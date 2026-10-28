// Karakter pemain: kelebihan & kekurangan satir (PRD §18). Angka disetel lewat simulasi.

export type CharacterId = 'rakyat' | 'sultan' | 'burt' | 'ojol' | 'buzzer' | 'crypto' | 'pns'

export interface Character {
  id: CharacterId
  name: string
  icon: string
  plus: string
  minus: string
  startMult: number
  umrMult: number
  takeHome: number
}

export const CHARACTERS: Character[] = [
  { id: 'rakyat', name: 'Rakyat Jelata', icon: '🧍', plus: 'Jago berhemat: sisa gaji minimal 60% (yang lain 50%).', minus: 'Tidak punya orang dalam.', startMult: 1, umrMult: 1, takeHome: 0.6 },
  { id: 'sultan', name: 'Anak Sultan', icon: '👑', plus: 'Modal awal 1,25×.', minus: 'Gaya hidup: sisa gaji cuma 30%.', startMult: 1.25, umrMult: 1, takeHome: 0.55 },
  { id: 'burt', name: 'Bu RT', icon: '🧕', plus: 'Kebal pungli, parkir liar & ormas (kenal orang kelurahan). Sisa gaji minimal 55%.', minus: 'Tidak ada. Bu RT selalu menang.', startMult: 1, umrMult: 1, takeHome: 0.55 },
  { id: 'ojol', name: 'Ojol Sejati', icon: '🏍️', plus: 'Tahu jalan tikus: tiap jalan +1 petak.', minus: 'Status "mitra": gaji UMR cuma 90%.', startMult: 1, umrMult: 0.9, takeHome: 0.5 },
  { id: 'buzzer', name: 'Buzzer 62', icon: '🤳', plus: 'Kebal Pasal Karet. Dibayar tiap ada Kartu Viral keluar.', minus: 'Gaji UMR cuma 70% (kerjanya cuma ngetwit).', startMult: 1, umrMult: 0.7, takeHome: 0.5 },
  { id: 'crypto', name: 'Mas Crypto', icon: '🪙', plus: 'Tiap tahun baru uang tunai bisa naik sampai 30% (to the moon!).', minus: '...atau turun 20% (rug pull).', startMult: 1, umrMult: 1, takeHome: 0.5 },
  { id: 'pns', name: 'PNS', icon: '🧑‍💼', plus: 'Gaji 1,3× dan kebal PHK.', minus: 'Iuran Tabungan Rumah 2× (dipotong langsung dari gaji).', startMult: 1, umrMult: 1.3, takeHome: 0.5 },
]

export const CHARACTER_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c])) as Record<CharacterId, Character>
