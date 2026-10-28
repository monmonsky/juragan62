// Adegan singkat saat bidak berhenti di tiap petak (PRD §21).
// Satir tanpa nama/wajah tokoh asli (PRD §5). Aktor = emoji + kelas animasi CSS.

export type Anim = 'walk' | 'walkBack' | 'float' | 'bounce' | 'shake' | 'spin' | 'rise' | 'drop' | 'flicker' | 'sail' | 'zoom' | 'swing' | 'pass' | 'rain' | 'bob' | 'dash'

// [emoji, animasi, x %, y %, jeda detik?, ukuran em?]
export type Actor = [string, Anim, number, number, number?, number?]

export interface Scene {
  line: string
  icon?: Anim
  bubble?: string
  actors: Actor[]
}

const viral: Scene = {
  line: 'Siap-siap... notifikasimu bakal meledak.',
  icon: 'shake',
  actors: [['🔥', 'float', 70, 40], ['💬', 'float', 20, 45, 0.4], ['❤️', 'float', 78, 60, 0.8], ['🔁', 'float', 15, 65, 1.1]],
}
const bansos: Scene = {
  line: 'Antre bansos dulu. Semoga namamu ada di daftar.',
  icon: 'bounce',
  actors: [['🍚', 'drop', 22, 10], ['🍚', 'drop', 72, 10, 0.4], ['🙌', 'bob', 48, 72, 0.2], ['🧍', 'bob', 12, 70, 0.5], ['🧍', 'bob', 84, 70, 0.7]],
}

