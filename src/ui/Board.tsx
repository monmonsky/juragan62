import type { CSSProperties } from 'react'
import { BOARD, GROUPS, LEVEL_NAMES, SIDE } from '../data/board.ts'
import { ECONOMY } from '../data/economy.ts'
import { HEADLINE_BY_ID, price } from '../engine/engine.ts'
import { fmtIndex, rp } from '../engine/format.ts'
import type { GameState } from '../engine/types.ts'
import { BuildingIcon, SquareIcon } from './icons.tsx'
import { DiceStage, Die } from './Dice.tsx'
import type { DiceShow } from './Dice.tsx'
import { SceneCard } from './Scene.tsx'

// Petak ke-i di grid (SIDE+1)×(SIDE+1): START di pojok kanan bawah, jalan searah jarum jam.
function place(i: number) {
  const n = SIDE + 1
  if (i <= SIDE) return { row: n, col: n - i, side: i === 0 || i === SIDE ? 'corner' : 'bottom' }
  if (i < SIDE * 2) return { row: n - (i - SIDE), col: 1, side: 'left' }
  if (i <= SIDE * 3) return { row: 1, col: 1 + (i - SIDE * 2), side: i === SIDE * 2 || i === SIDE * 3 ? 'corner' : 'top' }
  return { row: 1 + (i - SIDE * 3), col: n, side: 'right' }
}

interface Props {
  view: GameState
  positions: number[]
  dice: [number, number]
  diceShow: DiceShow | null
  sceneSq: number | null
  onSkipScene: () => void
  onCellClick: (sq: number) => void
}

export function Board({ view, positions, dice, diceShow, sceneSq, onSkipScene, onCellClick }: Props) {
  const s = view
  const headline = s.headline ? HEADLINE_BY_ID[s.headline] : null
  const gajiNaik = Math.round((s.umrIndex - 1) * 100)

  return (
    <div className="board">
      {BOARD.map((sq, i) => {
        const { row, col, side } = place(i)
        const prop = s.props[i]
        const owner = prop?.owner != null ? s.players[prop.owner] : null
        const here = s.players.filter((p) => !p.bankrupt && positions[p.id] === i)
        const isCorner = ['start', 'jail', 'parking', 'gotojail'].includes(sq.type)
        const flooded = !!sq.group && s.flood?.group === sq.group && s.round <= s.flood.untilRound
        let priceText = ''
        if (sq.price) priceText = owner ? (prop.mortgaged ? 'GADAI' : owner.name) : rp(price(s, i))
        else if (sq.tax === 'pungli') priceText = `Bayar ${rp(ECONOMY.pungliFee * s.ih)}`
        else if (sq.tax === 'iuran') priceText = `Bayar ${rp(ECONOMY.iuranFee * s.ih)}`
        else if (sq.tax === 'ppn') priceText = '12% uang'

        return (
          <div
            key={i}
            data-sq={i}
            className={[
              'cell',
              `side-${side}`,
              `sq-${i}`,
              isCorner ? 'type-corner' : `type-${sq.type}`,
              owner ? 'owned' : '',
              prop?.mortgaged ? 'mortgaged' : '',
              s.pendingBuy === i ? 'pending' : '',
              flooded ? 'flooded' : '',
            ].join(' ')}
            style={{
              gridRow: row,
              gridColumn: col,
              ...(sq.group ? { '--g': GROUPS[sq.group].color } : {}),
              ...(owner ? { '--owner': owner.color } : {}),
            } as CSSProperties}
            onClick={() => onCellClick(i)}
            title={sq.name}
          >
            {sq.group && <div className="strip" />}
            <SquareIcon sq={i} />
            <div className="cell-text">
              <div className="name">{sq.name}</div>
              {sq.sub && isCorner && <div className="sub">{sq.sub}</div>}
              {priceText && <div className="price">{priceText}</div>}
            </div>
            {owner && sq.type === 'prop' && !prop.mortgaged ? (
              <div className="bld" title={LEVEL_NAMES[prop.level]}>
                <BuildingIcon level={prop.level} color={owner.color} />
              </div>
            ) : null}
            {here.length > 0 && (
              <div className="tokens">
                {here.map((p) => (
                  <span key={p.id} className="token" data-player={p.id} style={{ '--c': p.color } as CSSProperties} title={p.name}>
                    {p.token}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="center">
        <div>
          <div className="logo">
            JURAGAN <span>+62</span>
          </div>
          <div className="tagline">Bertahan Hidup di Negeri Konoha</div>
        </div>

        <div className="center-row">
          <div className="ih">
            <div className="ih-label">Indeks Harga</div>
            <div className="ih-value">{fmtIndex(s.ih)}</div>
            <div className="ih-bar">
              <div style={{ width: `${Math.min(100, (s.ih - 1) * 100)}%` }} />
            </div>
            <div className="ih-note">
              Harga naik {Math.round((s.ih - 1) * 100)}% sejak awal. Gaji? {gajiNaik}%.
            </div>
          </div>
          <div className="turn-box">
            <div className="dice">
              <Die value={dice[0]} small />
              {dice[1] ? <Die value={dice[1]} small /> : null}
              <b className="dice-sum">= {dice[0] + dice[1]}</b>
            </div>
            <div className="round">
              Ronde <b>{s.round}</b>
              {s.maxRounds ? `/${s.maxRounds}` : ''} · Tahun {s.year}
            </div>
          </div>
        </div>

        <div className="headline-card">
          <div className="head">📰 HEADLINE TAHUN INI</div>
          {headline ? (
            <>
              <div className="title">{headline.title}</div>
              <div className="effect">{headline.effectText}</div>
            </>
          ) : (
            <div className="title">Belum ada berita besar. Nikmati selagi bisa.</div>
          )}
        </div>

        <ul className="log">
          {s.log
            .slice(-6)
            .reverse()
            .map((entry, k) => (
              <li key={s.log.length - k}>{entry.text}</li>
            ))}
        </ul>
      </div>
      {diceShow && <DiceStage show={diceShow} />}
      {sceneSq !== null && <SceneCard key={sceneSq} sq={sceneSq} onSkip={onSkipScene} />}
    </div>
  )
}
