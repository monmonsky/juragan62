// Format rupiah dari nilai ribuan: 1500 → "Rp 1,5 jt", 274 → "Rp 274 rb".
export function rp(value: number, signed = false): string {
  const sign = value < 0 ? '−' : signed && value > 0 ? '+' : ''
  const v = Math.abs(Math.round(value))
  if (v >= 1_000_000) return `${sign}Rp ${(v / 1_000_000).toFixed(2).replace('.', ',').replace(/,?0+$/, '')} M`
  if (v >= 1000) return `${sign}Rp ${(v / 1000).toFixed(1).replace('.', ',').replace(',0', '')} jt`
  return `${sign}Rp ${v} rb`
}

export const fmtIndex = (ih: number) => ih.toFixed(2).replace('.', ',')
