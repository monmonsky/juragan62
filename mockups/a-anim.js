// Demo animasi untuk mockup A (lihat docs/PRD.md §12.5).
// Ini cuma demo tampilan, bukan engine game: aturan dan angkanya disederhanakan.

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const board = document.querySelector('.board');
const cells = [...board.querySelectorAll('.cell')];

const HEADLINES = [
  'Rupiah tembus 18 ribu per dolar! Indeks Harga +5%',
  'Antre BBM mengular, SPBU kosong: semua cuma lempar 1 dadu',
  'Pemadaman bergilir se-Konoha: sewa PLN & PDAM nol',
  'Krisis air bersih: biaya hidup +20%',
  'Kabut asap karhutla: sewa Sumatra & Kalimantan setengah',
  'UU Ketenagakerjaan baru disahkan: UMR tahun ini naik 0%',
  'Gelombang PHK: gajian bisa tidak cair',
  'Investor asing kabur: semua kehilangan 5% uang tunai',
  'Anggaran disedot Makan Bergizi Gratis: bansos cair setengah',
  'Demo besar di ibu kota: SCBD & IKN tidak terima sewa',
  'Gagal bayar pinjol meningkat: bunga naik jadi 7%',
  'Tidak ada berita besar tahun ini. Mencurigakan.',
  'Lahan dibuka untuk sawit & tambang: Kalimantan & Papua diobral 30%',
  'Dapur MBG diaudit: vendor "kenalan" wajib bayar denda',
];

const CARDS = {
  viral: [
    { t: 'Bikin meme AI soal pejabat, keburu FYP.', e: '⚖️ Kena Pasal Karet → Kasus Mangkrak', jail: true },
    { t: 'Video jualan seblak-mu FYP.', e: 'Terima Rp 1 jt', amt: 1000 },
    { t: 'Portofolio sahammu merah semua, IHSG ambles.', e: 'Kehilangan 15% uang tunai', pct: -0.15 },
    { t: 'Akunmu dibajak buat promosi judol.', e: 'Bayar Rp 750 rb', amt: -750 },
    { t: 'Keluhan jalan rusak depan rumahmu viral. Diperbaiki dalam 24 jam!', e: 'Terima Rp 500 rb', amt: 500 },
    { t: 'Bikin konten "sawit kan juga pohon, ada daunnya". FYP!', e: 'Terima Rp 500 rb dari endorse', amt: 500 },
    { t: 'Katanya makan gratis lebih mendesak daripada lapangan kerja. Lamaranmu ditolak lagi.', e: 'Bayar Rp 200 rb (print CV & materai)', amt: -200 },
  ],
  bansos: [
    { t: 'Datamu tercatat masuk desil 10 (alias kaya raya). Bansos dicabut.', e: 'Kembalikan Rp 600 rb', amt: -600 },
    { t: 'Dapat rumah subsidi 18 m². Kasur masuk, kamu di luar.', e: 'Bayar DP Rp 500 rb', amt: -500 },
    { t: 'Kontrak kerjamu diperpanjang. Status: tetap kontrak.', e: 'Tidak terjadi apa-apa. Seperti kariermu.', amt: 0 },
    { t: 'THR cair!', e: 'Terima Rp 1 jt', amt: 1000 },
    { t: 'Bansos cair... tapi dipotong oknum.', e: 'Terima Rp 150 rb', amt: 150 },
    { t: 'Sekolah daring, tapi nasi kotak MBG tetap dikirim ke sekolah yang kosong.', e: 'Terima Rp 15 rb (jatah nasi kotak)', amt: 15 },
    { t: 'Kebun sawit masuk ke lahan kampungmu. Ganti rugi: "nanti dikabari".', e: 'Bayar Rp 300 rb ongkos ke kantor desa', amt: -300 },
  ],
};

const BUILD_COST = { ntt: 500, maluku: 600, sulawesi: 1000, kalimantan: 1200, sumatra: 1500, jawa: 1800, elit: 2000, pusat: 2500 };
const RENT_MULT = [1, 5, 15, 40, 60];

