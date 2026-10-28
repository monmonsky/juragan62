import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { START_PLAYERS } from '../data/economy.ts'
import { CHARACTERS, CHARACTER_BY_ID } from '../data/characters.ts'
import type { CharacterId } from '../data/characters.ts'
import { EDISI } from '../data/isu-terkini.ts'
import { fmtIndex, rp } from '../engine/format.ts'
import { rapor } from '../engine/rapor.ts'
import type { NewPlayer } from '../engine/engine.ts'
import type { Edisi, GameState } from '../engine/types.ts'
import { confetti } from './fx.ts'
import { shareRapor } from './share.ts'
import { ACHIEVEMENTS, loadLifetime } from './achievements.ts'
import type { Achievement } from './achievements.ts'
import type { Speed } from './fx.ts'
import { Modal, RulesModal } from './Modals.tsx'

const TOKENS = ['🛵', '🪙', '🧕', '👑', '🏍️', '🤳', '🧑‍🌾', '👷', '🧑‍💻', '🐓', '🍜', '🦍', '🐈', '🧑‍🍳', '🚕', '🎤', '🐊', '🥷']

export interface Profile {
  name: string
  token: string
}

export function TokenGrid({ value, onPick }: { value: string; onPick: (t: string) => void }) {
  return (
    <div className="token-grid">
      {TOKENS.map((t) => (
        <button key={t} className={t === value ? 'on' : ''} onClick={() => onPick(t)} aria-label={`Pilih bidak ${t}`}>
          {t}
        </button>
      ))}
    </div>
  )
}

export function CharacterPicker({ value, onPick, onClose }: { value: CharacterId; onPick: (c: CharacterId) => void; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <h2>Pilih karakter</h2>
      <div className="char-grid">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            className={c.id === value ? 'on' : ''}
            onClick={() => {
              onPick(c.id)
              onClose()
            }}
          >
            <b>
              {c.icon} {c.name}
            </b>
            <div className="plus" style={{ fontSize: 13 }}>
              ＋ {c.plus}
            </div>
            <div className="minus" style={{ fontSize: 13 }}>
              − {c.minus}
            </div>
          </button>
        ))}
      </div>
    </Modal>
  )
}

export function CharacterButton({ value, onClick }: { value: CharacterId; onClick: () => void }) {
  const c = CHARACTER_BY_ID[value]
  return (
    <button className="char-pick" onClick={onClick} title={`${c.plus} ${c.minus}`}>
      {c.icon} {c.name} ▾
    </button>
  )
}

