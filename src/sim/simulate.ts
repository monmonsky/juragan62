// Simulasi bot vs bot untuk menyetel ekonomi (PRD §13). Jalankan: npm run sim [jumlahGame] [mix|rakyat] [ronde]

import { START_PLAYERS } from '../data/economy.ts'
import { botAction } from '../engine/bot.ts'
import { createGame, netWorth, step } from '../engine/engine.ts'

const games = Number(process.argv[2] ?? 500)
const characters = process.argv[3] ?? 'mix'
const players = 4
const maxRounds = Number(process.argv[4] ?? 30)

let stuck = 0
let earlyEnd = 0
let totalBankrupt = 0
let firstBankruptSum = 0
let firstBankruptCount = 0
let finalIh = 0
let pinjolUsers = 0
let mangkrak = 0
let pungli = 0
let trades = 0
const winsByChar: Record<string, number> = {}
const worthSamples: number[] = []
const bankruptHist = new Array(players + 1).fill(0)

for (let g = 0; g < games; g++) {
  let s = createGame(
    START_PLAYERS.slice(0, players).map((p) => ({ ...p, character: characters === 'mix' ? p.character : 'rakyat', isBot: true })),
    { maxRounds, seed: g + 1 },
  )
  let steps = 0
  while (s.phase !== 'gameover') {
    const action = botAction(s)
    if (!action || action.type === 'ASK_TRADE' || ++steps > 20000) {
      stuck++
      break
    }
    s = step(s, action).state
  }
  const dead = s.players.filter((p) => p.bankrupt)
  totalBankrupt += dead.length
  bankruptHist[dead.length]++
  if (s.round <= maxRounds) earlyEnd++
  const first = Math.min(...dead.map((p) => p.bankruptRound ?? Infinity))
  if (first !== Infinity) {
    firstBankruptSum += first
    firstBankruptCount++
  }
  finalIh += s.ih
  trades += s.log.filter((l) => l.text.startsWith('🤝')).length
  if (s.winner !== null) winsByChar[s.players[s.winner].character] = (winsByChar[s.players[s.winner].character] ?? 0) + 1
  for (const p of s.players) {
    if (p.stats.bungaPinjol > 0) pinjolUsers++
    mangkrak += p.stats.mangkrak
    pungli += p.stats.pungli
    if (!p.bankrupt) worthSamples.push(netWorth(s, p.id))
  }
}

const pct = (n: number) => `${((n / games) * 100).toFixed(0)}%`
worthSamples.sort((a, b) => a - b)
console.log(`Simulasi ${games} game, ${players} bot, maks ${maxRounds} ronde`)
console.log(`- Game macet (bug)           : ${stuck}`)
console.log(`- Selesai sebelum ronde ${maxRounds}  : ${pct(earlyEnd)} (tinggal 1 pemain)`)
console.log(`- Rata-rata pemain bangkrut  : ${(totalBankrupt / games).toFixed(2)} dari ${players}`)
console.log(`- Distribusi jumlah bangkrut : ${bankruptHist.map((n, i) => `${i}:${pct(n)}`).join('  ')}`)
console.log(`- Ronde bangkrut pertama     : ${firstBankruptCount ? (firstBankruptSum / firstBankruptCount).toFixed(1) : '-'}`)
console.log(`- Indeks Harga akhir (rata2) : ${(finalIh / games).toFixed(2)}`)
console.log(`- Pemain yang pernah pinjol  : ${((pinjolUsers / (games * players)) * 100).toFixed(0)}%`)
console.log(`- Masuk Mangkrak per pemain  : ${(mangkrak / (games * players)).toFixed(2)}`)
console.log(`- Pungli per pemain          : Rp ${Math.round(pungli / (games * players))} rb`)
console.log(`- Deal tukar tanah per game: ${(trades / games).toFixed(2)} (log terakhir saja, perkiraan bawah)`)
console.log(`- Menang per karakter       : ${Object.entries(winsByChar).map(([k, v]) => `${k} ${pct(v)}`).join('  ')}`)
console.log(`- Kekayaan penyintas p10/p50/p90: ${[0.1, 0.5, 0.9].map((q) => worthSamples[Math.floor(q * (worthSamples.length - 1))]).join(' / ')} rb`)
