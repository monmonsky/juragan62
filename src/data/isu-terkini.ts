// Edisi isu terkini (PRD §9.3–9.5). Ganti/tambah edisi di sini tanpa mengubah engine.
// Aturan konten: sindir kebijakan & keadaan, jangan tragedi berkorban, jangan sebut nama tokoh (PRD §5).

import type { Card } from './cards.ts'
import { BANDARA_SQ } from './board.ts'

export const EDISI = '2026-10'

export type HeadlineId =
  | 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'H7'
  | 'H8' | 'H9' | 'H10' | 'H11' | 'H12' | 'H13' | 'H14'
  | 'H15' | 'H16' | 'H17' | 'H18' | 'H19'

export interface Headline {
  id: HeadlineId
  title: string
  effectText: string
}

export const HEADLINES: Headline[] = [
  { id: 'H1', title: 'Rupiah tembus 18 ribu per dolar!', effectText: 'Indeks Harga langsung naik tambahan 5%' },
  { id: 'H2', title: 'Antre BBM mengular, SPBU kosong', effectText: 'Semua pemain cuma lempar 1 dadu tahun ini' },
  { id: 'H3', title: 'Pemadaman bergilir se-Konoha', effectText: 'Sewa PLN & PDAM nol, sewa Mall −25%' },
  { id: 'H4', title: 'Krisis air bersih', effectText: 'Biaya hidup +20% tahun ini' },
  { id: 'H5', title: 'Kabut asap karhutla', effectText: 'Sewa properti Sumatra & Kalimantan setengah' },
  { id: 'H6', title: 'UU Ketenagakerjaan baru disahkan', effectText: 'Kenaikan UMR tahun ini 0%' },
  { id: 'H7', title: 'Gelombang PHK', effectText: 'Tiap gajian, 1 dari 3 kemungkinan gaji cuma cair setengah' },
  { id: 'H8', title: 'Investor asing kabur, status pasar diturunkan', effectText: 'Semua pemain kehilangan 5% uang tunai' },
  { id: 'H9', title: 'Anggaran disedot Makan Bergizi Gratis', effectText: 'Kartu Bansos yang memberi uang cuma cair setengah' },
  { id: 'H10', title: 'Demo besar di ibu kota', effectText: 'Jakarta SCBD & IKN tidak menghasilkan sewa' },
  { id: 'H11', title: 'Gagal bayar pinjol meningkat', effectText: 'Bunga pinjol naik jadi 7% per giliran' },
  { id: 'H12', title: 'Tidak ada berita besar tahun ini', effectText: 'Tidak ada efek. Mencurigakan.' },
  { id: 'H13', title: 'Lahan dibuka besar-besaran untuk sawit & tambang', effectText: 'Properti Kalimantan & Maluku–Papua diobral 30%, sewanya juga turun 30%' },
  { id: 'H14', title: 'Dapur MBG diaudit', effectText: 'Pemegang kartu Vendor MBG wajib bayar Rp 1 jt' },
  { id: 'H15', title: 'Korupsi berjamaah, anggaran bocor', effectText: 'Semua pajak & pungli 2× tahun ini (rakyat yang nambal)' },
  { id: 'H16', title: 'Presiden Konoha pidato: "Harga-harga turun kok"', effectText: 'Indeks Harga malah langsung naik 3%' },
  { id: 'H17', title: 'Koruptor dapat remisi, sel mewah laris', effectText: 'Hukum tumpul ke atas: uang ≥ Rp 20 jt kebal Pasal Karet. Sel mewah diskon 50%' },
  { id: 'H18', title: 'Polemik ijazah ramai lagi, semua sibuk debat', effectText: 'Kartu Viral yang memberi uang cair 2× (konten debat laris)' },
  { id: 'H19', title: 'Ormas minta "THR" ke pengusaha', effectText: 'Bayar Rp 100 rb per tanah yang kamu punya' },
]

