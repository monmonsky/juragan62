import type { HeadlineId } from '../data/isu-terkini.ts'
import type { CharacterId } from '../data/characters.ts'
import type { ChoiceKind, GroupId } from '../data/board.ts'

export interface Stats {
  gaji: number
  biayaHidup: number
  pungli: number
  bungaPinjol: number
  pajak: number
  mangkrak: number
  selMewah: number
  trades: number
  lelangMenang: number
  judol: number
  tertipu: number
  sewaDibayar: number
  sewaDiterima: number
  bangun: number
}

export interface Player {
  id: number
  name: string
  token: string
  color: string
  isBot: boolean
  character: CharacterId
  cash: number
  debt: number
  pos: number
  jailed: boolean
  jailTurns: number
  jailCards: number
  skipTurns: number
  lapped: boolean
  luxuryStays: number
  baliho: number
  vendorMBG: boolean
  bankrupt: boolean
  bankruptRound: number | null
  stats: Stats
}

export interface Prop {
  owner: number | null
  level: number
  mortgaged: boolean
}

export type Phase = 'opening' | 'roll' | 'buy' | 'auction' | 'choice' | 'action' | 'gameover'

export type Edisi = 'terbaru' | 'klasik'

export interface Auction {
  sq: number
  bid: number
  leader: number | null
  active: number[]
  turn: number
}

export interface LogEntry {
  round: number
  text: string
}

export interface GameState {
  version: 7
  rng: number
  players: Player[]
  props: Record<number, Prop>
  current: number
  round: number
  year: number
  ih: number
  umrIndex: number
  headline: HeadlineId | null
  decks: { viral: string[]; bansos: string[]; headline: HeadlineId[] }
  phase: Phase
  pendingBuy: number | null
  auction: Auction | null
  choice: { kind: ChoiceKind; sq: number } | null
  flood: { group: GroupId; untilRound: number } | null
  turnOrder: number[]
  openingRolls: ([number, number] | null)[]
  edisi: Edisi
  buildWindow: boolean
  builtThisTurn: number[]
  tradeTried: boolean
  canRollAgain: boolean
  doubles: number
  dice: [number, number]
  maxRounds: number | null
  lastCreditor: number | null
  log: LogEntry[]
  winner: number | null
}

export type Action =
  | { type: 'ROLL' }
  | { type: 'BUY' }
  | { type: 'SKIP_BUY' }
  | { type: 'BUILD'; sq: number }
  | { type: 'SELL_BUILDING'; sq: number }
  | { type: 'MORTGAGE'; sq: number }
  | { type: 'UNMORTGAGE'; sq: number }
  | { type: 'PINJOL'; amount: number }
  | { type: 'REPAY'; amount: number }
  | { type: 'PAY_BAIL' }
  | { type: 'USE_JAIL_CARD' }
  | { type: 'STAY_LUXURY' }
  | { type: 'BID'; amount: number }
  | { type: 'PASS_BID' }
  | { type: 'CHOOSE'; option: string }
  | { type: 'END_TURN' }
  | { type: 'BANKRUPT' }
  | { type: 'TRADE'; offer: TradeOffer; accepted: boolean }

export interface TradeOffer {
  from: number
  to: number
  give: number[]
  take: number[]
  cashGive: number
  cashTake: number
}

export type GameEvent =
  | { type: 'dice'; dice: [number, number] }
  | { type: 'move'; player: number; path: number[] }
  | { type: 'teleport'; player: number; to: number }
  | { type: 'money'; player: number; delta: number; sq?: number }
  | { type: 'card'; player: number; card: string }
  | { type: 'buy'; player: number; sq: number }
  | { type: 'build'; sq: number; level: number }
  | { type: 'stamp'; sq: number; text: string }
  | { type: 'payday'; player: number; umr: number; hidup: number; cicilan: number; net: number }
  | { type: 'year'; pct: number; ih: number; headline: HeadlineId | null }
  | { type: 'auction'; sq: number }
  | { type: 'bid'; player: number; amount: number }
  | { type: 'auctionEnd'; sq: number; winner: number | null; amount: number }
  | { type: 'order'; order: number[] }
  | { type: 'choice'; player: number; kind: ChoiceKind; option: string; outcome: 'win' | 'lose' | 'jackpot' | 'neutral' | 'caught'; delta: number; text: string }
  | { type: 'flood'; group: GroupId }
  | { type: 'jail'; player: number }
  | { type: 'free'; player: number }
  | { type: 'pinjol'; player: number; amount: number }
  | { type: 'bankrupt'; player: number }
  | { type: 'turn'; player: number }
  | { type: 'gameover'; winner: number | null }
  | { type: 'info'; text: string; sq?: number; player?: number }
  | { type: 'pemilu'; gift: number }
  | { type: 'trade'; from: number; to: number }

export interface StepResult {
  state: GameState
  events: GameEvent[]
}
