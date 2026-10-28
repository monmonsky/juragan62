// Ikon SVG custom gaya "Meme Cerah": garis tinta tebal + warna datar (PRD §12.4).
// Satu ikon per petak (landmark/ciri khas kota) + ikon tingkat bangunan berwarna pemilik.

import type { ReactNode } from 'react'
import { BOARD } from '../data/board.ts'

const INK = '#111'
const Y = '#ffd23f'
const HOT = '#ff3864'
const SKY = '#8fd9ff'
const SEA = '#3ec5ff'
const GREEN = '#13c27a'
const LEAF = '#8ef0a0'
const ORANGE = '#ff9505'
const BROWN = '#b4733f'
const CREAM = '#fff6c7'
const GREY = '#d9d9d9'
const PURPLE = '#6c2bd9'
const LILAC = '#b79cf2'
const W = '#fff'

const waves = (y: number) => <path d={`M3 ${y} q5 -3 10 0 t10 0 t10 0 t10 0`} stroke={SEA} />
const label = (x: number, y: number, size: number, text: string, fill = INK) => (
  <text x={x} y={y} fontSize={size} fontWeight={900} fontFamily="Rubik, sans-serif" textAnchor="middle" fill={fill} stroke="none">
    {text}
  </text>
)
const coin = (cx: number, cy: number, r = 8) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill={Y} />
    {label(cx, cy + r * 0.36, r * 0.95, 'Rp')}
  </>
)

