import { useEffect, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { BOARD, GROUPS, IKN_SQ, LEVEL_ICONS, LEVEL_NAMES } from '../data/board.ts'
import { ECONOMY as E } from '../data/economy.ts'
import {
  CARD_BY_ID,
  activePlayers,
  buildCost,
  canTradeProp,
  validTrade,
  canBuild,
  canMortgage,
  canSellBuilding,
  canUnmortgage,
  mortgageValue,
  ownedBy,
  pinjolRate,
  pinjolRoom,
  price,
  rentFor,
  sellValue,
  unmortgageCost,
} from '../engine/engine.ts'
import { rp } from '../engine/format.ts'
import { SquareIcon } from './icons.tsx'
import type { Action, GameState, TradeOffer } from '../engine/types.ts'

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal panel" onClick={(e) => e.stopPropagation()} role="dialog">
        <button className="btn small modal-close" onClick={onClose} aria-label="Tutup">
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

const SQUARE_INFO: Record<string, string> = {
  start: 'Lewat sini: terima gaji UMR, lalu langsung dipotong biaya hidup dan cicilan pinjol. Lama-lama gajian malah minus.',
  jail: 'Kalau cuma mampir, aman. Kalau ditahan: bayar uang damai, dapat dadu kembar, atau pakai kartu No Viral No Justice. Yang berduit bisa sewa SEL MEWAH: betah di dalam (aman dari sewa lawan) tapi sewa tanahnya tetap masuk.',
  parking: 'Bayar tukang parkir liar. Padahal cuma lewat.',
  gotojail: 'Kena Pasal Karet: langsung masuk Kasus Mangkrak, tidak lewat START.',
  viral: 'Ambil Kartu Viral: nasib dramatis, bisa cuan bisa kena pasal.',
  bansos: 'Ambil Kartu Bansos: hoki atau zonk, tergantung oknum.',
  pungli: 'Bayar "uang rokok" ke oknum kelurahan.',
  ppn: 'Bayar 12% dari uang tunai (ada minimalnya).',
  iuran: 'Iuran wajib tabungan rumah. Padahal belum punya rumah.',
  judol: 'Mini-game slot: pasang taruhan, peluang menang ±30% (jackpot 3%). Bandar selalu untung.',
  cabai: 'Mini-game: tebak harga cabai naik atau turun. Benar dapat uang, salah bayar.',
  investasi: 'Mini-game: tanam uang. Bisa cuan 2×, untung dikit, atau owner-nya kabur.',
  zebra: 'Pilih tilang resmi (mahal, aman) atau "damai" (murah, bisa ketahuan & masuk Kasus Mangkrak).',
  jalan: 'Ban bocor: tambal (bayar), tunggu (lewati giliran), atau viralkan (bisa dapat uang).',
  samsat: 'Antre (lewati giliran) atau bayar calo.',
  baliho: 'Pasang baliho: bayar sekarang, tiap Pemilu dapat "dana kampanye".',
  flood: 'Banjir merendam grup warna terdekat di depannya: sewa di sana nol sampai ronde berikutnya.',
}

function rentRows(s: GameState, sq: number) {
  const square = BOARD[sq]
  const ih = s.ih
  if (square.type === 'transport') {
    return E.transportRent.slice(1).map((r, k) => [`Punya ${k + 1} transportasi`, rp(r * ih)])
  }
  if (square.type === 'utility') {
    return [
      ['Punya 1 utilitas', `dadu × ${rp(E.utilityRent[1] * ih)}`],
      ['Punya 2 utilitas', `dadu × ${rp(E.utilityRent[2] * ih)}`],
    ]
  }
  const base = Math.round(((square.price ?? 0) * E.baseRentRate) / 10) * 10
  const ikn = sq === IKN_SQ ? 0.5 : 1
  return [
    ['Tanah kosong', rp(base * ih * ikn)],
    ['Tanah, punya grup penuh', rp(base * 2 * ih * ikn)],
    ...E.rentMultipliers.slice(1).map((m, k) => [
      `${LEVEL_ICONS[k + 1]} ${LEVEL_NAMES[k + 1]}`,
      `${rp(base * m * ih * (k + 1 === 4 ? 1 : ikn))} / grup penuh ${rp(base * m * E.fullGroupBuildingBonus * ih * (k + 1 === 4 ? 1 : ikn))}`,
    ]),
  ]
}

export function ManageButtons({ s, sq, dispatch }: { s: GameState; sq: number; dispatch: (a: Action) => void }) {
  const pid = s.current
  const p = s.players[pid]
  const prop = s.props[sq]
  if (!prop || prop.owner !== pid) return null
  const isProp = BOARD[sq].type === 'prop'
  return (
    <div className="row-actions">
      {isProp && (
        <button
          className="btn small primary"
          disabled={!canBuild(s, pid, sq) || p.cash < buildCost(s, sq)}
          title={s.buildWindow ? '' : 'Bangun cuma bisa saat lewat START'}
          onClick={() => dispatch({ type: 'BUILD', sq })}
        >
          🏗️ Bangun {prop.level < 4 ? LEVEL_NAMES[prop.level + 1] : ''} ({rp(buildCost(s, sq))})
        </button>
      )}
      {isProp && prop.level > 0 && (
        <button className="btn small" disabled={!canSellBuilding(s, pid, sq)} onClick={() => dispatch({ type: 'SELL_BUILDING', sq })}>
          Jual bangunan (+{rp(sellValue(s, sq))})
        </button>
      )}
      {!prop.mortgaged ? (
        <button className="btn small" disabled={!canMortgage(s, pid, sq)} onClick={() => dispatch({ type: 'MORTGAGE', sq })}>
          🏦 Gadai (+{rp(mortgageValue(s, sq))})
        </button>
      ) : (
        <button className="btn small" disabled={!canUnmortgage(s, pid, sq)} onClick={() => dispatch({ type: 'UNMORTGAGE', sq })}>
          Tebus ({rp(unmortgageCost(s, sq))})
        </button>
      )}
    </div>
  )
}

export function PropertyModal({ s, sq, canManage, dispatch, onClose }: {
  s: GameState
  sq: number
  canManage: boolean
  dispatch: (a: Action) => void
  onClose: () => void
}) {
  const square = BOARD[sq]
  const prop = s.props[sq]
  const owner = prop?.owner != null ? s.players[prop.owner] : null
  const info = square.deck ?? square.tax ?? square.choice ?? square.type
  return (
    <Modal onClose={onClose}>
      <h2>
        <SquareIcon sq={sq} className="modal-icon" /> {square.name}
      </h2>
      {square.group && (
        <div className="badge" style={{ background: GROUPS[square.group].color, color: '#fff', marginBottom: 8 }}>
          {GROUPS[square.group].name}
        </div>
      )}
      {!prop && <p>{SQUARE_INFO[info]}</p>}
      {prop && (
        <>
          <table>
            <tbody>
              <tr>
                <td>Harga sekarang</td>
                <td>{rp(price(s, sq))}</td>
              </tr>
              <tr>
                <td>Pemilik</td>
                <td>{owner ? `${owner.token} ${owner.name}` : 'Belum ada'}</td>
              </tr>
              {square.type === 'prop' && (
                <tr>
                  <td>Bangunan</td>
                  <td>
                    {LEVEL_ICONS[prop.level]} {LEVEL_NAMES[prop.level]}
                  </td>
                </tr>
              )}
              {prop.mortgaged && (
                <tr>
                  <td>Status</td>
                  <td className="minus">Digadai</td>
                </tr>
              )}
              {owner && square.type !== 'utility' && (
                <tr>
                  <td>Sewa saat ini</td>
                  <td>{rp(rentFor(s, sq, 7, false))}</td>
                </tr>
              )}
            </tbody>
          </table>
          <h3 className="bungee" style={{ fontSize: 15, margin: '12px 0 4px' }}>
            Tabel sewa
          </h3>
          <table>
            <tbody>
              {rentRows(s, sq).map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sq === IKN_SQ && <p className="muted">IKN "kota sepi": sewa dibagi 2 sampai ada Mall.</p>}
          {sq === 25 && <p className="muted">Pemilik Kereta Cepat wajib bayar cicilan utang proyek tiap gajian.</p>}
          {sq === 12 && <p className="muted">PLN: kalau penyewa dapat dadu kembar, listrik padam dan sewa batal.</p>}
          {sq === 32 && <p className="muted">Solo "Kota Dinasti": sewa 2× kalau pemiliknya juga punya tanah di Pusat Kekuasaan (Jakarta SCBD / IKN). Jalur keluarga.</p>}
          {canManage && <ManageButtons s={s} sq={sq} dispatch={dispatch} />}
        </>
      )}
    </Modal>
  )
}

export function AssetsModal({ s, dispatch, onClose }: { s: GameState; dispatch: (a: Action) => void; onClose: () => void }) {
  const pid = s.current
  const owned = ownedBy(s, pid)
  return (
    <Modal onClose={onClose}>
      <h2>🏦 Aset Kamu</h2>
      <p className="muted" style={{ margin: 0 }}>
        Bangun hanya saat lewat START. Di sini kamu bisa gadai, tebus, atau jual bangunan kapan saja di giliranmu.
      </p>
      {owned.length === 0 && <p>Belum punya aset. Kaum mendang-mending detected.</p>}
      {owned.map((sq) => {
        const square = BOARD[sq]
        const prop = s.props[sq]
        return (
          <div key={sq} className="asset" style={{ '--g': square.group ? GROUPS[square.group].color : '#ccc' } as CSSProperties}>
            <div className="asset-head">
              <span>
                {square.icon ?? ''} {square.name}
              </span>
              <span>
                {prop.mortgaged ? <span className="badge hot">GADAI</span> : square.type === 'prop' ? `${LEVEL_ICONS[prop.level]} ${LEVEL_NAMES[prop.level]}` : ''}
              </span>
            </div>
            <ManageButtons s={s} sq={sq} dispatch={dispatch} />
          </div>
        )
      })}
    </Modal>
  )
}

export function PinjolModal({ s, dispatch, onClose }: { s: GameState; dispatch: (a: Action) => void; onClose: () => void }) {
  const p = s.players[s.current]
  const room = pinjolRoom(s, p.id)
  const amounts = [500, 1000, 2000, 5000]
  return (
    <Modal onClose={onClose}>
      <h2>💸 PinjolKilat</h2>
      <p style={{ marginTop: 0 }}>
        Cair dalam 5 detik! Bunga cuma <b>{Math.round(pinjolRate(s) * 100)}% per giliran</b>*, cicilan otomatis {E.pinjolInstallment * 100}% saat gajian.
        <br />
        <small className="muted">*syarat & ketentuan menyiksa</small>
      </p>
      <table>
        <tbody>
          <tr>
            <td>Utang sekarang</td>
            <td className={p.debt ? 'minus' : ''}>{rp(p.debt)}</td>
          </tr>
          <tr>
            <td>Sisa plafon</td>
            <td>{rp(room)}</td>
          </tr>
        </tbody>
      </table>
      <div className="row-actions">
        {amounts.map((a) => (
          <button key={a} className="btn small danger" disabled={room < a} onClick={() => dispatch({ type: 'PINJOL', amount: a })}>
            Pinjam {rp(a)}
          </button>
        ))}
        {p.cash < 0 && room > 0 && (
          <button className="btn small danger" onClick={() => dispatch({ type: 'PINJOL', amount: Math.min(room, Math.ceil(-p.cash / E.pinjolStep) * E.pinjolStep) })}>
            Tutup minus ({rp(Math.min(room, Math.ceil(-p.cash / E.pinjolStep) * E.pinjolStep))})
          </button>
        )}
      </div>
      <div className="row-actions">
        <button className="btn small primary" disabled={!p.debt || p.cash <= 0} onClick={() => dispatch({ type: 'REPAY', amount: Math.min(1000, p.debt) })}>
          Bayar {rp(Math.min(1000, p.debt || 1000))}
        </button>
        <button className="btn small primary" disabled={!p.debt || p.cash < p.debt} onClick={() => dispatch({ type: 'REPAY', amount: p.debt })}>
          Lunasi semua
        </button>
      </div>
    </Modal>
  )
}

export function CardModal({ cardId, playerName, onClose }: { cardId: string; playerName: string; onClose: () => void }) {
  const card = CARD_BY_ID[cardId]
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`game-card ${card.deck}`} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="head">
          {card.deck === 'viral' ? '📱 KARTU VIRAL' : '🍚 KARTU BANSOS'} · {playerName}
        </div>
        <div className="body">{card.text}</div>
        <div className="effect">{card.effectText}</div>
        <button className="btn dark" onClick={onClose} autoFocus>
          Oke deh 😮‍💨
        </button>
      </div>
    </div>
  )
}

