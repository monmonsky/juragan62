// Engine Juragan +62: reducer murni `step(state, action) → { state, events }`.
// UI memutar `events` sebagai animasi; engine tidak pernah menunggu animasi (PRD §12.5, §13).

import { BOARD, GROUPS, JAIL_SQ, IKN_SQ, SCBD_SQ, SOLO_SQ, KERETA_CEPAT_SQ, PLN_SQ, SIZE, groupMembers, isBuyable, LEVEL_NAMES } from '../data/board.ts'
import type { ChoiceKind, GroupId } from '../data/board.ts'
import { CLASSIC_CARDS } from '../data/cards.ts'
import type { Card } from '../data/cards.ts'
import { HEADLINES, ISU_CARDS } from '../data/isu-terkini.ts'
import type { HeadlineId } from '../data/isu-terkini.ts'
import { ECONOMY as E } from '../data/economy.ts'
import { CHARACTER_BY_ID } from '../data/characters.ts'
import type { CharacterId } from '../data/characters.ts'
import { rp } from './format.ts'
import type { Action, Edisi, GameEvent, GameState, Player, StepResult, TradeOffer } from './types.ts'

export const ALL_CARDS: Card[] = [...CLASSIC_CARDS, ...ISU_CARDS]
export const CARD_BY_ID: Record<string, Card> = Object.fromEntries(ALL_CARDS.map((c) => [c.id, c]))
export const HEADLINE_BY_ID = Object.fromEntries(HEADLINES.map((h) => [h.id, h])) as Record<HeadlineId, (typeof HEADLINES)[number]>

interface Ctx {
  s: GameState
  ev: GameEvent[]
}

// ---------- RNG (mulberry32, state disimpan di GameState) ----------

