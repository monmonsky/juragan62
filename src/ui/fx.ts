// Efek animasi berbasis DOM / Web Animations API (PRD §12.5). Hanya transform & opacity.

export type Speed = 'normal' | 'cepat' | 'mati'

const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
let base = 1
let factor = 1

export function setSpeed(speed: Speed) {
  base = reduceMotion || speed === 'mati' ? 0 : speed === 'cepat' ? 0.8 : 2
  factor = base
  document.documentElement.classList.toggle('no-anim', factor === 0)
}

// Giliran bot diputar sedikit lebih cepat.
export function setBoost(on: boolean) {
  factor = on ? base * 0.75 : base
}

export const animationsOn = () => factor > 0

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms * factor))

export function anim(el: Element | null, frames: Keyframe[], opts: KeyframeAnimationOptions & { duration: number }) {
  if (!el || factor === 0) return Promise.resolve()
  return el.animate(frames, { ...opts, duration: opts.duration * factor }).finished.then(
    () => undefined,
    () => undefined,
  )
}

export const cellEl = (sq: number) => document.querySelector(`[data-sq="${sq}"]`)
export const playerCardEl = (pid: number) => document.querySelector(`[data-player-card="${pid}"]`)
export const tokenEl = (pid: number) => document.querySelector(`.board .token[data-player="${pid}"]`)

function overlay(cls: string, html: string, anchor?: Element | null) {
  const el = document.createElement('div')
  el.className = cls
  el.innerHTML = html
  if (anchor) {
    const r = anchor.getBoundingClientRect()
    el.style.left = `${r.left + r.width / 2}px`
    el.style.top = `${r.top + r.height / 2}px`
  }
  document.body.appendChild(el)
  return el
}

