import type { CSSProperties } from 'react'
import { BOARD } from '../data/board.ts'
import { SquareIcon } from './icons.tsx'
import { SCENES } from './scenes.ts'

export function SceneCard({ sq, onSkip }: { sq: number; onSkip: () => void }) {
  const scene = SCENES[BOARD[sq]?.id]
  if (!scene) return null
  return (
    <div className="scene" onClick={onSkip} role="status" aria-label={`${BOARD[sq].name}: ${scene.line}`}>
      <div className="scene-stage">
        <SquareIcon sq={sq} className={`scene-icon ${scene.icon ? `anim-${scene.icon}` : 'anim-zoom'}`} />
        {scene.actors.map(([emoji, anim, x, y, delay = 0, size = 3.2], i) => (
          <span
            key={i}
            className={`actor anim-${anim}`}
            style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${delay}s`, fontSize: `${size}em` } as CSSProperties}
          >
            {emoji}
          </span>
        ))}
        {scene.bubble && <div className="scene-bubble">{scene.bubble}</div>}
      </div>
      <div className="scene-title">{BOARD[sq].name}</div>
      <div className="scene-line">{scene.line}</div>
    </div>
  )
}