export function RulesModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <h2>❓ Panduan Singkat</h2>
      <div className="rules">
        <h3>1. Keliling dulu 🧭</h3>
        <ul>
          <li>Putaran pertama belum boleh beli apa-apa. Lewati START dulu.</li>
        </ul>
        <h3>2. Beli tanah 🚩</h3>
        <ul>
          <li>Mendarat di petak kosong? Beli tanahnya. Pemain lain yang mampir bayar sewa ke kamu.</li>
        </ul>
        <h3>3. Lewat START = gajian + bangun 🏗️</h3>
        <ul>
          <li>Gaji UMR langsung dipotong biaya hidup & cicilan pinjol, tapi selalu ada sisanya (minimal 25%).</li>
          <li>Habis gajian, pilih <b>satu</b> tanahmu untuk dibangun (naik sampai {E.levelsPerWindow} tingkat): 🛖 Warung → 🏠 Kos → 🏬 Ruko → 🏢 Mall.</li>
          <li>Mall wajib punya satu grup warna penuh.</li>
          <li>Berhenti pas di START? Gaji ditahan HRD 😅</li>
        </ul>
        <h3>4. Bertahan hidup 💸</h3>
        <ul>
          <li>Tiap 5 ronde harga naik 5–12% dan ada Headline Nasional dengan efek setahun.</li>
          <li>Uang minus? Gadai tanah, jual bangunan, atau pinjol (bunga 5% tiap giliran!). Mentok = bangkrut.</li>
          <li>Petak ungu = mini-game & aksi: 🎰 Slot Judol, 🌶️ Tebak Cabai, 📈 Investasi Bodong, 🚓 Operasi Zebra, 🕳️ Jalan Rusak, 🏛️ Samsat, 🪧 Baliho. 🌊 Banjir bikin sewa satu grup nol.</li>
          <li>Kena Pasal Karet → Kasus Mangkrak. Keluar dengan uang damai, dadu kembar, atau kartu No Viral. Yang berduit bisa sewa 🛋️ sel mewah.</li>
        </ul>
        <h3>5. Menang 👑</h3>
        <ul>
          <li>Kekayaan (uang + aset − utang) tertinggi di akhir ronde, atau satu-satunya yang belum bangkrut.</li>
        </ul>
      </div>
      <button className="btn primary" style={{ marginTop: 14, width: '100%' }} onClick={onClose}>
        Siap menderita 💪
      </button>
    </Modal>
  )
}

