import { useEffect, useRef, useState } from 'react'
import { rp } from '../engine/format.ts'

// Saldo yang menghitung naik/turun ke nilai baru (PRD §12.5).
export function AnimatedRp({ value, className }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value)
  const [flash, setFlash] = useState<'' | 'up' | 'down'>('')
  const from = useRef(value)

  useEffect(() => {
    const start = from.current
    if (start === value) return
    const t0 = performance.now()
    const dur = 600
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / dur)
      const v = start + (value - start) * (1 - Math.pow(1 - k, 3))
      setShown(v)
      from.current = v
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    setFlash(value > start ? 'up' : 'down')
    const t = setTimeout(() => setFlash(''), 700)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(t)
      from.current = value
    }
  }, [value])

  return <b className={`${className ?? ''} money ${flash}`}>{rp(shown)}</b>
}
