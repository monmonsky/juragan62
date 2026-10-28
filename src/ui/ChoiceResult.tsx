import { useEffect, useState } from 'react'
import type { ChoiceKind } from '../data/board.ts'
import { rp } from '../engine/format.ts'

export interface ChoiceShow {
  kind: ChoiceKind
  outcome: 'win' | 'lose' | 'jackpot' | 'neutral' | 'caught'
  delta: number
  text: string
  name: string
}

const TITLE: Record<ChoiceKind, string> = {
  judol: '🎰 SLOT JUDOL',
  cabai: '🌶️ HARGA CABAI',
  investasi: '📈 INVESTASI BODONG',
  zebra: '🚓 OPERASI ZEBRA',
  jalan: '🕳️ JALAN RUSAK',
  samsat: '🏛️ ANTRE SAMSAT',
  baliho: '🪧 BALIHO KAMPANYE',
}

const SYMBOLS = ['🍒', '💎', '7️⃣', '🍋', '🔔', '💩']
const EMOJI: Record<ChoiceShow['outcome'], string> = { win: '🤑', jackpot: '🎉', lose: '😭', neutral: '😐', caught: '🚨' }

// Hasil mini-game. Slot judol: gulungan berputar dulu, lalu berhenti satu per satu.
export function ChoiceResult({ show }: { show: ChoiceShow }) {
  const final =
    show.outcome === 'jackpot' ? ['7️⃣', '7️⃣', '7️⃣'] : show.outcome === 'win' ? ['🍒', '🍒', '🍒'] : ['🍒', '💎', '💩']
  const [reels, setReels] = useState(['🎰', '🎰', '🎰'])
  const [stopped, setStopped] = useState(show.kind === 'judol' ? 0 : 3)

  useEffect(() => {
    if (show.kind !== 'judol') return
    const spin = setInterval(() => setReels((r) => r.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])), 80)
    const stops = [700, 1050, 1400].map((ms, i) => setTimeout(() => setStopped(i + 1), ms))
    return () => {
      clearInterval(spin)
      stops.forEach(clearTimeout)
    }
  }, [show.kind])

  const done = stopped >= 3
  return (
    <div className={`choice-result ${show.outcome}`} role="status">
      <div className="choice-title">{TITLE[show.kind]}</div>
      {show.kind === 'judol' ? (
        <div className="reels">
          {final.map((sym, i) => (
            <span key={i} className={`reel ${i < stopped ? 'stop' : ''}`}>
              {i < stopped ? sym : reels[i]}
            </span>
          ))}
        </div>
      ) : (
        <div className="choice-emoji">{EMOJI[show.outcome]}</div>
      )}
      {done && (
        <>
          <div className="choice-text">
            <b>{show.name}:</b> {show.text}
          </div>
          {show.delta !== 0 && <div className={`choice-delta ${show.delta > 0 ? 'plus' : 'minus'}`}>{rp(show.delta, true)}</div>}
        </>
      )}
    </div>
  )
}