export const ISU_CARDS: Card[] = [
  { id: 'V14', deck: 'viral', text: 'Bikin meme AI soal pejabat, keburu FYP.', effectText: 'Kena Pasal Karet → Kasus Mangkrak', effect: { kind: 'jail' } },
  { id: 'V15', deck: 'viral', text: 'Antre BBM 3 jam, eh bensinnya habis.', effectText: 'Lewati 1 giliran', effect: { kind: 'skipTurn' } },
  { id: 'V16', deck: 'viral', text: 'Portofolio sahammu merah semua, IHSG ambles.', effectText: 'Kehilangan 15% uang tunai', effect: { kind: 'pctCash', pct: -0.15 } },
  { id: 'V17', deck: 'viral', text: 'Anakmu diangkat jadi "tenaga ahli". Viral, lalu mundur.', effectText: 'Terima Rp 1 jt, lalu bayar Rp 1,5 jt untuk "konsultan citra"', effect: { kind: 'money', amount: -500 } },
  { id: 'V18', deck: 'viral', text: 'Penerbangan batal gara-gara kabut asap.', effectText: 'Pindah ke Bandara (tidak bayar sewa)', effect: { kind: 'moveTo', sq: BANDARA_SQ, collectStart: false, noRent: true } },
  { id: 'V19', deck: 'viral', text: 'Bikin konten "sawit kan juga pohon, ada daunnya". FYP!', effectText: 'Terima Rp 500 rb dari endorse', effect: { kind: 'money', amount: 500 } },
  { id: 'V20', deck: 'viral', text: 'Liburan ke Raja Ampat. Yang viral malah lubang tambangnya.', effectText: 'Bayar Rp 500 rb', effect: { kind: 'money', amount: -500 } },
  { id: 'V21', deck: 'viral', text: 'Katanya makan gratis lebih mendesak daripada lapangan kerja. Lamaranmu ditolak lagi.', effectText: 'Bayar Rp 200 rb (print CV & materai)', effect: { kind: 'money', amount: -200 } },

  { id: 'B14', deck: 'bansos', text: 'Datamu tercatat masuk desil 10 (alias kaya raya). Bansos dicabut.', effectText: 'Kembalikan Rp 600 rb', effect: { kind: 'money', amount: -600 } },
  { id: 'B15', deck: 'bansos', text: 'Dapat rumah subsidi 18 m². Kasur masuk, kamu di luar.', effectText: 'Bayar DP Rp 500 rb', effect: { kind: 'money', amount: -500 } },
  { id: 'B16', deck: 'bansos', text: 'Iuran wajib koperasi desa.', effectText: 'Bayar Rp 200 rb', effect: { kind: 'money', amount: -200 }, pungli: true },
  { id: 'B17', deck: 'bansos', text: 'Harga BBM non-subsidi naik lagi.', effectText: 'Bayar Rp 300 rb', effect: { kind: 'money', amount: -300 } },
  { id: 'B18', deck: 'bansos', text: 'Kontrak kerjamu diperpanjang. Status: tetap kontrak.', effectText: 'Tidak terjadi apa-apa. Seperti kariermu.', effect: { kind: 'none' } },
  { id: 'B19', deck: 'bansos', text: 'Air PDAM mati seminggu, beli galon.', effectText: 'Bayar Rp 250 rb', effect: { kind: 'money', amount: -250 } },
  { id: 'B20', deck: 'bansos', text: 'Sekolah daring, tapi nasi kotak MBG tetap dikirim ke sekolah yang kosong.', effectText: 'Terima Rp 15 rb (jatah nasi kotak)', effect: { kind: 'money', amount: 15 } },
  { id: 'B21', deck: 'bansos', text: 'Kenalanmu buka dapur MBG, kamu ikut jadi "vendor".', effectText: 'Terima Rp 1,5 jt. Hati-hati kalau ada audit.', effect: { kind: 'vendorMBG', amount: 1500 } },
  { id: 'V22', deck: 'viral', text: 'Menang tender proyek karena "kenal orang". Cuan... lalu kena OTT.', effectText: 'Terima Rp 2 jt, lalu masuk Kasus Mangkrak', effect: { kind: 'moneyJail', amount: 2000 } },
  { id: 'V23', deck: 'viral', text: 'Ijazahmu diragukan warganet. Sidang demi sidang.', effectText: 'Bayar Rp 1 jt untuk pengacara & legalisir', effect: { kind: 'money', amount: -1000 } },
  { id: 'V24', deck: 'viral', text: 'Video reaksimu atas pidato asal bunyi Presiden Konoha FYP!', effectText: 'Terima Rp 700 rb', effect: { kind: 'money', amount: 700 } },

  { id: 'B23', deck: 'bansos', text: 'Dana desa dikorupsi oknum. Jalan kampung tetap rusak, kamu tambal sendiri.', effectText: 'Bayar Rp 300 rb', effect: { kind: 'money', amount: -300 }, pungli: true },
  { id: 'B24', deck: 'bansos', text: 'Ormas segel usahamu karena belum bayar "uang keamanan".', effectText: 'Bayar Rp 200 rb per tanah yang kamu punya', effect: { kind: 'perProperty', amount: 200 }, pungli: true },
  { id: 'B25', deck: 'bansos', text: 'Om-mu jadi napi korupsi, minta dikirimi kasur empuk buat sel mewahnya.', effectText: 'Bayar Rp 500 rb', effect: { kind: 'money', amount: -500 } },
  { id: 'B22', deck: 'bansos', text: 'Kebun sawit masuk ke lahan kampungmu. Ganti rugi: "nanti dikabari".', effectText: 'Bayar Rp 300 rb ongkos ke kantor desa', effect: { kind: 'money', amount: -300 } },
]