function PropPicker({ s, owner, picked, onToggle }: { s: GameState; owner: number; picked: number[]; onToggle: (sq: number) => void }) {
  const list = ownedBy(s, owner)
  if (!list.length) return <div className="muted">Belum punya tanah.</div>
  return (
    <div className="pick-list">
      {list.map((sq) => {
        const ok = canTradeProp(s, sq)
        const on = picked.includes(sq)
        const g = BOARD[sq].group
        return (
          <button
            key={sq}
            className={`pick ${on ? 'on' : ''}`}
            disabled={!ok}
            title={ok ? '' : 'Ada bangunannya / grupnya punya Mall'}
            style={{ '--g': g ? GROUPS[g].color : '#ccc' } as CSSProperties}
            onClick={() => onToggle(sq)}
          >
            {on ? '✅' : '⬜'} {BOARD[sq].name} <small>{rp(price(s, sq))}</small>
          </button>
        )
      })}
    </div>
  )
}

function CashStepper({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="stepper">
      <button className="btn small" disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 500))}>
        −
      </button>
      <b>{rp(value)}</b>
      <button className="btn small" disabled={value + 500 > max} onClick={() => onChange(Math.min(max, value + 500))}>
        +
      </button>
    </div>
  )
}

export function TradeModal({ s, onPropose, onClose }: { s: GameState; onPropose: (o: TradeOffer) => void; onClose: () => void }) {
  const me = s.current
  const others = activePlayers(s).filter((p) => p.id !== me)
  const [to, setTo] = useState(others[0]?.id ?? me)
  const [give, setGive] = useState<number[]>([])
  const [take, setTake] = useState<number[]>([])
  const [cashGive, setCashGive] = useState(0)
  const [cashTake, setCashTake] = useState(0)
  const toggle = (list: number[], set: (v: number[]) => void, sq: number) => set(list.includes(sq) ? list.filter((x) => x !== sq) : [...list, sq])
  const offer: TradeOffer = { from: me, to, give, take, cashGive, cashTake }
  const partner = s.players[to]
  return (
    <Modal onClose={onClose}>
      <h2>🤝 Tawar Tukar Tanah</h2>
      <div className="row-actions" style={{ marginTop: 0 }}>
        {others.map((p) => (
          <button
            key={p.id}
            className={`btn small ${p.id === to ? 'dark' : ''}`}
            onClick={() => {
              setTo(p.id)
              setTake([])
              setCashTake(0)
            }}
          >
            {p.token} {p.name}
          </button>
        ))}
      </div>
      <div className="trade-cols">
        <div>
          <h3 className="bungee trade-h">Kamu kasih</h3>
          <PropPicker s={s} owner={me} picked={give} onToggle={(sq) => toggle(give, setGive, sq)} />
          <CashStepper value={cashGive} max={Math.max(0, s.players[me].cash)} onChange={setCashGive} />
        </div>
        <div>
          <h3 className="bungee trade-h">Kamu minta</h3>
          <PropPicker s={s} owner={to} picked={take} onToggle={(sq) => toggle(take, setTake, sq)} />
          <CashStepper value={cashTake} max={Math.max(0, partner?.cash ?? 0)} onChange={setCashTake} />
        </div>
      </div>
      <p className="muted" style={{ fontSize: 12 }}>Tanah yang ada bangunannya tidak bisa ditukar. Bot cuma mau kalau untung.</p>
      <button className="btn primary" style={{ width: '100%' }} disabled={!validTrade(s, offer)} onClick={() => onPropose(offer)}>
        Ajukan tawaran ke {partner?.name} ➜
      </button>
    </Modal>
  )
}