let ih = IH;
let year = 3;
let round = 12;
let cur = 0;
let lastRoll = 7;
let busy = false;
const cash = Object.fromEntries(PLAYERS.map((p) => [p.id, p.cash]));
const debt = Object.fromEntries(PLAYERS.map((p) => [p.id, p.debt]));

// ---------- util ----------

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function fmt(v, signed = false) {
  const sign = v < 0 ? '−' : signed ? '+' : '';
  v = Math.abs(Math.round(v));
  const s = v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',').replace(',0', '') + ' jt' : v + ' rb';
  return sign + 'Rp ' + s;
}

function anim(el, frames, opts) {
  return el.animate(frames, { ...opts, duration: reduceMotion ? 1 : opts.duration }).finished;
}

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function overlay(cls, html, anchor) {
  const el = document.createElement('div');
  el.className = cls;
  el.innerHTML = html;
  if (anchor) {
    const { x, y } = centerOf(anchor);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  }
  document.body.appendChild(el);
  return el;
}

const playerCard = (id) => document.querySelector(`[data-player-card="${id}"]`);
const tokenOf = (id) => board.querySelector(`.token[data-player="${id}"]`);

// ---------- efek dasar ----------

async function floatText(text, anchor, kind) {
  const el = overlay('float ' + kind, text, anchor);
  await anim(el, [
    { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
    { transform: 'translate(-50%,-90%) scale(1.15)', opacity: 1, offset: 0.25 },
    { transform: 'translate(-50%,-260%) scale(1)', opacity: 0 },
  ], { duration: 1200, easing: 'ease-out' });
  el.remove();
}

async function stamp(text, anchor) {
  const el = overlay('stamp', text, anchor);
  await anim(el, [
    { transform: 'translate(-50%,-50%) scale(3) rotate(-25deg)', opacity: 0 },
    { transform: 'translate(-50%,-50%) scale(1) rotate(-8deg)', opacity: 1, offset: 0.3 },
    { transform: 'translate(-50%,-50%) scale(1) rotate(-8deg)', opacity: 1, offset: 0.8 },
    { transform: 'translate(-50%,-50%) scale(1.1) rotate(-8deg)', opacity: 0 },
  ], { duration: 1200, easing: 'ease-out' });
  el.remove();
}

function shake(el, power = 8) {
  return anim(el, [
    { transform: 'translate(0,0)' },
    { transform: `translate(${-power}px,${power / 2}px)` },
    { transform: `translate(${power}px,${-power / 2}px)` },
    { transform: `translate(${-power / 2}px,${power / 3}px)` },
    { transform: `translate(${power / 2}px,0)` },
    { transform: 'translate(0,0)' },
  ], { duration: 450 });
}

async function banner(text) {
  const el = overlay('banner', text);
  await anim(el, [
    { transform: 'translate(-50%,-50%) scale(4) rotate(-10deg)', opacity: 0 },
    { transform: 'translate(-50%,-50%) scale(1) rotate(-3deg)', opacity: 1, offset: 0.25 },
    { transform: 'translate(-50%,-50%) scale(1.05) rotate(-3deg)', opacity: 1, offset: 0.8 },
    { transform: 'translate(-50%,-150%) scale(.9) rotate(-3deg)', opacity: 0 },
  ], { duration: 1600, easing: 'ease-out' });
  el.remove();
}

async function toast(icon, title, body) {
  const el = overlay('toast', `<div class="toast-icon">${icon}</div><div><b>${title}</b><div>${body}</div></div>`);
  await anim(el, [
    { transform: 'translate(-50%,-120%)' },
    { transform: 'translate(-50%,16px)', offset: 0.15 },
    { transform: 'translate(-50%,16px)', offset: 0.85 },
    { transform: 'translate(-50%,-120%)' },
  ], { duration: 2600, easing: 'ease-in-out' });
  el.remove();
}

function countTo(el, from, to, isDebt) {
  const t0 = performance.now();
  const dur = reduceMotion ? 1 : 650;
  const step = (now) => {
    const k = Math.min(1, (now - t0) / dur);
    const v = from + (to - from) * (1 - Math.pow(1 - k, 3));
    el.textContent = isDebt && Math.round(v) <= 0 ? '—' : fmt(v);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  el.classList.toggle('debt', isDebt ? to > 0 : false);
  anim(el, [{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 650, easing: 'ease-out' });
}

function addMoney(id, delta, anchor) {
  if (!delta) return;
  const from = cash[id];
  cash[id] += delta;
  countTo(document.querySelector(`[data-cash="${id}"]`), from, cash[id], false);
  floatText(fmt(delta, true), anchor || playerCard(id), delta > 0 ? 'plus' : 'minus');
}

function addDebt(id, delta) {
  const from = debt[id];
  debt[id] = Math.max(0, debt[id] + delta);
  countTo(document.querySelector(`[data-debt="${id}"]`), from, debt[id], true);
}

function addLog(who, msg) {
  const ul = document.querySelector('.log');
  const li = document.createElement('li');
  li.innerHTML = `<b class="who">${who}</b> ${msg}`;
  ul.prepend(li);
  anim(li, [{ transform: 'translateX(-30px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' });
  while (ul.children.length > 5) ul.lastElementChild.remove();
}

// ---------- ticker berita ----------

const ticker = document.createElement('div');
ticker.className = 'ticker';
ticker.innerHTML = '<span class="ticker-label">📰 BREAKING KONOHA</span><div class="ticker-track"><div class="ticker-move"></div></div>';
document.querySelector('.layout').before(ticker);
const tickerItems = [
  HEADLINES[1],
  'Harga naik, gaji: "sabar ya"',
  'Pejabat imbau rakyat berhemat (sambil flexing)',
  'Warganet: "No viral, no justice"',
];
function renderTicker() {
  const items = tickerItems.map((t) => `<span>⚡ ${t}</span>`).join('');
  ticker.querySelector('.ticker-move').innerHTML = items + items;
}
renderTicker();

// ---------- papan ----------

function rentFor(i, owner) {
  const sq = BOARD[i];
  if (owner.mortgaged && owner.mortgaged.includes(i)) return 0;
  if (sq.type === 'transport') {
    const n = Object.keys(owner.owns).filter((k) => BOARD[k].type === 'transport').length;
    return [0, 250, 500, 1000, 2000][n] * ih;
  }
  if (sq.type === 'utility') return lastRoll * 50 * ih;
  const base = Math.round((sq.price * 0.08) / 10) * 10;
  const lvl = owner.owns[i];
  const fullSet = BOARD.every((s, k) => s.group !== sq.group || k in owner.owns);
  let rent = base * (lvl === 0 && fullSet ? 2 : RENT_MULT[lvl]) * ih;
  if (i === 39 && lvl < 4) rent /= 2; // IKN: kota sepi
  return rent;
}

function refreshPrices() {
  BOARD.forEach((sq, i) => {
    const price = cells[i].querySelector('.price');
    if (!price) return;
    if (sq.price && !ownerOf(i)) price.textContent = fmt(sq.price * ih);
    else if (sq.fee) price.textContent = 'Bayar ' + fmt(sq.fee * ih);
  });
}

async function hop(token, idx, arc = 18, dur = 170) {
  board.classList.add('hopping');
  const first = token.getBoundingClientRect();
  const cell = cells[idx];
  let wrap = cell.querySelector('.tokens');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'tokens';
    cell.appendChild(wrap);
  }
  const oldWrap = token.parentElement;
  wrap.appendChild(token);
  if (!oldWrap.children.length) oldWrap.remove();
  const last = token.getBoundingClientRect();
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  await anim(token, [
    { transform: `translate(${dx}px,${dy}px)` },
    { transform: `translate(${dx / 2}px,${dy / 2 - arc}px) scale(1.35)`, offset: 0.5 },
    { transform: 'translate(0,0) scale(1)' },
  ], { duration: dur, easing: 'ease-in-out' });
  board.classList.remove('hopping');
}

async function landPulse(cell) {
  cell.style.zIndex = 4;
  await anim(cell, [{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' });
  cell.style.zIndex = '';
}

async function rollDice(oneDie) {
  const dice = [...document.querySelectorAll('.die')];
  const vals = [1 + Math.floor(Math.random() * 6), oneDie ? 0 : 1 + Math.floor(Math.random() * 6)];
  const shuffle = setInterval(() => dice.forEach((d) => (d.textContent = 1 + Math.floor(Math.random() * 6))), 60);
  await Promise.all(dice.map((d, k) => anim(d, [
    { transform: 'rotate(0) translateY(0)' },
    { transform: 'rotate(220deg) translateY(-22px)', offset: 0.4 },
    { transform: 'rotate(380deg) translateY(0)', offset: 0.8 },
    { transform: 'rotate(360deg) translateY(-5px)', offset: 0.9 },
    { transform: 'rotate(360deg) translateY(0)' },
  ], { duration: 700 + k * 90, easing: 'ease-out' })));
  clearInterval(shuffle);
  dice.forEach((d, k) => (d.textContent = vals[k] || '–'));
  return vals;
}

function setJailBadge(p, on) {
  const head = playerCard(p.id).querySelector('.player-head');
  const badge = head.querySelector('.badge.jail');
  if (on && !badge) head.insertAdjacentHTML('beforeend', '<span class="badge jail">Mangkrak</span>');
  if (!on && badge) badge.remove();
}

async function goJail(p) {
  await stamp('MANGKRAK', cells[p.pos]);
  await hop(tokenOf(p.id), 10, 140, 650);
  p.pos = 10;
  p.jailed = true;
  setJailBadge(p, true);
  landPulse(cells[10]);
  addLog(p.name, 'masuk <b>Kasus Mangkrak</b>. Nunggu viral dulu.');
}

// ---------- aksi ----------

async function drawCard(deck, p) {
  const c = pick(CARDS[deck]);
  const el = document.querySelector('.game-card');
  await anim(el, [
    { transform: 'perspective(700px) rotate(-1.5deg) rotateY(0)' },
    { transform: 'perspective(700px) rotate(-1.5deg) rotateY(90deg)' },
  ], { duration: 220, easing: 'ease-in' });
  el.className = 'game-card ' + deck;
  el.innerHTML = `
    <div class="game-card-head">${deck === 'viral' ? '📱 KARTU VIRAL' : '🍚 KARTU BANSOS'}</div>
    <div class="game-card-body">${c.t}</div>
    <div class="game-card-effect">${c.e}</div>`;
  await anim(el, [
    { transform: 'perspective(700px) rotate(-1.5deg) rotateY(-90deg)' },
    { transform: 'perspective(700px) rotate(2.5deg) rotateY(0) scale(1.06)', offset: 0.7 },
    { transform: 'perspective(700px) rotate(-1.5deg) rotateY(0) scale(1)' },
  ], { duration: 420, easing: 'ease-out' });

  addLog(p.name, `dapat kartu: <b>${c.t}</b>`);
  if (c.jail) return goJail(p);
  if (c.amt) addMoney(p.id, c.amt * ih, el);
  if (c.pct) addMoney(p.id, Math.max(0, cash[p.id]) * c.pct, el);
}

async function payday(p) {
  const umr = 3200;
  const hidup = 2400 * ih;
  const cicilan = debt[p.id] * 0.2;
  const net = umr - hidup - cicilan;
  const slip = document.querySelector('.slip');
  const vals = slip.querySelectorAll('.slip-row b');
  vals[0].textContent = fmt(umr, true);
  vals[1].textContent = fmt(-hidup);
  vals[2].textContent = cicilan ? fmt(-cicilan) : 'Rp 0';
  const total = slip.querySelector('.slip-total b');
  total.textContent = fmt(net, true);
  total.className = net < 0 ? 'minus' : 'plus';
  slip.querySelector('.slip-note').textContent = net < 0 ? 'Gajian kok malah minus? Selamat datang di Konoha.' : 'Masih plus. Nikmati selagi bisa.';
  await anim(slip, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 800, easing: 'steps(8)' });
  addMoney(p.id, net, cells[0]);
  if (cicilan) addDebt(p.id, -cicilan);
  addLog(p.name, `gajian. Diterima <b>${fmt(net, true)}</b>.`);
}

async function resolve(p, i) {
  const sq = BOARD[i];
  const cell = cells[i];
  const owner = ownerOf(i);

  if (sq.price) {
    if (!owner) {
      const cost = sq.price * ih;
      p.owns[i] = 0;
      cell.classList.add('owned');
      cell.style.setProperty('--owner', p.color);
      cell.querySelector('.price').textContent = p.name;
      stamp('SAH!', cell);
      addMoney(p.id, -cost, cell);
      addLog(p.name, `beli <b>${sq.name}</b> seharga ${fmt(cost)}.`);
    } else if (owner === p) {
      floatText('Tanah sendiri 😌', cell, 'info');
    } else {
      const rent = rentFor(i, owner);
      if (!rent) {
        floatText('Tergadai, gratis! 🙏', cell, 'info');
        return;
      }
      addMoney(p.id, -rent, cell);
      addMoney(owner.id, rent);
      addLog(p.name, `bayar sewa <b>${fmt(rent)}</b> ke ${owner.name}.`);
    }
    return;
  }
  if (sq.type === 'card') return drawCard(sq.name === 'Kartu Viral' ? 'viral' : 'bansos', p);
  if (sq.type === 'tax') {
    const fee = sq.fee ? sq.fee * ih : Math.max(300 * ih, cash[p.id] * 0.12);
    addMoney(p.id, -fee, cell);
    addLog(p.name, `bayar <b>${sq.name}</b> ${fmt(fee)}.`);
    return;
  }
  if (i === 30) return goJail(p);
  if (i === 20) {
    stamp('PRIT!', cell);
    addMoney(p.id, -100 * ih, cell);
    addLog(p.name, 'bayar <b>parkir liar</b>. Padahal cuma lewat.');
    return;
  }
  if (i === 10) floatText('Cuma mampir 👀', cell, 'info');
}

async function roll() {
  const p = PLAYERS[cur];
  const oneDie = tickerItems[0] === HEADLINES[1];
  const [a, b] = await rollDice(oneDie);
  lastRoll = a + b;

  if (p.jailed) {
    // Saat krisis BBM cuma ada 1 dadu, jadi syarat bebasnya dapat angka 6.
    if (oneDie ? a === 6 : a === b) {
      p.jailed = false;
      setJailBadge(p, false);
      floatText('Bebas! Kasusnya viral 🎉', cells[10], 'plus');
    } else {
      floatText('Masih mangkrak 🗂️', cells[10], 'info');
      addLog(p.name, 'gagal dapat dadu kembar. Kasus masih mangkrak.');
      return;
    }
  }

  const token = tokenOf(p.id);
  let passedStart = false;
  for (let s = 0; s < a + b; s++) {
    p.pos = (p.pos + 1) % 40;
    if (p.pos === 0) passedStart = true;
    await hop(token, p.pos);
  }
  await landPulse(cells[p.pos]);
  if (passedStart) await payday(p);
  await resolve(p, p.pos);
}

async function newYear() {
  const pct = 5 + Math.floor(Math.random() * 8);
  ih *= 1 + pct / 100;
  year += 1;
  round += 5;
  const headline = pick(HEADLINES);

  shake(board, 10);
  await banner(`HARGA NAIK ${pct}%!`);

  document.querySelector('.ih-value').innerHTML = `${ih.toFixed(2).replace('.', ',')} <span class="ih-up">▲ ${pct}%</span>`;
  document.querySelector('.ih-bar > div').style.width = Math.min(100, (ih - 1) * 100) + '%';
  document.querySelector('.ih-note').textContent = `Harga naik ${Math.round((ih - 1) * 100)}% sejak awal. Gaji? ${3 * (year - 1)}%.`;
  document.querySelector('.round').innerHTML = `Ronde <b>${round}</b>/30 · Tahun ${year}`;
  shake(document.querySelector('.ih'), 5);
  refreshPrices();

  tickerItems.unshift(headline);
  tickerItems.length = Math.min(tickerItems.length, 5);
  renderTicker();
  anim(ticker, [{ background: '#ff3864' }, { background: '#111' }, { background: '#ff3864' }, { background: '#111' }], { duration: 700 });
  addLog('📰', `<b>Headline:</b> ${headline}`);
}

async function pinjol() {
  const p = PLAYERS[cur];
  const amount = 2000;
  toast('💸', 'PinjolKilat', `Pinjaman <b>${fmt(amount)}</b> cair dalam 5 detik! Bunga cuma 5%/giliran*<br><small>*syarat & ketentuan menyiksa</small>`);
  await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 500));
  addMoney(p.id, amount);
  addDebt(p.id, amount * 1.05);
  addLog(p.name, `ambil pinjol <b>${fmt(amount)}</b>. Semoga kuat 💀`);
}

async function build() {
  const p = PLAYERS[cur];
  const props = Object.keys(p.owns).map(Number).filter((k) => BOARD[k].type === 'prop' && p.owns[k] < 4);
  if (!props.length) {
    floatText('Belum punya tanah 🥲', playerCard(p.id), 'info');
    return;
  }
  const i = props.reduce((a, b) => (p.owns[b] < p.owns[a] ? b : a));
  const level = ++p.owns[i];
  const cell = cells[i];
  let bld = cell.querySelector('.bld');
  if (!bld) {
    bld = document.createElement('div');
    bld.className = 'bld';
    cell.insertBefore(bld, cell.querySelector('.tokens'));
  }
  bld.innerHTML = `${LEVELS[level]}<small>${LEVEL_NAMES[level]}</small>`;
  await anim(bld, [
    { transform: 'translateY(80%) scale(.2)', opacity: 0 },
    { transform: 'translateY(-30%) scale(1.6)', opacity: 1, offset: 0.6 },
    { transform: 'none', opacity: 1 },
  ], { duration: 480, easing: 'cubic-bezier(.3,1.6,.5,1)' });
  const cost = BUILD_COST[BOARD[i].group] * ih;
  addMoney(p.id, -cost, cell);
  addLog(p.name, `bangun <b>${LEVEL_NAMES[level]}</b> di ${BOARD[i].name}.`);
}

async function endTurn() {
  const prev = playerCard(PLAYERS[cur].id);
  cur = (cur + 1) % PLAYERS.length;
  const next = playerCard(PLAYERS[cur].id);
  prev.classList.remove('active');
  next.classList.add('active');
  const badge = document.querySelector('.turn-badge');
  badge.textContent = cur === 0 ? 'Giliranmu' : 'Giliran';
  next.querySelector('.player-name').after(badge);
  await anim(next, [
    { transform: 'scale(1)' },
    { transform: 'scale(1.05) rotate(-1deg)', offset: 0.4 },
    { transform: 'scale(.98)', offset: 0.7 },
    { transform: 'scale(1)' },
  ], { duration: 380, easing: 'ease-out' });
}

const ACTIONS = { roll, year: newYear, pinjol, build, end: endTurn };
const buttons = [...document.querySelectorAll('[data-act]')];
buttons.forEach((btn) => btn.addEventListener('click', async () => {
  if (busy) return;
  busy = true;
  buttons.forEach((b) => (b.disabled = true));
  try {
    await ACTIONS[btn.dataset.act]();
  } finally {
    busy = false;
    buttons.forEach((b) => (b.disabled = false));
  }
}));
