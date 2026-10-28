// Room online peer-to-peer (PeerJS). Host menjalankan engine; tamu cuma kirim aksi & terima hasil.

import Peer from 'peerjs'
import type { DataConnection } from 'peerjs'
import type { CharacterId } from '../data/characters.ts'
import type { Action, GameEvent, GameState, TradeOffer } from '../engine/types.ts'

const PREFIX = 'juragan62-v1-'
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export interface SeatInfo {
  name: string
  token: string
  color: string
  isBot: boolean
  character: CharacterId
  peer: string | null
}

export type NetMsg =
  | { t: 'hello'; name: string; token: string; character: CharacterId }
  | { t: 'lobby'; seats: SeatInfo[]; maxRounds: number | null; you: number }
  | { t: 'full' }
  | { t: 'start'; state: GameState; you: number; key?: string }
  | { t: 'step'; state: GameState; events: GameEvent[] }
  | { t: 'action'; action: Action }
  | { t: 'tradeRequest'; offer: TradeOffer }
  | { t: 'tradeAsk'; offer: TradeOffer }
  | { t: 'tradeReply'; accept: boolean }
  | { t: 'left'; seat: number }
  | { t: 'react'; emoji: string; seat?: number }
  | { t: 'rejoin'; seat: number; key: string }
  | { t: 'rejoined'; seat: number }
  | { t: 'ended'; reason: string }

export const makeCode = () => Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')

export const roomLink = (code: string) => `${location.origin}${location.pathname}?room=${code}`

// Server TURN opsional (untuk jaringan ketat), diatur lewat env saat build:
// VITE_TURN_URL=turn:host:3478 VITE_TURN_USER=... VITE_TURN_PASS=...
const env = import.meta.env
const iceServers: RTCIceServer[] = [{ urls: 'stun:stun.l.google.com:19302' }]
if (env.VITE_TURN_URL) iceServers.push({ urls: env.VITE_TURN_URL, username: env.VITE_TURN_USER, credential: env.VITE_TURN_PASS })
const peerOptions = { config: { iceServers } }

function openPeer(id?: string): Promise<Peer> {
  return new Promise((resolve, reject) => {
    const peer = id ? new Peer(id, peerOptions) : new Peer(peerOptions)
    const timer = setTimeout(() => reject(new Error('Server sinyal tidak merespons. Cek koneksi internet.')), 12000)
    peer.on('open', () => {
      clearTimeout(timer)
      resolve(peer)
    })
    peer.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
  })
}

export class HostRoom {
  readonly code: string
  private peer: Peer
  private conns = new Map<string, DataConnection>()
  onMessage: (peerId: string, msg: NetMsg) => void = () => {}
  onLeave: (peerId: string) => void = () => {}

  private constructor(code: string, peer: Peer) {
    this.code = code
    this.peer = peer
    peer.on('connection', (conn) => {
      conn.on('open', () => this.conns.set(conn.peer, conn))
      conn.on('data', (data) => this.onMessage(conn.peer, data as NetMsg))
      conn.on('close', () => {
        this.conns.delete(conn.peer)
        this.onLeave(conn.peer)
      })
    })
  }

  static async create(): Promise<HostRoom> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const code = makeCode()
      try {
        return new HostRoom(code, await openPeer(PREFIX + code))
      } catch (err) {
        if ((err as { type?: string }).type !== 'unavailable-id') throw err
      }
    }
    throw new Error('Gagal membuat room. Coba lagi.')
  }

  send(peerId: string, msg: NetMsg) {
    this.conns.get(peerId)?.send(msg)
  }

  broadcast(msg: NetMsg) {
    for (const conn of this.conns.values()) conn.send(msg)
  }

  kick(peerId: string, msg: NetMsg) {
    const conn = this.conns.get(peerId)
    conn?.send(msg)
    setTimeout(() => conn?.close(), 300)
  }

  close() {
    this.broadcast({ t: 'ended', reason: 'Host menutup room.' })
    setTimeout(() => this.peer.destroy(), 300)
  }
}

export class GuestRoom {
  private peer: Peer
  private conn: DataConnection
  onMessage: (msg: NetMsg) => void = () => {}
  onClose: () => void = () => {}

  private constructor(peer: Peer, conn: DataConnection) {
    this.peer = peer
    this.conn = conn
    conn.on('data', (data) => this.onMessage(data as NetMsg))
    conn.on('close', () => this.onClose())
  }

  static async join(code: string): Promise<GuestRoom> {
    const peer = await openPeer()
    return new Promise((resolve, reject) => {
      const conn = peer.connect(PREFIX + code.toUpperCase(), { reliable: true })
      const timer = setTimeout(() => {
        peer.destroy()
        reject(new Error('Room tidak ditemukan atau host offline.'))
      }, 12000)
      conn.on('open', () => {
        clearTimeout(timer)
        resolve(new GuestRoom(peer, conn))
      })
      peer.on('error', (err) => {
        clearTimeout(timer)
        peer.destroy()
        reject(err.type === 'peer-unavailable' ? new Error('Room tidak ditemukan. Cek lagi kodenya.') : err)
      })
    })
  }

  send(msg: NetMsg) {
    this.conn.send(msg)
  }

  close() {
    this.peer.destroy()
  }
}
