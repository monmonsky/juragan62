// Data papan + state contoh untuk mockup statis (lihat docs/PRD.md §8).
// Gaya visual diatur CSS di halaman mockup; animasi demo ada di a-anim.js.

const IH = 1.37;

// Harga dasar dalam ribu rupiah.
const BOARD = [
  { name: 'START', sub: 'Gajian', type: 'corner', icon: '💰' },
  { name: 'Kupang', type: 'prop', group: 'ntt', price: 500 },
  { name: 'Labuan Bajo', type: 'prop', group: 'ntt', price: 900 },
  { name: 'Kartu Bansos', type: 'card', icon: '🍚' },
  { name: 'Ambon', type: 'prop', group: 'maluku', price: 1100 },
  { name: 'Pelabuhan', type: 'transport', icon: '⚓', price: 2000 },
  { name: 'Ternate', type: 'prop', group: 'maluku', price: 1100 },
  { name: 'Pungli Kelurahan', type: 'tax', icon: '🧾', fee: 200 },
  { name: 'Jayapura', type: 'prop', group: 'maluku', price: 1300 },
  { name: 'Kartu Viral', type: 'card', icon: '📱' },
  { name: 'Kasus Mangkrak', sub: 'cuma mampir', type: 'corner', icon: '🗂️' },
  { name: 'Palu', type: 'prop', group: 'sulawesi', price: 1500 },
  { name: 'PLN', type: 'utility', icon: '⚡', price: 1500 },
  { name: 'Kendari', type: 'prop', group: 'sulawesi', price: 1500 },
  { name: 'Makassar', type: 'prop', group: 'sulawesi', price: 1800 },
  { name: 'Stasiun KRL', type: 'transport', icon: '🚆', price: 2000 },
  { name: 'Kartu Viral', type: 'card', icon: '📱' },
  { name: 'Pontianak', type: 'prop', group: 'kalimantan', price: 1900 },
  { name: 'Banjarmasin', type: 'prop', group: 'kalimantan', price: 2000 },
  { name: 'Balikpapan', type: 'prop', group: 'kalimantan', price: 2300 },
  { name: 'Parkir Liar', sub: 'prit! bayar', type: 'corner', icon: '🅿️' },
  { name: 'Padang', type: 'prop', group: 'sumatra', price: 2400 },
  { name: 'Kartu Viral', type: 'card', icon: '📱' },
  { name: 'Palembang', type: 'prop', group: 'sumatra', price: 2500 },
  { name: 'Medan', type: 'prop', group: 'sumatra', price: 2700 },
  { name: 'Kereta Cepat', type: 'transport', icon: '🚄', price: 2000 },
  { name: 'PPN 12%', type: 'tax', icon: '💸', note: '12% uang' },
  { name: 'Semarang', type: 'prop', group: 'jawa', price: 2800 },
  { name: 'Yogyakarta', type: 'prop', group: 'jawa', price: 3000 },
  { name: 'PDAM', type: 'utility', icon: '🚰', price: 1500 },
  { name: 'Kena Pasal Karet', sub: 'masuk mangkrak', type: 'corner', icon: '⚖️' },
  { name: 'Surabaya', type: 'prop', group: 'jawa', price: 3100 },
  { name: 'Kartu Bansos', type: 'card', icon: '🍚' },
  { name: 'Bandung', type: 'prop', group: 'elit', price: 3300 },
  { name: 'Canggu', type: 'prop', group: 'elit', price: 3500 },
  { name: 'Bandara', type: 'transport', icon: '✈️', price: 2000 },
  { name: 'BSD', type: 'prop', group: 'elit', price: 3600 },
  { name: 'Jakarta SCBD', type: 'prop', group: 'pusat', price: 4200 },
  { name: 'Iuran Tabungan Rumah', type: 'tax', icon: '🏠', fee: 750 },
  { name: 'IKN Nusantara', type: 'prop', group: 'pusat', price: 5000 },
];

