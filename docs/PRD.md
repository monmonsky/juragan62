# PRD — Juragan +62

> **Juragan +62: Bertahan Hidup di Negeri Konoha**
> Game papan properti satir tentang susahnya hidup di Indonesia, dimainkan di browser.

| | |
|---|---|
| Status | v1.0: papan 48 petak dengan 3 mini-game + 5 petak aksi (§24) |
| Tanggal | 27 Oktober 2026 |
| Platform | Web (desktop & HP) |
| Bahasa | Indonesia (gaya santai/meme) |

---

## 1. Latar Belakang

"Konoha" dan "Wkwkland" adalah julukan sindiran warganet untuk Indonesia. Pada 24 Okt 2026 game *Konohapoly* (Devan Christiawan) viral dengan konsep serupa, lalu ditutup sementara karena servernya tidak kuat menampung lonjakan pemain.

**Juragan +62** mengambil tema yang sama tapi dengan identitas sendiri. Pembedanya ada di mekanik: satirnya **dirasakan lewat sistem ekonomi game**, bukan cuma lewat nama petak dan teks kartu.

## 2. Visi & Pesan Satir

> *Gaji kalah cepat dari harga. Yang punya aset makin kaya, yang cuma punya gaji pelan-pelan tenggelam, atau terjerat pinjol.*

Di awal game pemain merasa aman. Di pertengahan, biaya hidup mulai menyalip UMR. Di akhir, hanya pemilik properti yang bisa bertahan. Pemain harus "merasakan" ketimpangan itu tanpa perlu diceramahi.

## 3. Tujuan

| Tujuan | Ukuran Sukses |
|---|---|
| Lucu & relatable, layak dibagikan | Pemain screenshot "Rapor Hidup" di akhir game |
| Satir terasa lewat mekanik | Pemain tanpa properti hampir pasti bangkrut sebelum ronde 30 |
| Mudah dimainkan | Bisa mulai main < 30 detik tanpa daftar akun |
| Tidak tumbang saat viral | v1 tanpa server (statis), biaya hosting ≈ 0 |
| Satu sesi tidak terlalu lama | 1 game ±20–40 menit |

### Non-Goals (v1)
- Multiplayer online / room (lihat Roadmap v2)
- Akun, login, leaderboard
- Tukar-menukar properti antar pemain & lelang
- Monetisasi

## 4. Target Pemain

- Anak muda Indonesia 17–35 tahun yang akrab dengan meme "Konoha", "+62", pinjol, dan "no viral no justice".
- Main bareng teman di satu HP/laptop (tongkrongan), atau sendirian melawan bot.

## 5. Batasan Konten & Legal

- **Yang disindir adalah situasinya, bukan orangnya.** Tidak ada nama, wajah, atau karikatur pejabat/politisi asli, partai, maupun lembaga negara tertentu. Ini untuk menghindari masalah UU ITE/pencemaran nama baik.
- Tidak memakai kata/merek "Monopoly" (milik Hasbro). Semua harga, susunan papan, dan teks kartu dibuat orisinal.
- Tidak menyerang suku, agama, ras, atau daerah. Nama kota dipakai sebagai lokasi, bukan bahan ejekan.
- **Isu terkini (§9.3–9.4):** yang disindir kebijakan dan keadaannya. **Tidak** menjadikan lelucon peristiwa dengan korban jiwa atau korban luka (keracunan anak, kematian, kekerasan terhadap demonstran/wartawan, bencana alam). Tokoh yang terlibat tidak disebut namanya.
- Ada disclaimer di halaman awal: *"Karya satir & fiksi. Kemiripan dengan negara mana pun itu kebetulan... atau tidak."*

---

## 6. Gameplay

### 6.1 Ringkasan Giliran
1. Pemain melempar 2 dadu dan maju sesuai jumlahnya.
2. Efek petak tempat mendarat dijalankan (beli/bayar sewa/kartu/pajak/dll).
3. Pemain boleh melakukan aksi bebas: bangun, jual bangunan, gadai/tebus, pinjol, bayar pinjol.
4. Kalau dadunya kembar, pemain jalan lagi. Kembar 3× berturut-turut berarti langsung masuk **Kasus Mangkrak**.
5. Tekan **Selesai** dan giliran pindah ke pemain berikutnya.

**1 ronde** = semua pemain aktif sudah jalan 1 giliran. **1 tahun** = 5 ronde.

### 6.2 Setup
| Parameter | Default | Opsi |
|---|---|---|
| Jumlah pemain | 4 | 2–6 (manusia + bot, minimal 1 manusia) |
| Uang awal | Rp 15 jt | — |
| Panjang game | 30 ronde | 20 / 30 / 40 / "sampai tinggal satu" |
| Kecepatan bot | Normal | Cepat / Normal / Lambat |

### 6.3 Kondisi Menang
- **Mode Ronde (default):** setelah ronde terakhir, pemain dengan **Kekayaan Bersih** tertinggi menang.
- **Menang cepat:** semua pemain lain bangkrut.
- **Kekayaan Bersih** = uang tunai + nilai properti + nilai bangunan − utang pinjol − nilai tebus properti yang tergadai.

---

## 7. Sistem Ekonomi "Susahnya Hidup" ⭐ (fitur inti)

Semua nominal di dokumen ini adalah **nilai dasar**. Nilai sebenarnya di game = nilai dasar × **Indeks Harga (IH)**, kecuali UMR.

### 7.1 Indeks Harga (Inflasi)
- IH dimulai dari **1,00**.
- Setiap pergantian tahun (setiap 5 ronde), IH naik **acak 5–12%**.
- Yang ikut naik: harga properti, biaya bangun, sewa, pajak, denda, biaya hidup, dan nominal kartu.
- Ditampilkan sebagai meter di tengah papan: *"Harga naik 8%! Indeks Harga: 1,37"*.
- Bersamaan dengan kenaikan IH, satu **Headline Nasional** diambil (§9.3).

### 7.2 Gajian (UMR) vs Biaya Hidup
Setiap kali melewati/mendarat di START:

```
+ Gaji UMR        (dasar Rp 3 jt, naik hanya 3% per tahun, TIDAK ikut IH)
- Biaya Hidup     (dasar Rp 2,4 jt × IH)
- Cicilan Pinjol  (20% dari utang, jika punya utang)
```

Dengan angka di atas, gaji bersih awalnya cuma ±Rp 600 rb, lalu biaya hidup menyalip UMR sekitar **ronde 20–25**. Setelah itu, setiap gajian justru membuat pemain *rugi*. Di layar ditampilkan rincian gaji seperti slip gaji.

### 7.3 Pinjol ("PinjolKilat")
- Bisa diambil kapan saja di giliran sendiri, kelipatan Rp 500 rb.
- Plafon total utang: Rp 10 jt × IH.
- **Bunga 5% dari sisa utang setiap giliran sendiri** (berbunga majemuk).
- Cicilan otomatis 20% saat gajian, dan bisa dilunasi kapan saja.
- Kartu tertentu memicu "kunjungan debt collector".

