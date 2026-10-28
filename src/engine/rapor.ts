// Rapor Hidup di Konoha (PRD §11): peringkat + gelar.

import { netWorth } from './engine.ts'
import type { GameState, Player } from './types.ts'

export interface RaporRow {
  player: Player
  worth: number
  rank: number
  titles: string[]
}

export function rapor(s: GameState): RaporRow[] {
  const alive = s.players.filter((p) => !p.bankrupt).sort((a, b) => netWorth(s, b.id) - netWorth(s, a.id))
  const dead = s.players.filter((p) => p.bankrupt).sort((a, b) => (b.bankruptRound ?? 0) - (a.bankruptRound ?? 0))
  const rows: RaporRow[] = [...alive, ...dead].map((player, i) => ({ player, worth: netWorth(s, player.id), rank: i + 1, titles: [] }))

  const top = (key: keyof Player['stats']) => {
    const best = [...s.players].sort((a, b) => b.stats[key] - a.stats[key])[0]
    return best && best.stats[key] > 0 ? best.id : null
  }
  const give = (pid: number | null, title: string) => {
    const row = rows.find((r) => r.player.id === pid)
    if (row) row.titles.push(title)
  }

  give(rows[0]?.player.id ?? null, '👑 Sultan +62')
  const firstBankrupt = [...dead].sort((a, b) => (a.bankruptRound ?? 0) - (b.bankruptRound ?? 0))[0]
  if (firstBankrupt) give(firstBankrupt.id, '🪦 Rakyat Jelata Abadi')
  give(top('bungaPinjol'), '💸 Korban Pinjol')
  give(top('pungli'), '🧾 Donatur Tetap Oknum')
  give(top('mangkrak'), '⚖️ Langganan Pasal Karet')
  give(top('selMewah'), '🛋️ Napi Sultan')
  for (const p of s.players) if (p.stats.bangun === 0) give(p.id, '🏚️ Kaum Mendang-Mending')
  return rows
}