const PLAYERS = [
  { id: 'kamu', name: 'Kamu', token: '🛵', color: '#e63946', cash: 4200, debt: 3500, pos: 14, owns: { 11: 1, 13: 1, 14: 2, 5: 0 } },
  { id: 'crypto', name: 'Mas Crypto', token: '🪙', color: '#1d6fd8', cash: 1100, debt: 8200, pos: 22, owns: { 25: 0, 39: 0, 21: 0 }, mortgaged: [39] },
  { id: 'burt', name: 'Bu RT', token: '🧕', color: '#2a9d4b', cash: 9800, debt: 0, pos: 10, jailed: true, owns: { 27: 2, 28: 3, 31: 2, 12: 0 } },
  { id: 'sultan', name: 'Anak Sultan', token: '👑', color: '#8e44ad', cash: 21500, debt: 0, pos: 37, owns: { 33: 1, 34: 1, 36: 1, 37: 0, 35: 0, 15: 0 } },
];

const LEVELS = ['', '🛖', '🏠', '🏬', '🏢'];
const LEVEL_NAMES = ['Tanah', 'Warung', 'Kos-kosan', 'Ruko', 'Mall'];

const LOG = [
  ['Kamu', 'mendarat di <b>Makassar</b> (milik sendiri). Aman.'],
  ['Mas Crypto', 'ambil pinjol <b>Rp 2 jt</b>. Bunga 5%/giliran 💀'],
  ['Bu RT', 'kena <b>Pasal Karet</b>. Masuk Kasus Mangkrak.'],
  ['📰', '<b>Headline:</b> Antre BBM mengular. Semua cuma lempar 1 dadu.'],
  ['📈', '<b>Tahun ke-3:</b> harga naik 8%! UMR naik 3%.'],
  ['Anak Sultan', 'bangun <b>Warung</b> di BSD.'],
];

function rp(rb) {
  const v = Math.round(rb * IH);
  if (v >= 1000) return 'Rp ' + (v / 1000).toFixed(1).replace('.', ',').replace(',0', '') + ' jt';
  return 'Rp ' + v + ' rb';
}

function cellPlace(i) {
  if (i <= 10) return { row: 11, col: 11 - i, side: i === 0 || i === 10 ? 'corner' : 'bottom' };
  if (i < 20) return { row: 11 - (i - 10), col: 1, side: 'left' };
  if (i <= 30) return { row: 1, col: 1 + (i - 20), side: i === 20 || i === 30 ? 'corner' : 'top' };
  return { row: 1 + (i - 30), col: 11, side: 'right' };
}

function ownerOf(i) {
  for (const p of PLAYERS) if (i in p.owns) return p;
  return null;
}

function renderCell(sq, i) {
  const { row, col, side } = cellPlace(i);
  const owner = ownerOf(i);
  const level = owner ? owner.owns[i] : 0;
  const mortgaged = owner && owner.mortgaged && owner.mortgaged.includes(i);
  const here = PLAYERS.filter((p) => p.pos === i);

  const el = document.createElement('div');
  el.className = `cell side-${side} type-${sq.type}` + (owner ? ' owned' : '') + (mortgaged ? ' mortgaged' : '');
  el.style.gridRow = row;
  el.style.gridColumn = col;
  if (sq.group) el.dataset.group = sq.group;
  if (owner) el.style.setProperty('--owner', owner.color);

  let price = '';
  if (sq.price) price = owner ? (mortgaged ? 'GADAI' : owner.name) : rp(sq.price);
  else if (sq.fee) price = 'Bayar ' + rp(sq.fee);
  else if (sq.note) price = sq.note;

  el.innerHTML = `
    ${sq.group ? '<div class="strip"></div>' : ''}
    ${sq.icon ? `<div class="icon">${sq.icon}</div>` : ''}
    <div class="name">${sq.name}</div>
    ${sq.sub ? `<div class="sub">${sq.sub}</div>` : ''}
    ${price ? `<div class="price">${price}</div>` : ''}
    ${level ? `<div class="bld" title="${LEVEL_NAMES[level]}">${LEVELS[level]}<small>${LEVEL_NAMES[level]}</small></div>` : ''}
    ${here.length ? `<div class="tokens">${here.map((p) => `<span class="token" data-player="${p.id}" style="--c:${p.color}">${p.token}</span>`).join('')}</div>` : ''}
  `;
  return el;
}