export function Welcome({ initial, onDone }: { initial: Profile | null; onDone: (p: Profile) => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [token, setToken] = useState(initial?.token ?? TOKENS[0])
  return (
    <div className="screen">
      <h1 className="logo home-logo">
        JURAGAN <span>+62</span>
      </h1>
      <div className="panel" style={{ display: 'grid', gap: 12 }}>
        <h2 className="bungee" style={{ fontSize: 22 }}>
          Selamat datang, warga Konoha!
        </h2>
        <label style={{ display: 'grid', gap: 6, fontWeight: 800 }}>
          Siapa namamu?
          <input
            className="welcome-input"
            type="text"
            value={name}
            maxLength={16}
            placeholder="mis. Budi Sudarsono"
            autoFocus
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div style={{ fontWeight: 800 }}>Pilih bidakmu</div>
        <TokenGrid value={token} onPick={setToken} />
      </div>
      <div className="home-actions">
        <button className="btn primary big" disabled={!name.trim()} onClick={() => onDone({ name: name.trim(), token })}>
          {token} Masuk Konoha ➜
        </button>
      </div>
    </div>
  )
}

export function Home({ profile, hasSave, onNew, onOnline, onAchievements, onContinue, onEditProfile }: {
  profile: Profile
  hasSave: boolean
  onNew: () => void
  onOnline: () => void
  onAchievements: () => void
  onContinue: () => void
  onEditProfile: () => void
}) {
  const [rules, setRules] = useState(false)
  return (
    <div className="screen">
      <h1 className="logo home-logo">
        JURAGAN <span>+62</span>
      </h1>
      <div className="home-tagline">Bertahan Hidup di Negeri Konoha</div>
      <div style={{ textAlign: 'center', fontWeight: 700 }}>
        Halo, {profile.token} {profile.name}!{' '}
        <button className="btn small" onClick={onEditProfile}>
          ganti
        </button>
      </div>
      <div className="panel" style={{ transform: 'rotate(-1deg)' }}>
        Game papan properti tentang betapa susahnya hidup di Konoha: gaji UMR kalah cepat dari harga, pinjol cair 5 detik, dan berita tiap tahun makin
        ajaib. Kumpulkan aset sebelum aset yang mengumpulkanmu.
      </div>
      <div className="home-actions">
        {hasSave && (
          <button className="btn primary big" onClick={onContinue}>
            ▶ Lanjutkan Game
          </button>
        )}
        <button className={`btn big ${hasSave ? '' : 'primary'}`} onClick={onNew}>
          🎲 Main di 1 HP
        </button>
        <button className="btn big" onClick={onOnline}>
          🌐 Main Online
        </button>
        <button className="btn" onClick={onAchievements}>
          🏆 Pencapaian & Statistik
        </button>
        <button className="btn" onClick={() => setRules(true)}>
          ❓ Panduan
        </button>
      </div>
      <p className="disclaimer">
        Karya satir & fiksi. Kemiripan dengan negara mana pun itu kebetulan... atau tidak.
        <br />
        Edisi isu: {EDISI}
      </p>
      {rules && <RulesModal onClose={() => setRules(false)} />}
    </div>
  )
}

export interface SetupResult {
  players: NewPlayer[]
  maxRounds: number | null
  speed: Speed
  edisi: Edisi
  openingRoll: boolean
}

export function Setup({ profile, speed, onStart, onBack }: { profile: Profile; speed: Speed; onStart: (r: SetupResult) => void; onBack: () => void }) {
  const [players, setPlayers] = useState<NewPlayer[]>(() =>
    START_PLAYERS.slice(0, 4).map((p, i) => (i === 0 ? { ...p, ...profile, isBot: false } : { ...p, token: p.token === profile.token ? TOKENS[10 + i] : p.token, isBot: true })),
  )
  const [picking, setPicking] = useState<number | null>(null)
  const [charPicking, setCharPicking] = useState<number | null>(null)
  const [maxRounds, setMaxRounds] = useState<number | null>(30)
  const [spd, setSpd] = useState<Speed>(speed)
  const [edisi, setEdisi] = useState<Edisi>('terbaru')
  const [openingRoll, setOpeningRoll] = useState(true)

  const update = (i: number, patch: Partial<NewPlayer>) => setPlayers((ps) => ps.map((p, k) => (k === i ? { ...p, ...patch } : p)))
  const humans = players.filter((p) => !p.isBot).length

  return (
    <div className="screen">
      <h1 className="bungee" style={{ fontSize: 32 }}>
        Siapa yang mau menderita?
      </h1>
      <div className="panel" style={{ display: 'grid', gap: 10 }}>
        {players.map((p, i) => (
          <div key={i} className="setup-row">
            <button className="token-pick" style={{ borderColor: p.color } as CSSProperties} onClick={() => setPicking(i)} title="Ganti bidak">
              {p.token}
            </button>
            <input type="text" value={p.name} maxLength={16} onChange={(e) => update(i, { name: e.target.value })} aria-label={`Nama pemain ${i + 1}`} />
            <CharacterButton value={p.character} onClick={() => setCharPicking(i)} />
            <div className="toggle">
              <button className={!p.isBot ? 'on' : ''} onClick={() => update(i, { isBot: false })}>
                🙋 Orang
              </button>
              <button className={p.isBot ? 'on' : ''} onClick={() => update(i, { isBot: true })}>
                🤖 Bot
              </button>
            </div>
            <button className="btn small" disabled={players.length <= 2} onClick={() => setPlayers((ps) => ps.filter((_, k) => k !== i))} aria-label="Hapus pemain">
              ✕
            </button>
          </div>
        ))}
        <button
          className="btn small"
          disabled={players.length >= 6}
          onClick={() => setPlayers((ps) => [...ps, { ...START_PLAYERS[ps.length], isBot: true }])}
        >
          + Tambah pemain
        </button>
      </div>

      <div className="panel" style={{ display: 'grid', gap: 12 }}>
        <div className="field">
          <b>Panjang game</b>
          {[20, 30, 40, null].map((r) => (
            <button key={String(r)} className={`btn small ${maxRounds === r ? 'dark' : ''}`} onClick={() => setMaxRounds(r)}>
              {r ? `${r} ronde` : 'Sampai tinggal satu'}
            </button>
          ))}
        </div>
        <div className="field">
          <b>Urutan main</b>
          <button className={`btn small ${openingRoll ? 'dark' : ''}`} onClick={() => setOpeningRoll(true)}>
            🎲 Lempar dadu (tertinggi duluan)
          </button>
          <button className={`btn small ${!openingRoll ? 'dark' : ''}`} onClick={() => setOpeningRoll(false)}>
            Urut daftar
          </button>
        </div>
        <div className="field">
          <b>Edisi kartu</b>
          <button className={`btn small ${edisi === 'terbaru' ? 'dark' : ''}`} onClick={() => setEdisi('terbaru')}>
            📰 Isu terkini ({EDISI})
          </button>
          <button className={`btn small ${edisi === 'klasik' ? 'dark' : ''}`} onClick={() => setEdisi('klasik')}>
            🎲 Klasik (tanpa Headline)
          </button>
        </div>
        <div className="muted" style={{ fontSize: 13 }}>
          Perkiraan durasi: ±{Math.round(((maxRounds ?? 45) * (players.filter((p) => !p.isBot).length * 25 + players.filter((p) => p.isBot).length * (spd === 'normal' ? 9 : 5))) / 60)} menit
        </div>
        <div className="field">
          <b>Kecepatan animasi</b>
          {(['normal', 'cepat', 'mati'] as Speed[]).map((v) => (
            <button key={v} className={`btn small ${spd === v ? 'dark' : ''}`} onClick={() => setSpd(v)}>
              {v === 'normal' ? 'Normal' : v === 'cepat' ? 'Cepat' : 'Mati'}
            </button>
          ))}
        </div>
      </div>

      {charPicking !== null && (
        <CharacterPicker value={players[charPicking].character} onPick={(c) => update(charPicking, { character: c })} onClose={() => setCharPicking(null)} />
      )}
      {picking !== null && (
        <Modal onClose={() => setPicking(null)}>
          <h2>Pilih bidak {players[picking].name}</h2>
          <TokenGrid
            value={players[picking].token}
            onPick={(t) => {
              update(picking, { token: t })
              setPicking(null)
            }}
          />
        </Modal>
      )}
      {humans === 0 && <div className="action-note warn">Minimal satu pemain harus orang. Masa bot semua yang menderita?</div>}
      <div className="home-actions">
        <button
          className="btn primary big"
          disabled={humans === 0}
          onClick={() => onStart({ players: players.map((p, i) => ({ ...p, name: p.name.trim() || `Pemain ${i + 1}` })), maxRounds, speed: spd, edisi, openingRoll })}
        >
          Mulai Menderita ➜
        </button>
        <button className="btn" onClick={onBack}>
          ← Kembali
        </button>
      </div>
    </div>
  )
}

export function Rapor({ s, unlocked, onAgain, onHome }: { s: GameState; unlocked: Achievement[]; onAgain: () => void; onHome: () => void }) {
  const rows = rapor(s)
  const [shareMsg, setShareMsg] = useState('')
  useEffect(() => confetti(), [])
  return (
    <div className="screen">
      <div className="panel rapor-card">
        <div className="logo" style={{ fontSize: 30, textAlign: 'center' }}>
          RAPOR HIDUP <span>KONOHA</span>
        </div>
        <p style={{ textAlign: 'center', fontWeight: 700 }}>
          {s.round - 1 >= 1 ? `${Math.min(s.round - 1, s.maxRounds ?? s.round)} ronde` : ''} · Harga naik {Math.round((s.ih - 1) * 100)}% (Indeks {fmtIndex(s.ih)}) · Gaji
          cuma naik {Math.round((s.umrIndex - 1) * 100)}%
        </p>
        {rows.map((r) => (
          <div key={r.player.id} className="rapor-row">
            <div className="rapor-rank">{r.rank}</div>
            <div>
              <b>
                {r.player.token} {r.player.name}
              </b>
              <span className="badge" style={{ marginLeft: 6 }}>
                {CHARACTER_BY_ID[r.player.character].icon} {CHARACTER_BY_ID[r.player.character].name}
              </span>
              {r.player.bankrupt && <span className="badge" style={{ marginLeft: 6 }}>🪦 bangkrut ronde {r.player.bankruptRound}</span>}
              <div className="rapor-titles">
                {r.titles.map((t) => (
                  <span key={t} className="badge hot">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <b className={r.worth < 0 ? 'minus' : ''}>{r.player.bankrupt ? '—' : rp(r.worth)}</b>
          </div>
        ))}
        <div className="table-scroll">
          <table className="rapor-stats">
            <thead>
              <tr>
                <th>Pemain</th>
                <th>Gaji</th>
                <th>Biaya hidup</th>
                <th>Pungli</th>
                <th>Bunga pinjol</th>
                <th>Pajak</th>
                <th>Mangkrak</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ player: p }) => (
                <tr key={p.id}>
                  <td>
                    {p.token} {p.name}
                  </td>
                  <td>{rp(p.stats.gaji)}</td>
                  <td>{rp(p.stats.biayaHidup)}</td>
                  <td>{rp(p.stats.pungli)}</td>
                  <td>{rp(p.stats.bungaPinjol)}</td>
                  <td>{rp(p.stats.pajak)}</td>
                  <td>{p.stats.mangkrak}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="disclaimer">juragan +62 · karya satir · screenshot & pamerkan penderitaanmu</p>
      </div>
      {unlocked.length > 0 && (
        <div className="panel" style={{ display: 'grid', gap: 8 }}>
          <b className="bungee">🏆 Pencapaian baru!</b>
          {unlocked.map((a) => (
            <div key={a.id} className="achv on">
              <span className="achv-icon">{a.icon}</span>
              <div>
                <b>{a.name}</b>
                <div className="muted">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="home-actions">
        <button
          className="btn danger big"
          onClick={async () => {
            try {
              const how = await shareRapor(s)
              setShareMsg(how === 'shared' ? 'Terkirim! 🎉' : 'Gambar rapor sudah diunduh. Tinggal posting 📸')
            } catch {
              setShareMsg('Gagal bikin gambar. Screenshot manual aja ya 🙏')
            }
          }}
        >
          📸 Bagikan Rapor
        </button>
        {shareMsg && <div className="action-note">{shareMsg}</div>}
        <button className="btn primary big" onClick={onAgain}>
          🎲 Main Lagi
        </button>
        <button className="btn" onClick={onHome}>
          🏠 Beranda
        </button>
      </div>
    </div>
  )
}

export function Achievements({ onBack }: { onBack: () => void }) {
  const life = loadLifetime()
  const got = Object.keys(life.unlocked).length
  return (
    <div className="screen">
      <h1 className="bungee" style={{ fontSize: 32 }}>
        🏆 Pencapaian
      </h1>
      <div className="panel stats-grid">
        <div>
          <span>Game</span>
          <b>{life.games}</b>
        </div>
        <div>
          <span>Menang</span>
          <b>{life.wins}</b>
        </div>
        <div>
          <span>Bangkrut</span>
          <b>{life.bankrupt}</b>
        </div>
        <div>
          <span>Total pungli</span>
          <b>{rp(life.pungli)}</b>
        </div>
        <div>
          <span>Total bunga pinjol</span>
          <b>{rp(life.bungaPinjol)}</b>
        </div>
        <div>
          <span>Deal tanah</span>
          <b>{life.trades}</b>
        </div>
      </div>
      <div className="panel" style={{ display: 'grid', gap: 8 }}>
        <b>
          Terbuka {got}/{ACHIEVEMENTS.length}
        </b>
        {ACHIEVEMENTS.map((a) => (
          <div key={a.id} className={`achv ${life.unlocked[a.id] ? 'on' : ''}`}>
            <span className="achv-icon">{life.unlocked[a.id] ? a.icon : '🔒'}</span>
            <div>
              <b>{a.name}</b>
              <div className="muted">
                {a.desc}
                {life.unlocked[a.id] ? ` · ${life.unlocked[a.id]}` : ''}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="home-actions">
        <button className="btn" onClick={onBack}>
          ← Kembali
        </button>
      </div>
    </div>
  )
}
