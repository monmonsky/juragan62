import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { flushSync } from 'react-dom'
import { BOARD, GROUPS, LEVEL_NAMES, groupMembers } from '../data/board.ts'
import { CHARACTER_BY_ID } from '../data/characters.ts'
import { ECONOMY } from '../data/economy.ts'
import { botAcceptTrade, botAction } from '../engine/bot.ts'
import {
  CARD_BY_ID,
  HEADLINE_BY_ID,
  actorOf,
  auctionMin,
  auctionStep,
  bailCost,
  buildCost,
  choiceOptions,
  canBuild,
  canStayLuxury,
  canTradeProp,
  luxuryCost,
  ownedBy,
  pinjolRoom,
  price,
  step,
} from '../engine/engine.ts'
import { rp } from '../engine/format.ts'
import type { Action, GameEvent, GameState, TradeOffer } from '../engine/types.ts'
import type { NetMsg } from '../net/room.ts'
import { Board } from './Board.tsx'
import { BuildingIcon } from './icons.tsx'
import type { DiceShow } from './Dice.tsx'
import { AnimatedRp } from './AnimatedNumber.tsx'
import { Coach } from './Coach.tsx'
import { ChoiceResult } from './ChoiceResult.tsx'
import type { ChoiceShow } from './ChoiceResult.tsx'
import * as fx from './fx.ts'
import { AssetsModal, CardModal, PinjolModal, PropertyModal, RulesModal, TradeAskModal, TradeModal } from './Modals.tsx'
import * as sfx from './sfx.ts'

interface Slip {
  name: string
  umr: number
  hidup: number
  cicilan: number
  net: number
}

// Jembatan ke room online. Tanpa `net` = main lokal di satu perangkat.
export interface NetBridge {
  role: 'host' | 'guest'
  mySeat: number
  remoteSeats: () => Set<number>
  send: (msg: NetMsg) => void
  broadcast: (msg: NetMsg) => void
  askTrade: (seat: number, offer: TradeOffer) => Promise<boolean>
  listen: (fn: (msg: NetMsg, seat: number | null) => void) => () => void
}

// Apakah kursi `pid` dikendalikan dari perangkat ini?
function ownsSeat(net: NetBridge | undefined, s: GameState, pid: number) {
  const p = s.players[pid]
  if (!net) return !p.isBot
  if (net.role === 'guest') return pid === net.mySeat
  return !p.isBot && !net.remoteSeats().has(pid)
}

const CHOICE_PROMPT: Record<string, { title: string; desc: string }> = {
  judol: { title: '🎰 Slot Judol: mau coba peruntungan?', desc: 'Peluang menang ±30%. Bandar selalu untung. Pikir dua kali.' },
  cabai: { title: '🌶️ Tebak harga cabai minggu ini!', desc: 'Benar dapat uang, salah bayar. (Biasanya sih naik.)' },
  investasi: { title: '📈 Ditawari investasi "pasti cuan"', desc: 'Bisa cuan 2×... atau owner-nya kabur bawa uangmu.' },
  zebra: { title: '🚓 Kena Operasi Zebra!', desc: 'Tilang resmi lebih mahal tapi aman. "Damai" murah, tapi bisa ketahuan & masuk Kasus Mangkrak.' },
  jalan: { title: '🕳️ Ban bocor kena jalan rusak!', desc: 'Tambal, tunggu, atau viralkan (kalau sepi, tetap nunggu).' },
  samsat: { title: '🏛️ Harus perpanjang STNK di Samsat', desc: 'Antre dari subuh (lewati giliran) atau bayar calo.' },
  baliho: { title: '🪧 Pasang baliho kampanye?', desc: 'Bayar sekarang, dapat "dana kampanye" tiap Pemilu.' },
}

const MANAGE_ACTIONS = new Set<Action['type']>(['BUILD', 'SELL_BUILDING', 'MORTGAGE', 'UNMORTGAGE', 'PINJOL', 'REPAY', 'TRADE'])

const canBuildAny = (s: GameState) =>
  s.buildWindow && ownedBy(s, s.current).some((sq) => canBuild(s, s.current, sq) && s.players[s.current].cash >= buildCost(s, sq))

type ModalState = { kind: 'prop'; sq: number } | { kind: 'assets' } | { kind: 'pinjol' } | { kind: 'guide' } | { kind: 'trade' } | null

interface Props {
  initial: GameState
  showGuide: boolean
  speed: fx.Speed
  sound: boolean
  music: boolean
  net?: NetBridge
  onToggleSound: () => void
  onToggleMusic: () => void
  onChange: (s: GameState) => void
  onExit: () => void
  onGameOver: (s: GameState) => void
}