export const SCENES: Record<string, Scene> = {
  jalan: { line: 'Lubang sedalam janji kampanye.', icon: 'shake', bubble: 'DUAK! 😵', actors: [['🛵', 'walk', 0, 60], ['💥', 'zoom', 46, 55, 1.1], ['🦺', 'bob', 84, 66, 0.6]] },
  cabai: { line: 'Harga cabai: naik atau... naik?', actors: [['🌶️', 'bounce', 22, 62], ['📈', 'zoom', 76, 30, 0.4], ['🌶️', 'float', 60, 60, 0.7]] },
  zebra: { line: 'Operasi Zebra! Surat-surat lengkap?', bubble: 'Selamat siang, Pak 👮', actors: [['👮', 'walk', 0, 62], ['🚓', 'bob', 82, 64, 0.3], ['📄', 'shake', 20, 25, 0.6]] },
  judol: { line: 'Klik sekali, rumah melayang. Bandar selalu menang.', icon: 'shake', actors: [['🎰', 'bounce', 20, 62], ['💸', 'float', 76, 55, 0.3], ['💸', 'float', 60, 60, 0.7], ['🤑', 'bob', 84, 25, 0.5]] },
  investasi: { line: '"Pasti cuan 30% per bulan, Kak!"', bubble: 'Join grup VIP? 🚀', actors: [['🚀', 'rise', 30, 70], ['🏃', 'dash', 0, 72, 0.8], ['💰', 'bob', 80, 30, 0.4]] },
  samsat: { line: 'Antre dari subuh. Calo cuma 5 menit.', bubble: 'Nomor antrean A-999 📢', actors: [['🧍', 'bob', 12, 66], ['🧍‍♂️', 'bob', 26, 66, 0.2], ['🧍‍♀️', 'bob', 40, 66, 0.4], ['🕴️', 'bounce', 84, 60, 0.6]] },
  banjir: { line: 'Banjir lagi. Katanya sudah dinormalisasi.', icon: 'bounce', actors: [['🌊', 'bob', 15, 78], ['🌊', 'bob', 80, 78, 0.3], ['🛶', 'sail', 0, 60, 0.4], ['☔', 'rain', 50, 0]] },
  baliho: { line: 'Baliho di tiap tiang. Janjinya belum terpasang.', bubble: '"Bersama Rakyat!" 📣', actors: [['📣', 'shake', 20, 30], ['🪧', 'bounce', 80, 62, 0.4], ['😐', 'bob', 18, 70, 0.6]] },
  start: { line: 'Gajian! ...langsung habis buat cicilan & biaya hidup.', icon: 'bounce', actors: [['💸', 'float', 25, 55], ['💸', 'float', 70, 55, 0.4], ['🧾', 'drop', 48, 5, 0.6], ['🥳', 'bob', 82, 25, 0.2]] },
  kupang: { line: 'Petik sasando, lupakan sejenak harga beras.', icon: 'swing', actors: [['🎵', 'float', 22, 50], ['🎶', 'float', 72, 45, 0.5], ['🎵', 'float', 50, 35, 1]] },
  labuanbajo: { line: 'Wisata premium. Komodonya juga harga premium.', actors: [['🦎', 'walk', 0, 72], ['🛥️', 'sail', 0, 30, 0.3], ['📸', 'bounce', 82, 18, 0.6]] },
  bansos: bansos,
  ambon: { line: 'Ambon manise. Gong perdamaian berbunyi... GOOONG.', icon: 'shake', actors: [['🕊️', 'float', 22, 50, 0.3], ['🕊️', 'float', 74, 55, 0.7], ['〰️', 'zoom', 50, 18]] },
  pelabuhan: { line: 'Kapal bersandar. Peti kemasnya... nunggu dulu.', bubble: 'TUUUUT!', actors: [['🚢', 'sail', 0, 40], ['📦', 'bob', 14, 72, 0.3], ['📦', 'bob', 80, 72, 0.6]] },
  ternate: { line: 'Gamalama batuk-batuk. Harga tiket ikut naik.', icon: 'shake', actors: [['💨', 'rise', 40, 30], ['💨', 'rise', 58, 30, 0.5], ['🔥', 'flicker', 50, 18, 0.2]] },
  pungli: { line: 'Mau urus surat? Ada "biaya administrasi".', bubble: 'Uang rokoknya, Pak? 😏', actors: [['🤚', 'swing', 78, 55], ['✉️', 'pass', 20, 60, 0.4], ['🚬', 'bounce', 85, 20, 0.8]] },
  jayapura: { line: 'Jembatan merah di ujung timur. Indah, mahal ke sananya.', actors: [['🌅', 'rise', 50, 20], ['🛶', 'sail', 0, 72, 0.3]] },
  viral: viral,
  mangkrak: { line: 'Kasusnya... masih diproses. Sejak lama.', icon: 'swing', bubble: 'Sedang didalami 🧐', actors: [['🕷️', 'drop', 78, 5], ['💨', 'rise', 30, 70, 0.4], ['⏳', 'spin', 18, 25, 0.2]] },
  palu: { line: 'Kaledo hangat. Dompet tinggal tulangnya.', actors: [['♨️', 'rise', 40, 30], ['♨️', 'rise', 60, 30, 0.6], ['🦴', 'bob', 80, 65, 0.3]] },
  pln: { line: 'Listrik byar-pet. Penjual lilin panen.', icon: 'flicker', actors: [['💡', 'flicker', 22, 30], ['🕯️', 'zoom', 76, 60, 0.6], ['😩', 'bob', 20, 70, 0.9]] },
  kendari: { line: 'Masjid di atas laut. Tenangnya bikin lupa cicilan.', actors: [['🌊', 'bob', 15, 75], ['🌊', 'bob', 80, 75, 0.4], ['🐟', 'walk', 0, 60, 0.6]] },
  makassar: { line: 'Pinisi berlayar. Coto Makassar menunggu di dermaga.', actors: [['⛵', 'sail', 0, 40], ['🐟', 'bob', 20, 74, 0.4], ['🍲', 'bounce', 82, 70, 0.7]] },
  krl: { line: 'KRL jam pulang kerja: kaki tidak napak.', bubble: 'Geser dikit, Bu! 😤', actors: [['🧍', 'bob', 12, 65], ['🧍‍♀️', 'bob', 28, 68, 0.15], ['🧍', 'bob', 70, 66, 0.3], ['🧍‍♀️', 'bob', 86, 64, 0.45], ['🚆', 'walk', 0, 25, 0.2]] },
  pontianak: { line: 'Kulminasi: bayanganmu hilang. Kayak gajimu.', actors: [['☀️', 'drop', 50, 0], ['🧍', 'bob', 22, 68, 0.5], ['🕶️', 'bounce', 78, 30, 0.8]] },
  banjarmasin: { line: 'Pasar terapung: nawar sambil goyang.', actors: [['🛶', 'bob', 20, 66], ['🍊', 'bob', 48, 62, 0.3], ['🍌', 'bob', 72, 64, 0.6], ['🍍', 'bob', 86, 60, 0.9]] },
  balikpapan: { line: 'Kota minyak. Bensinnya tetap mahal.', icon: 'bounce', actors: [['🔥', 'flicker', 78, 15], ['🛢️', 'bob', 18, 68, 0.3], ['💰', 'float', 50, 45, 0.6]] },
  parkir: { line: 'Cuma lewat juga bayar.', bubble: 'PRIIIT! Kiri, kiri... 🦺', actors: [['🦺', 'walk', 0, 62], ['🗣️', 'shake', 78, 22, 0.4], ['🛵', 'bob', 84, 70, 0.6]] },
  padang: { line: 'Rendang juara dunia. Harga dagingnya juga juara.', actors: [['🍛', 'zoom', 22, 62], ['♨️', 'rise', 24, 35, 0.4], ['🌶️', 'spin', 80, 30, 0.6]] },
  palembang: { line: 'Pempek & Ampera. Cukonya pedas, harganya juga.', actors: [['🍤', 'bob', 18, 70], ['🐟', 'walk', 0, 82, 0.3], ['🌶️', 'bounce', 82, 25, 0.6]] },
  medan: { line: 'Durian Medan: wanginya sampai Jakarta.', icon: 'shake', actors: [['💨', 'rise', 30, 40], ['🤢', 'bob', 80, 60, 0.4], ['😍', 'bob', 15, 62, 0.7]] },
  keretacepat: { line: 'WHOOSH! Sampai cepat, cicilan utangnya lama.', actors: [['🚄', 'dash', 0, 40], ['💸', 'float', 30, 60, 0.4], ['💸', 'float', 70, 60, 0.7]] },
  ppn: { line: 'PPN 12%: beli permen pun ikut menyumbang negara.', actors: [['🧾', 'drop', 25, 5], ['🧾', 'drop', 70, 5, 0.4], ['🍬', 'bounce', 50, 70, 0.6]] },
  semarang: { line: 'Seribu pintu, tidak satu pun pintu lowongan kerja.', actors: [['👻', 'float', 20, 55], ['👻', 'float', 75, 50, 0.6], ['🦇', 'swing', 50, 15, 0.3]] },
  yogyakarta: { line: 'UMR paling mepet, kenangannya paling mahal.', actors: [['🐴', 'walk', 0, 66], ['🍛', 'bob', 82, 28, 0.4], ['💔', 'float', 22, 45, 0.7]] },
  pdam: { line: 'Keran dibuka... setetes. Tagihan tetap mengalir.', icon: 'flicker', actors: [['💧', 'drop', 60, 30], ['🪣', 'bob', 58, 72, 0.2], ['😑', 'bob', 18, 60, 0.6]] },
  pasalkaret: { line: 'Salah ketik sedikit, langsung kena pasal.', icon: 'swing', bubble: 'Pasal yang mana? Nanti kami cari 👮', actors: [['👮', 'walk', 0, 66], ['🔨', 'swing', 80, 25, 0.3], ['📱', 'shake', 22, 28, 0.5]] },
  surabaya: { line: 'Suro vs Boyo: rebutan lahan sejak dulu kala.', actors: [['🦈', 'shake', 18, 55], ['🐊', 'shake', 72, 55, 0.2], ['💥', 'zoom', 46, 30, 0.5]] },
  solo: { line: 'Solo: kota asal... ya, kamu tahu sendiri.', bubble: 'Estafet kepemimpinan 🙏', actors: [['👨‍🦳', 'bob', 14, 62], ['👑', 'pass', 30, 40, 0.3], ['🧒', 'bob', 80, 62, 0.6]] },
  bandung: { line: 'Bandung: macet, hujan, tetap romantis.', actors: [['🍢', 'spin', 20, 60], ['💧', 'rain', 40, 0], ['💧', 'rain', 62, 0, 0.3], ['💧', 'rain', 84, 0, 0.6], ['☂️', 'bob', 78, 64, 0.4]] },
  canggu: { line: 'Bule kerja remote, warga lokal jadi tamu.', actors: [['🏄', 'sail', 0, 45], ['🌊', 'bob', 50, 75, 0.2], ['🍹', 'bounce', 85, 20, 0.6]] },
  bandara: { line: 'Tiket domestik: lebih mahal daripada ke luar negeri.', actors: [['✈️', 'dash', 0, 35], ['🧳', 'bob', 20, 70, 0.4], ['😵', 'bob', 80, 66, 0.7]] },
  bsd: { line: 'Startup bakar uang, kopi susu 60 ribu.', actors: [['☕', 'bob', 18, 66], ['💻', 'bob', 48, 70, 0.3], ['🔥', 'flicker', 80, 30, 0.6]] },
  scbd: { line: 'Kerja di gedung kaca, gaji tetap pas-pasan.', bubble: '"Ekonomi kita kuat!" 📈', actors: [['💼', 'dash', 0, 66], ['💼', 'dash', 0, 78, 0.4], ['💸', 'float', 78, 45, 0.6]] },
  iuran: { line: 'Iuran rumah tiap bulan. Rumahnya kapan-kapan.', icon: 'flicker', actors: [['❓', 'zoom', 76, 22], ['🧍', 'bob', 20, 66, 0.4], ['💸', 'float', 50, 55, 0.7]] },
  ikn: { line: 'Kota megah, penghuninya... angin.', bubble: '🎤 "Saya akan lawan!"', actors: [['🍂', 'walk', 0, 76], ['🍂', 'walk', 0, 66, 0.8], ['🎤', 'bounce', 82, 30, 0.3]] },
}
