import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { CharacterId } from '../data/characters.ts'
import { START_PLAYERS } from '../data/economy.ts'
import { createGame } from '../engine/engine.ts'
import type { GameState, TradeOffer } from '../engine/types.ts'
import { GuestRoom, HostRoom, roomLink } from '../net/room.ts'
import type { NetMsg, SeatInfo } from '../net/room.ts'
import type { Speed } from './fx.ts'
import { Game } from './Game.tsx'
import type { NetBridge } from './Game.tsx'
import { CharacterButton, CharacterPicker } from './Screens.tsx'
import type { Profile } from './Screens.tsx'

type Listener = (msg: NetMsg, seat: number | null) => void

interface Props {
  profile: Profile
  speed: Speed
  sound: boolean
  music: boolean
  initialCode: string | null
  onToggleSound: () => void
  onToggleMusic: () => void
  onExit: () => void
  onGameOver: (s: GameState, mySeats: number[]) => void
}

interface Lobby extends SeatInfo {
  waiting?: boolean // kursi game tersimpan yang belum diambil tamu
}

const SAVE_KEY = 'juragan62.onlineSave'
const LAST_KEY = 'juragan62.lastRoom'
const withColors = (seats: Lobby[]) => seats.map((s, i) => ({ ...s, color: START_PLAYERS[i].color }))
const randomKey = () => Math.random().toString(36).slice(2, 10)

function loadJson<T>(key: string): T | null {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null
  } catch {
    return null
  }
}

function saveJson(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // penyimpanan tidak tersedia
  }
}