const ICONS: Record<string, ReactNode> = {
  // START: panah jalan + koin gaji
  start: (
    <>
      <path d="M5 30 L19 17 V24 H42 V36 H19 V43 Z" fill={HOT} />
      {coin(32, 11, 8)}
    </>
  ),
  // Kupang: sasando
  kupang: (
    <>
      <path d="M7 31 A17 17 0 0 1 41 31 Z" fill={Y} />
      <path d="M24 31 L11 22 M24 31 L15 16 M24 31 V14 M24 31 L33 16 M24 31 L37 22" strokeWidth={1.6} />
      <rect x="19" y="27" width="10" height="17" rx="4" fill={BROWN} />
      <path d="M22 31 V40 M26 31 V40" strokeWidth={1.4} />
    </>
  ),
  // Labuan Bajo: bukit Pulau Padar + perahu
  labuanbajo: (
    <>
      <path d="M3 36 Q10 14 18 30 Q25 10 34 28 Q39 20 45 36 Z" fill={LEAF} />
      <path d="M28 38 H42 L39 42 H31 Z" fill={BROWN} />
      <path d="M35 38 V29 L41 37 Z" fill={W} />
      {waves(45)}
    </>
  ),
  // Kartu Bansos: karung beras
  bansos: (
    <>
      <path d="M12 14 Q7 30 10 43 H38 Q41 30 36 14 Z" fill={W} />
      <path d="M12 14 Q24 10 36 14 M18 12 L24 5 L30 12" />
      <rect x="12" y="24" width="24" height="9" fill={HOT} />
      {label(24, 30.6, 6, 'BANSOS', W)}
    </>
  ),
  // Ambon: Gong Perdamaian
  ambon: (
    <>
      <path d="M10 44 L13 9 M38 44 L35 9 M8 9 H40 M19 9 V14 M29 9 V14" />
      <circle cx="24" cy="27" r="12" fill={Y} />
      <circle cx="24" cy="27" r="7" />
      <circle cx="24" cy="27" r="3.5" fill={ORANGE} />
    </>
  ),
  // Pelabuhan: kapal
  pelabuhan: (
    <>
      <rect x="27" y="12" width="6" height="10" fill={Y} />
      <rect x="11" y="21" width="25" height="9" fill={W} />
      <path d="M15 25.5 h2 M20 25.5 h2 M25 25.5 h2" />
      <path d="M4 30 H44 L38 40 H10 Z" fill={HOT} />
      {waves(45)}
    </>
  ),
  // Ternate: Gunung Gamalama
  ternate: (
    <>
      <circle cx="21" cy="9" r="4" fill={W} />
      <circle cx="28" cy="7" r="3.5" fill={W} />
      <path d="M3 43 L17 17 H31 L45 43 Z" fill={GREEN} />
      <path d="M17 17 Q24 21 31 17" />
      <path d="M21 19 L19 29 M27 19 L29 26" stroke={HOT} strokeWidth={3} />
    </>
  ),
  // Pungli Kelurahan: amplop
  pungli: (
    <>
      <rect x="4" y="12" width="30" height="21" fill={W} />
      <path d="M4 12 L19 25 L34 12" />
      {coin(35, 33, 9)}
    </>
  ),
  // Jayapura: Jembatan Youtefa
  jayapura: (
    <>
      <path d="M11.3 27 V34 M15.5 22 V34 M24 18 V34 M32.5 22 V34 M36.7 27 V34" strokeWidth={1.6} />
      <path d="M7 34 Q24 2 41 34" stroke={INK} strokeWidth={7} />
      <path d="M7 34 Q24 2 41 34" stroke={HOT} strokeWidth={3.5} />
      <path d="M3 34 H45" strokeWidth={3.5} />
      {waves(42)}
    </>
  ),
  // Kartu Viral: HP terbakar
  viral: (
    <>
      <rect x="12" y="5" width="24" height="38" rx="5" fill={W} />
      <path d="M21 9 H27" />
      <path d="M24 37 Q14 33 19 21 Q21 27 24 26 Q21 18 27 12 Q27 20 31 22 Q34 33 24 37 Z" fill={ORANGE} />
    </>
  ),
  // Kasus Mangkrak: map berdebu + sarang laba-laba
  mangkrak: (
    <>
      <path d="M5 13 H18 L22 17 H43 V41 H5 Z" fill={Y} />
      <path d="M5 21 H43" />
      <path d="M43 21 L32 21 M43 21 L43 33 M43 21 L34 30 M38 21 Q38.5 26 43 27 M34.5 21 Q35 29.5 43 30.5" strokeWidth={1.3} />
      <path d="M10 27 h14 M10 32 h10 M10 37 h12" strokeWidth={1.8} />
    </>
  ),
  // Palu: kaledo (sup tulang)
  palu: (
    <>
      <path d="M15 17 q-2 -3 0 -6 M21 16 q-2 -3 0 -6" strokeWidth={1.8} />
      <path d="M20 23 L35 9" stroke={INK} strokeWidth={7} />
      <path d="M20 23 L35 9" stroke={W} strokeWidth={3.5} />
      <circle cx="36" cy="8" r="3" fill={W} />
      <path d="M5 24 H43 Q41 41 24 42 Q7 41 5 24 Z" fill={ORANGE} />
    </>
  ),
  // PLN: petir
  pln: (
    <>
      <circle cx="24" cy="24" r="19" fill={Y} />
      <path d="M27 7 L13 27 H23 L20 41 L35 19 H25 Z" fill={W} />
    </>
  ),
  // Kendari: masjid di atas laut
  kendari: (
    <>
      <rect x="12" y="24" width="22" height="13" fill={W} />
      <path d="M13 24 Q23 6 33 24 Z" fill={GREEN} />
      <path d="M23 11 V6" />
      <rect x="37" y="12" width="5" height="25" fill={W} />
      <path d="M36.5 12 L39.5 6 L42.5 12 Z" fill={GREEN} />
      <path d="M20 37 V31 Q23 28 26 31 V37" />
      {waves(42)}
    </>
  ),
  // Makassar: kapal Pinisi
  makassar: (
    <>
      <path d="M17 34 V7 M30 34 V9" />
      <path d="M17 9 L6 30 H17 Z" fill={W} />
      <path d="M30 11 L20 31 H30 Z" fill={W} />
      <path d="M30 11 L41 30 H30 Z" fill={CREAM} />
      <path d="M4 34 H44 L38 42 H10 Z" fill={BROWN} />
    </>
  ),
  // Stasiun KRL: kereta komuter tampak depan
  krl: (
    <>
      <rect x="10" y="5" width="28" height="33" rx="7" fill={W} />
      <rect x="14" y="10" width="20" height="10" rx="2" fill={SKY} />
      <rect x="10" y="24" width="28" height="4" fill={HOT} />
      <circle cx="16" cy="33" r="2" fill={Y} />
      <circle cx="32" cy="33" r="2" fill={Y} />
      <path d="M15 38 L11 44 M33 38 L37 44 M6 44 H42" />
    </>
  ),
  // Pontianak: Tugu Khatulistiwa
  pontianak: (
    <>
      <path d="M24 10 V3 M21 6 L24 3 L27 6" />
      <path d="M18 38 V24 M30 38 V24" strokeWidth={3} />
      <circle cx="24" cy="18" r="9" fill={SKY} />
      <path d="M15 18 H33 M24 9 Q30 18 24 27 Q18 18 24 9" strokeWidth={1.6} />
      <rect x="11" y="38" width="26" height="6" fill={Y} />
    </>
  ),
  // Banjarmasin: pasar terapung
  banjarmasin: (
    <>
      <path d="M7 22 L16 13 L25 22 Z" fill={Y} />
      <rect x="11" y="22" width="10" height="7" fill={SKY} />
      <circle cx="31" cy="26" r="4" fill={ORANGE} />
      <circle cx="37" cy="27" r="3.5" fill={HOT} />
      <circle cx="34" cy="21" r="3" fill={LEAF} />
      <path d="M4 29 Q24 42 44 29 Z" fill={BROWN} />
      {waves(44)}
    </>
  ),
  // Balikpapan: kilang minyak
  balikpapan: (
    <>
      <path d="M39 12 Q35 6 39 2 Q43 6 39 12 Z" fill={ORANGE} />
      <rect x="36" y="12" width="6" height="30" fill={GREY} />
      <path d="M36 19 H42 M36 26 H42" stroke={HOT} strokeWidth={2} />
      <rect x="5" y="25" width="14" height="17" rx="2" fill={W} />
      <path d="M5 30 H19" />
      <rect x="21" y="30" width="12" height="12" rx="2" fill={W} />
      <path d="M3 42 H45" />
    </>
  ),
  // Parkir Liar: rambu P + peluit
  parkir: (
    <>
      <path d="M16 28 V45" strokeWidth={3} />
      <rect x="5" y="5" width="22" height="23" rx="4" fill="#1d6fd8" />
      {label(16, 23.5, 18, 'P', W)}
      <path d="M27 31 H40 A6 6 0 1 1 34 39 H27 Z" fill={Y} />
      <circle cx="39" cy="35.5" r="2" fill={INK} />
    </>
  ),
  // Padang: Rumah Gadang
  padang: (
    <>
      <path d="M2 21 Q9 22 11 8 Q15 19 24 19 Q33 19 37 8 Q39 22 46 21 L41 26 H7 Z" fill={BROWN} />
      <rect x="9" y="26" width="30" height="12" fill={HOT} />
      <path d="M15 29 V35 M21 29 V35 M27 29 V35 M33 29 V35" />
      <path d="M12 38 V44 M24 38 V44 M36 38 V44" />
    </>
  ),
  // Palembang: Jembatan Ampera
  palembang: (
    <>
      <path d="M14 14 L4 30 M14 14 L22 30 M34 14 L26 30 M34 14 L44 30" strokeWidth={1.4} />
      <rect x="11" y="7" width="6" height="31" fill={HOT} />
      <rect x="31" y="7" width="6" height="31" fill={HOT} />
      <rect x="11" y="10" width="26" height="4" fill={HOT} />
      <path d="M3 30 H45" strokeWidth={3.5} />
      {waves(43)}
    </>
  ),
  // Medan: durian
  medan: (
    <>
      <path d="M24 12 V6 Q27 4 30 6" />
      <ellipse cx="24" cy="28" rx="15" ry="15" fill={LEAF} />
      <path d="M15 21 l2.5 -3.5 l2.5 3.5 M25 18 l2.5 -3.5 l2.5 3.5 M20 28 l2.5 -3.5 l2.5 3.5 M30 27 l2.5 -3.5 l2.5 3.5 M13 33 l2.5 -3.5 l2.5 3.5 M24 37 l2.5 -3.5 l2.5 3.5" strokeWidth={1.8} />
    </>
  ),
  // Kereta Cepat: kereta peluru
  keretacepat: (
    <>
      <path d="M3 34 H38 Q46 34 45 28 Q40 18 22 18 H3 Z" fill={W} />
      <path d="M30 20 Q38 21 41 26 H30 Z" fill={SKY} />
      <path d="M3 29 H44" stroke={HOT} strokeWidth={3} />
      <path d="M8 23 h4 M15 23 h4 M22 23 h4" />
      <circle cx="12" cy="37" r="2.5" fill={GREY} />
      <circle cx="32" cy="37" r="2.5" fill={GREY} />
      <path d="M3 41 H45" />
    </>
  ),
  // PPN 12%: struk
  ppn: (
    <>
      <path d="M11 5 H37 V43 L34 40 L30.5 43 L27 40 L24 43 L20.5 40 L17 43 L14 40 L11 43 Z" fill={W} />
      <path d="M16 12 H32 M16 17 H27" />
      {label(24, 33, 11, '12%', HOT)}
    </>
  ),
  // Semarang: Lawang Sewu
  semarang: (
    <>
      <rect x="10" y="20" width="28" height="22" fill={CREAM} />
      <rect x="3" y="13" width="9" height="29" fill={CREAM} />
      <rect x="36" y="13" width="9" height="29" fill={CREAM} />
      <path d="M3 13 L7.5 6 L12 13 Z M36 13 L40.5 6 L45 13 Z" fill={HOT} />
      <path d="M15 25 h4 M22 25 h4 M29 25 h4" />
      <path d="M15 42 V35 Q17 32 19 35 V42 M22 42 V35 Q24 32 26 35 V42 M29 42 V35 Q31 32 33 35 V42" />
    </>
  ),
  // Yogyakarta: Tugu Jogja
  yogyakarta: (
    <>
      <path d="M21 14 Q24 1 27 14 Z" fill={Y} />
      <path d="M19 38 L21 14 H27 L29 38 Z" fill={W} />
      <path d="M20 26 H28" />
      <path d="M13 44 H35 L32 38 H16 Z" fill={CREAM} />
    </>
  ),
  // PDAM: keran + tetes air
  pdam: (
    <>
      <path d="M16 13 V7 M10 7 H22" />
      <path d="M5 13 H26 Q34 13 34 21 V26 H28 V21 Q28 19 26 19 H5 Z" fill={GREY} />
      <path d="M31 30 C27 36 27 42 31 42 C35 42 35 36 31 30 Z" fill={SEA} />
    </>
  ),
  // Kena Pasal Karet: palu hakim + karet
  pasalkaret: (
    <>
      <path d="M21 21 L39 39" strokeWidth={5} />
      <rect x="7" y="9" width="22" height="11" rx="2" fill={BROWN} transform="rotate(-45 18 14.5)" />
      <ellipse cx="31" cy="31" rx="5.5" ry="3" transform="rotate(45 31 31)" stroke={HOT} strokeWidth={3} />
      <rect x="4" y="39" width="22" height="6" fill={BROWN} />
    </>
  ),
  // Surabaya: Jembatan Suramadu
  surabaya: (
    <>
      <path d="M16 10 L4 31 M16 10 L9 31 M16 10 L22 31 M16 10 L27 31 M32 10 L21 31 M32 10 L26 31 M32 10 L39 31 M32 10 L44 31" strokeWidth={1.2} />
      <path d="M16 40 V7 M32 40 V7" strokeWidth={4} />
      <path d="M3 31 H45" strokeWidth={3.5} />
      {waves(43)}
    </>
  ),
  // Bandung: Gedung Sate
  bandung: (
    <>
      <path d="M24 12 V2" />
      <circle cx="24" cy="4" r="1.8" fill={BROWN} />
      <circle cx="24" cy="8" r="1.8" fill={BROWN} />
      <path d="M15 19 L24 12 L33 19 Z" fill={HOT} />
      <rect x="18" y="19" width="12" height="9" fill={W} />
      <rect x="4" y="28" width="40" height="14" fill={W} />
      <path d="M9 32 V38 M14 32 V38 M34 32 V38 M39 32 V38 M21 42 V35 H27 V42" />
    </>
  ),
  // Canggu: papan selancar + ombak
  canggu: (
    <>
      <circle cx="12" cy="11" r="6" fill={ORANGE} />
      <path d="M3 43 Q6 22 22 22 Q33 22 31 32 Q27 27 23 31 Q19 41 3 43 Z" fill={SEA} />
      <path d="M35 45 Q47 26 40 6 Q30 26 35 45 Z" fill={Y} />
      <path d="M37.5 41 L40 11" stroke={HOT} />
    </>
  ),
  // Bandara: pesawat
  bandara: (
    <path
      d="M24 3 Q27.5 3 27.5 10 V18 L45 28 V32 L27.5 27 V37 L33 41 V44 L24 41.5 L15 44 V41 L20.5 37 V27 L3 32 V28 L20.5 18 V10 Q20.5 3 24 3 Z"
      fill={W}
    />
  ),
  // BSD: gedung kaca + taman
  bsd: (
    <>
      <rect x="7" y="14" width="12" height="28" fill={SKY} />
      <rect x="21" y="5" width="12" height="37" fill={SKY} />
      <path d="M7 22 H19 M7 30 H19 M21 13 H33 M21 21 H33 M21 29 H33" strokeWidth={1.5} />
      <circle cx="40" cy="32" r="5" fill={GREEN} />
      <path d="M40 37 V42 M4 42 H45" />
    </>
  ),
  // Jakarta SCBD: pencakar langit
  scbd: (
    <>
      <path d="M23 6 V1" />
      <rect x="4" y="19" width="11" height="23" fill={LILAC} />
      <rect x="17" y="6" width="12" height="36" fill={PURPLE} />
      <rect x="31" y="13" width="12" height="29" fill={LILAC} />
      <path d="M20.5 11 V38 M25.5 11 V38" stroke={W} strokeWidth={1.4} />
      <path d="M7 24 h5 M7 30 h5 M34 18 h6 M34 24 h6 M34 30 h6" strokeWidth={1.5} />
      <path d="M2 42 H46" />
    </>
  ),
  // Iuran Tabungan Rumah: rumah yang belum ada
  iuran: (
    <>
      <path d="M10 19 L24 8 L38 19 V42 H10 Z" fill={CREAM} strokeDasharray="4 3" />
      <path d="M5 22 L24 7 L43 22" />
      {label(24, 37, 18, '?', HOT)}
    </>
  ),
  // IKN Nusantara: Istana Garuda
  ikn: (
    <>
      {[
        [2.8, 32.3],
        [7.1, 23.9],
        [14.7, 18.1],
        [24, 16],
        [33.3, 18.1],
        [40.9, 23.9],
        [45.2, 32.3],
      ].map(([x, y]) => (
        <g key={x}>
          <path d={`M24 38 L${x} ${y}`} stroke={INK} strokeWidth={6} />
          <path d={`M24 38 L${x} ${y}`} stroke={Y} strokeWidth={3} />
        </g>
      ))}
      <rect x="6" y="38" width="36" height="6" fill={CREAM} />
    </>
  ),
}
// Solo: gapura keraton bermahkota (kota dinasti)
ICONS.solo = (
  <>
    <path d="M18 9 L20 4 L24 7 L28 4 L30 9 Z" fill={Y} />
    <path d="M12 16 Q24 6 36 16 V20 H12 Z" fill={BROWN} />
    <rect x="9" y="20" width="30" height="20" fill={CREAM} />
    <path d="M19 40 V30 Q24 24 29 30 V40" fill={BROWN} />
    <path d="M12 24 h4 M32 24 h4 M12 30 h4 M32 30 h4" />
    <path d="M5 44 H43 M7 40 H41" />
  </>
)

