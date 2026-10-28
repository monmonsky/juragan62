// Gambar Rapor ke canvas lalu bagikan (Web Share) atau unduh sebagai PNG.

import { CHARACTER_BY_ID } from '../data/characters.ts'
import { fmtIndex, rp } from '../engine/format.ts'
import { rapor } from '../engine/rapor.ts'
import type { GameState } from '../engine/types.ts'

const W = 1080
const INK = '#111'
const HOT = '#ff3864'

function box(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, shadow = 10) {
  g.fillStyle = INK
  g.fillRect(x + shadow, y + shadow, w, h)
  g.fillStyle = fill
  g.fillRect(x, y, w, h)
  g.lineWidth = 6
  g.strokeStyle = INK
  g.strokeRect(x, y, w, h)
}

export async function raporImage(s: GameState): Promise<Blob> {
  await document.fonts.ready
  const rows = rapor(s)
  const H = 520 + rows.length * 150
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const g = canvas.getContext('2d')!

  g.fillStyle = '#ffd23f'
  g.fillRect(0, 0, W, H)
  g.fillStyle = 'rgba(0,0,0,.12)'
  for (let y = 10; y < H; y += 28) for (let x = 10; x < W; x += 28) g.fillRect(x, y, 3, 3)

  g.textBaseline = 'middle'
  g.fillStyle = INK
  g.font = '80px Bungee, sans-serif'
  g.fillText('JURAGAN', 70, 110)
  const tw = g.measureText('JURAGAN ').width
  g.save()
  g.translate(70 + tw + 120, 110)
  g.rotate(-0.08)
  box(g, -110, -55, 230, 110, HOT, 8)
  g.fillStyle = '#fff'
  g.textAlign = 'center'
  g.fillText('+62', 5, 4)
  g.restore()

  g.textAlign = 'left'
  g.fillStyle = INK
  g.font = '800 34px Rubik, sans-serif'
  g.fillText('RAPOR HIDUP DI KONOHA', 70, 210)
  g.font = '600 26px Rubik, sans-serif'
  g.fillText(`Harga naik ${Math.round((s.ih - 1) * 100)}% (Indeks ${fmtIndex(s.ih)}) · Gaji cuma naik ${Math.round((s.umrIndex - 1) * 100)}%`, 70, 255)

  rows.forEach((r, i) => {
    const y = 300 + i * 150
    box(g, 60, y, W - 130, 120, r.rank === 1 ? '#fff6c7' : '#fff')
    g.fillStyle = INK
    g.font = '64px Bungee, sans-serif'
    g.fillText(String(r.rank), 90, y + 62)
    g.font = '800 36px Rubik, sans-serif'
    const ch = CHARACTER_BY_ID[r.player.character]
    g.fillText(`${r.player.token} ${r.player.name}`, 170, y + 40)
    g.font = '600 22px Rubik, sans-serif'
    g.fillText(`${ch.icon} ${ch.name}${r.player.bankrupt ? ` · 🪦 bangkrut ronde ${r.player.bankruptRound}` : ''}`, 172, y + 76)
    g.fillStyle = HOT
    g.font = '800 22px Rubik, sans-serif'
    g.fillText(r.titles.join('  '), 172, y + 104)
    g.textAlign = 'right'
    g.fillStyle = r.worth < 0 ? HOT : INK
    g.font = '800 34px Rubik, sans-serif'
    g.fillText(r.player.bankrupt ? '—' : rp(r.worth), W - 100, y + 52)
    g.textAlign = 'left'
  })

  g.fillStyle = INK
  g.font = 'italic 600 24px Rubik, sans-serif'
  g.fillText('Karya satir. Pamerkan penderitaanmu: main di Juragan +62', 70, H - 60)

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('gagal membuat gambar'))), 'image/png'))
}

export async function shareRapor(s: GameState): Promise<'shared' | 'downloaded'> {
  const blob = await raporImage(s)
  const file = new File([blob], 'rapor-juragan62.png', { type: 'image/png' })
  const text = 'Rapor hidupku di Negeri Konoha 😮‍💨 #Juragan62'
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text, title: 'Juragan +62' })
      return 'shared'
    } catch {
      // dibatalkan: lanjut unduh
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'rapor-juragan62.png'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'downloaded'
}