function rand(s: GameState): number {
  s.rng = (s.rng + 0x6d2b79f5) | 0
  let t = Math.imul(s.rng ^ (s.rng >>> 15), 1 | s.rng)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const d6 = (s: GameState) => 1 + Math.floor(rand(s) * 6)

function shuffle<T>(s: GameState, arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand(s) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ---------- setup ----------

export interface NewPlayer {
  name: string
  token: string
  color: string
  isBot: boolean
  character: CharacterId
}

export function createGame(
  players: NewPlayer[],
  opts: { maxRounds: number | null; seed?: number; edisi?: Edisi; openingRoll?: boolean },
): GameState {
  const s: GameState = {
    version: 7,
    rng: opts.seed ?? Math.floor(Math.random() * 2 ** 31),
    players: players.map((p, id) => ({
      ...p,
      id,
      cash: Math.round(E.startCash * CHARACTER_BY_ID[p.character].startMult),
      debt: 0,
      pos: 0,
      jailed: false,
      jailTurns: 0,
      jailCards: 0,
      skipTurns: 0,
      lapped: false,
      luxuryStays: 0,
      baliho: 0,
      vendorMBG: false,
      bankrupt: false,
      bankruptRound: null,
      stats: { gaji: 0, biayaHidup: 0, pungli: 0, bungaPinjol: 0, pajak: 0, mangkrak: 0, selMewah: 0, trades: 0, lelangMenang: 0, judol: 0, tertipu: 0, sewaDibayar: 0, sewaDiterima: 0, bangun: 0 },
    })),
    props: {},
    current: 0,
    round: 1,
    year: 1,
    ih: 1,
    umrIndex: 1,
    headline: null,
    decks: { viral: [], bansos: [], headline: [] },
    // Lempar dadu dulu untuk menentukan urutan main (kalau diaktifkan).
    phase: opts.openingRoll ? 'opening' : 'roll',
    turnOrder: players.map((_, i) => i),
    openingRolls: players.map(() => null),
    pendingBuy: null,
    auction: null,
    choice: null,
    flood: null,
    edisi: opts.edisi ?? 'terbaru',
    buildWindow: false,
    builtThisTurn: [],
    tradeTried: false,
    canRollAgain: false,
    doubles: 0,
    dice: [1, 1],
    maxRounds: opts.maxRounds,
    lastCreditor: null,
    log: [],
    winner: null,
  }
  BOARD.forEach((sq, i) => {
    if (isBuyable(sq)) s.props[i] = { owner: null, level: 0, mortgaged: false }
  })
  // Edisi "klasik": tanpa kartu & Headline isu terkini.
  const cards = s.edisi === 'klasik' ? CLASSIC_CARDS : ALL_CARDS
  s.decks.viral = shuffle(s, cards.filter((c) => c.deck === 'viral').map((c) => c.id))
  s.decks.bansos = shuffle(s, cards.filter((c) => c.deck === 'bansos').map((c) => c.id))
  s.decks.headline = s.edisi === 'klasik' ? [] : shuffle(s, HEADLINES.map((h) => h.id))
  s.log.push({ round: 1, text: 'Selamat datang di Negeri Konoha. Semoga betah.' })
  return s
}

// ---------- query (dipakai UI & bot) ----------

export const activePlayers = (s: GameState) => s.players.filter((p) => !p.bankrupt)

export function price(s: GameState, sq: number): number {
  const base = BOARD[sq].price ?? 0
  const obral = s.headline === 'H13' && (BOARD[sq].group === 'kalimantan' || BOARD[sq].group === 'maluku') ? 0.7 : 1
  return Math.round(base * s.ih * obral)
}

export const buildCost = (s: GameState, sq: number) => Math.round(GROUPS[BOARD[sq].group as GroupId].buildCost * s.ih)
export const mortgageValue = (s: GameState, sq: number) => Math.round((BOARD[sq].price ?? 0) * s.ih * E.mortgageRate)
export const unmortgageCost = (s: GameState, sq: number) => Math.round(mortgageValue(s, sq) * (1 + E.unmortgageFee))
export const sellValue = (s: GameState, sq: number) => Math.round(buildCost(s, sq) * E.sellBuildingRate)
export const bailCost = (s: GameState) => Math.round(E.bail * s.ih)
export const pinjolRoom = (s: GameState, pid: number) => Math.max(0, Math.round(E.pinjolLimit * s.ih - s.players[pid].debt))
export const pinjolRate = (s: GameState) => (s.headline === 'H11' ? E.pinjolInterestCrisis : E.pinjolInterest)

export function ownsGroup(s: GameState, pid: number, group: GroupId): boolean {
  return groupMembers(group).every((i) => s.props[i].owner === pid)
}

export function rentFor(s: GameState, sq: number, diceTotal: number, isDouble: boolean): number {
  const prop = s.props[sq]
  if (prop.owner === null || prop.mortgaged) return 0
  const square = BOARD[sq]
  const owner = prop.owner
  if (square.type === 'transport') {
    const n = BOARD.filter((b, i) => b.type === 'transport' && s.props[i].owner === owner).length
    return Math.round(E.transportRent[n] * s.ih)
  }
  if (square.type === 'utility') {
    if (s.headline === 'H3') return 0
    if (sq === PLN_SQ && isDouble) return 0 // pemadaman bergilir
    const n = BOARD.filter((b, i) => b.type === 'utility' && s.props[i].owner === owner).length
    return Math.round(diceTotal * E.utilityRent[n] * s.ih)
  }
  const group = square.group as GroupId
  const base = Math.round(((square.price ?? 0) * E.baseRentRate) / 10) * 10
  const full = ownsGroup(s, owner, group)
  const mult = E.rentMultipliers[prop.level] * (full ? (prop.level === 0 ? 2 : E.fullGroupBuildingBonus) : 1)
  let rent = base * mult * s.ih
  if (sq === IKN_SQ && prop.level < 4) rent /= 2 // kota sepi
  if (s.headline === 'H3' && prop.level === 4) rent *= 0.75
  if (s.headline === 'H5' && (group === 'sumatra' || group === 'kalimantan')) rent /= 2
  if (s.headline === 'H10' && (sq === SCBD_SQ || sq === IKN_SQ)) return 0
  if (s.headline === 'H13' && (group === 'kalimantan' || group === 'maluku')) rent *= 0.7
  if (sq === SOLO_SQ && hasDynasty(s, owner)) rent *= E.dynastyMult
  if (s.flood && s.flood.group === group && s.round <= s.flood.untilRound) return 0
  return Math.round(rent)
}

// Bangun hanya saat jendela bangun (habis lewat START): pilih SATU tanah, naik maksimal `levelsPerWindow` tingkat.
// Solo "Kota Dinasti": jalur keluarga ke Pusat Kekuasaan.
export const hasDynasty = (s: GameState, pid: number) => s.props[SCBD_SQ].owner === pid || s.props[IKN_SQ].owner === pid

export const luxuryCost = (s: GameState) => Math.round(E.luxuryCell * s.ih * (s.headline === 'H17' ? 0.5 : 1))
export const canStayLuxury = (s: GameState, pid: number) => {
  const p = s.players[pid]
  return s.phase === 'roll' && s.current === pid && p.jailed && p.luxuryStays < E.maxLuxuryStays && p.cash >= luxuryCost(s)
}

export function canBuild(s: GameState, pid: number, sq: number): boolean {
  const prop = s.props[sq]
  const group = BOARD[sq].group
  if (!s.buildWindow || s.current !== pid) return false
  if (s.builtThisTurn.length && s.builtThisTurn[0] !== sq) return false
  if (s.builtThisTurn.length >= E.levelsPerWindow) return false
  if (!prop || !group || prop.owner !== pid || prop.mortgaged || prop.level >= 4) return false
  // Tanpa grup penuh mentok di Ruko; Mall wajib grup penuh.
  return ownsGroup(s, pid, group) || prop.level < E.maxLevelWithoutGroup
}

export function canSellBuilding(s: GameState, pid: number, sq: number): boolean {
  const prop = s.props[sq]
  return !!prop && !!BOARD[sq].group && prop.owner === pid && prop.level > 0
}

export function canMortgage(s: GameState, pid: number, sq: number): boolean {
  const prop = s.props[sq]
  return !!prop && prop.owner === pid && !prop.mortgaged && prop.level === 0
}

export function canUnmortgage(s: GameState, pid: number, sq: number): boolean {
  const prop = s.props[sq]
  return !!prop && prop.owner === pid && prop.mortgaged && s.players[pid].cash >= unmortgageCost(s, sq)
}

export function netWorth(s: GameState, pid: number): number {
  const p = s.players[pid]
  if (p.bankrupt) return 0
  let total = p.cash - p.debt
  for (const [key, prop] of Object.entries(s.props)) {
    if (prop.owner !== pid) continue
    const sq = Number(key)
    const value = Math.round((BOARD[sq].price ?? 0) * s.ih)
    total += prop.mortgaged ? value - unmortgageCost(s, sq) : value
    if (prop.level) total += prop.level * buildCost(s, sq)
  }
  return Math.round(total)
}

export const ownedBy = (s: GameState, pid: number) =>
  Object.entries(s.props).filter(([, p]) => p.owner === pid).map(([k]) => Number(k))

export const canTradeProp = (s: GameState, sq: number) => {
  const prop = s.props[sq]
  if (!prop || prop.level > 0) return false
  const group = BOARD[sq].group
  return !group || groupMembers(group).every((i) => s.props[i].level < 4)
}

export function validTrade(s: GameState, o: TradeOffer): boolean {
  const from = s.players[o.from]
  const to = s.players[o.to]
  if (!from || !to || o.from === o.to || from.bankrupt || to.bankrupt || o.from !== s.current) return false
  if (!o.give.length && !o.take.length && !o.cashGive && !o.cashTake) return false
  if (o.cashGive < 0 || o.cashTake < 0 || o.cashGive > Math.max(0, from.cash) || o.cashTake > Math.max(0, to.cash)) return false
  return (
    o.give.every((sq) => s.props[sq]?.owner === o.from && canTradeProp(s, sq)) &&
    o.take.every((sq) => s.props[sq]?.owner === o.to && canTradeProp(s, sq))
  )
}

// Langkah berikutnya untuk menutup uang minus: jual bangunan → gadai → pinjol → bangkrut.
// ---------- petak pilihan (mini-game & aksi) ----------

export interface ChoiceOption {
  value: string
  label: string
  cost: number
}

export function choiceOptions(s: GameState, kind: ChoiceKind): ChoiceOption[] {
  const ih = s.ih
  const r = (v: number) => Math.round(v * ih)
  switch (kind) {
    case 'judol':
      return [{ value: '0', label: '🙅 Ogah, judol bikin miskin', cost: 0 }, ...E.judolBets.map((b) => ({ value: String(b), label: `🎰 Pasang ${rp(r(b))}`, cost: r(b) }))]
    case 'cabai':
      return [
        { value: 'naik', label: '📈 Harga NAIK', cost: 0 },
        { value: 'turun', label: '📉 Harga TURUN', cost: 0 },
      ]
    case 'investasi':
      return [{ value: '0', label: '🙅 Gak percaya', cost: 0 }, ...E.investAmounts.map((a) => ({ value: String(a), label: `💰 Tanam ${rp(r(a))}`, cost: r(a) }))]
    case 'zebra':
      return [
        { value: 'resmi', label: `🧾 Tilang resmi ${rp(r(E.zebraFine))}`, cost: r(E.zebraFine) },
        { value: 'damai', label: `🤝 "Damai" ${rp(r(E.zebraBribe))}`, cost: r(E.zebraBribe) },
      ]
    case 'jalan':
      return [
        { value: 'tambal', label: `🔧 Tambal ban ${rp(r(E.jalanPatch))}`, cost: r(E.jalanPatch) },
        { value: 'tunggu', label: '⏳ Tunggu (lewati 1 giliran)', cost: 0 },
        { value: 'viral', label: '📱 Viralkan jalannya!', cost: 0 },
      ]
    case 'samsat':
      return [
        { value: 'antre', label: '🧍 Antre (lewati 1 giliran)', cost: 0 },
        { value: 'calo', label: `🕴️ Pakai calo ${rp(r(E.samsatCalo))}`, cost: r(E.samsatCalo) },
      ]
    case 'baliho':
      return [
        { value: 'pasang', label: `🪧 Pasang baliho ${rp(r(E.balihoCost))}`, cost: r(E.balihoCost) },
        { value: 'skip', label: '🙅 Gak usah', cost: 0 },
      ]
  }
}

function resolveChoice(c: Ctx, p: Player, kind: ChoiceKind, option: string): boolean {
  const s = c.s
  const opt = choiceOptions(s, kind).find((o) => o.value === option)
  // Operasi Zebra wajib bayar (uang boleh minus); taruhan & pilihan lain harus ada uangnya.
  if (!opt || (kind !== 'zebra' && opt.cost > Math.max(0, p.cash))) return false
  // Event hasil dulu (animasi mini-game), baru uangnya berpindah.
  const result = (outcome: 'win' | 'lose' | 'jackpot' | 'neutral' | 'caught', delta: number, text: string) => {
    c.ev.push({ type: 'choice', player: p.id, kind, option, outcome, delta: Math.round(delta), text })
    log(c, `${p.name}: ${text}`)
    if (delta > 0) change(c, p.id, delta)
    else if (delta < 0) transfer(c, p.id, null, -delta)
  }
  const r = rand(s)
  switch (kind) {
    case 'judol': {
      const bet = opt.cost
      if (!bet) return result('neutral', 0, 'Menolak main judol. Dompet selamat 👍'), true
      if (r < E.judolJackpotRate) {
        p.stats.judol -= bet * 9
        return result('jackpot', bet * 9, 'JACKPOT! ...besok pasti ketagihan dan kalah 🪝'), true
      }
      if (r < E.judolJackpotRate + E.judolWinRate) {
        p.stats.judol -= bet
        return result('win', bet, 'Menang! Bandar sengaja kasih umpan 🪝'), true
      }
      p.stats.judol += bet
      return result('lose', -bet, 'Kalah. Yang menang cuma bandar 🎰'), true
    }
    case 'cabai': {
      const naik = r < E.cabaiUpRate
      const benar = (option === 'naik') === naik
      const harga = naik ? 'NAIK lagi 🌶️📈' : 'turun... tumben 📉'
      return benar ? result('win', E.cabaiWin * s.ih, `Harga cabai ${harga} Tebakanmu benar!`) : result('lose', -E.cabaiLose * s.ih, `Harga cabai ${harga} Tebakanmu salah.`), true
    }
    case 'investasi': {
      const amt = opt.cost
      if (!amt) return result('neutral', 0, 'Tidak tergiur investasi "pasti cuan". Pintar.'), true
      if (r < E.investDoubleRate) return result('win', amt, 'Cuan 2×! (Uangnya dari korban berikutnya 😬)'), true
      if (r < E.investDoubleRate + E.investHalfRate) return result('win', amt * 0.5, 'Untung dikit. Masih dipancing.'), true
      p.stats.tertipu += amt
      return result('lose', -amt, 'Owner-nya kabur ke luar negeri. Uangmu ikut 🏃💨'), true
    }
    case 'zebra': {
      if (option === 'resmi') {
        p.stats.pajak += opt.cost
        return result('neutral', -opt.cost, 'Bayar tilang resmi. Taat aturan, dompet menangis.'), true
      }
      p.stats.pungli += opt.cost
      if (p.character !== 'burt' && r < E.zebraCaughtRate) {
        result('caught', -opt.cost, 'Suapnya ketahuan & viral! Masuk Kasus Mangkrak 🚨')
        sendToJail(c, p)
        return true
      }
      return result('win', -opt.cost, '"Damai" sukses. Pak polisi senyum 😉'), true
    }
    case 'jalan': {
      if (option === 'tambal') return result('neutral', -opt.cost, 'Tambal ban di bengkel pinggir jalan.'), true
      if (option === 'tunggu') {
        p.skipTurns++
        return result('neutral', 0, 'Nunggu ban ditambal. Lewati 1 giliran.'), true
      }
      if (r < E.jalanViralRate) return result('win', E.jalanViralReward * s.ih, 'Videomu viral! Jalan langsung diperbaiki + kamu di-endorse 📱'), true
      p.skipTurns++
      return result('lose', 0, 'Videomu sepi. Jalan tetap rusak, lewati 1 giliran.'), true
    }
    case 'samsat': {
      if (option === 'antre') {
        p.skipTurns++
        return result('neutral', 0, 'Antre dari subuh. Lewati 1 giliran.'), true
      }
      p.stats.pungli += opt.cost
      return result('neutral', -opt.cost, 'Calo beres 5 menit. Uang pelicin memang licin.'), true
    }
    case 'baliho': {
      if (option === 'skip') return result('neutral', 0, 'Tidak pasang baliho. Tiang listrik lega.'), true
      p.baliho++
      return result('neutral', -opt.cost, `Baliho dipasang (total ${p.baliho}). Pemilu nanti dapat "dana kampanye" 🪧`), true
    }
  }
}

// Siapa yang sedang harus bertindak: peserta lelang saat lelang, selain itu pemain giliran.
export const actorOf = (s: GameState) => {
  if (s.phase === 'auction' && s.auction) return s.auction.active[s.auction.turn]
  if (s.phase === 'opening') return Math.max(0, s.openingRolls.findIndex((r) => r === null))
  return s.current
}

export const auctionStep = (s: GameState, sq: number) => Math.max(100, Math.round(price(s, sq) * 0.1 / 50) * 50)
export const auctionMin = (s: GameState) => {
  const a = s.auction
  if (!a) return 0
  return a.leader === null ? Math.round(price(s, a.sq) * E.auctionStartRate / 50) * 50 : a.bid + auctionStep(s, a.sq)
}

// Menutup uang minus dengan kerugian sekecil mungkin:
// gadai tanah kosong di luar grup penuh → pinjol kecil → jual bangunan → gadai sisanya → pinjol sisa plafon → bangkrut.
export function liquidationAction(s: GameState, pid: number): Action {
  const p = s.players[pid]
  const owned = ownedBy(s, pid)
  const need = Math.ceil(-p.cash / E.pinjolStep) * E.pinjolStep
  const inFullGroup = (sq: number) => !!BOARD[sq].group && ownsGroup(s, pid, BOARD[sq].group!)
  const byValue = (a: number, b: number) => mortgageValue(s, a) - mortgageValue(s, b)
  const loose = owned.filter((sq) => canMortgage(s, pid, sq) && !inFullGroup(sq)).sort(byValue)
  if (loose.length) return { type: 'MORTGAGE', sq: loose.find((sq) => mortgageValue(s, sq) >= -p.cash) ?? loose[loose.length - 1] }
  const room = pinjolRoom(s, pid)
  if (room >= need && p.debt + need <= E.pinjolLimit * s.ih * 0.5) return { type: 'PINJOL', amount: need }
  const sellable = owned.filter((sq) => canSellBuilding(s, pid, sq)).sort((a, b) => s.props[a].level - s.props[b].level)
  if (sellable.length) return { type: 'SELL_BUILDING', sq: sellable[0] }
  const rest = owned.filter((sq) => canMortgage(s, pid, sq)).sort(byValue)
  if (rest.length) return { type: 'MORTGAGE', sq: rest[0] }
  if (room > 0) return { type: 'PINJOL', amount: Math.min(room, need) }
  return { type: 'BANKRUPT' }
}

// ---------- helper mutasi ----------

function log(c: Ctx, text: string) {
  c.s.log.push({ round: c.s.round, text })
  if (c.s.log.length > 80) c.s.log.splice(0, c.s.log.length - 80)
}

function change(c: Ctx, pid: number, delta: number, sq?: number) {
  delta = Math.round(delta)
  if (!delta) return
  c.s.players[pid].cash += delta
  c.ev.push({ type: 'money', player: pid, delta, sq })
}

// `from` membayar `amount` ke `to` (null = bank/negara). Uang boleh minus; harus ditutup sebelum selesai giliran.
function transfer(c: Ctx, from: number, to: number | null, amount: number, sq?: number) {
  amount = Math.round(amount)
  if (amount <= 0) return
  change(c, from, -amount, sq)
  if (to !== null) change(c, to, amount)
  if (c.s.players[from].cash < 0) c.s.lastCreditor = to
  if (from !== c.s.current) settleOffTurn(c, from)
}

// Pemain yang bukan gilirannya tidak bisa klik apa-apa, jadi utangnya dilunasi otomatis.
function settleOffTurn(c: Ctx, pid: number) {
  for (let guard = 0; guard < 50 && c.s.players[pid].cash < 0 && !c.s.players[pid].bankrupt; guard++) {
    const a = liquidationAction(c.s, pid)
    if (a.type === 'BANKRUPT') bankrupt(c, pid)
    else applyManage(c, pid, a)
  }
}

// Bu RT kenal orang kelurahan: pungli tidak berlaku.
function immuneToPungli(c: Ctx, p: Player, sq?: number) {
  if (p.character !== 'burt') return false
  c.ev.push({ type: 'info', text: 'Bu RT kenal orang kelurahan 😎', sq, player: sq === undefined ? p.id : undefined })
  log(c, `${p.name} lolos pungli. Kenal orang kelurahan.`)
  return true
}

// Buzzer kebal Pasal Karet.
function immuneToPasalKaret(c: Ctx, p: Player) {
  if (p.character !== 'buzzer') return false
  c.ev.push({ type: 'info', text: 'Buzzer kebal Pasal Karet 😎', player: p.id })
  log(c, `${p.name} kebal Pasal Karet. Namanya juga buzzer.`)
  return true
}

function sendToJail(c: Ctx, p: Player) {
  if (c.s.headline === 'H17' && p.cash >= E.richImmunity * c.s.ih) {
    c.ev.push({ type: 'info', text: 'Hukum tumpul ke atas 😎', player: p.id })
    log(c, `${p.name} lolos dari Pasal Karet. Uangnya banyak.`)
    return
  }
  c.ev.push({ type: 'stamp', sq: p.pos, text: 'MANGKRAK' })
  p.pos = JAIL_SQ
  p.jailed = true
  p.jailTurns = 0
  p.stats.mangkrak++
  c.s.canRollAgain = false
  c.s.doubles = 0
  c.ev.push({ type: 'teleport', player: p.id, to: JAIL_SQ })
  c.ev.push({ type: 'jail', player: p.id })
  log(c, `${p.name} masuk Kasus Mangkrak. Nunggu viral dulu.`)
}

function payday(c: Ctx, p: Player) {
  const s = c.s
  const ch = CHARACTER_BY_ID[p.character]
  const phk = s.headline === 'H7' && ch.id !== 'pns' && rand(s) < 1 / 3
  const umr = Math.round(E.umr * s.umrIndex * ch.umrMult * (phk ? 0.5 : 1))
  // Gajian selalu menyisakan uang: potongan (biaya hidup + cicilan) dibatasi.
  const maxCut = Math.round(umr * (1 - ch.takeHome))
  const hidup = Math.min(maxCut, Math.round(E.livingCost * s.ih * (s.headline === 'H4' ? 1.2 : 1)))
  const cicilan = Math.min(maxCut - hidup, Math.round(p.debt * E.pinjolInstallment))
  const net = umr - hidup - cicilan
  p.debt -= cicilan
  p.stats.gaji += umr
  p.stats.biayaHidup += hidup
  p.cash += net
  if (p.cash < 0) s.lastCreditor = null
  c.ev.push({ type: 'payday', player: p.id, umr, hidup, cicilan, net })
  log(c, `${p.name} gajian${phk ? ' (kena PHK, gaji cuma cair setengah!)' : ''}. Diterima ${rp(net, true)}.`)
  if (s.props[KERETA_CEPAT_SQ].owner === p.id) {
    transfer(c, p.id, null, E.keretaCepatInstallment * s.ih, KERETA_CEPAT_SQ)
    log(c, `${p.name} bayar cicilan utang proyek Kereta Cepat.`)
  }
}

// Gajian & jendela bangun hanya kalau MELEWATI START. Berhenti pas di START: gaji ditahan.
function movePath(c: Ctx, p: Player, steps: number, collectStart = true) {
  const path: number[] = []
  let passedStart = false
  const dir = steps < 0 ? -1 : 1
  const n = Math.abs(steps)
  for (let k = 0; k < n; k++) {
    p.pos = (p.pos + dir + SIZE) % SIZE
    path.push(p.pos)
    if (p.pos === 0 && dir > 0) {
      if (!p.lapped) c.ev.push({ type: 'info', text: 'Putaran pertama beres! Sekarang boleh beli tanah 🚩', player: p.id })
      p.lapped = true
      if (k < n - 1) passedStart = true
    }
  }
  c.ev.push({ type: 'move', player: p.id, path })
  if (passedStart && collectStart) {
    payday(c, p)
    if (ownedBy(c.s, p.id).some((sq) => BOARD[sq].type === 'prop')) {
      c.s.buildWindow = true
      c.s.builtThisTurn = []
    }
  }
}

function moveTo(c: Ctx, p: Player, target: number, collectStart: boolean) {
  const steps = (target - p.pos + SIZE) % SIZE
  movePath(c, p, steps, collectStart)
}

function drawCard(c: Ctx, deck: 'viral' | 'bansos'): Card {
  const id = c.s.decks[deck].shift() as string
  const card = CARD_BY_ID[id]
  if (card.effect.kind !== 'jailCard') c.s.decks[deck].push(id)
  if (deck === 'viral') {
    for (const b of activePlayers(c.s)) if (b.character === 'buzzer') change(c, b.id, E.buzzerFee * c.s.ih)
  }
  return card
}

function applyCard(c: Ctx, p: Player, card: Card, diceTotal: number, isDouble: boolean) {
  const s = c.s
  const eff = card.effect
  c.ev.push({ type: 'card', player: p.id, card: card.id })
  log(c, `${p.name} dapat kartu: "${card.text}"`)
  switch (eff.kind) {
    case 'money': {
      let amount = eff.amount * s.ih
      if (card.pungli && amount < 0 && immuneToPungli(c, p)) break
      if (amount > 0 && card.deck === 'bansos' && s.headline === 'H9') amount /= 2
      if (amount > 0 && card.deck === 'viral' && s.headline === 'H18') amount *= 2
      if (amount > 0) change(c, p.id, amount)
      else transfer(c, p.id, null, -amount)
      if (card.pungli && amount < 0) p.stats.pungli += Math.round(-amount)
      break
    }
    case 'pctCash':
      transfer(c, p.id, null, Math.max(0, p.cash) * -eff.pct)
      break
    case 'debtPct': {
      const pay = Math.round(p.debt * eff.pct)
      if (!pay) {
        c.ev.push({ type: 'info', text: 'Kamu selamat... kali ini.', player: p.id })
        break
      }
      p.debt -= pay
      transfer(c, p.id, null, pay)
      break
    }
    case 'jail':
      if (!immuneToPasalKaret(c, p)) sendToJail(c, p)
      break
    case 'jailCard':
      p.jailCards++
      break
    case 'moveTo':
      moveTo(c, p, eff.sq, eff.collectStart)
      if (!eff.noRent) land(c, p, diceTotal, isDouble)
      break
    case 'moveBy':
      movePath(c, p, eff.steps)
      land(c, p, diceTotal, isDouble)
      break
    case 'nearestTransport': {
      let target = (p.pos + 1) % SIZE
      while (BOARD[target].type !== 'transport') target = (target + 1) % SIZE
      moveTo(c, p, target, true)
      land(c, p, diceTotal, isDouble, 2)
      break
    }
    case 'fromEach':
      for (const other of activePlayers(s)) {
        if (other.id !== p.id) transfer(c, other.id, p.id, eff.amount * s.ih)
      }
      break
    case 'toEach':
      for (const other of activePlayers(s)) {
        if (other.id !== p.id) transfer(c, p.id, other.id, eff.amount * s.ih)
      }
      break
    case 'perProperty': {
      if (card.pungli && immuneToPungli(c, p)) break
      const n = ownedBy(s, p.id).length
      if (!n) {
        c.ev.push({ type: 'info', text: 'Belum punya tanah, ormas pergi 😅', player: p.id })
        break
      }
      const fee = n * eff.amount * s.ih
      if (card.pungli) p.stats.pungli += Math.round(fee)
      transfer(c, p.id, null, fee)
      break
    }
    case 'moneyJail':
      change(c, p.id, eff.amount * s.ih)
      if (!immuneToPasalKaret(c, p)) sendToJail(c, p)
      break
    case 'perBuilding': {
      const levels = ownedBy(s, p.id).reduce((n, sq) => n + s.props[sq].level, 0)
      if (levels) transfer(c, p.id, null, levels * eff.amount * s.ih)
      else c.ev.push({ type: 'info', text: 'Untung belum punya bangunan 😅', player: p.id })
      break
    }
    case 'inflation':
      s.ih *= 1 + eff.pct
      c.ev.push({ type: 'info', text: `Harga naik ${Math.round(eff.pct * 100)}%!` })
      break
    case 'skipTurn':
      p.skipTurns++
      break
    case 'vendorMBG':
      p.vendorMBG = true
      change(c, p.id, eff.amount * s.ih)
      break
    case 'none':
      break
  }
}

function land(c: Ctx, p: Player, diceTotal: number, isDouble: boolean, rentMult = 1) {
  const s = c.s
  const sq = p.pos
  const square = BOARD[sq]
  if (p.jailed) return

  if (isBuyable(square)) {
    const prop = s.props[sq]
    if (prop.owner === null) {
      if (p.lapped) s.pendingBuy = sq
      else c.ev.push({ type: 'info', text: 'Putaran pertama: keliling dulu, belum boleh beli 🧭', sq })
    } else if (prop.owner !== p.id) {
      const rent = rentFor(s, sq, diceTotal, isDouble) * rentMult
      const owner = s.players[prop.owner]
      if (!rent) {
        const why = prop.mortgaged ? 'Lagi digadai, gratis! 🙏' : sq === PLN_SQ && isDouble ? 'Listrik padam, sewa batal ⚡' : 'Sewa nol. Hoki!'
        c.ev.push({ type: 'info', text: why, sq })
        return
      }
      p.stats.sewaDibayar += rent
      owner.stats.sewaDiterima += rent
      log(c, `${p.name} bayar sewa ${rp(rent)} ke ${owner.name} di ${square.name}.`)
      transfer(c, p.id, owner.id, rent, sq)
    }
    return
  }

  switch (square.type) {
    case 'card':
      applyCard(c, p, drawCard(c, square.deck!), diceTotal, isDouble)
      break
    case 'tax': {
      let fee: number
      if (square.tax === 'pungli') {
        if (immuneToPungli(c, p, sq)) break
        fee = E.pungliFee * s.ih * (s.headline === 'H15' ? 2 : 1)
        p.stats.pungli += Math.round(fee)
      } else if (square.tax === 'ppn') {
        fee = Math.max(E.ppnMin * s.ih, Math.max(0, p.cash) * E.ppnRate) * (s.headline === 'H15' ? 2 : 1)
        p.stats.pajak += Math.round(fee)
      } else {
        fee = E.iuranFee * s.ih * (p.character === 'pns' ? 2 : 1) * (s.headline === 'H15' ? 2 : 1)
        p.stats.pajak += Math.round(fee)
      }
      log(c, `${p.name} bayar ${square.name} ${rp(fee)}.`)
      transfer(c, p.id, null, fee, sq)
      break
    }
    case 'parking': {
      if (immuneToPungli(c, p, sq)) break
      const fee = E.parkingFee * s.ih * (s.headline === 'H15' ? 2 : 1)
      p.stats.pungli += Math.round(fee)
      c.ev.push({ type: 'stamp', sq, text: 'PRIT!' })
      log(c, `${p.name} bayar parkir liar. Padahal cuma lewat.`)
      transfer(c, p.id, null, fee, sq)
      break
    }
    case 'gotojail':
      if (!immuneToPasalKaret(c, p)) sendToJail(c, p)
      break
    case 'choice':
      s.choice = { kind: square.choice!, sq }
      break
    case 'flood': {
      // Banjir merendam grup warna terdekat di depan: sewanya nol sampai ronde berikutnya.
      let i = (sq + 1) % SIZE
      while (!BOARD[i].group) i = (i + 1) % SIZE
      const group = BOARD[i].group!
      s.flood = { group, untilRound: s.round + 1 }
      c.ev.push({ type: 'flood', group })
      log(c, `🌊 Banjir merendam ${GROUPS[group].name}! Sewa di sana nol sampai ronde ${s.round + 1}.`)
      break
    }
    case 'jail':
      c.ev.push({ type: 'info', text: 'Cuma mampir 👀', sq })
      break
    case 'start':
      c.ev.push({ type: 'info', text: 'Pas di START: gaji ditahan HRD 😅', sq })
      log(c, `${p.name} berhenti pas di START. Gaji ditahan HRD.`)
      break
  }
}

function newYear(c: Ctx) {
  const s = c.s
  const pct = Math.round((E.inflationMin + rand(s) * (E.inflationMax - E.inflationMin)) * 100) / 100
  s.ih *= 1 + pct
  s.year++
  const id = (s.decks.headline.shift() as HeadlineId | undefined) ?? null
  if (id) s.decks.headline.push(id)
  s.headline = id
  if (id !== 'H6') s.umrIndex *= 1 + E.umrRaisePerYear
  c.ev.push({ type: 'year', pct, ih: s.ih, headline: id })
  log(c, `📈 Tahun ke-${s.year}: harga naik ${Math.round(pct * 100)}%!${id ? ` Headline: ${HEADLINE_BY_ID[id].title}.` : ''}`)

  if (id === 'H1') s.ih *= 1.05
  if (id === 'H16') s.ih *= 1.03
  if (id === 'H19') {
    for (const p of activePlayers(s)) {
      const n = ownedBy(s, p.id).length
      if (!n || p.character === 'burt') continue
      const fee = n * E.ormasThr * s.ih
      p.stats.pungli += Math.round(fee)
      transfer(c, p.id, null, fee)
    }
  }
  if (id === 'H8') {
    for (const p of activePlayers(s)) if (p.cash > 0) transfer(c, p.id, null, p.cash * 0.05)
  }
  if (id === 'H14') {
    for (const p of activePlayers(s)) {
      if (!p.vendorMBG) continue
      p.vendorMBG = false
      log(c, `${p.name} kena audit dapur MBG.`)
      transfer(c, p.id, null, 1000 * s.ih)
    }
  }
  for (const p of activePlayers(s)) {
    if (p.character !== 'crypto' || p.cash <= 0) continue
    const swing = Math.round((-0.2 + rand(s) * 0.5) * 100) / 100
    log(c, `${p.name}: portofolio crypto ${swing >= 0 ? 'to the moon 🚀' : 'kena rug pull 📉'} (${swing >= 0 ? '+' : ''}${Math.round(swing * 100)}%).`)
    if (swing >= 0) change(c, p.id, p.cash * swing)
    else transfer(c, p.id, null, p.cash * -swing)
  }
  if (s.year % E.pemiluEveryYears === 0) pemilu(c)
}

// Pesta demokrasi: serangan fajar + bansos untuk semua, lalu harga naik.
function pemilu(c: Ctx) {
  const s = c.s
  const gift = Math.round(E.pemiluGift * s.ih)
  c.ev.push({ type: 'pemilu', gift })
  log(c, `🗳️ PEMILU! Semua dapat serangan fajar + bansos ${rp(gift)}. Habis itu harga naik 5%.`)
  for (const p of activePlayers(s)) {
    change(c, p.id, gift + p.baliho * E.balihoPemilu * s.ih)
    if (p.baliho) log(c, `🪧 ${p.name} dapat "dana kampanye" dari ${p.baliho} baliho.`)
  }
  s.ih *= 1.05
}

function endGame(c: Ctx) {
  const s = c.s
  const ranked = activePlayers(s).sort((a, b) => netWorth(s, b.id) - netWorth(s, a.id))
  s.winner = ranked[0]?.id ?? null
  s.phase = 'gameover'
  c.ev.push({ type: 'gameover', winner: s.winner })
  log(c, s.winner !== null ? `🏁 Game selesai! ${s.players[s.winner].name} jadi Sultan +62.` : '🏁 Game selesai.')
}

function advanceTurn(c: Ctx) {
  const s = c.s
  const n = s.players.length
  for (let guard = 0; guard < n * 4; guard++) {
    const idx = s.turnOrder.indexOf(s.current)
    const next = s.turnOrder[(idx + 1) % n]
    const wrapped = idx + 1 >= n
    s.current = next
    if (wrapped) {
      s.round++
      if (s.maxRounds !== null && s.round > s.maxRounds) return endGame(c)
      if ((s.round - 1) % E.roundsPerYear === 0) newYear(c)
    }
    const p = s.players[next]
    if (p.bankrupt) continue
    s.phase = 'roll'
    s.doubles = 0
    s.canRollAgain = false
    s.pendingBuy = null
    s.lastCreditor = null
    s.buildWindow = false
    s.builtThisTurn = []
    s.tradeTried = false
    if (p.debt > 0) {
      const interest = Math.round(p.debt * pinjolRate(s))
      p.debt += interest
      p.stats.bungaPinjol += interest
    }
    if (p.skipTurns > 0) {
      p.skipTurns--
      log(c, `${p.name} melewatkan giliran (masih antre BBM).`)
      c.ev.push({ type: 'info', text: 'Lewati giliran ⛽', player: p.id })
      continue
    }
    c.ev.push({ type: 'turn', player: p.id })
    if (activePlayers(s).length <= 1) endGame(c)
    return
  }
}

function bankrupt(c: Ctx, pid: number) {
  const s = c.s
  const p = s.players[pid]
  const creditor = s.lastCreditor !== null && !s.players[s.lastCreditor].bankrupt && s.lastCreditor !== pid ? s.lastCreditor : null
  for (const sq of ownedBy(s, pid)) {
    const prop = s.props[sq]
    if (creditor === null) s.props[sq] = { owner: null, level: 0, mortgaged: false }
    else prop.owner = creditor
  }
  for (let k = 0; k < p.jailCards; k++) s.decks.viral.push('V2')
  p.jailCards = 0
  p.cash = 0
  p.debt = 0
  p.bankrupt = true
  p.bankruptRound = s.round
  c.ev.push({ type: 'bankrupt', player: pid })
  log(c, `🪦 ${p.name} BANGKRUT.${creditor !== null ? ` Asetnya diambil ${s.players[creditor].name}.` : ' Asetnya disita negara.'}`)
  if (activePlayers(s).length <= 1) return endGame(c)
  if (pid === s.current) advanceTurn(c)
}

// Aksi kelola aset/utang yang boleh dilakukan kapan saja di giliran sendiri (juga dipakai pelunasan otomatis).
function applyManage(c: Ctx, pid: number, a: Action) {
  const s = c.s
  const p = s.players[pid]
  switch (a.type) {
    case 'BUILD': {
      if (!canBuild(s, pid, a.sq)) return
      const cost = buildCost(s, a.sq)
      if (p.cash < cost) return
      s.props[a.sq].level++
      s.builtThisTurn.push(a.sq)
      p.stats.bangun++
      transfer(c, pid, null, cost, a.sq)
      c.ev.push({ type: 'build', sq: a.sq, level: s.props[a.sq].level })
      log(c, `${p.name} bangun ${LEVEL_NAMES[s.props[a.sq].level]} di ${BOARD[a.sq].name}.`)
      return
    }
    case 'SELL_BUILDING': {
      if (!canSellBuilding(s, pid, a.sq)) return
      s.props[a.sq].level--
      change(c, pid, sellValue(s, a.sq), a.sq)
      c.ev.push({ type: 'build', sq: a.sq, level: s.props[a.sq].level })
      log(c, `${p.name} jual bangunan di ${BOARD[a.sq].name}.`)
      return
    }
    case 'MORTGAGE': {
      if (!canMortgage(s, pid, a.sq)) return
      s.props[a.sq].mortgaged = true
      change(c, pid, mortgageValue(s, a.sq), a.sq)
      c.ev.push({ type: 'stamp', sq: a.sq, text: 'GADAI' })
      log(c, `${p.name} menggadaikan ${BOARD[a.sq].name} ke Pegadaian.`)
      return
    }
    case 'UNMORTGAGE': {
      if (!canUnmortgage(s, pid, a.sq)) return
      s.props[a.sq].mortgaged = false
      transfer(c, pid, null, unmortgageCost(s, a.sq), a.sq)
      c.ev.push({ type: 'stamp', sq: a.sq, text: 'TEBUS' })
      log(c, `${p.name} menebus ${BOARD[a.sq].name}.`)
      return
    }
    case 'PINJOL': {
      const amount = Math.min(Math.round(a.amount), pinjolRoom(s, pid))
      if (amount <= 0) return
      p.debt += amount
      change(c, pid, amount)
      c.ev.push({ type: 'pinjol', player: pid, amount })
      log(c, `${p.name} ambil pinjol ${rp(amount)}. Semoga kuat 💀`)
      return
    }
    case 'REPAY': {
      const amount = Math.min(Math.round(a.amount), p.debt, Math.max(0, p.cash))
      if (amount <= 0) return
      p.debt -= amount
      change(c, pid, -amount)
      log(c, `${p.name} bayar utang pinjol ${rp(amount)}.`)
      return
    }
    default:
      return
  }
}

// Lempar dadu urutan main: total tertinggi jalan duluan.
// Seri: dadu tunggal tertinggi menang, lalu yang lempar duluan.
function openingRoll(c: Ctx) {
  const s = c.s
  const pid = actorOf(s)
  const dice: [number, number] = [d6(s), d6(s)]
  s.openingRolls[pid] = dice
  s.dice = dice
  c.ev.push({ type: 'dice', dice })
  c.ev.push({ type: 'info', text: `Dapat ${dice[0] + dice[1]}!`, player: pid })
  log(c, `🎲 ${s.players[pid].name} lempar dadu urutan: ${dice[0]} + ${dice[1]} = ${dice[0] + dice[1]}.`)
  if (s.openingRolls.some((r) => r === null)) return
  const score = (i: number) => {
    const [a, b] = s.openingRolls[i]!
    return (a + b) * 10 + Math.max(a, b)
  }
  s.turnOrder = s.players.map((_, i) => i).sort((a, b) => score(b) - score(a) || a - b)
  s.current = s.turnOrder[0]
  s.phase = 'roll'
  c.ev.push({ type: 'order', order: s.turnOrder })
  log(c, `📋 Urutan main: ${s.turnOrder.map((i, k) => `${k + 1}. ${s.players[i].name}`).join(', ')}.`)
  c.ev.push({ type: 'turn', player: s.current })
}

function roll(c: Ctx) {
  const s = c.s
  const p = s.players[s.current]
  const oneDie = s.headline === 'H2'
  const a = d6(s)
  const b = oneDie ? 0 : d6(s)
  s.dice = [a, b]
  c.ev.push({ type: 'dice', dice: [a, b] })
  const isDouble = !oneDie && a === b
  s.canRollAgain = false

  if (p.jailed) {
    const free = oneDie ? a === 6 : isDouble
    if (free) {
      p.jailed = false
      p.luxuryStays = 0
      c.ev.push({ type: 'free', player: p.id })
      log(c, `${p.name} bebas dari Kasus Mangkrak! Kasusnya akhirnya viral.`)
    } else {
      p.jailTurns++
      if (p.jailTurns < E.maxJailTurns) {
        log(c, `${p.name} gagal dapat ${oneDie ? 'angka 6' : 'dadu kembar'}. Kasus masih mangkrak.`)
        c.ev.push({ type: 'info', text: 'Masih mangkrak 🗂️', sq: JAIL_SQ })
        s.phase = 'action'
        return
      }
      p.jailed = false
      p.luxuryStays = 0
      transfer(c, p.id, null, bailCost(s))
      c.ev.push({ type: 'free', player: p.id })
      log(c, `${p.name} sudah 3 giliran mangkrak, terpaksa bayar uang damai.`)
    }
  } else if (isDouble) {
    s.doubles++
    if (s.doubles >= 3) {
      log(c, `${p.name} dapat kembar 3× berturut-turut. Mencurigakan!`)
      sendToJail(c, p)
      s.phase = 'action'
      return
    }
    s.canRollAgain = true
  }

  movePath(c, p, a + b + (p.character === 'ojol' ? 1 : 0))
  land(c, p, a + b, isDouble)
  if (p.jailed) s.canRollAgain = false
  s.phase = s.pendingBuy !== null ? 'buy' : s.choice ? 'choice' : 'action'
}

// ---------- reducer ----------

export function step(state: GameState, action: Action): StepResult {
  const s: GameState = structuredClone(state)
  const c: Ctx = { s, ev: [] }
  const p = s.players[s.current]
  if (s.phase === 'gameover') return { state, events: [] }

  switch (action.type) {
    case 'ROLL':
      if (s.phase === 'opening') {
        openingRoll(c)
        break
      }
      if (s.phase !== 'roll' && !(s.phase === 'action' && s.canRollAgain && p.cash >= 0)) return { state, events: [] }
      roll(c)
      break
    case 'BUY': {
      if (s.phase !== 'buy' || s.pendingBuy === null) return { state, events: [] }
      const sq = s.pendingBuy
      const cost = price(s, sq)
      if (p.cash < cost) return { state, events: [] }
      s.props[sq].owner = p.id
      transfer(c, p.id, null, cost, sq)
      c.ev.push({ type: 'buy', player: p.id, sq })
      c.ev.push({ type: 'stamp', sq, text: 'SAH!' })
      log(c, `${p.name} beli ${BOARD[sq].name} seharga ${rp(cost)}.`)
      s.pendingBuy = null
      s.phase = 'action'
      break
    }
    case 'SKIP_BUY': {
      if (s.phase !== 'buy' || s.pendingBuy === null) return { state, events: [] }
      const sq = s.pendingBuy
      s.pendingBuy = null
      s.phase = 'action'
      // Yang menolak beli tidak ikut lelang.
      const n = s.players.length
      const bidders = Array.from({ length: n - 1 }, (_, k) => (s.current + 1 + k) % n).filter((i) => !s.players[i].bankrupt && s.players[i].cash > 0)
      if (bidders.length) {
        s.auction = { sq, bid: 0, leader: null, active: bidders, turn: 0 }
        s.phase = 'auction'
        c.ev.push({ type: 'auction', sq })
        log(c, `🔨 ${BOARD[sq].name} dilelang! Mulai dari ${rp(auctionMin(s))}.`)
      }
      break
    }
    case 'BID':
    case 'PASS_BID': {
      const a = s.auction
      if (s.phase !== 'auction' || !a) return { state, events: [] }
      const who = s.players[a.active[a.turn]]
      if (action.type === 'BID') {
        const amount = Math.round(action.amount)
        if (amount < auctionMin(s) || amount > who.cash) return { state, events: [] }
        a.bid = amount
        a.leader = who.id
        c.ev.push({ type: 'bid', player: who.id, amount })
        log(c, `🔨 ${who.name} menawar ${rp(amount)}.`)
        a.turn = (a.turn + 1) % a.active.length
      } else {
        a.active.splice(a.turn, 1)
        c.ev.push({ type: 'info', text: 'Mundur 🙅', player: who.id })
        if (a.active.length) a.turn %= a.active.length
      }
      if (a.active.length > 1 && a.active[a.turn] === a.leader) a.turn = (a.turn + 1) % a.active.length
      const done = a.active.length === 0 || (a.active.length === 1 && a.active[0] === a.leader)
      if (done) {
        if (a.leader !== null) {
          const winner = s.players[a.leader]
          s.props[a.sq].owner = winner.id
          winner.stats.lelangMenang++
          transfer(c, winner.id, null, a.bid, a.sq)
          c.ev.push({ type: 'stamp', sq: a.sq, text: 'LELANG!' })
          log(c, `🔨 ${winner.name} menang lelang ${BOARD[a.sq].name} seharga ${rp(a.bid)}.`)
        } else {
          log(c, `🔨 Tidak ada yang mau ${BOARD[a.sq].name}. Tanahnya tetap nganggur.`)
        }
        c.ev.push({ type: 'auctionEnd', sq: a.sq, winner: a.leader, amount: a.bid })
        s.auction = null
        s.phase = 'action'
      }
      break
    }
    case 'PAY_BAIL':
      if (s.phase !== 'roll' || !p.jailed) return { state, events: [] }
      p.jailed = false
      p.luxuryStays = 0
      transfer(c, p.id, null, bailCost(s))
      c.ev.push({ type: 'free', player: p.id })
      log(c, `${p.name} bayar uang damai ${rp(bailCost(s))}. Kasus ditutup.`)
      break
    case 'CHOOSE': {
      if (s.phase !== 'choice' || !s.choice) return { state, events: [] }
      const kind = s.choice.kind
      s.choice = null
      if (!resolveChoice(c, p, kind, action.option)) return { state, events: [] }
      if (s.phase === 'choice') s.phase = 'action'
      break
    }
    case 'STAY_LUXURY': {
      if (!canStayLuxury(s, p.id)) return { state, events: [] }
      const fee = luxuryCost(s)
      p.luxuryStays++
      p.jailTurns = 0
      p.stats.selMewah++
      transfer(c, p.id, null, fee, JAIL_SQ)
      c.ev.push({ type: 'stamp', sq: JAIL_SQ, text: 'SEL MEWAH' })
      log(c, `${p.name} betah di sel mewah (${rp(fee)}). Sewa tetap jalan, kasur empuk.`)
      advanceTurn(c)
      break
    }
    case 'USE_JAIL_CARD':
      if (s.phase !== 'roll' || !p.jailed || p.jailCards < 1) return { state, events: [] }
      p.jailed = false
      p.luxuryStays = 0
      p.jailCards--
      s.decks.viral.push('V2')
      c.ev.push({ type: 'free', player: p.id })
      log(c, `${p.name} pakai kartu No Viral No Justice. Bebas!`)
      break
    case 'END_TURN':
      if (s.phase !== 'action' || s.canRollAgain || p.cash < 0) return { state, events: [] }
      advanceTurn(c)
      break
    case 'BANKRUPT':
      if (p.cash >= 0) return { state, events: [] }
      bankrupt(c, p.id)
      break
    case 'TRADE': {
      if (s.phase !== 'roll' && s.phase !== 'action') return { state, events: [] }
      const o = action.offer
      if (!validTrade(s, o)) return { state, events: [] }
      s.tradeTried = true
      const to = s.players[o.to]
      if (!action.accepted) {
        c.ev.push({ type: 'info', text: `${to.name}: "Ogah, rugi bandar" 🙅`, player: o.to })
        log(c, `${to.name} menolak tawaran ${p.name}.`)
        break
      }
      p.stats.trades++
      to.stats.trades++
      for (const sq of o.give) s.props[sq].owner = o.to
      for (const sq of o.take) s.props[sq].owner = o.from
      if (o.cashGive) transfer(c, o.from, o.to, o.cashGive)
      if (o.cashTake) transfer(c, o.to, o.from, o.cashTake)
      for (const sq of [...o.give, ...o.take]) c.ev.push({ type: 'stamp', sq, text: 'DEAL!' })
      c.ev.push({ type: 'trade', from: o.from, to: o.to })
      const names = (sqs: number[]) => sqs.map((i) => BOARD[i].name).join(', ')
      const parts = [
        o.give.length ? `${names(o.give)} → ${to.name}` : '',
        o.take.length ? `${names(o.take)} → ${p.name}` : '',
        o.cashGive ? `${rp(o.cashGive)} → ${to.name}` : '',
        o.cashTake ? `${rp(o.cashTake)} → ${p.name}` : '',
      ].filter(Boolean)
      log(c, `🤝 Deal ${p.name} × ${to.name}: ${parts.join('; ')}.`)
      break
    }
    default:
      if (s.phase === 'auction' || s.phase === 'choice') return { state, events: [] }
      if (s.phase === 'buy' && action.type !== 'PINJOL' && action.type !== 'MORTGAGE' && action.type !== 'SELL_BUILDING') {
        return { state, events: [] }
      }
      applyManage(c, p.id, action)
  }
  return { state: s, events: c.ev }
}
