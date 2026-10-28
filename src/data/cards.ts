// Kartu Viral & Bansos klasik (PRD §9.1–9.2). Kartu isu terkini ada di isu-terkini.ts.

import { IKN_SQ } from './board.ts'

export type CardEffect =
  | { kind: 'money'; amount: number }
  | { kind: 'pctCash'; pct: number }
  | { kind: 'debtPct'; pct: number }
  | { kind: 'jail' }
  | { kind: 'jailCard' }
  | { kind: 'moveTo'; sq: number; collectStart: boolean; noRent?: boolean }
  | { kind: 'moveBy'; steps: number }
  | { kind: 'nearestTransport' }
  | { kind: 'fromEach'; amount: number }
  | { kind: 'toEach'; amount: number }
  | { kind: 'perBuilding'; amount: number }
  | { kind: 'perProperty'; amount: number }
  | { kind: 'moneyJail'; amount: number }
  | { kind: 'inflation'; pct: number }
  | { kind: 'skipTurn' }
  | { kind: 'vendorMBG'; amount: number }
  | { kind: 'none' }

export interface Card {
  id: string
  deck: 'viral' | 'bansos'
  text: string
  effectText: string
  effect: CardEffect
  pungli?: boolean
}

export const CLASSIC_CARDS: Card[] = [
  { id: 'V1', deck: 'viral', text: 'Keluhan jalan rusak depan rumahmu viral. Diperbaiki dalam 24 jam!', effectText: 'Terima Rp 500 rb', effect: { kind: 'money', amount: 500 } },
  { id: 'V2', deck: 'viral', text: 'No Viral No Justice.', effectText: 'Simpan kartu ini: keluar dari Kasus Mangkrak gratis', effect: { kind: 'jailCard' } },
  { id: 'V3', deck: 'viral', text: 'Kamu nge-tweet kritik pedas.', effectText: 'Kena Pasal Karet → Kasus Mangkrak', effect: { kind: 'jail' } },
  { id: 'V4', deck: 'viral', text: 'Video jualan seblak-mu FYP.', effectText: 'Terima Rp 1 jt', effect: { kind: 'money', amount: 1000 } },
  { id: 'V5', deck: 'viral', text: 'Debt collector datang ke rumah dan direkam tetangga.', effectText: 'Bayar 20% utang pinjol', effect: { kind: 'debtPct', pct: 0.2 } },
  { id: 'V6', deck: 'viral', text: 'Konten flexing-mu dilirik petugas pajak.', effectText: 'Bayar 10% uang tunai', effect: { kind: 'pctCash', pct: -0.1 } },
  { id: 'V7', deck: 'viral', text: 'Ikut demo, kena gas air mata.', effectText: 'Mundur 3 petak', effect: { kind: 'moveBy', steps: -3 } },
  { id: 'V8', deck: 'viral', text: 'Mudik Lebaran! Harga tiket naik.', effectText: 'Maju ke transportasi terdekat. Kalau ada pemiliknya, bayar sewa 2×', effect: { kind: 'nearestTransport' } },
  { id: 'V9', deck: 'viral', text: 'Diundang upacara ke IKN.', effectText: 'Maju ke IKN Nusantara', effect: { kind: 'moveTo', sq: IKN_SQ, collectStart: true } },
  { id: 'V10', deck: 'viral', text: 'Akunmu dibajak buat promosi judol.', effectText: 'Bayar Rp 750 rb', effect: { kind: 'money', amount: -750 }, pungli: true },
  { id: 'V11', deck: 'viral', text: 'Kamu jadi buzzer bayaran.', effectText: 'Terima Rp 300 rb dari setiap pemain', effect: { kind: 'fromEach', amount: 300 } },
  { id: 'V12', deck: 'viral', text: 'Hutan di hulu jadi kebun sawit. Banjir kiriman!', effectText: 'Bayar Rp 150 rb per bangunan milikmu', effect: { kind: 'perBuilding', amount: 150 } },
  { id: 'V13', deck: 'viral', text: 'Rupiah melemah!', effectText: 'Indeks Harga langsung naik 5%', effect: { kind: 'inflation', pct: 0.05 } },

  { id: 'B1', deck: 'bansos', text: 'Bansos cair jelang pemilu.', effectText: 'Terima Rp 600 rb', effect: { kind: 'money', amount: 600 } },
  { id: 'B2', deck: 'bansos', text: 'Bansos cair... tapi dipotong oknum.', effectText: 'Terima Rp 150 rb', effect: { kind: 'money', amount: 150 }, pungli: true },
  { id: 'B3', deck: 'bansos', text: 'Harga beras naik lagi.', effectText: 'Bayar Rp 400 rb', effect: { kind: 'money', amount: -400 } },
  { id: 'B4', deck: 'bansos', text: 'Ormas minta "uang keamanan".', effectText: 'Bayar Rp 300 rb', effect: { kind: 'money', amount: -300 }, pungli: true },
  { id: 'B5', deck: 'bansos', text: 'Menang giveaway selebgram.', effectText: 'Terima Rp 250 rb', effect: { kind: 'money', amount: 250 } },
  { id: 'B6', deck: 'bansos', text: 'Kondangan beruntun minggu ini.', effectText: 'Bayar Rp 100 rb ke setiap pemain', effect: { kind: 'toEach', amount: 100 } },
  { id: 'B7', deck: 'bansos', text: 'THR cair!', effectText: 'Terima Rp 1 jt', effect: { kind: 'money', amount: 1000 } },
  { id: 'B8', deck: 'bansos', text: 'Kena tilang, "damai di tempat".', effectText: 'Bayar Rp 250 rb', effect: { kind: 'money', amount: -250 }, pungli: true },
  { id: 'B9', deck: 'bansos', text: 'Subsidi BBM dicabut.', effectText: 'Bayar Rp 500 rb', effect: { kind: 'money', amount: -500 } },
  { id: 'B10', deck: 'bansos', text: 'Lolos CPNS lewat "orang dalam".', effectText: 'Terima Rp 800 rb', effect: { kind: 'money', amount: 800 } },
  { id: 'B11', deck: 'bansos', text: 'Iuran BPJS naik.', effectText: 'Bayar Rp 300 rb', effect: { kind: 'money', amount: -300 } },
  { id: 'B12', deck: 'bansos', text: 'Arisan RT, namamu keluar!', effectText: 'Terima Rp 200 rb dari setiap pemain', effect: { kind: 'fromEach', amount: 200 } },
  { id: 'B13', deck: 'bansos', text: 'Pulang kampung, minta modal ke ortu.', effectText: 'Maju ke START. Berhenti pas di START = gaji ditahan 😅', effect: { kind: 'moveTo', sq: 0, collectStart: true } },
]
