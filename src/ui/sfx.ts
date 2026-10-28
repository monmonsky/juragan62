// Efek suara sintetis (Web Audio API), tanpa file audio.

export type Sound = 'dice' | 'step' | 'coin' | 'pay' | 'stamp' | 'card' | 'notif' | 'sad' | 'fanfare' | 'alarm'

let ctx: AudioContext | null = null
let enabled = true

export function setSound(on: boolean) {
  enabled = on
}

function audio() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'square', vol = 0.08, endFreq?: number) {
  const a = audio()
  const t = a.currentTime + start
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t + dur)
  gain.gain.setValueAtTime(vol, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(a.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

function noise(start: number, dur: number, vol = 0.12) {
  const a = audio()
  const buf = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
  const src = a.createBufferSource()
  const gain = a.createGain()
  src.buffer = buf
  gain.gain.value = vol
  src.connect(gain).connect(a.destination)
  src.start(a.currentTime + start)
}

export function play(sound: Sound) {
  if (!enabled || typeof AudioContext === 'undefined') return
  try {
    switch (sound) {
      case 'dice':
        for (let i = 0; i < 6; i++) noise(i * 0.07, 0.04, 0.1)
        break
      case 'step':
        tone(520, 0, 0.05, 'triangle', 0.05)
        break
      case 'coin':
        tone(988, 0, 0.08, 'square', 0.06)
        tone(1319, 0.08, 0.25, 'square', 0.06)
        break
      case 'pay':
        tone(330, 0, 0.12, 'sawtooth', 0.05, 220)
        break
      case 'stamp':
        noise(0, 0.08, 0.25)
        tone(90, 0, 0.15, 'sine', 0.2, 50)
        break
      case 'card':
        noise(0, 0.12, 0.05)
        tone(660, 0.05, 0.1, 'triangle', 0.05, 880)
        break
      case 'notif':
        ;[880, 1175, 1568].forEach((f, i) => tone(f, i * 0.09, 0.12, 'sine', 0.08))
        break
      case 'sad':
        ;[392, 370, 349, 262].forEach((f, i) => tone(f, i * 0.35, i === 3 ? 0.9 : 0.32, 'sawtooth', 0.06, i === 3 ? 196 : undefined))
        break
      case 'fanfare':
        ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, i === 3 ? 0.5 : 0.14, 'square', 0.06))
        break
      case 'alarm':
        ;[0, 0.2, 0.4].forEach((t) => tone(740, t, 0.12, 'square', 0.07, 520))
        break
    }
  } catch {
    // audio diblokir browser: abaikan
  }
}

// ---------- musik latar: loop koplo 8-bit sederhana ----------

let musicTimer: ReturnType<typeof setInterval> | null = null
let musicStep = 0
const BPM = 112
const STEP = 60 / BPM / 2 // per 1/8 ketuk
// Tangga nada pelog-ish (Hz). 0 = diam.
const MELODY = [392, 0, 440, 466, 0, 440, 392, 0, 349, 0, 392, 440, 0, 392, 349, 311, 294, 0, 311, 349, 0, 392, 349, 0, 311, 0, 294, 262, 0, 294, 311, 0]
const BASS = [98, 0, 98, 0, 117, 0, 117, 0, 87, 0, 87, 0, 98, 0, 98, 0]

export function setMusic(on: boolean) {
  if (!on || typeof AudioContext === 'undefined') {
    if (musicTimer) clearInterval(musicTimer)
    musicTimer = null
    return
  }
  if (musicTimer) return
  try {
    audio()
  } catch {
    return
  }
  musicTimer = setInterval(() => {
    const i = musicStep++
    const m = MELODY[i % MELODY.length]
    if (m) tone(m, 0, STEP * 0.9, 'square', 0.025)
    const b = BASS[i % BASS.length]
    if (b) tone(b, 0, STEP * 1.6, 'triangle', 0.06)
    // kendang: "dut" di ketuk 1 & 3, "tak" di sela
    if (i % 4 === 0) tone(110, 0, 0.12, 'sine', 0.12, 55)
    if (i % 4 === 2) noise(0, 0.04, 0.05)
    if (i % 8 === 7) tone(180, 0, 0.08, 'sine', 0.08, 120)
  }, STEP * 1000)
}
