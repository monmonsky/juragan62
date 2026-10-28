# Progress — Juragan +62

Catatan kemajuan pengerjaan. Spesifikasi lengkap ada di [PRD.md](PRD.md).

**Update terakhir:** 27 Oktober 2026
**Tahap sekarang:** v1.0 (papan 48 petak + mini-game & petak aksi) → tinggal deploy & main-tes

---

## Rencana Tahap

| Tahap | Isi | Status |
|---|---|---|
| 0. Konsep & PRD | Riset, nama game, konsep, `docs/PRD.md` | ✅ Selesai |
| 1. Mockup tampilan | Mockup gaya Meme Cerah + demo animasi | ✅ Selesai |
| 2. Engine + simulasi | Aturan game, bot, unit test, simulasi balancing | ✅ Selesai |
| 3. Sambungkan UI | Game bisa dimainkan penuh di browser | ✅ Selesai |
| 4. Polish & rilis v1 | Rapor, simpan otomatis, mobile, deploy | 🟡 Sebagian (tinggal deploy & polish mobile) |

---

## Tahap 0: Konsep & PRD ✅

- [x] Riset Konohapoly (game viral oleh Devan Christiawan, 24 Okt 2026)
- [x] Nama: **Juragan +62**
- [x] Konsep inti: "gaji kalah cepat dari harga": inflasi, UMR, biaya hidup, pinjol, pegadaian
- [x] `docs/PRD.md`, isu terkini Okt 2026 (Headline Nasional + kartu), satir MBG & sawit/tambang
- [x] Nama kartu tetap **Viral** & **Bansos**

## Tahap 1: Mockup ✅

- [x] Gaya terpilih: **Meme Cerah** (`mockups/a-meme.html` + demo animasi `mockups/a-anim.js`)

## Tahap 2: Engine + Simulasi ✅

- [x] Data di `src/data/`: papan, kartu klasik, `isu-terkini.ts` (edisi 2026-10), `economy.ts`
- [x] Engine reducer murni `step(state, action) → { state, events }` dengan RNG ber-seed (`src/engine/engine.ts`)
  - giliran, dadu, dadu kembar (3× → Mangkrak), beli/lewati, sewa (tanah/transport/utilitas)
  - kartu Viral & Bansos (43 kartu), pajak, pungli, parkir liar, Pasal Karet, Kasus Mangkrak
  - Indeks Harga, gajian vs biaya hidup, pinjol (bunga per giliran, cicilan saat gajian), gadai/tebus
  - Headline Nasional H1–H14 dengan efek setahun
  - bangunan Warung → Mall, bangkrut (aset ke penagih / disita negara), pelunasan otomatis untuk pemain di luar gilirannya
  - satir khusus: IKN "kota sepi", PLN padam saat dadu kembar, cicilan Kereta Cepat, vendor MBG kena audit
- [x] Bot (`src/engine/bot.ts`)
- [x] Rapor + gelar (`src/engine/rapor.ts`)
- [x] 13 unit test (`npm test`)
- [x] Simulasi balancing (`npm run sim`). Hasil & perubahan aturan dicatat di PRD §16

## Tahap 3: UI ✅

- [x] Beranda (lanjutkan game tersimpan, cara main, disclaimer)
- [x] Setup: 2–6 pemain, orang/bot, ganti bidak, panjang game (20/30/40/sampai tinggal satu), kecepatan animasi
- [x] Layar game: papan, ticker BREAKING KONOHA, meter Indeks Harga, headline, log, panel pemain, slip gaji, panel aksi kontekstual
- [x] Modal: info properti + tabel sewa, Kelola Aset, PinjolKilat, kartu
- [x] Animasi dari antrian event: dadu, bidak lompat, uang melayang, stempel SAH!/MANGKRAK/GADAI/PRIT!, kartu flip, slip gaji dicetak, banner HARGA NAIK, toast pinjol, bangunan pop, bangkrut, confetti
- [x] Kecepatan animasi Normal/Cepat/Mati + `prefers-reduced-motion`
- [x] Simpan otomatis ke `localStorage`
- [x] Rapor Hidup di Konoha (peringkat, gelar, statistik)

## Feedback Main-tes #1 ✅ (27 Okt 2026, PRD §17)