// Petak pilihan & Banjir (PRD §24)
ICONS.jalan = (
  <>
    <path d="M2 34 L14 18 H34 L46 34 Z" fill={GREY} />
    <ellipse cx="22" cy="28" rx="8" ry="3.5" fill={INK} />
    <path d="M32 40 L36 24 L40 40 Z" fill={ORANGE} />
    <path d="M33.5 34 H38.5" stroke={W} strokeWidth={2.5} />
    <path d="M29 40 H43" />
  </>
)
ICONS.cabai = (
  <>
    <path d="M14 14 Q8 30 22 42 Q30 46 26 36 Q20 26 22 14 Z" fill={HOT} />
    <path d="M14 14 Q17 9 22 14 M18 11 Q18 6 22 5" stroke={GREEN} strokeWidth={3} />
    <path d="M32 36 V12 M26 18 L32 12 L38 18" stroke={HOT} strokeWidth={4} />
  </>
)
ICONS.zebra = (
  <>
    <rect x="20" y="5" width="8" height="6" rx="2" fill={HOT} />
    <path d="M10 44 V20 M38 44 V20" strokeWidth={3} />
    <rect x="5" y="16" width="38" height="9" fill={W} />
    <path d="M10 16 L6 25 M18 16 L14 25 M26 16 L22 25 M34 16 L30 25 M42 16 L38 25" stroke={HOT} strokeWidth={3.5} />
    <rect x="5" y="16" width="38" height="9" />
    <path d="M5 44 H43" />
  </>
)
ICONS.judol = (
  <>
    <rect x="6" y="9" width="30" height="35" rx="4" fill={PURPLE} />
    <rect x="9" y="17" width="24" height="12" fill={W} />
    <path d="M17 17 V29 M25 17 V29" strokeWidth={1.5} />
    {label(13, 26.5, 8, '7', HOT)}
    {label(21, 26.5, 8, '7', HOT)}
    {label(29, 26.5, 8, '7', HOT)}
    <rect x="11" y="33" width="20" height="5" fill={Y} />
    <path d="M36 30 H41 V12" strokeWidth={3} />
    <circle cx="41" cy="10" r="3.5" fill={HOT} />
    {label(21, 14.5, 5, 'JUDOL', Y)}
  </>
)
ICONS.investasi = (
  <>
    <path d="M5 42 H44 M5 42 V6" />
    <path d="M8 36 L16 28 L22 31 L32 12 L38 40" stroke={GREEN} strokeWidth={3.5} />
    <path d="M32 12 L38 40" stroke={HOT} strokeWidth={3.5} />
    <path d="M36 7 Q30 10 33 16 Q42 18 42 10 Q42 5 36 7 Z" fill={Y} />
    {label(37.5, 14.5, 6, 'Rp')}
  </>
)
ICONS.samsat = (
  <>
    <path d="M4 16 L24 6 L44 16 Z" fill={CREAM} />
    <rect x="7" y="16" width="34" height="24" fill={W} />
    <path d="M13 20 V36 M20 20 V36 M28 20 V36 M35 20 V36" strokeWidth={2} />
    <path d="M3 40 H45" strokeWidth={3} />
    <rect x="26" y="30" width="16" height="12" fill={Y} transform="rotate(-10 34 36)" />
    {label(34, 39, 6, 'A-999')}
  </>
)
ICONS.banjir = (
  <>
    <path d="M10 22 L24 10 L38 22 V30 H10 Z" fill={CREAM} />
    <path d="M6 24 L24 9 L42 24" />
    <rect x="20" y="22" width="8" height="8" fill={SKY} />
    <path d="M3 31 Q9 27 15 31 T27 31 T39 31 T48 31 V45 H3 Z" fill={SEA} />
    <path d="M3 38 q5 -3 10 0 t10 0 t10 0 t10 0" stroke={W} />
  </>
)
ICONS.baliho = (
  <>
    <path d="M14 30 V45 M34 30 V45" strokeWidth={3} />
    <rect x="4" y="6" width="40" height="24" fill={Y} />
    <circle cx="14" cy="18" r="6" fill={CREAM} />
    <path d="M12 17 h.5 M16 17 h.5 M11.5 20 Q14 22.5 16.5 20" strokeWidth={1.6} />
    <path d="M23 13 H39 M23 19 H36 M23 25 H39" stroke={HOT} strokeWidth={2.5} />
  </>
)