export function Online({ profile, speed, sound, music, initialCode, onToggleSound, onToggleMusic, onExit, onGameOver }: Props) {
  const [mode, setMode] = useState<'menu' | 'host' | 'guest' | 'game'>('menu')
  const [character, setCharacter] = useState<CharacterId>('rakyat')
  const [charPicking, setCharPicking] = useState(false)
  const [code, setCode] = useState(initialCode ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const [seats, setSeats] = useState<Lobby[]>([])
  const [you, setYou] = useState(0)
  const [maxRounds, setMaxRounds] = useState<number | null>(30)
  const [game, setGame] = useState<{ state: GameState; bridge: NetBridge; key: number } | null>(null)
  const [roomCode, setRoomCode] = useState('')
  const [resuming, setResuming] = useState(false)
  const [saved] = useState(() => {
    const s = loadJson<GameState>(SAVE_KEY)
    return s && s.version === 7 && s.phase !== 'gameover' ? s : null
  })

  const hostRef = useRef<HostRoom | null>(null)
  const guestRef = useRef<GuestRoom | null>(null)
  const seatsRef = useRef<Lobby[]>([])
  const keysRef = useRef<string[]>([])
  const roundsRef = useRef<number | null>(30)
  const resumeRef = useRef<GameState | null>(null)
  const latestRef = useRef<GameState | null>(null)
  const listeners = useRef(new Set<Listener>())
  const pendingAsk = useRef(new Map<number, (ok: boolean) => void>())
  const phaseRef = useRef<'lobby' | 'game' | 'over'>('lobby')
  const myKeyRef = useRef<{ code: string; seat: number; key: string } | null>(null)
  const gameKey = useRef(0)

  useEffect(
    () => () => {
      hostRef.current?.close()
      guestRef.current?.close()
    },
    [],
  )

  const emit = (msg: NetMsg, seat: number | null) => listeners.current.forEach((fn) => fn(msg, seat))
  const listen = (fn: Listener) => {
    listeners.current.add(fn)
    return () => {
      listeners.current.delete(fn)
    }
  }

  const pushLobby = (next: Lobby[], rounds = roundsRef.current) => {
    const colored = resumeRef.current ? next : withColors(next)
    seatsRef.current = colored
    setSeats(colored)
    colored.forEach((s, i) => s.peer && hostRef.current?.send(s.peer, { t: 'lobby', seats: colored, maxRounds: rounds, you: i }))
  }

  // ---------- host ----------

  const hostBridge = (room: HostRoom): NetBridge => ({
    role: 'host',
    mySeat: 0,
    remoteSeats: () => new Set(seatsRef.current.flatMap((s, i) => (s.peer ? [i] : []))),
    send: () => {},
    broadcast: (m) => {
      if (m.t === 'step') {
        latestRef.current = m.state
        saveJson(SAVE_KEY, m.state.phase === 'gameover' ? null : m.state)
      }
      room.broadcast(m)
    },
    askTrade: (seat: number, offer: TradeOffer) =>
      new Promise((resolve) => {
        const peer = seatsRef.current[seat]?.peer
        if (!peer) return resolve(false)
        pendingAsk.current.set(seat, resolve)
        room.send(peer, { t: 'tradeAsk', offer })
        setTimeout(() => {
          if (pendingAsk.current.get(seat) === resolve) {
            pendingAsk.current.delete(seat)
            resolve(false)
          }
        }, 45000)
      }),
    listen,
  })

  const createRoom = async (resume: GameState | null) => {
    setLoading(true)
    setError('')
    try {
      const room = await HostRoom.create()
      hostRef.current = room
      resumeRef.current = resume
      setResuming(!!resume)
      setRoomCode(room.code)
      room.onMessage = (peerId, msg) => {
        const seat = seatsRef.current.findIndex((s) => s.peer === peerId)
        if (phaseRef.current === 'lobby') {
          if (msg.t !== 'hello') return
          if (resumeRef.current) {
            // Lanjutkan game tersimpan: ambil kursi dengan nama sama, atau kursi kosong pertama.
            const list = seatsRef.current
            const same = list.findIndex((s) => s.waiting && s.name === msg.name)
            const free = same >= 0 ? same : list.findIndex((s) => s.waiting)
            if (free < 0) return room.kick(peerId, { t: 'full' })
            pushLobby(list.map((s, i) => (i === free ? { ...s, peer: peerId, waiting: false } : s)))
            return
          }
          if (seatsRef.current.length >= 6) return room.kick(peerId, { t: 'full' })
          pushLobby([...seatsRef.current, { name: msg.name, token: msg.token, character: msg.character, color: '', isBot: false, peer: peerId }])
          return
        }
        if (msg.t === 'rejoin') {
          if (keysRef.current[msg.seat] !== msg.key || !latestRef.current) return room.kick(peerId, { t: 'ended', reason: 'Kursi tidak dikenali.' })
          seatsRef.current = seatsRef.current.map((s, i) => (i === msg.seat ? { ...s, peer: peerId, isBot: false } : s))
          emit({ t: 'rejoined', seat: msg.seat }, msg.seat)
          room.send(peerId, { t: 'start', state: latestRef.current, you: msg.seat, key: msg.key })
          return
        }
        if (seat < 0) return
        if (msg.t === 'tradeReply') {
          pendingAsk.current.get(seat)?.(msg.accept)
          pendingAsk.current.delete(seat)
          return
        }
        emit(msg, seat)
      }
      room.onLeave = (peerId) => {
        const seat = seatsRef.current.findIndex((s) => s.peer === peerId)
        if (seat < 0) return
        if (phaseRef.current === 'lobby') {
          if (resumeRef.current) return pushLobby(seatsRef.current.map((s, i) => (i === seat ? { ...s, peer: null, waiting: true } : s)))
          return pushLobby(seatsRef.current.filter((_, i) => i !== seat))
        }
        pendingAsk.current.get(seat)?.(false)
        seatsRef.current = seatsRef.current.map((s, i) => (i === seat ? { ...s, peer: null } : s))
        emit({ t: 'left', seat }, seat)
      }
      if (resume) {
        roundsRef.current = resume.maxRounds
        setMaxRounds(resume.maxRounds)
        pushLobby(
          resume.players.map((p, i) => {
            const wasHuman = !p.isBot || p.name.endsWith(' (bot)')
            return {
              name: p.name.replace(/ \(bot\)$/, ''),
              token: p.token,
              character: p.character,
              color: p.color,
              isBot: i > 0 && !wasHuman,
              peer: null,
              waiting: i > 0 && wasHuman && !p.bankrupt,
            }
          }),
        )
      } else {
        pushLobby([{ ...profile, character, color: '', isBot: false, peer: null }])
      }
      setMode('host')
    } catch (err) {
      setError((err as Error).message || 'Gagal membuat room.')
    }
    setLoading(false)
  }

  const startGame = () => {
    const room = hostRef.current
    if (!room) return
    const list = seatsRef.current
    const state: GameState = resumeRef.current
      ? {
          // Kursi yang tidak diambil siapa pun dijalankan bot.
          ...resumeRef.current,
          players: resumeRef.current.players.map((p, i) => ({ ...p, name: list[i].name, isBot: i > 0 && !list[i].peer })),
        }
      : createGame(
          list.map((s) => ({ name: s.name, token: s.token, color: s.color, isBot: s.isBot, character: s.character })),
          { maxRounds: roundsRef.current, openingRoll: true },
        )
    phaseRef.current = 'game'
    latestRef.current = state
    keysRef.current = list.map(() => randomKey())
    list.forEach((s, i) => s.peer && room.send(s.peer, { t: 'start', state, you: i, key: keysRef.current[i] }))
    saveJson(SAVE_KEY, state)
    setGame({ state, bridge: hostBridge(room), key: ++gameKey.current })
    setMode('game')
  }

  // ---------- tamu ----------

  const attachGuest = (room: GuestRoom, joinCode: string) => {
    guestRef.current = room
    room.onMessage = (msg) => {
      if (msg.t === 'lobby') {
        setSeats(msg.seats)
        setYou(msg.you)
        setMaxRounds(msg.maxRounds)
      } else if (msg.t === 'ended') {
        if (phaseRef.current === 'over') return
        setError(msg.reason)
        setGame(null)
        setMode('menu')
        phaseRef.current = 'lobby'
        myKeyRef.current = null
        saveJson(LAST_KEY, null)
      } else if (msg.t === 'full') {
        setError('Room sudah penuh.')
        setMode('menu')
      } else if (msg.t === 'start') {
        phaseRef.current = 'game'
        if (msg.key) {
          myKeyRef.current = { code: joinCode, seat: msg.you, key: msg.key }
          saveJson(LAST_KEY, myKeyRef.current)
        }
        setReconnecting(false)
        const bridge: NetBridge = {
          role: 'guest',
          mySeat: msg.you,
          remoteSeats: () => new Set(),
          send: (m) => guestRef.current?.send(m),
          broadcast: () => {},
          askTrade: () => Promise.resolve(false),
          listen,
        }
        setGame({ state: msg.state, bridge, key: ++gameKey.current })
        setMode('game')
      } else {
        if (msg.t === 'step' && msg.state.phase === 'gameover') phaseRef.current = 'over'
        emit(msg, null)
      }
    }
    room.onClose = () => {
      if (phaseRef.current === 'over') return
      if (phaseRef.current === 'game' && myKeyRef.current) {
        void reconnect()
        return
      }
      setError('Koneksi ke host terputus.')
      setGame(null)
      setMode('menu')
    }
  }

  // Sambung ulang otomatis: 5 percobaan dengan jeda makin lama.
  const reconnect = async () => {
    const info = myKeyRef.current
    if (!info) return
    setReconnecting(true)
    for (let attempt = 0; attempt < 5; attempt++) {
      await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt))
      try {
        const room = await GuestRoom.join(info.code)
        attachGuest(room, info.code)
        room.send({ t: 'rejoin', seat: info.seat, key: info.key })
        return
      } catch {
        // coba lagi
      }
    }
    setReconnecting(false)
    setError('Gagal menyambung ulang ke host.')
    setGame(null)
    setMode('menu')
    phaseRef.current = 'lobby'
  }

  const joinRoom = async () => {
    setLoading(true)
    setError('')
    try {
      const joinCode = code.trim().toUpperCase()
      const last = loadJson<{ code: string; seat: number; key: string }>(LAST_KEY)
      const room = await GuestRoom.join(joinCode)
      attachGuest(room, joinCode)
      if (last && last.code === joinCode) {
        // Pernah di room ini (mis. tab ketutup): coba ambil kursi lama dulu, kalau gagal gabung biasa.
        myKeyRef.current = last
        room.send({ t: 'rejoin', seat: last.seat, key: last.key })
        setTimeout(() => {
          if (phaseRef.current === 'lobby') room.send({ t: 'hello', name: profile.name, token: profile.token, character })
        }, 1500)
      } else {
        room.send({ t: 'hello', name: profile.name, token: profile.token, character })
      }
      setMode('guest')
    } catch (err) {
      setError((err as Error).message || 'Gagal gabung room.')
    }
    setLoading(false)
  }

  if (mode === 'game' && game) {
    return (
      <>
        {reconnecting && <div className="reconnect-banner">📡 Koneksi putus. Menyambung ulang ke host...</div>}
        <Game
          key={game.key}
          initial={game.state}
          showGuide={false}
          speed={speed}
          sound={sound}
          music={music}
          net={game.bridge}
          onToggleSound={onToggleSound}
          onToggleMusic={onToggleMusic}
          onChange={() => {}}
          onExit={onExit}
          onGameOver={(s) => {
            phaseRef.current = 'over'
            saveJson(LAST_KEY, null)
            onGameOver(s, [game.bridge.mySeat])
          }}
        />
      </>
    )
  }

  const seatList = (
    <div className="panel" style={{ display: 'grid', gap: 8 }}>
      <b>Pemain di room ({seats.length}/6)</b>
      {seats.map((s, i) => (
        <div key={i} className="setup-row">
          <span className="token big" style={{ '--c': s.color } as CSSProperties}>
            {s.token}
          </span>
          <b style={{ flex: 1 }}>
            {s.name} {mode === 'guest' && i === you ? '(kamu)' : ''} {i === 0 ? '👑 host' : ''}
          </b>
          <span className="badge">{s.waiting ? '⏳ menunggu' : s.isBot ? '🤖 bot' : '🙋 orang'}</span>
          {mode === 'host' && i > 0 && !resuming && (
            <button
              className="btn small"
              onClick={() => {
                if (s.peer) hostRef.current?.kick(s.peer, { t: 'ended', reason: 'Dikeluarkan host.' })
                pushLobby(seatsRef.current.filter((_, k) => k !== i))
              }}
            >
              ✕
            </button>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="screen">
      <h1 className="bungee" style={{ fontSize: 32 }}>
        🌐 Main Online
      </h1>

      {mode === 'menu' && (
        <>
          <div className="panel" style={{ display: 'grid', gap: 10 }}>
            <div className="field">
              <b>
                Kamu: {profile.token} {profile.name}
              </b>
              <CharacterButton value={character} onClick={() => setCharPicking(true)} />
            </div>
            <button className="btn primary big" disabled={loading} onClick={() => createRoom(null)}>
              🏠 Buat Room
            </button>
            {saved && (
              <button className="btn big" disabled={loading} onClick={() => createRoom(saved)}>
                ▶ Lanjutkan room tersimpan (ronde {saved.round})
              </button>
            )}
          </div>
          <div className="panel" style={{ display: 'grid', gap: 10 }}>
            <b>Punya kode room dari teman?</b>
            <input
              className="welcome-input"
              value={code}
              maxLength={5}
              placeholder="KODE"
              style={{ textTransform: 'uppercase', letterSpacing: '.2em' }}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
            <button className="btn big" disabled={loading || code.trim().length !== 5} onClick={joinRoom}>
              🚪 Gabung
            </button>
          </div>
          {loading && <div className="action-note">⏳ Menghubungkan...</div>}
          {error && <div className="action-note warn">{error}</div>}
          <p className="disclaimer">
            Koneksi langsung antar perangkat (peer-to-peer). Host yang menjalankan & menyimpan game. Kalau koneksi tamu putus, game menyambung ulang otomatis.
          </p>
        </>
      )}

      {mode === 'host' && (
        <>
          <div className="panel" style={{ display: 'grid', gap: 10, textAlign: 'center' }}>
            <b>{resuming ? 'Lanjutkan game tersimpan · kode room baru' : 'Kode room'}</b>
            <div className="room-code">{roomCode}</div>
            <button className="btn small" onClick={() => navigator.clipboard?.writeText(roomLink(roomCode))}>
              📋 Salin link undangan
            </button>
            {resuming && (
              <div className="muted" style={{ fontSize: 13 }}>
                Teman yang gabung otomatis menempati kursi dengan nama yang sama. Kursi yang masih kosong saat mulai dijalankan bot.
              </div>
            )}
          </div>
          {seatList}
          {!resuming && (
            <div className="panel" style={{ display: 'grid', gap: 10 }}>
              <button
                className="btn small"
                disabled={seats.length >= 6}
                onClick={() => {
                  const tpl = START_PLAYERS[seats.length]
                  pushLobby([...seatsRef.current, { name: tpl.name, token: tpl.token, character: tpl.character, color: '', isBot: true, peer: null }])
                }}
              >
                + Tambah bot
              </button>
              <div className="field">
                <b>Panjang game</b>
                {[20, 30, 40, null].map((r) => (
                  <button
                    key={String(r)}
                    className={`btn small ${maxRounds === r ? 'dark' : ''}`}
                    onClick={() => {
                      setMaxRounds(r)
                      roundsRef.current = r
                      pushLobby(seatsRef.current, r)
                    }}
                  >
                    {r ? `${r} ronde` : 'Sampai tinggal satu'}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="home-actions">
            <button className="btn primary big" disabled={seats.length < 2} onClick={startGame}>
              Mulai Menderita Bareng ➜
            </button>
          </div>
        </>
      )}

      {mode === 'guest' && (
        <>
          <div className="action-note">⏳ Menunggu host memulai game... ({maxRounds ? `${maxRounds} ronde` : 'sampai tinggal satu'})</div>
          {seatList}
          {error && <div className="action-note warn">{error}</div>}
        </>
      )}

      <div className="home-actions">
        <button className="btn" onClick={onExit}>
          ← Kembali
        </button>
      </div>
      {charPicking && <CharacterPicker value={character} onPick={setCharacter} onClose={() => setCharPicking(false)} />}
    </div>
  )
}