- [x] Putaran pertama belum boleh beli
- [x] Beli tanah dulu 🚩; bangun hanya saat lewat START, pilih tanahnya (maks 2 tingkat/tanah)
- [x] Berhenti pas di START = tidak gajian
- [x] Ikon tanah & bangunan: 🚩 Tanah → 🛖 Warung → 🏠 Kos-kosan → 🏬 Ruko → 🏢 Mall
- [x] Giliran selesai otomatis
- [x] Panduan singkat (muncul di game pertama + tombol ❓ Panduan) & petunjuk kontekstual di panel aksi
- [x] Bidak di papan diperbesar
- [x] Layar perkenalan: isi nama & pilih bidak saat pertama dibuka (bisa diganti dari Beranda)
- [x] Animasi & info diperlambat (Normal ±1,5×, jeda bot 0,9 dtk, kartu bot 3,5 dtk)
- [x] Ekonomi disetel ulang lewat simulasi
- [x] 15 unit test, build, lint, dan tes end-to-end lulus

## Fitur v0.5 ✅ (27 Okt 2026, PRD §18)

- [x] 7 karakter dengan kelebihan/kekurangan, diseimbangkan lewat simulasi (menang 18–31%)
- [x] Pemilu tiap 4 tahun (serangan fajar + bansos, lalu harga naik)
- [x] Tukar tanah: pemain ↔ pemain, pemain ↔ bot, bot ↔ bot; bot aktif menawar untuk melengkapi grup
- [x] Efek suara sintetis + tombol 🔊/🔇
- [x] Bagikan Rapor sebagai gambar (share HP / unduh PNG)
- [x] Main online pakai room (PeerJS, host-authoritative), link undangan `?room=KODE`, tamu keluar → diganti bot
- [x] Bug diperbaiki: bot bisa terjebak "bayar utang Rp 0" berulang
- [x] 19 unit test, build, lint bersih; e2e lokal sampai Rapor + unduh gambar; e2e online 2 browser (host & tamu sinkron)

## Polish Visual ✅ (27 Okt 2026)

- [x] Ikon SVG custom untuk 40 petak (landmark tiap kota, transportasi, utilitas, kartu, pajak, pojok)
- [x] Ikon tanah & 4 tingkat bangunan berwarna sesuai pemilik
- [x] Gadai / Pinjol / Tawar hanya muncul saat uang tidak cukup

## v0.6 ✅ (28 Okt 2026, PRD §19)

- [x] Bangun saat lewat START cuma 1 tanah (maks 2 tingkat); aturan bangun merata dihapus
- [x] Gajian selalu menyisakan uang (minimal 25%, per karakter beda)
- [x] Dadu besar ber-pip di atas papan + total "a + b = n"
- [x] Kota Solo ("Kota Dinasti"), sel tahanan mewah, korupsi, remisi koruptor, pungli ormas, polemik ijazah, Presiden Konoha asbun
- [x] Ekonomi & karakter disetel ulang lewat simulasi
- [x] 21 unit test, build, lint bersih; e2e game penuh lulus

## v0.7 ✅ (28 Okt 2026, PRD §20)

- [x] Tampilan HP pas satu layar
- [x] Tombol Tawar juga muncul saat kurang 1 tanah untuk grup penuh
- [x] Lelang tanah
- [x] Giliran bot lebih cepat + perkiraan durasi di Setup
- [x] Bot lebih pintar (lelang, cadangan uang, urutan cari dana)
- [x] Tutorial interaktif
- [x] Saldo bergerak bertahap
- [x] Musik latar
- [x] Online: sambung ulang otomatis, lanjutkan room tersimpan, TURN opsional, reaksi emoji
- [x] Edisi kartu (Isu terkini / Klasik) + proses edisi bulanan
- [x] 15 pencapaian & statistik lintas game
- [x] 22 unit test, build, lint bersih; e2e lokal penuh, e2e online (sinkron, reaksi, sambung ulang setelah reload)

## v0.8 ✅ (28 Okt 2026, PRD §21)

- [x] Gaji lebih besar (UMR Rp 5 jt, sisa gaji minimal 50%)
- [x] Animasi & jalan bidak lebih pelan
- [x] Adegan khas di semua 40 petak (tap untuk lewati)
- [x] 22 unit test, build, lint bersih; e2e game penuh lulus