### 7.4 Pegadaian
- Gadai properti: dapat **50% harga × IH**. Properti tergadai tidak menghasilkan sewa.
- Tebus: bayar nilai gadai **+10%**.
- Semua bangunan di properti itu harus dijual dulu sebelum digadai.
- Jual bangunan: dapat 50% biaya bangun × IH.

### 7.5 Bangkrut
Kalau pemain harus membayar tapi uangnya kurang:
1. Pemain wajib menutup kekurangan dengan menjual bangunan, menggadai, atau mengambil pinjol.
2. Kalau semua opsi sudah habis dan uang masih minus, pemain **BANGKRUT**.
   - Kalau utangnya ke pemain lain, semua aset pindah ke pemain itu (properti tergadai tetap tergadai).
   - Kalau utangnya ke bank/negara, properti kembali kosong dan bangunannya hilang.

---

## 8. Papan (40 Petak)

Papan persegi 11×11 dengan 9 petak per sisi + 4 pojok. Arah jalan searah jarum jam.

### 8.1 Grup Properti (22 petak)

Sewa dasar = **8% harga** (dibulatkan ke 10 rb). Biaya bangun per tingkat ada per grup.

| Grup | Warna | Properti (harga dasar) | Biaya bangun |
|---|---|---|---|
| Nusa Tenggara | Cokelat | Kupang (500 rb), Labuan Bajo (900 rb) | 500 rb |
| Maluku–Papua | Biru muda | Ambon (1,1 jt), Ternate (1,1 jt), Jayapura (1,3 jt) | 600 rb |
| Sulawesi | Merah muda | Palu (1,5 jt), Kendari (1,5 jt), Makassar (1,8 jt) | 1 jt |
| Kalimantan | Oranye | Pontianak (1,9 jt), Banjarmasin (2 jt), Balikpapan (2,3 jt) | 1,2 jt |
| Sumatra | Merah | Padang (2,4 jt), Palembang (2,5 jt), Medan (2,7 jt) | 1,5 jt |
| Jawa | Kuning | Semarang (2,8 jt), Yogyakarta (3 jt), Surabaya (3,1 jt) | 1,8 jt |
| Kawasan Elit | Hijau | Bandung (3,3 jt), Canggu (3,5 jt), BSD (3,6 jt) | 2 jt |
| Pusat Kekuasaan | Ungu tua | Jakarta SCBD (4,2 jt), **IKN Nusantara** (5 jt) | 2,5 jt |

### 8.2 Tanah, Bangunan & Sewa
**Alur (v0.4):**
1. **Putaran pertama:** pemain belum boleh membeli apa pun sampai melewati START satu kali.
2. **Beli tanah 🚩:** mendarat di petak kosong → boleh membeli tanahnya (atau transportasi/utilitas).
3. **Bangun saat lewat START 🏗️:** setiap kali *melewati* START (setelah gajian), muncul pilihan "mau bangun di tanah mana?". Tiap tanah naik maksimal **2 tingkat** per lewat START.
4. **"IMB bisa diatur":** tanpa grup penuh, bangunan mentok di **Ruko**. **Mall** wajib grup penuh. (v0.6: aturan "bangun merata" dihapus; lihat §19.)
5. Properti tergadai tidak bisa dibangun. Properti yang masih ada bangunannya tidak bisa digadai.

| Tingkat | Ikon | Nama | Sewa | Punya grup penuh |
|---|---|---|---|---|
| 0 | 🚩 | Tanah | 1× sewa dasar | 2× |
| 1 | 🛖 | Warung | 5× | 7,5× |
| 2 | 🏠 | Kos-kosan | 15× | 22,5× |
| 3 | 🏬 | Ruko | 40× | 60× |
| 4 | 🏢 | Mall | — | 90× |

Sewa dasar = **12% harga** (v0.4, sebelumnya 8%).

**Keunikan satir:**
- **IKN Nusantara — "Kota Sepi":** harganya termahal, tapi sewanya **dibagi 2** sebelum ada Mall.
- **Labuan Bajo — "Wisata Premium":** harganya hampir 2× Kupang padahal satu grup.

### 8.3 Transportasi (4 petak, harga dasar 2 jt)
Pelabuhan, Stasiun KRL, Kereta Cepat, Bandara.

| Jumlah dimiliki | Sewa |
|---|---|
| 1 | 250 rb |
| 2 | 500 rb |
| 3 | 1 jt |
| 4 | 2 jt |

**Kereta Cepat — "Cicilan Utang Proyek":** pemiliknya wajib bayar **200 rb × IH** setiap gajian.

### 8.4 Utilitas (2 petak, harga dasar 1,5 jt)
PLN dan PDAM. Sewa = total dadu × 50 rb (punya 1) atau × 120 rb (punya 2).

**PLN — "Pemadaman Bergilir":** kalau penyewa melempar dadu kembar, listrik padam dan sewa **batal**.

### 8.5 Pojok
| Petak | Efek |
|---|---|
| **START — Gajian** | Lihat §7.2 |
| **Kasus Mangkrak** | Kalau cuma mampir, tidak ada efek. Kalau "ditahan", lihat §8.7 |
| **Parkir Liar** | *"Prit! Cuma lewat juga bayar."* Bayar 100 rb ke bank |
| **Kena Pasal Karet** | Langsung ke Kasus Mangkrak, tidak lewat START |

### 8.6 Petak Pajak & Pungli
| Petak | Efek |
|---|---|
| Pungli Kelurahan | Bayar 200 rb *"buat uang rokok, Pak"* |
| PPN 12% | Bayar 12% dari uang tunai (minimal 300 rb) |
| Iuran Wajib Tabungan Rumah | Bayar 750 rb *"padahal belum punya rumah"* |

### 8.7 Kasus Mangkrak (versi "penjara")
Pemain yang "ditahan" bisa keluar dengan:
- membayar **uang damai** 500 rb di awal giliran,
- melempar dadu kembar (maksimal 3 percobaan, lalu wajib bayar), atau
- memakai kartu **No Viral No Justice**.

Selama ditahan, pemain tetap menerima sewa.

### 8.8 Urutan Petak

