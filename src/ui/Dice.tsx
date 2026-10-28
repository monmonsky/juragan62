// Dadu dengan titik (pip). Titik angka 1 & 4 merah seperti dadu tradisional.

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

export function Die({ value, small = false }: { value: number; small?: boolean }) {
  const pips = PIPS[value] ?? []
  return (
    <div className={`die-face ${small ? 'small' : ''} ${value === 0 ? 'blank' : ''}`} aria-label={value ? `dadu ${value}` : 'dadu kosong'}>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={pips.includes(i) ? `pip ${value === 1 || value === 4 ? 'red' : ''}` : ''} />
      ))}
    </div>
  )
}

export interface DiceShow {
  values: [number, number]
  rolling: boolean
}

export function DiceStage({ show }: { show: DiceShow }) {
  const [a, b] = show.values
  return (
    <div className="dice-stage">
      <div className="dice-pair">
        <Die value={a} />
        {b ? <Die value={b} /> : null}
      </div>
      {!show.rolling && <div className="dice-total">{b ? `${a} + ${b} = ${a + b}` : `${a}`}</div>}
    </div>
  )
}
