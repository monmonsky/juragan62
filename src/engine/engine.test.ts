import { describe, expect, it } from 'vitest'
import { START_PLAYERS, ECONOMY } from '../data/economy.ts'
import { BOARD, IKN_SQ, JAIL_SQ, PLN_SQ, SIZE, SOLO_SQ } from '../data/board.ts'
import { botAcceptTrade, botAction } from './bot.ts'
import { actorOf, auctionMin, canBuild, createGame, rentFor, step, netWorth } from './engine.ts'
import type { Action, GameState } from './types.ts'

const newGame = (seed = 1, bots = false) =>
  createGame(START_PLAYERS.slice(0, 3).map((p) => ({ ...p, isBot: bots })), { maxRounds: 30, seed })

const run = (s: GameState, ...actions: Action[]) => actions.reduce((acc, a) => step(acc, a).state, s)

describe('engine', () => {
  it('memulai game dengan uang awal dan semua properti kosong', () => {
    const s = newGame()
    expect(s.players.every((p) => p.cash === ECONOMY.startCash)).toBe(true)
    expect(Object.values(s.props).every((p) => p.owner === null)).toBe(true)
    expect(s.phase).toBe('roll')
  })

  it('deterministik untuk seed yang sama', () => {
    const a = step(newGame(42), { type: 'ROLL' }).state
    const b = step(newGame(42), { type: 'ROLL' }).state
    expect(a.dice).toEqual(b.dice)
    expect(a.players[0].pos).toEqual(b.players[0].pos)
  })

  it('tidak mengubah state lama (reducer murni)', () => {
    const s = newGame()
    step(s, { type: 'ROLL' })
    expect(s.players[0].pos).toBe(0)
  })

  it('beli properti saat mendarat di petak kosong', () => {
    let s = newGame()
    s = { ...s, phase: 'buy', pendingBuy: 1 }
    s = run(s, { type: 'BUY' })
    expect(s.props[1].owner).toBe(0)
    expect(s.players[0].cash).toBe(ECONOMY.startCash - 500)
    expect(s.phase).toBe('action')
  })

  it('sewa tanah dobel kalau punya grup penuh, IKN dibagi dua sebelum Mall', () => {
    const s = newGame()
    s.props[1].owner = 1
    expect(rentFor(s, 1, 7, false)).toBe(90)
    s.props[2].owner = 1
    expect(rentFor(s, 1, 7, false)).toBe(180)
    s.props[IKN_SQ].owner = 1
    expect(rentFor(s, IKN_SQ, 7, false)).toBe(450)
  })

  it('PLN padam kalau penyewa dapat dadu kembar', () => {
    const s = newGame()
    s.props[PLN_SQ].owner = 1
    expect(rentFor(s, PLN_SQ, 8, false)).toBe(400)
    expect(rentFor(s, PLN_SQ, 8, true)).toBe(0)
  })

  it('bangun cuma saat lewat START; tanpa grup penuh mentok Ruko, Mall wajib grup penuh', () => {
    const s = newGame()
    s.props[5].owner = 0
    expect(canBuild(s, 0, 5)).toBe(false)
    s.buildWindow = true
    expect(canBuild(s, 0, 5)).toBe(true)
    s.props[5].level = 3
    expect(canBuild(s, 0, 5)).toBe(false)
    s.props[7].owner = 0
    s.props[9].owner = 0
    expect(canBuild(s, 0, 5)).toBe(true)
  })

  it('gajian selalu menyisakan uang: potongan dibatasi', () => {
    let s = newGame()
    s.players[0].pos = SIZE - 2
    s.players[0].debt = 1000
    // cari seed yang langsung melewati START tanpa mendarat di petak lain yang berbiaya
    for (let seed = 1; seed < 200; seed++) {
      const t = structuredClone(s)
      t.rng = seed
      const r = step(t, { type: 'ROLL' })
      const pay = r.events.find((e) => e.type === 'payday')
      if (pay && pay.type === 'payday') {
        // Rakyat Jelata: sisa gaji minimal 60% → potongan maks Rp 2 jt (biaya hidup Rp 2,5 jt terpotong batas)
        expect(pay.umr).toBe(5000)
        expect(pay.hidup).toBe(2000)
        expect(pay.cicilan).toBe(0)
        expect(pay.net).toBe(3000)
        expect(r.state.players[0].debt).toBe(1000)
        return
      }
    }
    throw new Error('tidak ada lemparan yang lewat START')
  })

  it('putaran pertama belum boleh beli; berhenti pas di START tidak gajian', () => {
    for (let seed = 1; seed < 300; seed++) {
      const s = newGame()
      s.rng = seed
      const r = step(s, { type: 'ROLL' })
      const sq = r.state.players[0].pos
      if (r.state.props[sq]) {
        expect(r.state.pendingBuy).toBeNull()
        expect(r.state.phase).toBe('action')
        break
      }
    }
    for (let seed = 1; seed < 500; seed++) {
      const s = newGame()
      s.players[0].pos = SIZE - 8
      s.rng = seed
      const r = step(s, { type: 'ROLL' })
      if (r.state.players[0].pos === 0) {
        expect(r.events.some((e) => e.type === 'payday')).toBe(false)
        expect(r.state.players[0].lapped).toBe(true)
        return
      }
    }
    throw new Error('tidak ada lemparan yang berhenti pas di START')
  })

  it('lewat START: pilih 1 tanah, naik maksimal 2 tingkat', () => {
    let s = newGame()
    s.props[1].owner = 0
    s.props[2].owner = 0
    s.players[0].lapped = true
    for (let seed = 1; seed < 500; seed++) {
      const t = structuredClone(s)
      t.players[0].pos = SIZE - 4
      t.rng = seed
      const r = step(t, { type: 'ROLL' })
      if (r.events.some((e) => e.type === 'payday') && r.state.phase === 'action' && !r.state.players[0].jailed) {
        s = r.state
        expect(s.buildWindow).toBe(true)
        s = run(s, { type: 'BUILD', sq: 1 }, { type: 'BUILD', sq: 1 })
        expect(s.props[1].level).toBe(2)
        s = run(s, { type: 'BUILD', sq: 1 })
        expect(s.props[1].level).toBe(2)
        s = run(s, { type: 'BUILD', sq: 2 })
        expect(s.props[2].level).toBe(0) // cuma 1 tanah per lewat START
        return
      }
    }
    throw new Error('tidak ada lemparan yang lewat START')
  })

  it('pinjol menambah utang dan bunganya jalan tiap giliran sendiri', () => {
    let s = newGame()
    s = { ...s, phase: 'action' }
    s = run(s, { type: 'PINJOL', amount: 2000 })
    expect(s.players[0].debt).toBe(2000)
    expect(s.players[0].cash).toBe(ECONOMY.startCash + 2000)
    s.current = 2
    s = run(s, { type: 'END_TURN' })
    expect(s.current).toBe(0)
    expect(s.players[0].debt).toBe(2100)
  })

  it('tidak bisa selesai giliran kalau uang minus; bangkrut menyerahkan aset ke penagih', () => {
    let s = newGame()
    s.props[1].owner = 0
    s.players[0].cash = -100
    s.lastCreditor = 1
    s.phase = 'action'
    expect(step(s, { type: 'END_TURN' }).events).toHaveLength(0)
    s = run(s, { type: 'BANKRUPT' })
    expect(s.players[0].bankrupt).toBe(true)
    expect(s.props[1].owner).toBe(1)
    expect(s.current).toBe(1)
  })

  it('Kasus Mangkrak: bayar uang damai lalu lempar dadu normal', () => {
    let s = newGame()
    s.players[0].jailed = true
    s.players[0].pos = JAIL_SQ
    s = run(s, { type: 'PAY_BAIL' })
    expect(s.players[0].jailed).toBe(false)
    expect(s.players[0].cash).toBe(ECONOMY.startCash - ECONOMY.bail)
    expect(s.phase).toBe('roll')
  })

  it('tahun baru menaikkan Indeks Harga dan memunculkan Headline', () => {
    let s = newGame()
    s.round = 5
    s.current = 2
    s.phase = 'action'
    const r = step(s, { type: 'END_TURN' })
    s = r.state
    expect(s.round).toBe(6)
    expect(s.year).toBe(2)
    expect(s.ih).toBeGreaterThan(1.04)
    expect(s.headline).not.toBeNull()
    expect(r.events.some((e) => e.type === 'year')).toBe(true)
  })

  it('tukar tanah: valid dipindah, ditolak cuma dicatat', () => {
    let s = newGame()
    s.phase = 'action'
    s.props[1].owner = 0
    s.props[2].owner = 1
    const offer = { from: 0, to: 1, give: [1], take: [2], cashGive: 500, cashTake: 0 }
    const declined = run(s, { type: 'TRADE', offer, accepted: false })
    expect(declined.props[2].owner).toBe(1)
    expect(declined.tradeTried).toBe(true)
    s = run(s, { type: 'TRADE', offer, accepted: true })
    expect(s.props[1].owner).toBe(1)
    expect(s.props[2].owner).toBe(0)
    expect(s.players[1].cash).toBe(ECONOMY.startCash + 500)
  })

  it('bot menolak tawaran yang merugikan, terima yang untung', () => {
    const s = newGame()
    s.props[5].owner = 1
    expect(botAcceptTrade(s, { from: 0, to: 1, give: [], take: [5], cashGive: 500, cashTake: 0 })).toBe(false)
    expect(botAcceptTrade(s, { from: 0, to: 1, give: [], take: [5], cashGive: 3000, cashTake: 0 })).toBe(true)
  })

  it('karakter: Bu RT kebal pungli, Buzzer kebal Pasal Karet', () => {
    const s = createGame(
      [
        { ...START_PLAYERS[2], isBot: false },
        { ...START_PLAYERS[5], isBot: false },
      ],
      { maxRounds: 30, seed: 3 },
    )
    for (let seed = 1; seed < 400; seed++) {
      const t = structuredClone(s)
      t.players[0].pos = 3
      t.rng = seed
      const r = step(t, { type: 'ROLL' })
      if (BOARD[r.state.players[0].pos].tax === 'pungli') {
        expect(r.state.players[0].stats.pungli).toBe(0)
        break
      }
    }
    for (let seed = 1; seed < 400; seed++) {
      const t = structuredClone(s)
      t.current = 1
      t.players[1].pos = 31
      t.rng = seed
      const r = step(t, { type: 'ROLL' })
      if (BOARD[r.state.players[1].pos].type === 'gotojail') {
        expect(r.state.players[1].jailed).toBe(false)
        return
      }
    }
    throw new Error('tidak ada lemparan yang kena Pasal Karet')
  })

  it('sel mewah: tetap ditahan, bayar sewa sel, giliran pindah', () => {
    let s = newGame()
    s.players[0].jailed = true
    s.players[0].pos = JAIL_SQ
    s = run(s, { type: 'STAY_LUXURY' })
    expect(s.players[0].jailed).toBe(true)
    expect(s.players[0].cash).toBe(ECONOMY.startCash - ECONOMY.luxuryCell)
    expect(s.players[0].stats.selMewah).toBe(1)
    expect(s.current).toBe(1)
  })

  it('Solo kota dinasti: sewa 2× kalau pemilik juga punya SCBD/IKN', () => {
    const s = newGame()
    s.props[SOLO_SQ].owner = 1
    const biasa = rentFor(s, SOLO_SQ, 7, false)
    s.props[IKN_SQ].owner = 1
    expect(rentFor(s, SOLO_SQ, 7, false)).toBe(biasa * 2)
  })

  it('lelang: tanah yang tidak dibeli dilelang, yang menolak tidak ikut', () => {
    let s = newGame()
    s = { ...s, phase: 'buy', pendingBuy: 1 }
    s = run(s, { type: 'SKIP_BUY' })
    expect(s.phase).toBe('auction')
    expect(s.auction?.active).toEqual([1, 2])
    expect(actorOf(s)).toBe(1)
    const min = auctionMin(s)
    s = run(s, { type: 'BID', amount: min })
    expect(actorOf(s)).toBe(2)
    s = run(s, { type: 'PASS_BID' })
    expect(s.phase).toBe('action')
    expect(s.props[1].owner).toBe(1)
    expect(s.players[1].cash).toBe(ECONOMY.startCash - min)
  })

  it('lempar dadu urutan: total tertinggi jalan duluan, urutan giliran ikut', () => {
    let s = createGame(START_PLAYERS.slice(0, 3).map((p) => ({ ...p, isBot: false })), { maxRounds: 30, seed: 9, openingRoll: true })
    expect(s.phase).toBe('opening')
    expect(actorOf(s)).toBe(0)
    s = run(s, { type: 'ROLL' }, { type: 'ROLL' }, { type: 'ROLL' })
    expect(s.phase).toBe('roll')
    const total = (i: number) => s.openingRolls[i]![0] + s.openingRolls[i]![1]
    expect(total(s.turnOrder[0])).toBeGreaterThanOrEqual(total(s.turnOrder[1]))
    expect(total(s.turnOrder[1])).toBeGreaterThanOrEqual(total(s.turnOrder[2]))
    expect(s.current).toBe(s.turnOrder[0])
    s = { ...s, phase: 'action' }
    s = run(s, { type: 'END_TURN' })
    expect(s.current).toBe(s.turnOrder[1])
  })

  it('petak pilihan: judol, cabai, zebra & banjir', () => {
    let s = newGame()
    s = { ...s, phase: 'choice', choice: { kind: 'judol', sq: 21 } }
    expect(step(s, { type: 'CHOOSE', option: '999' }).events).toHaveLength(0)
    const r = step(s, { type: 'CHOOSE', option: '1000' })
    const ev = r.events.find((e) => e.type === 'choice')
    expect(ev?.type === 'choice' && ['win', 'lose', 'jackpot'].includes(ev.outcome)).toBe(true)
    expect(r.state.phase).toBe('action')
    s = { ...newGame(), phase: 'choice', choice: { kind: 'zebra', sq: 17 } }
    s.players[0].cash = 50
    expect(step(s, { type: 'CHOOSE', option: 'resmi' }).state.players[0].cash).toBe(50 - ECONOMY.zebraFine)
    const g = newGame()
    g.props[40].owner = 1
    g.flood = { group: 'elit', untilRound: 1 }
    expect(rentFor(g, 40, 7, false)).toBe(0)
  })

  it('pemilu tiap 4 tahun: semua dapat serangan fajar', () => {
    let s = newGame()
    s.round = 15
    s.year = 3
    s.current = 2
    s.phase = 'action'
    const r = step(s, { type: 'END_TURN' })
    s = r.state
    expect(s.year).toBe(4)
    expect(r.events.some((e) => e.type === 'pemilu')).toBe(true)
  })

  it('bot bisa menamatkan banyak game tanpa macet', () => {
    for (let seed = 1; seed <= 30; seed++) {
      let s = newGame(seed, true)
      let n = 0
      while (s.phase !== 'gameover') {
        const a = botAction(s)!
        expect(a.type).not.toBe('ASK_TRADE')
        s = step(s, a as Action).state
        expect(++n).toBeLessThan(20000)
      }
      expect(s.winner).not.toBeNull()
      expect(netWorth(s, s.winner!)).toBeGreaterThan(-Infinity)
    }
  })
})