| # | Petak | # | Petak |
|---|---|---|---|
| 0 | START — Gajian | 20 | Parkir Liar |
| 1 | Kupang | 21 | Padang |
| 2 | Labuan Bajo | 22 | 📱 Kartu Viral |
| 3 | 🍚 Kartu Bansos | 23 | Palembang |
| 4 | Ambon | 24 | Medan |
| 5 | Pelabuhan | 25 | Kereta Cepat |
| 6 | Ternate | 26 | PPN 12% |
| 7 | Pungli Kelurahan | 27 | Semarang |
| 8 | Jayapura | 28 | Yogyakarta |
| 9 | 📱 Kartu Viral | 29 | PDAM |
| 10 | Kasus Mangkrak | 30 | Kena Pasal Karet |
| 11 | Palu | 31 | Surabaya |
| 12 | PLN | 32 | 🍚 Kartu Bansos |
| 13 | Kendari | 33 | Bandung |
| 14 | Makassar | 34 | Canggu |
| 15 | Stasiun KRL | 35 | Bandara |
| 16 | 📱 Kartu Viral | 36 | BSD |
| 17 | Pontianak | 37 | Jakarta SCBD |
| 18 | Banjarmasin | 38 | Iuran Wajib Tabungan Rumah |
| 19 | Balikpapan | 39 | IKN Nusantara |

---

## 9. Kartu

Semua nominal kartu dikali IH. Kartu dikocok saat game dimulai. Kartu yang sudah dipakai masuk ke bawah dek. Kartu bertanda 🧾 masuk statistik "pungli" di Rapor.

### 9.1 📱 Kartu VIRAL (nasib dramatis)
| # | Teks | Efek |
|---|---|---|
| V1 | Keluhan jalan rusak depan rumahmu viral. Diperbaiki dalam 24 jam! | Terima 500 rb |
| V2 | **No Viral No Justice.** | Simpan; bisa dipakai untuk keluar Kasus Mangkrak gratis |
| V3 | Kamu nge-tweet kritik pedas. | Ke Kasus Mangkrak (Pasal Karet) |
| V4 | Video jualan seblak-mu FYP. | Terima 1 jt |
| V5 | Debt collector datang ke rumah dan direkam tetangga. | Bayar 20% utang pinjol. Tidak punya utang: *"Kamu selamat... kali ini."* |
| V6 | Konten flexing-mu dilirik petugas pajak. | Bayar 10% uang tunai |
| V7 | Ikut demo, kena gas air mata. | Mundur 3 petak |
| V8 | Mudik Lebaran! Harga tiket naik. | Maju ke transportasi terdekat. Kalau ada pemiliknya, bayar sewa 2× |
| V9 | Diundang upacara ke IKN. | Maju ke IKN Nusantara (lewat START tetap gajian) |
| V10 | Akunmu dibajak buat promosi judol. 🧾 | Bayar 750 rb |
| V11 | Kamu jadi buzzer bayaran. | Terima 300 rb dari setiap pemain |
| V12 | Hutan di hulu jadi kebun sawit. Banjir kiriman! | Bayar 150 rb per bangunan milikmu |
| V13 | Rupiah melemah! | **Semua pemain:** IH langsung naik 5% |

### 9.2 🍚 Kartu BANSOS (hoki atau zonk)
| # | Teks | Efek |
|---|---|---|
| B1 | Bansos cair jelang pemilu. | Terima 600 rb |
| B2 | Bansos cair... tapi dipotong oknum. 🧾 | Terima 150 rb |
| B3 | Harga beras naik lagi. | Bayar 400 rb |
| B4 | Ormas minta "uang keamanan". 🧾 | Bayar 300 rb |
| B5 | Menang giveaway selebgram. | Terima 250 rb |
| B6 | Kondangan beruntun minggu ini. | Bayar 100 rb ke setiap pemain |
| B7 | THR cair! | Terima 1 jt |
| B8 | Kena tilang, "damai di tempat". 🧾 | Bayar 250 rb |
| B9 | Subsidi BBM dicabut. | Bayar 500 rb |
| B10 | Lolos CPNS lewat "orang dalam". | Terima 800 rb |
| B11 | Iuran BPJS naik. | Bayar 300 rb |
| B12 | Arisan RT, namamu keluar! | Terima 200 rb dari setiap pemain |
| B13 | Pulang kampung, minta modal ke ortu. | Maju ke START (gajian) |

### 9.3 📰 Headline Nasional (event tahunan, Edisi Oktober 2026)

Mekanik baru yang membuat game terasa "update". Setiap **pergantian tahun** (bersamaan dengan kenaikan IH), satu Headline diambil dari dek. Efeknya berlaku **selama tahun itu** (5 ronde) dan ditampilkan di **ticker berita** di atas papan.

| # | Headline | Efek selama setahun | Isu nyata yang disindir |
|---|---|---|---|
| H1 | **Rupiah tembus 18 ribu per dolar!** | IH langsung naik tambahan 5% | Rupiah ±Rp 18.000/USD (Jun & Okt 2026) |
| H2 | **Antre BBM mengular, SPBU kosong** | Semua pemain hanya melempar **1 dadu** | Krisis/kelangkaan BBM (Okt 2026) |
| H3 | **Pemadaman bergilir se-Konoha** | Sewa PLN & PDAM nol, sewa Mall −25% | Pemadaman listrik bergilir (Okt 2026) |
| H4 | **Krisis air bersih** | Biaya hidup +20% | Krisis air bersih di beberapa daerah |
| H5 | **Kabut asap karhutla** | Sewa properti Sumatra & Kalimantan **½** | Karhutla & kabut asap (Okt 2026) |
| H6 | **UU Ketenagakerjaan baru disahkan** | Kenaikan UMR tahun ini **0%** | UU Ketenagakerjaan disahkan 6 Okt 2026, ditolak buruh |
| H7 | **Gelombang PHK** | Tiap gajian, lempar 1 dadu: 1–2 = gaji tidak cair (biaya hidup tetap dipotong) | Kenaikan angka PHK 2026 |
| H8 | **Investor asing kabur, status pasar diturunkan** | Semua pemain langsung kehilangan 5% uang tunai | IHSG anjlok, isu penurunan status oleh MSCI |
| H9 | **Anggaran disedot Makan Bergizi Gratis** | Kartu Bansos yang memberi uang hanya cair **½** | Realokasi anggaran untuk MBG; "MBG lebih mendesak daripada lapangan kerja" |
| H10 | **Demo besar di ibu kota** | Jakarta SCBD & IKN tidak menghasilkan sewa | Gelombang unjuk rasa Okt 2026 |
| H11 | **Gagal bayar pinjol meningkat** | Bunga pinjol naik jadi **7%** per giliran | Daya beli melemah, risiko gagal bayar pinjol naik |
| H12 | **Tidak ada berita besar tahun ini** | Tidak ada efek. *"Mencurigakan."* | — |
| H13 | **Lahan dibuka besar-besaran untuk sawit & tambang** | Harga beli properti Kalimantan & Maluku–Papua **−30%** ("diobral ke investor"), tapi sewanya juga **−30%** (hutannya sudah habis) | Wacana perluasan sawit, izin tambang di Raja Ampat |
| H14 | **Dapur MBG diaudit** | Pemain yang memegang kartu **Vendor MBG** (B21) wajib bayar 1 jt; yang lain aman | Tuntutan audit anggaran MBG & pengawasan SPPG (Okt 2026) |

### 9.4 Kartu Tambahan Isu Terkini (Edisi Oktober 2026)

