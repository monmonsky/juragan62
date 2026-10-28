// Statistik & pencapaian lintas game, disimpan di localStorage (PRD §20).

import { IKN_SQ, SCBD_SQ, SOLO_SQ } from '../data/board.ts'
import type { GameState, Player } from '../engine/types.ts'

export interface Lifetime {
  games: number
  wins: number
  bankrupt: number
  pungli: number
  bungaPinjol: number
  selMewah: number
  trades: number
  lelang: number
  unlocked: Record<string, string> // id → tanggal
}

export interface Achievement {
  id: string
  icon: string
  name: string
  desc: string
  check: (p: Player, s: GameState, life: Lifetime) => boolean
}

const KEY = 'juragan62.lifetime'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', icon: '🎟️', name: 'Warga Baru Konoha', desc: 'Selesaikan 1 game', check: (_p, _s, l) => l.games >= 1 },
  { id: 'win', icon: '👑', name: 'Sultan +62', desc: 'Menang 1 game', check: (p, s) => s.winner === p.id },
  { id: 'win5', icon: '💎', name: 'Oligarki', desc: 'Menang 5 game', check: (_p, _s, l) => l.wins >= 5 },
  { id: 'bankrupt', icon: '🪦', name: 'Rakyat Jelata Abadi', desc: 'Bangkrut 1 kali', check: (p) => p.bankrupt },
  { id: 'bankrupt10', icon: '⚰️', name: 'Langganan Bangkrut', desc: 'Bangkrut 10 kali total', check: (_p, _s, l) => l.bankrupt >= 10 },
  { id: 'pinjol', icon: '💸', name: 'Korban Pinjol', desc: 'Bayar bunga pinjol ≥ Rp 5 jt dalam 1 game', check: (p) => p.stats.bungaPinjol >= 5000 },
  { id: 'nopinjol', icon: '🧘', name: 'Anti Pinjol Club', desc: 'Selesai game tanpa pernah pinjol', check: (p) => !p.bankrupt && p.stats.bungaPinjol === 0 },
  { id: 'pungli', icon: '🧾', name: 'Donatur Tetap Oknum', desc: 'Kena pungli ≥ Rp 2 jt dalam 1 game', check: (p) => p.stats.pungli >= 2000 },
  { id: 'mallikn', icon: '🏢', name: 'Mall di Kota Sepi', desc: 'Punya Mall di IKN Nusantara', check: (p, s) => s.props[IKN_SQ].owner === p.id && s.props[IKN_SQ].level === 4 },
  { id: 'dinasti', icon: '🏯', name: 'Politik Dinasti', desc: 'Punya Solo + Jakarta SCBD/IKN sekaligus', check: (p, s) => s.props[SOLO_SQ].owner === p.id && (s.props[SCBD_SQ].owner === p.id || s.props[IKN_SQ].owner === p.id) },
  { id: 'selmewah', icon: '🛋️', name: 'Napi Sultan', desc: 'Betah di sel mewah 3× dalam 1 game', check: (p) => p.stats.selMewah >= 3 },
  { id: 'mangkrak', icon: '⚖️', name: 'Langganan Pasal Karet', desc: 'Masuk Kasus Mangkrak 3× dalam 1 game', check: (p) => p.stats.mangkrak >= 3 },
  { id: 'deal', icon: '🤝', name: 'Makelar Tanah', desc: 'Deal tukar tanah 3× dalam 1 game', check: (p) => p.stats.trades >= 3 },
  { id: 'lelang', icon: '🔨', name: 'Raja Lelang', desc: 'Menang lelang 3× dalam 1 game', check: (p) => p.stats.lelangMenang >= 3 },
  { id: 'judol', icon: '🎰', name: 'Korban Judol', desc: 'Rugi judol ≥ Rp 3 jt dalam 1 game', check: (p) => p.stats.judol >= 3000 },
  { id: 'tertipu', icon: '🏃', name: 'Investor Tertipu', desc: 'Uangmu dibawa kabur investasi bodong ≥ Rp 2 jt', check: (p) => p.stats.tertipu >= 2000 },
  { id: 'veteran', icon: '🎖️', name: 'Veteran Penderitaan', desc: 'Main 25 game', check: (_p, _s, l) => l.games >= 25 },
]

const empty = (): Lifetime => ({ games: 0, wins: 0, bankrupt: 0, pungli: 0, bungaPinjol: 0, selMewah: 0, trades: 0, lelang: 0, unlocked: {} })

export function loadLifetime(): Lifetime {
  try {
    return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  } catch {
    return empty()
  }
}

// Catat hasil game untuk pemain milik perangkat ini. Mengembalikan pencapaian yang baru terbuka.
export function recordGame(s: GameState, mine: number[]): Achievement[] {
  const life = loadLifetime()
  const fresh: Achievement[] = []
  for (const pid of mine) {
    const p = s.players[pid]
    life.games++
    if (s.winner === pid) life.wins++
    if (p.bankrupt) life.bankrupt++
    life.pungli += p.stats.pungli
    life.bungaPinjol += p.stats.bungaPinjol
    life.selMewah += p.stats.selMewah
    life.trades += p.stats.trades
    life.lelang += p.stats.lelangMenang
    for (const a of ACHIEVEMENTS) {
      if (!life.unlocked[a.id] && a.check(p, s, life)) {
        life.unlocked[a.id] = new Date().toISOString().slice(0, 10)
        fresh.push(a)
      }
    }
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(life))
  } catch {
    // penyimpanan tidak tersedia
  }
  return fresh
}