export function TradeAskModal({ s, offer, passDevice, onAnswer }: { s: GameState; offer: TradeOffer; passDevice: boolean; onAnswer: (ok: boolean) => void }) {
  const from = s.players[offer.from]
  const to = s.players[offer.to]
  const names = (sqs: number[]) => (sqs.length ? sqs.map((sq) => BOARD[sq].name).join(', ') : '—')
  return (
    <div className="modal-backdrop">
      <div className="modal panel" role="dialog">
        <h2>📨 Tawaran dari {from.name}</h2>
        {passDevice && (
          <div className="action-note" style={{ marginBottom: 8 }}>
            📱 Oper HP ke <b>{to.name}</b> dulu ya.
          </div>
        )}
        <table>
          <tbody>
            <tr>
              <td>{to.name} dapat tanah</td>
              <td>{names(offer.give)}</td>
            </tr>
            <tr>
              <td>{to.name} dapat uang</td>
              <td className="plus">{rp(offer.cashGive)}</td>
            </tr>
            <tr>
              <td>{to.name} kasih tanah</td>
              <td>{names(offer.take)}</td>
            </tr>
            <tr>
              <td>{to.name} kasih uang</td>
              <td className="minus">{rp(offer.cashTake)}</td>
            </tr>
          </tbody>
        </table>
        <div className="row-actions">
          <button className="btn primary" onClick={() => onAnswer(true)}>
            🤝 Deal!
          </button>
          <button className="btn" onClick={() => onAnswer(false)}>
            🙅 Ogah
          </button>
        </div>
      </div>
    </div>
  )
}