Kartu-kartu ini dikocok bersama dek utama.

**📱 Viral**
| # | Teks | Efek |
|---|---|---|
| V14 | Bikin meme AI soal pejabat, keburu FYP. | Kena Pasal Karet → Kasus Mangkrak |
| V15 | Antre BBM 3 jam, eh bensinnya habis. | Lewati 1 giliran |
| V16 | Portofolio sahammu merah semua, IHSG ambles. | Kehilangan 15% uang tunai |
| V17 | Anakmu diangkat jadi "tenaga ahli". Viral, lalu mundur. | Terima 1 jt, lalu bayar 1,5 jt untuk "konsultan citra" |
| V18 | Penerbangan batal gara-gara kabut asap. | Pindah ke Bandara (tidak bayar sewa, tidak lewat START) |
| V19 | Bikin konten *"sawit kan juga pohon, ada daunnya"*. FYP! | Terima 500 rb dari endorse |
| V20 | Liburan ke Raja Ampat. Yang viral malah lubang tambangnya. | Bayar 500 rb |
| V21 | Katanya makan gratis lebih mendesak daripada lapangan kerja. Lamaranmu ditolak lagi. | Bayar 200 rb (ongkos print CV & materai) |

**🍚 Bansos**
| # | Teks | Efek |
|---|---|---|
| B14 | Datamu tercatat masuk **desil 10** (alias kaya raya). Bansos dicabut. | Kembalikan 600 rb |
| B15 | Dapat rumah subsidi 18 m². Kasur masuk, kamu di luar. | Bayar DP 500 rb |
| B16 | Iuran wajib koperasi desa. 🧾 | Bayar 200 rb |
| B17 | Harga BBM non-subsidi naik lagi. | Bayar 300 rb |
| B18 | Kontrak kerjamu diperpanjang. Status: tetap kontrak. | Tidak terjadi apa-apa. *Seperti kariermu.* |
| B19 | Air PDAM mati seminggu, beli galon. | Bayar 250 rb |
| B20 | Sekolah daring, tapi nasi kotak MBG tetap dikirim ke sekolah yang kosong. | Terima Rp 15 rb (jatah nasi kotak) |
| B21 | Kenalanmu buka dapur MBG, kamu ikut jadi "vendor". | Terima 1,5 jt. **Simpan kartu ini:** kena denda kalau keluar Headline *Dapur MBG diaudit* (H14) |
| B22 | Kebun sawit masuk ke lahan kampungmu. Ganti rugi: *"nanti dikabari"*. | Bayar 300 rb (ongkos bolak-balik ke kantor desa) |

> **Catatan MBG:** sindiran MBG fokus ke **anggaran, prioritas, dan pengelolaan**. Kasus keracunan siswa **tidak** dijadikan bahan lelucon (§5).

### 9.5 Menjaga Konten Tetap Segar
- Headline dan kartu isu terkini disimpan terpisah di `src/data/isu-terkini.ts` dengan label edisi (mis. `"2026-10"`).
- Edisi baru bisa dirilis tanpa mengubah engine. Kartu edisi lama boleh dipensiunkan atau dipindah ke dek "Klasik".
- Sebelum rilis edisi baru, cek ulang setiap isu ke media arus utama dan pastikan sesuai §5.

---

## 10. Bot

Bot memakai aturan sederhana. Setiap aksi ditampilkan di log supaya pemain bisa mengikuti.

| Situasi | Aturan Bot |
|---|---|
| Beli properti | Beli kalau sisa uang setelah beli ≥ cadangan (Rp 2 jt × IH). Prioritaskan properti yang melengkapi grup |
| Bangun | Kalau punya grup penuh, bangun merata selama uang > cadangan × 1,5 |
| Kasus Mangkrak | Bayar uang damai kalau uang > Rp 5 jt × IH, selain itu coba lempar kembar |
| Kekurangan uang | Urutan: jual bangunan → gadai properti termurah → pinjol |
| Tebus gadai / lunasi pinjol | Kalau uang > cadangan × 2. Pinjol dilunasi lebih dulu (bunganya lebih mahal) |

Bot diberi nama dan kepribadian lucu (kosmetik saja di v1), misalnya *Mas Crypto*, *Bu RT*, *Anak Sultan*, *Ojol Sejati*, *Buzzer 62*.

---

## 11. Rapor Hidup di Konoha (Layar Akhir)

Layar akhir berbentuk kartu yang **mudah di-screenshot** dan dibagikan:

- Peringkat pemain dan Kekayaan Bersih
- Statistik per pemain: total gaji vs total biaya hidup, total pungli 🧾, total bunga pinjol, total pajak, berapa kali masuk Kasus Mangkrak
- IH akhir, misalnya *"Harga naik 61% selama game"*
- **Gelar:**

| Gelar | Syarat |
|---|---|
| 👑 Sultan +62 | Juara |
| 🪦 Rakyat Jelata Abadi | Bangkrut pertama |
| 💸 Korban Pinjol | Bunga pinjol terbesar |
| 🧾 Donatur Tetap Oknum | Pungli terbesar |
| ⚖️ Langganan Pasal Karet | Paling sering masuk Kasus Mangkrak |
| 🏚️ Kaum Mendang-Mending | Tidak pernah membangun apa pun |

---

## 12. UI/UX

### 12.1 Layar
1. **Beranda:** judul, tagline, disclaimer satir, tombol *Main* dan *Cara Main*.
2. **Setup:** atur pemain (nama, warna/bidak, manusia/bot) dan panjang game.
3. **Game:** papan dan panel aksi.
4. **Rapor:** layar akhir (§11).

### 12.2 Layar Game
- **Papan** di tengah. Tiap petak menampilkan strip warna grup, nama, harga/pemilik, dan ikon tingkat bangunan.
- **Tengah papan:** dadu, meter Indeks Harga, ronde/tahun, dan log kejadian terbaru.
- **Panel pemain:** uang, utang pinjol, jumlah properti, status (ditahan/bangkrut).
- **Panel aksi:** Lempar Dadu / Beli / Lewati / Bangun / Gadai / Pinjol / Selesai. Tombol yang tidak bisa dipakai di-disable dengan alasan singkat.
- **Modal kartu:** kartu dibalik dengan animasi, menampilkan teks dan efeknya.
- **Modal slip gaji** saat lewat START.

### 12.3 Mobile
- Papan menyesuaikan lebar layar (zoom/pan kalau perlu).
- Panel aksi jadi *bottom sheet*.
- Target sentuh minimal 44px.

### 12.4 Gaya Visual: **Meme Cerah** ✅ (diputuskan 27 Okt 2026)
Referensi: `mockups/a-meme.html`. Gaya *neo-brutalism* ala stiker WhatsApp/meme Twitter.

