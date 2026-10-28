// Papan 48 petak, 13×13 (PRD §8, §24). Semua nominal dalam ribu rupiah, nilai dasar sebelum Indeks Harga.

export type GroupId = 'ntt' | 'maluku' | 'sulawesi' | 'kalimantan' | 'sumatra' | 'jawa' | 'elit' | 'pusat'

export type SquareType = 'start' | 'jail' | 'parking' | 'gotojail' | 'prop' | 'transport' | 'utility' | 'card' | 'tax' | 'choice' | 'flood'

// Petak pilihan (mini-game & petak aksi, PRD §24).
export type ChoiceKind = 'judol' | 'cabai' | 'investasi' | 'zebra' | 'jalan' | 'samsat' | 'baliho'

export interface Square {
  id: string
  name: string
  type: SquareType
  icon?: string
  sub?: string
  group?: GroupId
  price?: number
  deck?: 'viral' | 'bansos'
  tax?: 'pungli' | 'ppn' | 'iuran'
  choice?: ChoiceKind
}

export const GROUPS: Record<GroupId, { name: string; color: string; buildCost: number }> = {
  ntt: { name: 'Nusa Tenggara', color: '#9c5b2e', buildCost: 500 },
  maluku: { name: 'Maluku–Papua', color: '#3ec5ff', buildCost: 600 },
  sulawesi: { name: 'Sulawesi', color: '#ff6fb5', buildCost: 1000 },
  kalimantan: { name: 'Kalimantan', color: '#ff9505', buildCost: 1200 },
  sumatra: { name: 'Sumatra', color: '#f0222f', buildCost: 1500 },
  jawa: { name: 'Jawa', color: '#ffd60a', buildCost: 1800 },
  elit: { name: 'Kawasan Elit', color: '#13c27a', buildCost: 2000 },
  pusat: { name: 'Pusat Kekuasaan', color: '#6c2bd9', buildCost: 2500 },
}