export function Game({ initial, showGuide, speed, sound, music, net, onToggleSound, onToggleMusic, onChange, onExit, onGameOver }: Props) {
  const [state, setState] = useState(initial)
  const [view, setView] = useState(initial)
  const [positions, setPositions] = useState(() => initial.players.map((p) => p.pos))
  const [dice, setDice] = useState<[number, number]>(initial.dice)
  const [diceShow, setDiceShow] = useState<DiceShow | null>(null)
  const [sceneSq, setSceneSq] = useState<number | null>(null)
  const [choiceShow, setChoiceShow] = useState<ChoiceShow | null>(null)
  const sceneDone = useRef<(() => void) | null>(null)
  const [busy, setBusy] = useState(false)
  const [slip, setSlip] = useState<Slip | null>(null)
  const [card, setCard] = useState<{ id: string; player: string } | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const [coach, setCoach] = useState(showGuide ? 0 : -1)
  const [live, setLive] = useState(() => initial.players.map((p) => p.cash))
  const [reacts, setReacts] = useState<{ id: number; seat: number; emoji: string }[]>([])
  const [ask, setAsk] = useState<{ offer: TradeOffer; answer: (ok: boolean) => void } | null>(null)
  const [tradePending, setTradePending] = useState(false)
  const stateRef = useRef(state)
  const busyRef = useRef(false)
  const queueRef = useRef(Promise.resolve())
  const cardDone = useRef<(() => void) | null>(null)

  useEffect(() => fx.setSpeed(speed), [speed])
  useEffect(() => sfx.setSound(sound), [sound])
  useEffect(() => {
    sfx.setMusic(music)
    return () => sfx.setMusic(false)
  }, [music])

  const showReact = useCallback((seat: number, emoji: string) => {
    const id = Date.now() + Math.random()
    sfx.play('step')
    setReacts((r) => [...r, { id, seat, emoji }])
    setTimeout(() => setReacts((r) => r.filter((x) => x.id !== id)), 2600)
  }, [])
  const sendReact = (emoji: string) => {
    if (!net) return
    if (net.role === 'guest') net.send({ t: 'react', emoji })
    else {
      net.broadcast({ t: 'react', emoji, seat: net.mySeat })
      showReact(net.mySeat, emoji)
    }
  }

  const isMine = useCallback((pid: number) => ownsSeat(net, stateRef.current, pid), [net])

  const showCard = useCallback(
    (id: string, player: string, waitClick: boolean) =>
      new Promise<void>((resolve) => {
        setCard({ id, player })
        const done = () => {
          // timer kartu lama tidak boleh menutup kartu yang sedang tampil
          if (cardDone.current !== done) return
          cardDone.current = null
          setCard(null)
          resolve()
        }
        cardDone.current = done
        if (!waitClick) setTimeout(done, fx.animationsOn() ? (speed === 'cepat' ? 2500 : 4200) : 600)
      }),
    [speed],
  )

  // Adegan khas petak: tampil ±3 detik (Normal), bisa di-tap untuk lewati.
  const showScene = useCallback((sq: number) => {
    if (!fx.animationsOn()) return Promise.resolve()
    return new Promise<void>((resolve) => {
      flushSync(() => setSceneSq(sq))
      const done = () => {
        if (sceneDone.current !== done) return
        sceneDone.current = null
        setSceneSq(null)
        resolve()
      }
      sceneDone.current = done
      void fx.sleep(1500).then(done)
    })
  }, [])

  const play = useCallback(
    async (events: GameEvent[], next: GameState) => {
      for (const e of events) {
        switch (e.type) {
          case 'dice': {
            sfx.play('dice')
            if (fx.animationsOn()) {
              const one = e.dice[1] === 0
              const r = () => 1 + Math.floor(Math.random() * 6)
              flushSync(() => setDiceShow({ values: [r(), one ? 0 : r()], rolling: true }))
              const shuffle = setInterval(() => setDiceShow((d) => (d?.rolling ? { ...d, values: [r(), one ? 0 : r()] } : d)), 80)
              await fx.throwDice()
              clearInterval(shuffle)
              setDiceShow({ values: e.dice, rolling: false })
              await fx.sleep(550)
              await fx.fadeDice()
              setDiceShow(null)
            }
            setDice(e.dice)
            break
          }
          case 'move':
            for (const sq of e.path) {
              if (fx.animationsOn()) sfx.play('step')
              await fx.hop(e.player, () => flushSync(() => setPositions((pos) => pos.map((v, i) => (i === e.player ? sq : v)))))
            }
            await fx.landPulse(e.path[e.path.length - 1] ?? 0)
            if (e.path.length) await showScene(e.path[e.path.length - 1])
            break
          case 'teleport':
            await fx.hop(e.player, () => flushSync(() => setPositions((pos) => pos.map((v, i) => (i === e.player ? e.to : v)))), 140, 650)
            await fx.landPulse(e.to)
            await showScene(e.to)
            break
          case 'money': {
            const anchor = e.sq !== undefined ? fx.cellEl(e.sq) : fx.playerCardEl(e.player)
            sfx.play(e.delta > 0 ? 'coin' : 'pay')
            setLive((l) => l.map((v, i) => (i === e.player ? v + e.delta : v)))
            fx.floatText(rp(e.delta, true), anchor, e.delta > 0 ? 'plus' : 'minus')
            await fx.sleep(350)
            break
          }
          case 'card':
            sfx.play('card')
            await showCard(e.card, next.players[e.player].name, isMine(e.player))
            break
          case 'stamp':
            sfx.play('stamp')
            fx.stamp(e.text, fx.cellEl(e.sq))
            await fx.sleep(550)
            break
          case 'build':
            sfx.play('coin')
            await fx.popBuilding(e.sq)
            break
          case 'payday':
            flushSync(() => setSlip({ name: next.players[e.player].name, umr: e.umr, hidup: e.hidup, cicilan: e.cicilan, net: e.net }))
            sfx.play(e.net >= 0 ? 'coin' : 'pay')
            setLive((l) => l.map((v, i) => (i === e.player ? v + e.net : v)))
            await fx.printSlip()
            fx.floatText(rp(e.net, true), fx.cellEl(0), e.net >= 0 ? 'plus' : 'minus')
            await fx.sleep(600)
            break
          case 'year':
            sfx.play('alarm')
            fx.shake(document.querySelector('.board'), 10)
            await fx.banner(`HARGA NAIK ${Math.round(e.pct * 100)}%!${e.headline ? `<small>📰 ${HEADLINE_BY_ID[e.headline].title}</small>` : ''}`)
            break
          case 'auction':
            sfx.play('stamp')
            fx.stamp('LELANG!', fx.cellEl(e.sq))
            await fx.sleep(700)
            break
          case 'bid':
            sfx.play('coin')
            fx.floatText(`🔨 ${rp(e.amount)}`, fx.playerCardEl(e.player), 'info')
            await fx.sleep(450)
            break
          case 'auctionEnd':
            break
          case 'choice': {
            sfx.play(e.kind === 'judol' ? 'dice' : 'card')
            flushSync(() => setChoiceShow({ kind: e.kind, outcome: e.outcome, delta: e.delta, text: e.text, name: next.players[e.player].name }))
            if (e.kind === 'judol' && fx.animationsOn()) await new Promise((r) => setTimeout(r, 1500))
            sfx.play(e.outcome === 'jackpot' ? 'fanfare' : e.outcome === 'win' ? 'coin' : e.outcome === 'caught' ? 'alarm' : e.outcome === 'lose' ? 'sad' : 'step')
            await fx.sleep(1100)
            setChoiceShow(null)
            break
          }
          case 'flood':
            sfx.play('alarm')
            fx.floatText(`🌊 Banjir di ${GROUPS[e.group].name}!`, document.querySelector('.ih'), 'info')
            await fx.sleep(700)
            break
          case 'order':
            sfx.play('fanfare')
            await fx.banner(`URUTAN MAIN<small>${e.order.map((i, k) => `${k + 1}. ${next.players[i].token} ${next.players[i].name}`).join(' · ')}</small>`)
            break
          case 'pemilu':
            sfx.play('fanfare')
            await fx.banner(`🗳️ PEMILU!<small>Serangan fajar + bansos ${rp(e.gift)} buat semua. Habis ini harga naik 5%.</small>`)
            fx.confetti(40)
            break
          case 'pinjol':
            sfx.play('notif')
            fx.toast(
              '💸',
              'PinjolKilat',
              `Pinjaman <b>${rp(e.amount)}</b> cair dalam 5 detik!<br><small>*bunga ${Math.round((next.headline === 'H11' ? 0.07 : 0.05) * 100)}%/giliran, syarat & ketentuan menyiksa</small>`,
            )
            await fx.sleep(500)
            break
          case 'trade':
            sfx.play('coin')
            fx.floatText('🤝 DEAL!', fx.playerCardEl(e.from), 'plus')
            fx.floatText('🤝 DEAL!', fx.playerCardEl(e.to), 'plus')
            await fx.sleep(600)
            break
          case 'free':
            fx.floatText('Bebas! 🎉', fx.tokenEl(e.player) ?? fx.cellEl(10), 'plus')
            break
          case 'bankrupt':
            sfx.play('sad')
            fx.stamp('BANGKRUT', fx.playerCardEl(e.player))
            await fx.shake(fx.playerCardEl(e.player), 10)
            break
          case 'info': {
            const anchor = e.sq !== undefined ? fx.cellEl(e.sq) : e.player !== undefined ? fx.playerCardEl(e.player) : document.querySelector('.ih')
            fx.floatText(e.text, anchor, 'info')
            await fx.sleep(900)
            break
          }
          case 'gameover':
            sfx.play('fanfare')
            break
          case 'turn':
          case 'jail':
          case 'buy':
            break
        }
      }
    },
    [showCard, showScene, isMine],
  )

  // Putar hasil satu langkah engine (lokal, host, atau kiriman host untuk tamu).
  const apply = useCallback(
    async (next: GameState, events: GameEvent[], viewFirst: boolean, boost: boolean) => {
      busyRef.current = true
      stateRef.current = next
      setState(next)
      setBusy(true)
      if (viewFirst) setView(next)
      fx.setBoost(boost)
      await play(events, next)
      fx.setBoost(false)
      setView(next)
      setLive(next.players.map((p) => p.cash))
      setPositions(next.players.map((p) => p.pos))
      setDice(next.dice)
      const turn = events.find((e) => e.type === 'turn')
      if (turn && turn.type === 'turn') fx.bounce(fx.playerCardEl(turn.player))
      busyRef.current = false
      setBusy(false)
      if (next.phase === 'gameover') {
        await fx.sleep(600)
        onGameOver(next)
      }
    },
    [play, onGameOver],
  )

  const dispatch = useCallback(
    async (action: Action) => {
      if (net?.role === 'guest') {
        if (!busyRef.current) net.send({ t: 'action', action })
        return
      }
      if (busyRef.current) return
      const prev = stateRef.current
      const { state: next, events } = step(prev, action)
      if (next === prev) return
      onChange(next)
      if (net?.role === 'host') net.broadcast({ t: 'step', state: next, events })
      // Giliran bot diputar lebih cepat supaya game tidak kelamaan.
      await apply(next, events, MANAGE_ACTIONS.has(action.type), prev.players[actorOf(prev)].isBot)
    },
    [net, onChange, apply],
  )

  // Siapa yang menjawab tawaran: bot (otomatis), pemain di perangkat ini, atau tamu online.
  const resolveTrade = useCallback(
    (offer: TradeOffer): Promise<boolean> => {
      const target = stateRef.current.players[offer.to]
      if (target.isBot) return Promise.resolve(botAcceptTrade(stateRef.current, offer))
      if (net?.role === 'host' && net.remoteSeats().has(offer.to)) return net.askTrade(offer.to, offer)
      return new Promise((resolve) => setAsk({ offer, answer: resolve }))
    },
    [net],
  )

  const proposeTrade = useCallback(
    async (offer: TradeOffer) => {
      setModal(null)
      if (net?.role === 'guest') {
        net.send({ t: 'tradeRequest', offer })
        return
      }
      setTradePending(true)
      const accepted = await resolveTrade(offer)
      setTradePending(false)
      await dispatch({ type: 'TRADE', offer, accepted })
    },
    [net, resolveTrade, dispatch],
  )

  // Pesan jaringan.
  useEffect(() => {
    if (!net) return
    return net.listen((msg, seat) => {
      if (net.role === 'guest') {
        if (msg.t === 'step') {
          queueRef.current = queueRef.current.then(() => {
            const prev = stateRef.current
            return apply(msg.state, msg.events, false, prev.players[actorOf(prev)]?.isBot ?? false)
          })
        }
        if (msg.t === 'react' && msg.seat !== undefined) showReact(msg.seat, msg.emoji)
        if (msg.t === 'tradeAsk') setAsk({ offer: msg.offer, answer: (ok) => net.send({ t: 'tradeReply', accept: ok }) })
        return
      }
      const s = stateRef.current
      if (msg.t === 'action' && seat === actorOf(s) && msg.action.type !== 'TRADE') dispatch(msg.action)
      if (msg.t === 'react' && seat !== null) {
        net.broadcast({ t: 'react', emoji: msg.emoji, seat })
        showReact(seat, msg.emoji)
      }
      if (msg.t === 'tradeRequest' && seat === s.current && msg.offer.from === seat) proposeTrade(msg.offer)
      if (msg.t === 'rejoined' && s.players[msg.seat]?.isBot) {
        const next: GameState = {
          ...s,
          players: s.players.map((p) => (p.id === msg.seat ? { ...p, isBot: false, name: p.name.replace(/ \(bot\)$/, '') } : p)),
        }
        stateRef.current = next
        setState(next)
        setView(next)
        net.broadcast({ t: 'step', state: next, events: [{ type: 'info', text: 'Kembali ke room 👋', player: msg.seat }] })
      }
      if (msg.t === 'left' && seat !== null && !s.players[seat].isBot) {
        const next: GameState = {
          ...s,
          players: s.players.map((p) => (p.id === seat ? { ...p, isBot: true, name: `${p.name} (bot)` } : p)),
        }
        stateRef.current = next
        setState(next)
        setView(next)
        net.broadcast({ t: 'step', state: next, events: [{ type: 'info', text: 'Keluar dari room, diganti bot 🤖', player: seat }] })
      }
    })
  }, [net, apply, dispatch, proposeTrade, showReact])

  // Bot jalan sendiri (hanya di perangkat yang menjalankan engine), satu keputusan per langkah.
  useEffect(() => {
    if (net?.role === 'guest' || busy || tradePending || ask || modal?.kind === 'guide') return
    if (coach >= 0 || state.phase === 'gameover' || !state.players[actorOf(state)].isBot) return
    const t = setTimeout(() => {
      const decision = botAction(stateRef.current)
      if (!decision) return
      if (decision.type === 'ASK_TRADE') proposeTrade(decision.offer)
      else dispatch(decision)
    }, fx.animationsOn() ? (speed === 'cepat' ? 500 : 1200) : 30)
    return () => clearTimeout(t)
  }, [net, busy, tradePending, ask, modal, coach, state, dispatch, proposeTrade, speed])

  // Giliranku selesai otomatis kalau sudah tidak ada yang bisa/perlu dilakukan.
  const cur = state.players[state.current]
  const mine = ownsSeat(net, state, actorOf(state))
  const autoEnding =
    mine && coach < 0 && !busy && !modal && !card && !ask && !tradePending && state.phase === 'action' && !state.canRollAgain && cur.cash >= 0 && !canBuildAny(state)
  useEffect(() => {
    if (!autoEnding) return
    const t = setTimeout(() => dispatch({ type: 'END_TURN' }), fx.animationsOn() ? (speed === 'cepat' ? 900 : 1800) : 300)
    return () => clearTimeout(t)
  }, [autoEnding, dispatch, speed])

  const s = view
  const myTurn = mine && !busy && !tradePending && state.phase !== 'gameover'
  const headline = state.headline ? HEADLINE_BY_ID[state.headline] : null
  const tickerItems = [
    headline ? `${headline.title}: ${headline.effectText}` : 'Tahun pertama: belum ada berita besar. Mencurigakan.',
    'Harga naik, gaji: "sabar ya"',
    'Pejabat imbau rakyat berhemat (sambil flexing)',
    'Warganet: "No viral, no justice"',
    `Indeks Harga sekarang ${state.ih.toFixed(2).replace('.', ',')}`,
    `Pemilu berikutnya tahun ke-${Math.ceil((state.year + 1) / ECONOMY.pemiluEveryYears) * ECONOMY.pemiluEveryYears}. Siapkan amplop.`,
  ]

  return (
    <div className="game">
      <div className="ticker">
        <span className="ticker-label">📰 BREAKING KONOHA</span>
        <div className="ticker-track">
          <div className="ticker-move">
            {[...tickerItems, ...tickerItems].map((t, i) => (
              <span key={i}>⚡ {t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="layout">
        <div className="board-wrap">
          <Board
            view={s}
            positions={positions}
            dice={dice}
            diceShow={diceShow}
            sceneSq={sceneSq}
            onSkipScene={() => sceneDone.current?.()}
            onCellClick={(sq) => setModal({ kind: 'prop', sq })} />
        </div>

        <aside className="side">
          <div className="players">
            {s.turnOrder.map((id) => s.players[id]).map((p, rank) => {
              const active = p.id === s.current && s.phase !== 'gameover'
              const ch = CHARACTER_BY_ID[p.character]
              return (
                <div
                  key={p.id}
                  data-player-card={p.id}
                  className={`player ${active ? 'active' : ''} ${p.bankrupt ? 'dead' : ''} ${ownsSeat(net, state, p.id) ? 'mine' : ''}`}
                >
                  {reacts
                    .filter((r) => r.seat === p.id)
                    .map((r) => (
                      <span key={r.id} className="react-bubble">
                        {r.emoji}
                      </span>
                    ))}
                  <div className="player-head">
                    <span className="token big" style={{ '--c': p.color } as CSSProperties}>
                      {p.token}
                    </span>
                    <span className="player-name">
                      {s.phase !== 'opening' && <small className="order-no">#{rank + 1}</small>} {p.name}
                    </span>
                    <span className="badge" title={`${ch.plus} ${ch.minus}`}>
                      {ch.icon} {ch.name}
                    </span>
                    {p.isBot && <span className="badge grey">🤖</span>}
                    {net && ownsSeat(net, state, p.id) && <span className="badge">kamu</span>}
                    {active && <span className="badge hot">Giliran</span>}
                    {p.jailed && <span className="badge orange">Mangkrak</span>}
                    {p.jailCards > 0 && <span className="badge">📱×{p.jailCards}</span>}
                    {p.bankrupt && <span className="badge">🪦 Bangkrut</span>}
                  </div>
                  {!p.bankrupt && (
                    <div className="player-stats">
                      <div>
                        <span>Uang</span>
                        <AnimatedRp value={live[p.id]} className={live[p.id] < 0 ? 'minus' : ''} />
                      </div>
                      <div>
                        <span>Pinjol</span>
                        <b className={p.debt ? 'minus' : ''}>{p.debt ? rp(p.debt) : '—'}</b>
                      </div>
                      <div>
                        <span>Tanah</span>
                        <b>{ownedBy(s, p.id).length} 🚩</b>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="panel slip">
            <div className="slip-title">🧾 Slip Gaji Terakhir{slip ? `: ${slip.name}` : ''}</div>
            {slip ? (
              <>
                <div className="slip-row">
                  <span>Gaji UMR</span>
                  <b className="plus">{slip.umr ? rp(slip.umr, true) : 'Tidak cair 🥲'}</b>
                </div>
                <div className="slip-row">
                  <span>Biaya hidup</span>
                  <b className="minus">{rp(-slip.hidup)}</b>
                </div>
                <div className="slip-row">
                  <span>Cicilan pinjol</span>
                  <b className={slip.cicilan ? 'minus' : ''}>{slip.cicilan ? rp(-slip.cicilan) : 'Rp 0'}</b>
                </div>
                <div className="slip-total">
                  <span>Diterima</span>
                  <b className={slip.net < 0 ? 'minus' : 'plus'}>{rp(slip.net, true)}</b>
                </div>
                <div className="slip-note">{slip.net < 0 ? 'Gajian kok malah minus? Selamat datang di Konoha.' : 'Masih plus. Nikmati selagi bisa.'}</div>
              </>
            ) : (
              <div className="slip-note">Belum ada yang gajian. Gaji cair kalau lewat START (berhenti pas di START = gaji ditahan).</div>
            )}
          </div>

          <div className="actions-dock">
            <Actions
              s={state}
              mine={mine}
              myTurn={myTurn}
              busy={busy || tradePending}
              autoEnding={autoEnding}
              sound={sound}
              music={music}
              online={!!net}
              dispatch={dispatch}
              openModal={setModal}
              onToggleSound={onToggleSound}
              onToggleMusic={onToggleMusic}
              onExit={onExit}
            />
            {net && (
              <div className="react-bar">
                {['😂', '💸', '🪦', '🔥', '🤝', '😭', '🙏', '🤡'].map((e) => (
                  <button key={e} className="btn small" onClick={() => sendReact(e)} aria-label={`Reaksi ${e}`}>
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {modal?.kind === 'prop' && (
        <PropertyModal
          s={state}
          sq={modal.sq}
          canManage={myTurn && state.props[modal.sq]?.owner === state.current}
          dispatch={dispatch}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === 'assets' && myTurn && <AssetsModal s={state} dispatch={dispatch} onClose={() => setModal(null)} />}
      {modal?.kind === 'pinjol' && myTurn && <PinjolModal s={state} dispatch={dispatch} onClose={() => setModal(null)} />}
      {modal?.kind === 'trade' && myTurn && <TradeModal s={state} onPropose={proposeTrade} onClose={() => setModal(null)} />}
      {modal?.kind === 'guide' && <RulesModal onClose={() => setModal(null)} />}
      {ask && (
        <TradeAskModal
          s={state}
          offer={ask.offer}
          passDevice={!net}
          onAnswer={(ok) => {
            ask.answer(ok)
            setAsk(null)
          }}
        />
      )}
      {choiceShow && (
        <div className="modal-backdrop light">
          <ChoiceResult show={choiceShow} />
        </div>
      )}
      {coach >= 0 && <Coach step={coach} onNext={() => setCoach((c) => (c + 1 >= 5 ? -1 : c + 1))} onSkip={() => setCoach(-1)} />}
      {card && CARD_BY_ID[card.id] && <CardModal cardId={card.id} playerName={card.player} onClose={() => cardDone.current?.()} />}
    </div>
  )
}

function Actions({ s, mine, myTurn, busy, autoEnding, sound, music, online, dispatch, openModal, onToggleSound, onToggleMusic, onExit }: {
  s: GameState
  mine: boolean
  myTurn: boolean
  busy: boolean
  autoEnding: boolean
  sound: boolean
  music: boolean
  online: boolean
  dispatch: (a: Action) => void
  openModal: (m: ModalState) => void
  onToggleSound: () => void
  onToggleMusic: () => void
  onExit: () => void
}) {
  const p = s.players[s.current]
  const actor = s.players[actorOf(s)]
  const exit = (
    <div className="action-tools">
      <button className="btn small" onClick={() => openModal({ kind: 'guide' })}>
        ❓ Panduan
      </button>
      <button className="btn small" onClick={onToggleSound} aria-label="Efek suara">
        {sound ? '🔊' : '🔇'}
      </button>
      <button className={`btn small ${music ? 'dark' : ''}`} onClick={onToggleMusic} aria-label="Musik">
        🎵
      </button>
      <button className="btn small" onClick={onExit}>
        {online ? '🚪 Keluar room' : '🏠 Simpan & keluar'}
      </button>
    </div>
  )
  const lands = ownedBy(s, p.id).filter((sq) => BOARD[sq].type === 'prop')
  const hint = !p.lapped
    ? '🧭 Putaran pertama: keliling dulu sampai lewat START, baru boleh beli tanah.'
    : lands.length
      ? '💡 Lewat START = gajian + boleh bangun. Klik petak tanahmu untuk lihat detail & tebus gadai.'
      : '💡 Mendarat di petak kosong untuk beli tanah 🚩.'

  if (s.phase === 'gameover') return <div className="actions">{exit}</div>

  if (!mine || (busy && !myTurn)) {
    return (
      <div className="actions">
        <div className="thinking">
          <span>{actor.token}</span> {actor.name}{' '}
          {s.phase === 'opening' ? 'lagi lempar dadu urutan...' : s.phase === 'auction' ? 'lagi mikir tawaran...' : actor.isBot ? 'lagi mikir...' : mine ? 'lagi jalan...' : 'lagi giliran...'}
        </div>
        {exit}
      </div>
    )
  }

  if (s.phase === 'choice' && s.choice) {
    const kind = s.choice.kind
    const opts = choiceOptions(s, kind)
    return (
      <div className="actions">
        <div className="buy-box">
          <b>{CHOICE_PROMPT[kind].title}</b>
          <div className="muted" style={{ fontSize: 12 }}>
            {CHOICE_PROMPT[kind].desc}
          </div>
        </div>
        {opts.map((o) => (
          <button
            key={o.value}
            className="btn full"
            disabled={!myTurn || (kind !== 'zebra' && o.cost > p.cash)}
            onClick={() => dispatch({ type: 'CHOOSE', option: o.value })}
          >
            {o.label}
          </button>
        ))}
        {exit}
      </div>
    )
  }

  if (s.phase === 'opening') {
    const rolled = s.players.filter((pl) => s.openingRolls[pl.id])
    return (
      <div className="actions">
        <div className="buy-box">
          <b>🎲 Lempar dadu untuk urutan main</b>
          <div className="muted" style={{ fontSize: 12 }}>Total tertinggi jalan duluan. Seri? Dadu tunggal tertinggi menang.</div>
          {rolled.map((pl) => {
            const [a, b] = s.openingRolls[pl.id]!
            return (
              <div key={pl.id} style={{ fontSize: 13, fontWeight: 700 }}>
                {pl.token} {pl.name}: {a} + {b} = {a + b}
              </div>
            )
          })}
        </div>
        <button className="btn primary full big" disabled={!myTurn} onClick={() => dispatch({ type: 'ROLL' })}>
          🎲 Lempar ({actor.name})
        </button>
        {exit}
      </div>
    )
  }

  if (s.phase === 'auction' && s.auction) {
    const a = s.auction
    const min = auctionMin(s)
    const big = min + auctionStep(s, a.sq) * 2
    const leader = a.leader !== null ? s.players[a.leader] : null
    return (
      <div className="actions">
        <div className="buy-box">
          {BOARD[a.sq].group && <div className="strip" style={{ background: GROUPS[BOARD[a.sq].group!].color }} />}
          <div>
            🔨 Lelang <b>{BOARD[a.sq].name}</b> (harga normal {rp(price(s, a.sq))})
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>
            {leader ? `Tawaran tertinggi: ${rp(a.bid)} oleh ${leader.name}` : 'Belum ada tawaran.'}
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            Giliran nawar: {actor.token} {actor.name} · peserta: {a.active.map((i) => s.players[i].token).join(' ')}
          </div>
        </div>
        <button className="btn primary" disabled={!myTurn || actor.cash < min} onClick={() => dispatch({ type: 'BID', amount: min })}>
          🔨 Tawar {rp(min)}
        </button>
        <button className="btn" disabled={!myTurn || actor.cash < big} onClick={() => dispatch({ type: 'BID', amount: big })}>
          🔥 Lompat {rp(big)}
        </button>
        <button className="btn dark full" disabled={!myTurn} onClick={() => dispatch({ type: 'PASS_BID' })}>
          🙅 Mundur
        </button>
        {exit}
      </div>
    )
  }

  // Kurang satu tanah lagi buat grup penuh, dan tanah itu milik pemain lain → tombol Tawar muncul.
  const oneShort = lands.some((sq) => {
    const missing = groupMembers(BOARD[sq].group!).filter((i) => s.props[i].owner !== p.id)
    const owner = missing.length === 1 ? s.props[missing[0]].owner : null
    return owner !== null && !s.players[owner].bankrupt && canTradeProp(s, missing[0])
  })

  // Gadai, pinjol & tukar cuma muncul kalau uangnya tidak cukup untuk yang sedang dibutuhkan.
  const shortOfMoney =
    p.cash < 0 ||
    (s.phase === 'buy' && s.pendingBuy !== null && p.cash < price(s, s.pendingBuy)) ||
    (s.phase === 'roll' && p.jailed && p.cash < bailCost(s)) ||
    (s.buildWindow && lands.some((sq) => canBuild(s, p.id, sq)) && !lands.some((sq) => canBuild(s, p.id, sq) && p.cash >= buildCost(s, sq)))
  const tradeBtn = (shortOfMoney || oneShort) && (s.phase === 'roll' || s.phase === 'action') && (
    <button className="btn full" disabled={!myTurn} onClick={() => openModal({ kind: 'trade' })}>
      🤝 Tawar tukar tanah{oneShort && !shortOfMoney ? ' (kurang 1 buat grup penuh!)' : ''}
    </button>
  )
  const manage = (
    <>
      {shortOfMoney && (
        <>
          {p.cash >= 0 && s.phase !== 'buy' && <div className="action-note warn">💸 Uangnya kurang. Cari dana dulu:</div>}
          <button className="btn" disabled={!myTurn} onClick={() => openModal({ kind: 'assets' })}>
            🏦 Gadai / Jual
          </button>
          <button className="btn danger" disabled={!myTurn || (pinjolRoom(s, p.id) <= 0 && p.debt === 0)} onClick={() => openModal({ kind: 'pinjol' })}>
            💸 Pinjol
          </button>
        </>
      )}
      {tradeBtn}
    </>
  )

  if (s.phase === 'buy' && s.pendingBuy !== null) {
    const sq = s.pendingBuy
    const cost = price(s, sq)
    const square = BOARD[sq]
    return (
      <div className="actions">
        <div className="buy-box">
          {square.group && <div className="strip" style={{ background: GROUPS[square.group].color }} />}
          <div>
            Beli tanah 🚩 <b>{square.name}</b> seharga <b>{rp(cost)}</b>?
          </div>
          {square.type === 'prop' && <div className="muted" style={{ fontSize: 12 }}>Bangunannya nanti, tiap kamu lewat START.</div>}
          {p.cash < cost && <div className="minus" style={{ fontSize: 13, fontWeight: 700 }}>Uangmu kurang. Gadai atau pinjol dulu?</div>}
        </div>
        <button className="btn primary" disabled={!myTurn || p.cash < cost} onClick={() => dispatch({ type: 'BUY' })}>
          🚩 Beli Tanah
        </button>
        <button className="btn" disabled={!myTurn} onClick={() => dispatch({ type: 'SKIP_BUY' })}>
          Lewati
        </button>
        {manage}
        {exit}
      </div>
    )
  }

  if (s.phase === 'roll') {
    return (
      <div className="actions">
        {p.jailed ? (
          <>
            <div className="action-note">🗂️ Kamu lagi di Kasus Mangkrak (percobaan {p.jailTurns + 1}/3).</div>
            <button className="btn primary full" disabled={!myTurn} onClick={() => dispatch({ type: 'ROLL' })}>
              🎲 Coba {s.headline === 'H2' ? 'dapat angka 6' : 'dadu kembar'}
            </button>
            <button className="btn" disabled={!myTurn || p.cash < bailCost(s)} onClick={() => dispatch({ type: 'PAY_BAIL' })}>
              💰 Uang damai {rp(bailCost(s))}
            </button>
            <button className="btn" disabled={!myTurn || p.jailCards < 1} onClick={() => dispatch({ type: 'USE_JAIL_CARD' })}>
              📱 No Viral ({p.jailCards})
            </button>
            <button className="btn full" disabled={!myTurn || !canStayLuxury(s, p.id)} onClick={() => dispatch({ type: 'STAY_LUXURY' })}>
              🛋️ Betah di sel mewah {rp(luxuryCost(s))} ({ECONOMY.maxLuxuryStays - p.luxuryStays}× lagi)
            </button>
            <div className="action-note">Sel mewah: tetap ditahan (aman dari sewa lawan), tapi sewa tanahmu tetap masuk.</div>
          </>
        ) : (
          <button className="btn primary full big" disabled={!myTurn} onClick={() => dispatch({ type: 'ROLL' })}>
            🎲 Lempar Dadu
          </button>
        )}
        <div className="action-note">{hint}</div>
        {manage}
        {exit}
      </div>
    )
  }

  // phase === 'action'
  return (
    <div className="actions">
      {p.cash < 0 ? (
        <>
          <div className="action-note warn">
            😱 Uangmu minus <b>{rp(p.cash)}</b>! Jual bangunan, gadai, atau pinjol dulu sebelum selesai.
          </div>
          {manage}
          <button className="btn dark full" disabled={!myTurn} onClick={() => dispatch({ type: 'BANKRUPT' })}>
            🪦 Nyerah, bangkrut aja
          </button>
        </>
      ) : (
        <>
          {s.buildWindow && lands.length > 0 && (
            <div className="buy-box">
              <b>{s.builtThisTurn.length ? `🏗️ Lanjut bangun di ${BOARD[s.builtThisTurn[0]].name}?` : '🏗️ Lewat START! Pilih 1 tanah untuk dibangun'}</b>
              <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                Pilih <b>satu</b> tanah, naik sampai {ECONOMY.levelsPerWindow} tingkat. Tanpa grup penuh mentok di Ruko.
              </div>
              <div className="build-list">
                {lands.map((sq) => {
                  const level = s.props[sq].level
                  const cost = buildCost(s, sq)
                  const ok = canBuild(s, p.id, sq) && p.cash >= cost
                  return (
                    <button key={sq} className="btn small" disabled={!myTurn || !ok} onClick={() => dispatch({ type: 'BUILD', sq })}>
                      <BuildingIcon level={level} color={p.color} /> {BOARD[sq].name} →{' '}
                      {level < 4 ? (
                        <>
                          <BuildingIcon level={level + 1} color={p.color} /> {LEVEL_NAMES[level + 1]} ({rp(cost)})
                        </>
                      ) : (
                        'mentok'
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {s.canRollAgain ? (
            <button className="btn primary full big" disabled={!myTurn} onClick={() => dispatch({ type: 'ROLL' })}>
              🎲 Dadu kembar! Lempar lagi
            </button>
          ) : (
            <button className="btn dark full big" disabled={!myTurn} onClick={() => dispatch({ type: 'END_TURN' })}>
              {autoEnding ? '⏳ Selesai otomatis...' : s.buildWindow ? 'Selesai bangun ➜' : 'Selesai ➜'}
            </button>
          )}
          {manage}
        </>
      )}
      {exit}
    </div>
  )
}