function renderCenter() {
  const el = document.createElement('div');
  el.className = 'center';
  el.innerHTML = `
    <div class="brand">
      <div class="logo">JURAGAN <span>+62</span></div>
      <div class="tagline">Bertahan Hidup di Negeri Konoha</div>
    </div>

    <div class="center-row">
      <div class="ih">
        <div class="ih-label">Indeks Harga</div>
        <div class="ih-value">${IH.toFixed(2).replace('.', ',')} <span class="ih-up">▲ 8%</span></div>
        <div class="ih-bar"><div style="width:${Math.min(100, (IH - 1) * 100)}%"></div></div>
        <div class="ih-note">Harga naik 37% sejak awal. Gaji? 6%.</div>
      </div>
      <div class="turn">
        <div class="dice"><span class="die">4</span><span class="die">3</span></div>
        <div class="round">Ronde <b>12</b>/30 · Tahun 3</div>
      </div>
    </div>

    <div class="game-card viral">
      <div class="game-card-head">📱 KARTU VIRAL</div>
      <div class="game-card-body">Kamu nge-tweet kritik pedas.</div>
      <div class="game-card-effect">⚖️ Kena Pasal Karet → masuk Kasus Mangkrak</div>
    </div>

    <ul class="log">
      ${LOG.map(([who, msg]) => `<li><b class="who">${who}</b> ${msg}</li>`).join('')}
    </ul>
  `;
  return el;
}

function renderSide() {
  const el = document.createElement('aside');
  el.className = 'side';
  const players = PLAYERS.map((p, idx) => {
    const props = Object.keys(p.owns).length;
    return `
      <div data-player-card="${p.id}" class="player ${idx === 0 ? 'active' : ''}" style="--c:${p.color}">
        <div class="player-head">
          <span class="token big" style="--c:${p.color}">${p.token}</span>
          <span class="player-name">${p.name}</span>
          ${idx === 0 ? '<span class="badge turn-badge">Giliranmu</span>' : ''}
          ${p.jailed ? '<span class="badge jail">Mangkrak</span>' : ''}
        </div>
        <div class="player-stats">
          <div><span>Uang</span><b data-cash="${p.id}">${rp(p.cash / IH)}</b></div>
          <div><span>Pinjol</span><b data-debt="${p.id}" class="${p.debt ? 'debt' : ''}">${p.debt ? rp(p.debt / IH) : '—'}</b></div>
          <div><span>Properti</span><b>${props}</b></div>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <h2 class="side-title">Pemain</h2>
    <div class="players">${players}</div>

    <div class="slip">
      <div class="slip-title">🧾 Slip Gaji Terakhir</div>
      <div class="slip-row"><span>Gaji UMR</span><b class="plus">+Rp 3,2 jt</b></div>
      <div class="slip-row"><span>Biaya hidup</span><b class="minus">−Rp 3,3 jt</b></div>
      <div class="slip-row"><span>Cicilan pinjol</span><b class="minus">−Rp 700 rb</b></div>
      <div class="slip-total"><span>Diterima</span><b class="minus">−Rp 800 rb</b></div>
      <div class="slip-note">Gajian kok malah minus? Selamat datang di Konoha.</div>
    </div>

    <div class="actions">
      <button class="btn primary" data-act="roll">🎲 Lempar Dadu</button>
      <button class="btn" data-act="build">🏗️ Bangun</button>
      <button class="btn" data-act="year">📰 Tahun Baru</button>
      <button class="btn danger" data-act="pinjol">💸 Pinjol</button>
      <button class="btn end" data-act="end">Selesai ➜</button>
    </div>
  `;
  return el;
}

function renderMockup(root) {
  const layout = document.createElement('div');
  layout.className = 'layout';
  const board = document.createElement('div');
  board.className = 'board';
  BOARD.forEach((sq, i) => board.appendChild(renderCell(sq, i)));
  board.appendChild(renderCenter());
  layout.appendChild(board);
  layout.appendChild(renderSide());
  root.appendChild(layout);
}

renderMockup(document.getElementById('app'));