## v0.9 ✅ (28 Okt 2026, PRD §22–23)

- [x] Lempar dadu penentu urutan main (online selalu; lokal pilihan di Setup)
- [x] Dokumentasi penyimpanan data (tanpa database)
- [x] 23 unit test, build, lint; e2e lokal & online lulus

## v1.0 ✅ (28 Okt 2026, PRD §24)

- [x] Papan 48 petak (13×13), petak punya ID
- [x] Mini-game: Slot Judol, Tebak Harga Cabai, Investasi Bodong
- [x] Petak aksi: Operasi Zebra, Jalan Rusak, Antre Samsat, Baliho Kampanye, Banjir
- [x] Ikon SVG + adegan untuk 8 petak baru, animasi hasil (gulungan slot), 2 pencapaian baru
- [x] Ekonomi disetel ulang; 24 unit test, build, lint; e2e lokal & online lulus

## Tahap 4: Polish & Rilis ⬜

- [x] Konfigurasi Nginx + script deploy untuk juragan62.aikita.id (`deploy/`), CSP sudah dites dengan mode lokal & online
- [ ] Jalankan deploy ke server (DNS, certbot, `deploy/deploy.sh`)
- [ ] Polish layout mobile (sekarang papan digeser horizontal + tombol aksi menempel di bawah)
- [ ] Siapkan server TURN sendiri kalau banyak pemain online gagal tersambung
- [ ] Edisi isu November 2026

---

## Verifikasi (27 Okt 2026)

- `npm test`: 24/24 lulus
- `npm run build` & `npm run lint`: bersih
- `npm run sim 500`: 0 game macet
- Tes end-to-end di Chromium headless: beberapa game penuh dari Beranda sampai Rapor (20 ronde & "sampai tinggal satu", animasi Normal & Mati), tanpa error console
- Bug yang ditemukan & diperbaiki saat tes: timer tutup-otomatis kartu bot bisa menutup kartu pemain berikutnya sehingga game macet

## Keputusan

| Tanggal | Keputusan |
|---|---|
| 27 Okt 2026 | Nama game: **Juragan +62** |
| 27 Okt 2026 | v1 main lokal (1 perangkat + bot), tanpa server |
| 27 Okt 2026 | Stack: Vite + React + TypeScript |
| 27 Okt 2026 | Gaya visual: **Meme Cerah** + banyak animasi |
| 27 Okt 2026 | Satir isu terkini lewat Headline Nasional & kartu edisi Okt 2026 (termasuk MBG & sawit) |
| 27 Okt 2026 | Nama kartu tetap Viral & Bansos |
| 27 Okt 2026 | Aturan "IMB bisa diatur": tanpa grup penuh boleh bangun sampai Ruko, Mall wajib grup penuh (hasil simulasi, PRD §16) |
| 27 Okt 2026 | Aturan v0.4: putaran pertama tanpa beli, bangun saat lewat START, berhenti di START tidak gajian (PRD §17) |
| 27 Okt 2026 | v0.5: karakter, Pemilu, tukar tanah, suara, share Rapor, online P2P via PeerJS (PRD §18) |
| 27 Okt 2026 | Ekonomi v0.4: sewa dasar 12%, bangunan 5×/15×/40×/60×, biaya hidup Rp 2,7 jt, 2 tingkat per lewat START |

## Pertanyaan Terbuka

- Perlu mode "Hidup Mudah" tanpa inflasi & Headline? (PRD §15)
- Ganti nama folder/`package.json` dari `konohapoly` jadi `juragan62`?
- Deploy: perintah `npx vercel deploy dist --temporary` perlu dijalankan sendiri (diblokir pengaman otomatis karena membuat situs publik)

## Catatan / Masalah Diketahui

- Mobile: di layar HP nama kota disembunyikan (cuma ikon); detail lewat tap petak.
- Bot masih sederhana: kadang membangun lalu harus menjual bangunannya lagi saat kena sewa besar.
- Kalau pemain bangkrut karena utang ke pemain lain, penagih tetap menerima jumlah penuh dan juga asetnya (penyederhanaan).