export const BOARD: Square[] = [
  { id: 'start', name: 'START', sub: 'Gajian', type: 'start', icon: '💰' },
  { id: 'kupang', name: 'Kupang', type: 'prop', group: 'ntt', price: 500 },
  { id: 'labuanbajo', name: 'Labuan Bajo', type: 'prop', group: 'ntt', price: 900 },
  { id: 'bansos', name: 'Kartu Bansos', type: 'card', deck: 'bansos', icon: '🍚' },
  { id: 'jalan', name: 'Jalan Rusak', type: 'choice', choice: 'jalan', icon: '🕳️' },
  { id: 'ambon', name: 'Ambon', type: 'prop', group: 'maluku', price: 1100 },
  { id: 'pelabuhan', name: 'Pelabuhan', type: 'transport', icon: '⚓', price: 2000 },
  { id: 'ternate', name: 'Ternate', type: 'prop', group: 'maluku', price: 1100 },
  { id: 'pungli', name: 'Pungli Kelurahan', type: 'tax', tax: 'pungli', icon: '🧾' },
  { id: 'jayapura', name: 'Jayapura', type: 'prop', group: 'maluku', price: 1300 },
  { id: 'cabai', name: 'Tebak Harga Cabai', type: 'choice', choice: 'cabai', icon: '🌶️' },
  { id: 'viral', name: 'Kartu Viral', type: 'card', deck: 'viral', icon: '📱' },
  { id: 'mangkrak', name: 'Kasus Mangkrak', sub: 'ada sel mewah', type: 'jail', icon: '🗂️' },
  { id: 'palu', name: 'Palu', type: 'prop', group: 'sulawesi', price: 1500 },
  { id: 'pln', name: 'PLN', type: 'utility', icon: '⚡', price: 1500 },
  { id: 'kendari', name: 'Kendari', type: 'prop', group: 'sulawesi', price: 1500 },
  { id: 'makassar', name: 'Makassar', type: 'prop', group: 'sulawesi', price: 1800 },
  { id: 'zebra', name: 'Operasi Zebra', type: 'choice', choice: 'zebra', icon: '🚓' },
  { id: 'krl', name: 'Stasiun KRL', type: 'transport', icon: '🚆', price: 2000 },
  { id: 'viral', name: 'Kartu Viral', type: 'card', deck: 'viral', icon: '📱' },
  { id: 'pontianak', name: 'Pontianak', type: 'prop', group: 'kalimantan', price: 1900 },
  { id: 'judol', name: 'Slot Judol', type: 'choice', choice: 'judol', icon: '🎰' },
  { id: 'banjarmasin', name: 'Banjarmasin', type: 'prop', group: 'kalimantan', price: 2000 },
  { id: 'balikpapan', name: 'Balikpapan', type: 'prop', group: 'kalimantan', price: 2300 },
  { id: 'parkir', name: 'Parkir Liar', sub: 'prit! bayar', type: 'parking', icon: '🅿️' },
  { id: 'padang', name: 'Padang', type: 'prop', group: 'sumatra', price: 2400 },
  { id: 'bansos', name: 'Kartu Bansos', type: 'card', deck: 'bansos', icon: '🍚' },
  { id: 'palembang', name: 'Palembang', type: 'prop', group: 'sumatra', price: 2500 },
  { id: 'medan', name: 'Medan', type: 'prop', group: 'sumatra', price: 2700 },
  { id: 'investasi', name: 'Investasi Bodong', type: 'choice', choice: 'investasi', icon: '📈' },
  { id: 'keretacepat', name: 'Kereta Cepat', type: 'transport', icon: '🚄', price: 2000 },
  { id: 'ppn', name: 'PPN 12%', type: 'tax', tax: 'ppn', icon: '💸' },
  { id: 'semarang', name: 'Semarang', type: 'prop', group: 'jawa', price: 2800 },
  { id: 'samsat', name: 'Antre Samsat', type: 'choice', choice: 'samsat', icon: '🏛️' },
  { id: 'yogyakarta', name: 'Yogyakarta', type: 'prop', group: 'jawa', price: 3000 },
  { id: 'pdam', name: 'PDAM', type: 'utility', icon: '🚰', price: 1500 },
  { id: 'pasalkaret', name: 'Kena Pasal Karet', sub: 'masuk mangkrak', type: 'gotojail', icon: '⚖️' },
  { id: 'surabaya', name: 'Surabaya', type: 'prop', group: 'jawa', price: 3100 },
  { id: 'solo', name: 'Solo', sub: 'kota dinasti', type: 'prop', group: 'jawa', price: 3200 },
  { id: 'banjir', name: 'Banjir', type: 'flood', icon: '🌊' },
  { id: 'bandung', name: 'Bandung', type: 'prop', group: 'elit', price: 3300 },
  { id: 'canggu', name: 'Canggu', type: 'prop', group: 'elit', price: 3500 },
  { id: 'bandara', name: 'Bandara', type: 'transport', icon: '✈️', price: 2000 },
  { id: 'bsd', name: 'BSD', type: 'prop', group: 'elit', price: 3600 },
  { id: 'baliho', name: 'Baliho Kampanye', type: 'choice', choice: 'baliho', icon: '🪧' },
  { id: 'scbd', name: 'Jakarta SCBD', type: 'prop', group: 'pusat', price: 4200 },
  { id: 'iuran', name: 'Iuran Tabungan Rumah', sub: 'padahal belum punya rumah', type: 'tax', tax: 'iuran', icon: '🏠' },
  { id: 'ikn', name: 'IKN Nusantara', type: 'prop', group: 'pusat', price: 5000 },
]

export const SIZE = BOARD.length
export const SIDE = SIZE / 4
const at = (id: string) => BOARD.findIndex((sq) => sq.id === id)

export const JAIL_SQ = at('mangkrak')
export const IKN_SQ = at('ikn')
export const SCBD_SQ = at('scbd')
export const KERETA_CEPAT_SQ = at('keretacepat')
export const PLN_SQ = at('pln')
export const BANDARA_SQ = at('bandara')
export const SOLO_SQ = at('solo')

export const isBuyable = (sq: Square) => sq.price !== undefined

export const groupMembers = (group: GroupId) =>
  BOARD.map((sq, i) => (sq.group === group ? i : -1)).filter((i) => i >= 0)

export const LEVEL_NAMES = ['Tanah', 'Warung', 'Kos-kosan', 'Ruko', 'Mall']
export const LEVEL_ICONS = ['🚩', '🛖', '🏠', '🏬', '🏢']