| Token | Nilai |
|---|---|
| Latar | Kuning `#ffd23f` dengan pola titik |
| Tinta / garis | Hitam `#111`, garis tebal 2–3px |
| Aksen "panas" | Merah muda `#ff3864` (bahaya, utang, harga naik, +62) |
| Bayangan | Bayangan keras tanpa blur: `5px 5px 0 #111` |
| Font judul | Bungee |
| Font isi | Rubik (400/600/800) |
| Elemen khas | Stiker miring (rotate ±1–5°), badge kapsul |
| Ikon | **SVG custom** (`src/ui/icons.tsx`), viewBox 48, garis tinta 2,5px + warna datar. Tiap kota punya landmark/ciri khas (mis. Sasando–Kupang, Ampera–Palembang, Gedung Sate–Bandung, Istana Garuda–IKN). Tanah & bangunan (🚩 → Warung → Kos → Ruko → Mall) diwarnai sesuai warna pemilik. Emoji hanya untuk bidak pemain & teks |

Warna grup properti: Nusa Tenggara `#9c5b2e`, Maluku–Papua `#3ec5ff`, Sulawesi `#ff6fb5`, Kalimantan `#ff9505`, Sumatra `#f0222f`, Jawa `#ffd60a`, Kawasan Elit `#13c27a`, Pusat Kekuasaan `#6c2bd9`.

### 12.5 Animasi

Animasi harus terasa "meme": membal, sedikit lebay, dan cepat. Tidak boleh memperlambat game: semua animasi bisa dilewati dengan tap/klik, dan pengaturan **Kecepatan Animasi** (Normal / Cepat / Mati) tersedia.

| Momen | Animasi | Durasi |
|---|---|---|
| Lempar dadu | Dadu berguling/berputar, angka berganti cepat, lalu mendarat dengan sedikit membal | ±700 ms |
| Bidak jalan | Bidak **melompat petak demi petak** dengan lengkungan, petak tujuan berdenyut saat bidak mendarat | ±170 ms/petak |
| Uang masuk/keluar | Angka **"+Rp" hijau / "−Rp" merah melayang** dari petak/pemain, saldo menghitung naik/turun | ±900 ms |
| Beli properti | **Stempel "SAH!"** dibanting ke petak, bingkai warna pemilik muncul | ±500 ms |
| Bangun | Ikon bangunan **pop** membal dari bawah | ±400 ms |
| Ambil kartu | Kartu **dibalik 3D** lalu bergoyang seperti stiker ditempel | ±600 ms |
| Gajian | **Slip gaji keluar seperti struk** dicetak, baris muncul satu per satu | ±1 s |
| Pinjol | **Notifikasi HP** meluncur dari atas: *"Pinjaman cair dalam 5 detik!"*, saldo utang naik | ±800 ms |
| Debt collector | Layar bergetar ringan + notifikasi "📞 DC menelepon..." | ±600 ms |
| Tahun baru / inflasi | Banner **"HARGA NAIK X%!"** dibanting ke tengah, papan bergetar, meter IH terisi | ±1,2 s |
| Headline Nasional | **Ticker "BREAKING KONOHA"** di atas papan berganti dengan efek kilat merah | terus berjalan |
| Kasus Mangkrak | Bidak terlempar ke pojok, stempel **"MANGKRAK"** | ±700 ms |
| Ganti giliran | Kartu pemain aktif membal dan bersorot | ±300 ms |
| Bangkrut | Bidak **retak/hancur**, kartu pemain jadi abu-abu dengan stempel "BANGKRUT" | ±1 s |
| Juara / Rapor | Confetti + kartu Rapor muncul satu per satu | ±1,5 s |

**Aturan teknis:**
- Gunakan CSS animation / Web Animations API. Animasi hanya pada `transform` dan `opacity` supaya tetap mulus di HP.
- Hormati `prefers-reduced-motion`: animasi diganti fade singkat atau dimatikan.
- Engine tidak menunggu animasi. UI memutar **antrian event** dari engine (mis. `DICE_ROLLED`, `MOVED`, `PAID`), jadi animasi bisa dipercepat atau dilewati tanpa mengubah hasil game.
- (v1.1) Efek suara: dadu, "kaching", sirene notif pinjol, terompet sedih saat bangkrut.

### 12.6 Simpan Otomatis
State game disimpan ke `localStorage` setiap akhir giliran, jadi game yang terputus bisa dilanjutkan dari beranda.

---

## 13. Arsitektur Teknis

| Bagian | Pilihan |
|---|---|
| Framework | Vite + React + TypeScript (sudah ter-scaffold) |
| Engine game | Modul TypeScript murni, **terpisah dari UI**: `state + action → state baru` (reducer), RNG ber-*seed* |
| Data | Papan, kartu, dan konstanta ekonomi di file data (`src/data/`) agar mudah di-*balance* |
| Simpan | `localStorage` |
| Hosting | Static di Vercel/Netlify, tanpa backend → aman saat viral |
| Tes | Unit test engine (Vitest) |
| Balancing | Script simulasi headless bot vs bot (ribuan game) untuk menyetel angka di §7–§9 |

Engine dibuat murni dan deterministik supaya multiplayer online di v2 tinggal memindahkan reducer yang sama ke server, tanpa menulis ulang aturan.

### Struktur Folder (usulan)
```
src/
  engine/      # aturan game murni (reducer, bot, ekonomi)
  data/        # papan, kartu, konstanta
  ui/          # komponen React
  sim/         # script simulasi balancing
docs/
  PRD.md
```

---

## 14. Roadmap

| Versi | Isi |
|---|---|
| **v1 (MVP)** | Semua di dokumen ini: main lokal 1 perangkat + bot, Rapor, simpan otomatis |
| v1.1 | Tukar properti antar pemain, lelang, efek suara, bagikan Rapor sebagai gambar |
| v2 | Multiplayer online dengan room + kode (server otoritatif, mis. PartyKit/Supabase) dan bot pengisi slot |
| v2.x | Event musiman (musim banjir, Pemilu, Lebaran), kartu tambahan dari komunitas |

## 15. Pertanyaan Terbuka

1. Angka ekonomi (§7) dan efek Headline (§9.3) perlu divalidasi lewat simulasi. Apakah game terlalu kejam atau terlalu mudah?
2. Perlu mode "Hidup Mudah" (tanpa inflasi & tanpa Headline) untuk pemain yang mau main santai?
3. Nama domain/hosting, mis. `juragan62.vercel.app`?
4. Seberapa sering edisi isu terkini diperbarui (bulanan / saat ada isu besar)?

---

## 16. Hasil Simulasi & Penyetelan (27 Okt 2026)

`npm run sim` memainkan ratusan game bot vs bot (4 pemain, 30 ronde).

