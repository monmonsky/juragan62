import { useLayoutEffect, useState } from 'react'

// Tutorial interaktif di game pertama: sorot satu bagian layar per langkah.
const STEPS = [
  { sel: '[data-player-card].mine, [data-player-card]', text: 'Ini kamu. Uang, utang pinjol, dan jumlah tanahmu ada di sini.' },
  { sel: '.ih', text: 'Indeks Harga. Tiap 5 ronde harga naik 5–12%, gaji cuma naik dikit. Itulah inti penderitaannya 😅' },
  { sel: '.headline-card', text: 'Headline Nasional: berita tiap tahun yang efeknya berlaku setahun penuh.' },
  { sel: '.actions-dock', text: 'Tombol aksimu. Putaran pertama keliling dulu, baru boleh beli tanah 🚩. Tiap lewat START: gajian + boleh bangun 1 tanah.' },
  { sel: '.board', text: 'Klik petak mana pun untuk lihat harga & sewanya. Tanah yang tidak dibeli akan dilelang. Gas, lempar dadu!' },
]

export function Coach({ step, onNext, onSkip }: { step: number; onNext: () => void; onSkip: () => void }) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const cur = STEPS[step]

  useLayoutEffect(() => {
    if (!cur) return
    const el = document.querySelector(cur.sel)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    const update = () => setRect(el?.getBoundingClientRect() ?? null)
    update()
    const t = setTimeout(update, 350)
    window.addEventListener('resize', update)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', update)
    }
  }, [cur])

  if (!cur || !rect) return null
  const pad = 6
  const below = rect.bottom + 180 < window.innerHeight
  const bubbleTop = below ? rect.bottom + 14 : Math.max(12, rect.top - 170)
  const bubbleLeft = Math.min(Math.max(12, rect.left), window.innerWidth - 332)
  return (
    <div className="coach" role="dialog" aria-label="Tutorial">
      <div className="coach-hole" style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }} />
      <div className="coach-bubble panel" style={{ top: bubbleTop, left: bubbleLeft }}>
        <div className="muted" style={{ fontSize: 12, fontWeight: 800 }}>
          Tutorial {step + 1}/{STEPS.length}
        </div>
        <p style={{ margin: '6px 0 10px', fontWeight: 600 }}>{cur.text}</p>
        <div className="row-actions" style={{ marginTop: 0 }}>
          <button className="btn small primary" onClick={onNext} autoFocus>
            {step + 1 < STEPS.length ? 'Lanjut ➜' : 'Siap menderita 💪'}
          </button>
          <button className="btn small" onClick={onSkip}>
            Lewati
          </button>
        </div>
      </div>
    </div>
  )
}

