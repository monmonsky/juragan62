# Juragan +62

Game papan properti satir tentang susahnya hidup di Negeri Konoha. Dimainkan di browser, 2–6 pemain: di satu perangkat (manusia dan/atau bot) atau online pakai kode room.

- Spesifikasi: [docs/PRD.md](docs/PRD.md)
- Progress: [docs/PROGRESS.md](docs/PROGRESS.md)

## Menjalankan

```bash
npm install
npm run dev      # buka http://localhost:5173
npm test         # unit test engine (Vitest)
npm run sim      # simulasi bot vs bot untuk balancing (opsional: npm run sim 1000)
npm run build    # build statis ke dist/, siap deploy ke Vercel/Netlify
```

## Deploy

Produksi: **https://juragan62.aikita.id** dengan Nginx (tanpa PM2). Konfigurasi & langkah lengkap di [deploy/README.md](deploy/README.md):

```bash
DEPLOY_HOST=user@server ./deploy/deploy.sh
```

Alternatif tanpa server:

Build statis, bisa di-hosting di mana saja:

```bash
npm run build
npx vercel deploy dist --temporary   # tanpa login: deploy sementara, bisa diklaim ke akun nanti
npx vercel deploy dist --prod        # setelah `npx vercel login`
```

Mode online memakai server sinyal publik PeerJS (koneksi peer-to-peer), jadi tidak perlu backend.

## Struktur

```
src/
  data/       papan 48 petak, kartu, karakter, konstanta ekonomi, isu-terkini.ts (edisi satir)
  engine/     aturan game murni: step(state, action) → { state, events }, bot, rapor
  ui/         komponen React, fx.ts (animasi), sfx.ts (suara), share.ts (gambar Rapor), Online.tsx (lobby)
  net/        room online (PeerJS)
  sim/        script simulasi balancing
mockups/      mockup statis awal (referensi desain)
docs/         PRD & progress
```

Engine tidak bergantung pada UI. UI memutar `events` dari engine sebagai animasi. Mode online memakai pola yang sama: host menjalankan engine lalu mengirim `state + events` ke semua tamu.

## Edisi isu bulanan

Kartu & Headline satir terbaru ada di `src/data/isu-terkini.ts`. Untuk edisi baru tiap bulan:

1. Riset isu yang ramai bulan itu (cek ke media arus utama).
2. Ganti `EDISI` (mis. `'2026-11'`), lalu tambah/ganti kartu (`V..`/`B..`) & Headline (`H..`). ID harus unik; Headline baru juga ditambahkan ke tipe `HeadlineId`, dan efek khususnya di `newYear()`/`rentFor()` di `src/engine/engine.ts`.
3. Patuhi aturan konten PRD §5: sindir isunya, jangan sebut nama tokoh, jangan bercanda soal korban.
4. Cek keseimbangan: `npm test` dan `npm run sim`.

Pemain yang tidak mau isu terkini bisa memilih edisi **Klasik** di layar Setup.

## Server TURN (opsional, untuk mode online di jaringan ketat)

```bash
VITE_TURN_URL=turn:turn.contoh.com:3478 VITE_TURN_USER=user VITE_TURN_PASS=rahasia npm run build
```

## Mengubah konten

- Angka ekonomi: `src/data/economy.ts`, lalu cek dampaknya dengan `npm run sim`.
- Kartu & Headline isu terkini: `src/data/isu-terkini.ts`. Ikuti aturan konten di PRD §5.