| Versi aturan | Rata-rata bangkrut | Bangkrut pertama | Pernah pinjol | Catatan |
|---|---|---|---|---|
| Draf awal (bangun wajib grup penuh) | 0 dari 4 | — | 0% | Tanpa fitur tukar, grup penuh hampir tidak pernah terbentuk (0,34 per game), jadi tidak ada yang membangun |
| Bangun bebas sampai Mall | 1,9 dari 4 | ronde 19 | 60% | Bot bisa langsung bangun Mall di ronde 3: terlalu kejam |
| Bangun bebas sampai Kos-kosan | 0,1 dari 4 | ronde 27 | 26% | Terlalu gampang |
| **Bangun bebas sampai Ruko, Mall wajib grup penuh (dipakai)** | **1,4 dari 4** | **ronde 21** | **53%** | 14% game selesai lebih cepat karena tinggal 1 pemain |

Semua angka ada di `src/data/economy.ts`.

---

## 17. Perubahan v0.4 (27 Okt 2026, dari feedback main-tes)

| Perubahan | Detail |
|---|---|
| Putaran pertama | Belum boleh beli sampai lewat START sekali |
| Beli tanah dulu | Mendarat → beli tanah 🚩. Bangunan hanya dibangun saat **melewati** START, pilih tanahnya sendiri (maks 2 tingkat/tanah) |
| Berhenti pas di START | **Tidak gajian** ("gaji ditahan HRD"). Gajian hanya kalau melewati START |
| Giliran selesai otomatis | Kalau tidak ada lagi yang bisa dilakukan (tidak ada dadu kembar, uang tidak minus, tidak ada yang bisa dibangun) |
| Onboarding | Saat pertama dibuka: isi nama & pilih bidak (18 pilihan). Panduan singkat muncul di game pertama dan bisa dibuka lagi lewat tombol ❓ |
| Tampilan | Bidak di papan lebih besar; ikon 🚩 untuk tanah; kejadian terbaru di log disorot |
| Kecepatan | Animasi "Normal" diperlambat ±1,5×, jeda bot & tampilan kartu diperpanjang |
| Ekonomi | Sewa dasar 12%, pengali bangunan 5×/15×/40×/60×, biaya hidup Rp 2,7 jt |

Simulasi 500 game (4 bot, 30 ronde) dengan aturan v0.4: rata-rata **0,6 dari 4** pemain bangkrut, bangkrut pertama sekitar ronde 25, 34% pemain sempat pinjol. Mode 40 ronde terasa lebih "kejam" (±1,3 bangkrut).

---

## 18. Fitur v0.5 (27 Okt 2026)

### 18.1 Karakter
Dipilih per pemain di Setup / lobby online. Angka ada di `src/data/characters.ts`.

| Karakter | Kelebihan | Kekurangan |
|---|---|---|
| 🧍 Rakyat Jelata | Biaya hidup 90% ("sudah biasa susah") | Tidak punya orang dalam |
| 👑 Anak Sultan | Modal awal 1,6× | Biaya hidup 1,5× |
| 🧕 Bu RT | Kebal pungli & parkir liar | — ("Bu RT selalu menang") |
| 🏍️ Ojol Sejati | Tiap jalan +1 petak | Status mitra: UMR 90% |
| 🤳 Buzzer 62 | Kebal Pasal Karet; dibayar Rp 300 rb tiap Kartu Viral keluar | UMR 70% |
| 🪙 Mas Crypto | Tiap tahun baru uang tunai +30% s.d. −20% | Bisa kena rug pull |
| 🧑‍💼 PNS | UMR 1,1× & kebal PHK | Iuran Tabungan Rumah 2× |

Simulasi 1.500 game dengan karakter acak: peluang menang tiap karakter 18–31% (adil = 25%). Anak Sultan sedikit unggul, sengaja dibiarkan (realistis).

### 18.2 Pemilu
Tiap 4 tahun (tahun ke-4, 8, ...): semua pemain dapat **serangan fajar + bansos Rp 1 jt × IH**, lalu harga naik 5%.

### 18.3 Tukar Tanah
- Di giliran sendiri, pemain bisa menawarkan tukar tanah dan/atau uang ke pemain lain (tombol 🤝).
- Tanah yang ada bangunannya, atau grupnya punya Mall, tidak bisa ditukar.
- Bot menerima kalau untung (≥1,1× nilai, minta lebih kalau tawaran itu melengkapi grup lawan atau membongkar grupnya sendiri). Bot juga aktif menawar tanah terakhir yang melengkapi grupnya (1,6× harga).
- Main 1 HP: penerima diminta "oper HP" lalu pilih Deal / Ogah.

### 18.4 Efek Suara
Disintesis dengan Web Audio (tanpa file): dadu, langkah, koin, bayar, stempel, kartu, notifikasi pinjol, alarm tahun baru, fanfare Pemilu/juara, terompet sedih saat bangkrut. Bisa dimatikan (🔊/🔇).

### 18.5 Bagikan Rapor
Tombol 📸 di layar Rapor menggambar kartu rapor (PNG 1080px) lalu membuka menu share HP, atau mengunduh gambarnya di desktop.

### 18.6 Main Online (Room)
- **Peer-to-peer lewat PeerJS** (server sinyal publik PeerJS + STUN). Tidak perlu backend sendiri, jadi tetap gratis & tidak tumbang saat viral.
- Host membuat room → dapat **kode 5 huruf** + link `?room=KODE`. Teman gabung pakai kode/link. Maks 6 kursi, host bisa menambah bot.
- **Host menjalankan engine** dan mengirim `state + events` ke semua tamu; tiap perangkat memutar animasinya sendiri. Tamu hanya mengirim aksi.
- Tamu keluar di tengah game → kursinya diganti bot. Host keluar → room bubar.
- Keterbatasan: beberapa jaringan (NAT ketat / jaringan kantor) bisa gagal tersambung karena belum ada server TURN. Game online tidak disimpan (tidak bisa dilanjutkan).

### 18.7 Ekonomi setelah v0.5
Simulasi 500 game (4 bot, 30 ronde, karakter campur): rata-rata 0,65 dari 4 pemain bangkrut, bangkrut pertama sekitar ronde 25, 35% pemain sempat pinjol.

---

## 19. Perubahan v0.6 (28 Okt 2026)

### 19.1 Aturan
| Perubahan | Detail |
|---|---|
| Bangun cuma 1 tanah | Tiap lewat START, pemain memilih **satu** tanah; tanah itu boleh naik sampai **2 tingkat**. Aturan "bangun merata" dihapus |
| Gajian selalu dapat uang | Potongan (biaya hidup + cicilan pinjol) dibatasi; sisa gaji minimal **25%** (Rakyat Jelata 35%, Anak Sultan 10%). Sisa cicilan tetap jadi utang. PHK (H7) = gaji cuma cair setengah |
| Karakter | Kelebihan Rakyat Jelata & kekurangan Anak Sultan sekarang lewat "sisa gaji minimal". PNS: gaji 1,2× |
| Ekonomi | Sewa dasar 15%, pengali bangunan 6×/18×/45×/70× |