export function SquareIcon({ sq, className = 'sq-icon' }: { sq: number; className?: string }) {
  const content = ICONS[BOARD[sq]?.id]
  if (!content) return null
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      {content}
    </svg>
  )
}

function building(level: number, c: string): ReactNode {
  switch (level) {
    case 0: // bendera tanah
      return (
        <>
          <path d="M14 44 V5 M8 44 H20" />
          <path d="M14 7 H38 L31 15 L38 23 H14 Z" fill={c} />
        </>
      )
    case 1: // warung
      return (
        <>
          <path d="M10 26 V42 M38 26 V42" />
          <rect x="8" y="30" width="32" height="12" fill={c} />
          <path d="M5 26 L9 15 H39 L43 26 Z" fill={W} />
          <path d="M15 15 L13 26 M21 15 L20 26 M27 15 L28 26 M33 15 L35 26" stroke={HOT} strokeWidth={2.5} />
          <path d="M5 26 L9 15 H39 L43 26 Z" />
        </>
      )
    case 2: // kos-kosan
      return (
        <>
          <path d="M8 20 L24 7 L40 20 V43 H8 Z" fill={c} />
          <rect x="13" y="21" width="7" height="6" fill={W} />
          <rect x="28" y="21" width="7" height="6" fill={W} />
          <rect x="13" y="31" width="7" height="6" fill={W} />
          <rect x="28" y="31" width="7" height="12" fill={W} />
        </>
      )
    case 3: // ruko
      return (
        <>
          <rect x="6" y="8" width="36" height="35" fill={c} />
          <path d="M6 19 H42 M6 30 H42 M24 8 V43" />
          <path d="M11 12 h5 M30 12 h5 M11 23 h5 M30 23 h5" stroke={W} strokeWidth={3} />
          <path d="M10 43 V34 H20 V43 M28 43 V34 H38 V43" fill={W} />
        </>
      )
    default: // mall
      return (
        <>
          <path d="M14 16 Q24 3 34 16 Z" fill={Y} />
          <rect x="4" y="16" width="40" height="27" fill={c} />
          <rect x="11" y="20" width="26" height="8" fill={W} />
          {label(24, 26.6, 6.5, 'MALL', HOT)}
          <path d="M17 43 V32 H31 V43 M24 32 V43" fill={SKY} />
        </>
      )
  }
}

export function BuildingIcon({ level, color, className = 'bld-icon' }: { level: number; color: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      {building(level, color)}
    </svg>
  )
}