export async function floatText(text: string, anchor: Element | null, kind: 'plus' | 'minus' | 'info') {
  if (!anchor || factor === 0) return
  const el = overlay(`float ${kind}`, text, anchor)
  await anim(el, [
    { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
    { transform: 'translate(-50%,-90%) scale(1.15)', opacity: 1, offset: 0.25 },
    { transform: 'translate(-50%,-260%) scale(1)', opacity: 0 },
  ], { duration: 1200, easing: 'ease-out' })
  el.remove()
}

export async function stamp(text: string, anchor: Element | null) {
  if (!anchor || factor === 0) return
  const el = overlay('stamp', text, anchor)
  await anim(el, [
    { transform: 'translate(-50%,-50%) scale(3) rotate(-25deg)', opacity: 0 },
    { transform: 'translate(-50%,-50%) scale(1) rotate(-8deg)', opacity: 1, offset: 0.3 },
    { transform: 'translate(-50%,-50%) scale(1) rotate(-8deg)', opacity: 1, offset: 0.8 },
    { transform: 'translate(-50%,-50%) scale(1.1) rotate(-8deg)', opacity: 0 },
  ], { duration: 1100, easing: 'ease-out' })
  el.remove()
}

export function shake(el: Element | null, power = 8) {
  return anim(el, [
    { transform: 'translate(0,0)' },
    { transform: `translate(${-power}px,${power / 2}px)` },
    { transform: `translate(${power}px,${-power / 2}px)` },
    { transform: `translate(${-power / 2}px,${power / 3}px)` },
    { transform: `translate(${power / 2}px,0)` },
    { transform: 'translate(0,0)' },
  ], { duration: 450 })
}

export function bounce(el: Element | null) {
  return anim(el, [
    { transform: 'scale(1)' },
    { transform: 'scale(1.05) rotate(-1deg)', offset: 0.4 },
    { transform: 'scale(.98)', offset: 0.7 },
    { transform: 'scale(1)' },
  ], { duration: 380, easing: 'ease-out' })
}

export async function banner(html: string) {
  if (factor === 0) return
  const el = overlay('banner', html)
  await anim(el, [
    { transform: 'translate(-50%,-50%) scale(4) rotate(-10deg)', opacity: 0 },
    { transform: 'translate(-50%,-50%) scale(1) rotate(-3deg)', opacity: 1, offset: 0.2 },
    { transform: 'translate(-50%,-50%) scale(1.04) rotate(-3deg)', opacity: 1, offset: 0.85 },
    { transform: 'translate(-50%,-150%) scale(.9) rotate(-3deg)', opacity: 0 },
  ], { duration: 2000, easing: 'ease-out' })
  el.remove()
}

export async function toast(icon: string, title: string, body: string) {
  if (factor === 0) return
  const el = overlay('toast', `<div class="toast-icon">${icon}</div><div><b>${title}</b><div>${body}</div></div>`)
  await anim(el, [
    { transform: 'translate(-50%,-120%)' },
    { transform: 'translate(-50%,16px)', offset: 0.15 },
    { transform: 'translate(-50%,16px)', offset: 0.85 },
    { transform: 'translate(-50%,-120%)' },
  ], { duration: 2600, easing: 'ease-in-out' })
  el.remove()
}

// Dua dadu dilempar dari pojok papan, berguling, lalu mendarat di tengah.
export async function throwDice() {
  const dice = [...document.querySelectorAll('.dice-stage .die-face')]
  await Promise.all(
    dice.map((d, k) =>
      anim(d, [
        { transform: `translate(${k ? 260 : -260}px, -240px) rotate(${k ? 540 : -540}deg) scale(.5)`, opacity: 0 },
        { transform: `translate(${k ? 40 : -40}px, 30px) rotate(${k ? -30 : 30}deg) scale(1.1)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${k ? -12 : 12}px, -16px) rotate(${k ? 10 : -10}deg) scale(1)`, offset: 0.8 },
        { transform: 'translate(0, 0) rotate(0) scale(1)' },
      ], { duration: 950 + k * 120, easing: 'cubic-bezier(.2,.7,.3,1)' }),
    ),
  )
}

export function fadeDice() {
  return anim(document.querySelector('.dice-stage'), [{ opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(.6)' }], {
    duration: 300,
    easing: 'ease-in',
  })
}

// FLIP: ukur posisi bidak, jalankan `update` (render ke petak baru), lalu animasikan lompatannya.
export async function hop(pid: number, update: () => void, arc = 22, duration = 240) {
  const board = document.querySelector('.board')
  const before = tokenEl(pid)?.getBoundingClientRect()
  update()
  const el = tokenEl(pid)
  if (!before || !el || factor === 0) return
  const after = el.getBoundingClientRect()
  const dx = before.left - after.left
  const dy = before.top - after.top
  board?.classList.add('hopping')
  await anim(el, [
    { transform: `translate(${dx}px,${dy}px)` },
    { transform: `translate(${dx / 2}px,${dy / 2 - arc}px) scale(1.35)`, offset: 0.5 },
    { transform: 'translate(0,0) scale(1)' },
  ], { duration, easing: 'ease-in-out' })
  board?.classList.remove('hopping')
}

export async function landPulse(sq: number) {
  const el = cellEl(sq) as HTMLElement | null
  if (!el) return
  el.style.zIndex = '4'
  await anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' })
  el.style.zIndex = ''
}

export function popBuilding(sq: number) {
  return anim(cellEl(sq)?.querySelector('.bld') ?? null, [
    { transform: 'translateY(80%) scale(.2)', opacity: 0 },
    { transform: 'translateY(-30%) scale(1.6)', opacity: 1, offset: 0.6 },
    { transform: 'none', opacity: 1 },
  ], { duration: 480, easing: 'cubic-bezier(.3,1.6,.5,1)' })
}

export function printSlip() {
  return anim(document.querySelector('.slip'), [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], {
    duration: 800,
    easing: 'steps(8)',
  })
}

export function confetti(count = 80) {
  if (factor === 0) return
  const colors = ['#ff3864', '#ffd23f', '#8ef0a0', '#3ec5ff', '#6c2bd9', '#ff9505']
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'confetti'
    el.style.left = `${Math.random() * 100}vw`
    el.style.background = colors[i % colors.length]
    document.body.appendChild(el)
    const drift = (Math.random() - 0.5) * 200
    el.animate(
      [
        { transform: 'translate(0,0) rotate(0)' },
        { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${Math.random() * 900}deg)` },
      ],
      { duration: 1800 + Math.random() * 1600, delay: Math.random() * 600, easing: 'cubic-bezier(.2,.6,.4,1)' },
    ).finished.then(() => el.remove(), () => el.remove())
  }
}
