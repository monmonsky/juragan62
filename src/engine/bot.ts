// Bot sederhana (PRD §10): satu keputusan per panggilan, sampai giliran pindah.

import { BOARD, groupMembers } from '../data/board.ts'
import { activePlayers, auctionMin, bailCost, buildCost, canBuild, canStayLuxury, canTradeProp, liquidationAction, ownedBy, price, rentFor, unmortgageCost, validTrade } from './engine.ts'
import type { Action, GameState, TradeOffer } from './types.ts'

// ASK_TRADE: bot menawarkan tukar ke pemain manusia; UI yang menanyakan jawabannya.
export type BotDecision = Action | { type: 'ASK_TRADE'; offer: TradeOffer }

const propValue = (s: GameState, sq: number) => price(s, sq) * (s.props[sq].mortgaged ? 0.5 : 1)

// Bot mengincar petak terakhir yang melengkapi grupnya, bayar tunai 1,6× harga.
export function botProposeTrade(s: GameState): TradeOffer | null {
  const p = s.players[s.current]
  const reserve = 1000 * s.ih
  for (const sq of ownedBy(s, p.id)) {
    const group = BOARD[sq].group
    if (!group) continue
    const missing = groupMembers(group).filter((i) => s.props[i].owner !== p.id)
    if (missing.length !== 1) continue
    const target = missing[0]
    const owner = s.props[target].owner
    if (owner === null || s.players[owner].bankrupt || !canTradeProp(s, target)) continue
    const offer = Math.round(price(s, target) * 1.6)
    if (p.cash - offer < reserve) continue
    const o: TradeOffer = { from: p.id, to: owner, give: [], take: [target], cashGive: offer, cashTake: 0 }
    if (validTrade(s, o)) return o
  }
  return null
}

// Penilaian dari sisi penerima tawaran (`offer.to`).
export function botAcceptTrade(s: GameState, o: TradeOffer): boolean {
  const me = o.to
  const valueIn = o.cashGive + o.give.reduce((n, sq) => n + propValue(s, sq), 0)
  const valueOut = o.cashTake + o.take.reduce((n, sq) => n + propValue(s, sq), 0)
  let factor = 1.1
  for (const sq of o.take) {
    const group = BOARD[sq].group
    if (!group) continue
    const mine = groupMembers(group).filter((i) => s.props[i].owner === me).length
    if (mine >= 2) factor = Math.max(factor, 2.5) // jangan bongkar grup sendiri
    const theirs = groupMembers(group).filter((i) => s.props[i].owner === o.from).length
    if (theirs === groupMembers(group).length - 1) factor = Math.max(factor, 1.3) // tahu itu melengkapi grup lawan
  }
  return valueIn >= valueOut * factor
}

// Sewa terbesar yang bisa ditagih lawan dalam satu kali mendarat (buat jaga-jaga uang).
function maxThreat(s: GameState, pid: number) {
  let max = 0
  for (const [key, prop] of Object.entries(s.props)) {
    if (prop.owner === null || prop.owner === pid) continue
    max = Math.max(max, rentFor(s, Number(key), 7, false))
  }
  return max
}

export function botAction(s: GameState): BotDecision | null {
  if (s.phase === 'gameover') return null
  const reserve = 2000 * s.ih

  if (s.phase === 'auction' && s.auction) {
    const a = s.auction
    const me = s.players[a.active[a.turn]]
    const group = BOARD[a.sq].group
    const members = group ? groupMembers(group) : []
    const mine = members.filter((i) => s.props[i].owner === me.id).length
    const completes = !!group && mine === members.length - 1
    const worth = price(s, a.sq) * (completes ? 1.5 : mine ? 1.15 : 0.9)
    const limit = Math.min(worth, me.cash - 1000 * s.ih)
    const min = auctionMin(s)
    return min <= limit ? { type: 'BID', amount: min } : { type: 'PASS_BID' }
  }

  const p = s.players[s.current]

  if (s.phase === 'buy' && s.pendingBuy !== null) {
    const sq = s.pendingBuy
    const cost = price(s, sq)
    const group = BOARD[sq].group
    const completesGroup = !!group && groupMembers(group).every((i) => i === sq || s.props[i].owner === p.id)
    const ok = p.cash - cost >= reserve || (completesGroup && p.cash >= cost)
    return { type: ok ? 'BUY' : 'SKIP_BUY' }
  }

  if (s.phase === 'opening') return { type: 'ROLL' }

  if (s.phase === 'choice' && s.choice) {
    const me = s.players[s.current]
    const rich = (jt: number) => me.cash > jt * 1000 * s.ih
    const pick: Record<string, string> = {
      judol: me.character === 'crypto' && rich(8) ? '1000' : rich(12) ? '500' : '0',
      cabai: 'naik',
      investasi: rich(14) ? '1000' : '0',
      zebra: me.character === 'burt' || !rich(5) ? 'damai' : 'resmi',
      jalan: rich(3) ? 'tambal' : 'viral',
      samsat: rich(6) ? 'calo' : 'antre',
      baliho: s.year < 4 && rich(6) ? 'pasang' : 'skip',
    }
    return { type: 'CHOOSE', option: pick[s.choice.kind] }
  }

  if (s.phase === 'roll') {
    // Akhir game: kalau lawan sudah banyak bangunan, lebih aman betah di sel mewah.
    if (p.jailed && canStayLuxury(s, p.id) && p.cash > 4 * reserve) {
      const enemyLevels = activePlayers(s)
        .filter((o) => o.id !== p.id)
        .reduce((n, o) => n + ownedBy(s, o.id).reduce((m, sq) => m + s.props[sq].level, 0), 0)
      if (enemyLevels >= 6) return { type: 'STAY_LUXURY' }
    }
    if (p.jailed && p.jailCards > 0) return { type: 'USE_JAIL_CARD' }
    if (p.jailed && p.cash - bailCost(s) > 2.5 * reserve) return { type: 'PAY_BAIL' }
    return { type: 'ROLL' }
  }

  if (p.cash < 0) return liquidationAction(s, p.id)

  const owned = ownedBy(s, p.id)
  const mortgaged = owned.filter((sq) => s.props[sq].mortgaged)
  for (const sq of mortgaged) {
    if (p.cash - unmortgageCost(s, sq) > reserve * 2) return { type: 'UNMORTGAGE', sq }
  }
  const repay = Math.min(p.debt, Math.floor(p.cash - reserve * 2))
  if (repay >= 100) return { type: 'REPAY', amount: repay }
  // Pilih tanah paling menguntungkan: grup penuh dulu, lalu yang paling mahal.
  const full = (sq: number) => (BOARD[sq].group && groupMembers(BOARD[sq].group!).every((i) => s.props[i].owner === p.id) ? 1 : 0)
  const buildable = owned
    .filter((sq) => canBuild(s, p.id, sq))
    .sort((a, b) => full(b) - full(a) || (BOARD[b].price ?? 0) - (BOARD[a].price ?? 0))
  const cushion = Math.max(reserve * 0.5, maxThreat(s, p.id) * 0.6)
  for (const sq of buildable) {
    if (p.cash - buildCost(s, sq) > cushion) return { type: 'BUILD', sq }
  }
  if (!s.tradeTried) {
    const offer = botProposeTrade(s)
    if (offer) {
      if (s.players[offer.to].isBot) return { type: 'TRADE', offer, accepted: botAcceptTrade(s, offer) }
      return { type: 'ASK_TRADE', offer }
    }
  }
  if (s.canRollAgain) return { type: 'ROLL' }
  return { type: 'END_TURN' }
}