### 19.2 Dadu di atas papan
Dua dadu besar ber-pip (titik 1 & 4 merah seperti dadu tradisional) dilempar dari pojok papan, berguling, mendarat di tengah, lalu muncul total "a + b = n". Dadu kecil + total juga tampil di kotak ronde.

### 19.3 Satir tambahan (edisi Okt 2026)
Sesuai §5: isunya yang disindir, tokoh tidak disebut nama ("Presiden Konoha" fiktif).

| Isu | Isi |
|---|---|
| **Kota Solo** | Petak baru grup Jawa (Rp 3,2 jt) menggantikan satu Kartu Bansos; satu Kartu Viral diganti Bansos. **"Kota Dinasti"**: sewa 2× kalau pemiliknya juga punya Jakarta SCBD/IKN |
| **Sel tahanan mewah** | Di Kasus Mangkrak, opsi **🛋️ Betah di sel mewah** (Rp 600 rb × IH, maks 3×): tetap ditahan (aman dari sewa lawan) tapi sewa tanahnya tetap masuk. Gelar Rapor **🛋️ Napi Sultan** |
| Korupsi | H15 *Korupsi berjamaah, anggaran bocor*: pajak & pungli 2×. V22 menang tender karena kenal orang → terima Rp 2 jt lalu kena OTT. B23 dana desa dikorupsi oknum. B25 om napi korupsi minta kasur buat sel mewah |
| Koruptor dapat remisi | H17: "hukum tumpul ke atas", pemain dengan uang ≥ Rp 20 jt × IH kebal Pasal Karet; sel mewah diskon 50% |
| Pungli ormas | H19 ormas minta "THR": Rp 100 rb per tanah. B24 ormas segel usahamu: Rp 200 rb per tanah. Bu RT tetap kebal |
| Ijazah | H18 polemik ijazah ramai lagi: kartu Viral yang memberi uang cair 2×. V23 ijazahmu diragukan warganet: bayar Rp 1 jt pengacara & legalisir |
| Presiden asbun | H16 Presiden Konoha pidato "harga-harga turun kok": Indeks Harga malah naik 3%. V24 video reaksimu atas pidato asal bunyi FYP: terima Rp 700 rb |

### 19.4 Simulasi v0.6
500 game (4 bot, 30 ronde): rata-rata **1,0 dari 4** pemain bangkrut, bangkrut pertama sekitar ronde 23, 29% pemain sempat pinjol. Peluang menang per karakter 19–32% (adil = 25%).

---

## 20. Perubahan v0.7 (28 Okt 2026)

| Fitur | Detail |
|---|---|
| Tampilan HP | Di layar ≤ 640px papan pas selebar layar: petak hanya ikon + bingkai warna pemilik (tap untuk detail), tengah papan diringkas, kartu pemain jadi strip geser horizontal, slip gaji disembunyikan, tombol aksi menempel di bawah |
| Tombol 🤝 Tawar | Muncul saat uang kurang **atau** saat kurang 1 tanah untuk grup penuh (dan tanah itu milik pemain lain) |
| Lelang | Tanah yang tidak jadi dibeli dilelang ke pemain lain (yang menolak tidak ikut). Tawaran awal 30% harga, kenaikan 10% harga; giliran berputar sampai tinggal satu penawar. Gelar/pencapaian "Raja Lelang" |
| Durasi | Default tetap 30 ronde (20 ronde terlalu pendek: hampir tidak ada yang bangkrut). Giliran bot diputar ±2× lebih cepat; Setup menampilkan perkiraan durasi |
| Bot lebih pintar | Ikut lelang (nilai lebih tinggi kalau melengkapi grup); membangun dengan cadangan uang sesuai ancaman sewa terbesar lawan; cari dana dengan urutan gadai tanah lepas → pinjol kecil → jual bangunan → gadai sisanya → pinjol sisa |
| Tutorial | 5 langkah sorotan interaktif di game pertama (bisa dilewati); panduan teks tetap di tombol ❓ |
| Saldo bergerak | Uang di kartu pemain menghitung naik/turun saat uang melayang, bukan setelah animasi selesai |
| Musik | Loop koplo 8-bit sintetis (tombol 🎵, default mati) |
| Online | Sambung ulang otomatis (5× percobaan) + ambil kursi lama kalau tab ketutup (kunci kursi); host menyimpan game & bisa **Lanjutkan room tersimpan** dengan kode baru; server TURN opsional via env; **reaksi emoji** antar pemain |
| Edisi | Pilihan edisi kartu di Setup: Isu terkini / Klasik (tanpa Headline). Proses edisi bulanan di README |
| Pencapaian | 15 pencapaian + statistik lintas game (localStorage), layar 🏆 di Beranda, pencapaian baru tampil di Rapor |

Simulasi v0.7 (500 game, 4 bot, 30 ronde): rata-rata 0,7 dari 4 bangkrut, bangkrut pertama sekitar ronde 23; menang per karakter 17–30%.

---

## 21. Perubahan v0.8 (28 Okt 2026, feedback main-tes #3)

### 21.1 Gajian lebih terasa
Feedback: "baru beberapa putaran sudah minus". UMR naik **Rp 3 jt → Rp 5 jt**, biaya hidup Rp 2,5 jt, sisa gaji minimal **50%** (Rakyat Jelata 60%, Bu RT 55%, Anak Sultan 30%). Gaji bersih rata-rata per lewat START naik dari ±Rp 750 rb jadi **±Rp 2,9 jt**. Simulasi: tidak ada pemain berutang di ronde 10; rata-rata 0,9 dari 4 bangkrut di akhir 30 ronde; menang per karakter 20–31%.

### 21.2 Animasi lebih pelan
Kecepatan "Normal" diperlambat (±2× dari dasar; sebelumnya 1,5×), bidak melompat ±0,5 detik per petak, giliran bot cuma sedikit lebih cepat (0,75×), jeda bot 1,2 detik, kartu bot tampil ±4 detik.

### 21.3 Adegan khas tiap petak
Setiap bidak berhenti, muncul kartu adegan ±3 detik (tap untuk lewati) di tengah papan: ikon petak beranimasi + "aktor" emoji (jalan, berlayar, melayang, hujan, oper mahkota, dll.) + satu kalimat satir, kadang balon kata. Data di `src/ui/scenes.ts`. Contoh:

| Petak | Adegan |
|---|---|
| Solo | Bapak mengoper 👑 ke anak, balon kata *"Estafet kepemimpinan 🙏"* |
| IKN | Daun kering 🍂 lewat di kota sepi, podium 🎤 *"Saya akan lawan!"* |
| Jakarta SCBD | Pegawai 💼 lari, *"Ekonomi kita kuat!" 📈* |
| Stasiun KRL | Penumpang berdesakan, *"Geser dikit, Bu! 😤"* |
| Pungli Kelurahan | Tangan minta amplop, *"Uang rokoknya, Pak? 😏"* |
| Semarang | Hantu Lawang Sewu: *"Seribu pintu, tidak satu pun pintu lowongan kerja"* |
| Surabaya | 🦈 vs 🐊 (Suro & Boyo) rebutan lahan |
| Pontianak | Kulminasi: *"bayanganmu hilang, kayak gajimu"* |

Sesuai §5, adegan tidak memakai nama/wajah tokoh asli; balon kata berupa slogan umum.

---

## 22. Lempar Dadu Urutan Main (v0.9, 28 Okt 2026)

- Di awal game, tiap pemain melempar 2 dadu sesuai urutan duduk. **Total tertinggi jalan duluan**, lalu urut ke bawah. Seri: dadu tunggal tertinggi menang, kalau masih seri yang melempar duluan.
- Urutan dipakai sepanjang game (`turnOrder`). Kartu pemain di panel diurutkan sesuai giliran dan diberi nomor #1, #2, ...
- **Online: selalu aktif.** Main di 1 HP: pilihan di Setup ("Lempar dadu" / "Urut daftar"), default lempar dadu.

## 23. Penyimpanan Data

Game **tidak memakai database/server data**:

| Data | Disimpan di |
|---|---|
| Game lokal (lanjutkan), profil, pengaturan, statistik & pencapaian | `localStorage` browser masing-masing perangkat |
| Game online | Di browser **host** (state + simpan otomatis di `localStorage` host). Tamu hanya menerima salinan |
| Sinyal koneksi online | Server publik PeerJS, hanya untuk mempertemukan perangkat; isi game tidak lewat/disimpan di sana |

Konsekuensi: data hilang kalau data browser dihapus, tidak pindah antar perangkat, belum ada leaderboard global, dan room online bergantung pada perangkat host. Kalau fitur itu dibutuhkan, tambahkan backend (mis. Supabase/Firebase) untuk akun, sinkron statistik, leaderboard, dan room yang tidak bergantung host.

---

## 24. Papan 48 Petak: Mini-game & Petak Aksi (v1.0, 28 Okt 2026)

Papan diperbesar dari 40 jadi **48 petak (13×13)** supaya 8 petak baru masuk tanpa membuang kota. Petak pilihan berwarna ungu; tiap petak punya ID (`src/data/board.ts`) yang dipakai ikon & adegan.

| Petak | Jenis | Mekanik |
|---|---|---|
| 🎰 Slot Judol | Mini-game | Pasang Rp 500 rb / 1 jt / 2 jt × IH atau tolak. Menang 27% (+taruhan), jackpot 3% (+9× taruhan), sisanya kalah. Rata-rata rugi (bandar selalu untung). Animasi 3 gulungan slot |
| 🌶️ Tebak Harga Cabai | Mini-game | Tebak naik/turun. Harga naik 70% dari waktu. Benar +Rp 500 rb, salah −Rp 300 rb |
| 📈 Investasi Bodong | Mini-game | Tanam Rp 1 jt / 3 jt atau tolak. 35% cuan 2×, 15% untung ½, 50% owner kabur |
| 🚓 Operasi Zebra | Aksi | Tilang resmi Rp 400 rb, atau "damai" Rp 150 rb tapi 35% ketahuan → Kasus Mangkrak (Bu RT tidak pernah ketahuan). Wajib bayar walau uang minus |
| 🕳️ Jalan Rusak | Aksi | Tambal Rp 200 rb, tunggu (lewati giliran), atau viralkan (40% dapat Rp 600 rb, 60% tetap lewati giliran) |
| 🏛️ Antre Samsat | Aksi | Antre (lewati giliran) atau calo Rp 400 rb |
| 🪧 Baliho Kampanye | Aksi | Bayar Rp 500 rb per baliho; tiap Pemilu dapat "dana kampanye" Rp 1,5 jt × IH per baliho |
| 🌊 Banjir | Otomatis | Grup warna terdekat di depannya terendam: sewa nol sampai ronde berikutnya (animasi air di petak) |

Semua nominal × Indeks Harga. Setiap petak baru punya ikon SVG & adegan mendarat. Pencapaian baru: **🎰 Korban Judol**, **🏃 Investor Tertipu**.

Penyetelan setelah papan 48 petak: sewa dasar **18%**, bangunan **9×/27×/65×/100×**. Simulasi 400 game: rata-rata 0,67 dari 4 bangkrut, gaji bersih ±Rp 2,9 jt per lewat START, menang per karakter 20–33%.

---

## Lampiran A: Sumber Isu Terkini (dicek 27 Okt 2026)

Dipakai untuk §9.3–9.4. Cek ulang sebelum rilis.

- [Wikipedia: Unjuk rasa Oktober 2026 di Indonesia](https://id.wikipedia.org/wiki/Unjuk_rasa_Oktober_2026_di_Indonesia): krisis BBM, listrik & air, UU Ketenagakerjaan, IHSG/MSCI, rupiah ±18.049, karhutla, MBG, Kopdes, pendataan desil
- [Tempo: Beragam kontroversi kebijakan](https://www.tempo.co/foto/arsip/beragam-kontroversi-kebijakan-pemerintahan-prabowo-2269520): MBG, Koperasi Desa, rumah subsidi 18 m², sawit
- [Magdalene: Kontroversi Januari 2026](https://magdalene.co/story/kontroversi-pemerintah-januari-2026/): prioritas anggaran MBG vs lapangan kerja
- [Daeng Battala](https://daengbattala.com/2026/05/25/mbg-mas-bahlil-ganteng-anatomi-viralitas-kritik-sosial-dan-krisis-kepercayaan-publik/): penangkapan terkait meme AI, UU ITE
- [IDN Times](https://www.idntimes.com/news/indonesia/usai-viral-dua-anak-menhaj-mundur-sebagai-tenaga-ahli-di-kemenhaj-00-rgfwk-f8q12l): isu nepotisme "tenaga ahli" (Okt 2026)
- [Progres.id: viral sepekan 5–11 Okt 2026](https://progres.id/viral/rangkuman-berita-indonesia-viral-sepekan-5-11-oktober-2026-dari-agenda-prabowo-hingga-isu-yang-ramai-di-media-sosial.html): daya beli melemah, risiko gagal bayar pinjol, PHK
- [Kabar24 Bisnis](https://kabar24.bisnis.com/read/20260609/15/1979637/ini-respons-jusuf-kalla-soal-pelemahan-rupiah-hingga-mbg): rupiah menyentuh Rp 18.000 (Jun 2026)
- [BAK UNAS: PHK 2026](https://bak.unas.ac.id/2026/05/21/phk-naik-84-ini-10-provinsi-dengan-angka-phk-tertinggi-di-indonesia-2026/): angka PHK naik
- [KalderaNews](https://www.kalderanews.com/2026/03/sekolah-bakal-online-vs-mbg-tetap-jalan-akademisi-sebut-kebijakan-tambal-sulam/): sekolah daring vs MBG tetap jalan
