// Monta a cidade em "sprites" (cada objeto vira uma imagem com profundidade),
// para os bonecos poderem passar na frente e atrás das casas corretamente.
OX = 1300; OY = 300;
const WORLD = { W: 2600, H: 1700 };
const RES = 2; // resolução dos sprites (2 = nítido até zoom 2x)

// 30 terrenos, na mesma ordem e numeração do mapa aprovado
const PLOTS = (() => {
  const p = [];
  for (const gy of [1, 5]) { for (const gx of [1, 5, 9]) p.push([gx, gy]); for (const gx of [17, 21, 25]) p.push([gx, gy]); }
  for (const gy of [22, 26]) { for (const gx of [1, 5, 9]) p.push([gx, gy]); for (const gx of [17, 21, 25]) p.push([gx, gy]); }
  for (const gx of [1, 5]) p.push([gx, 17]);
  for (const gx of [22, 26]) { p.push([gx, 10]); p.push([gx, 17]); }
  p.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  return p;
})();
// portão de cada terreno (onde o dono fica)
function gateOf(i) { const [gx, gy] = PLOTS[i]; return [gx + 1.5, gy + 3.35]; }

// ---------- medir o que um desenho ocupa ----------
function measure(fn) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const c = cv.getContext('2d');
  const bb = [Infinity, Infinity, -Infinity, -Infinity];
  const P = (x, y) => { const m = c.getTransform(); const X = m.a * x + m.c * y + m.e, Y = m.b * x + m.d * y + m.f; if (X < bb[0]) bb[0] = X; if (Y < bb[1]) bb[1] = Y; if (X > bb[2]) bb[2] = X; if (Y > bb[3]) bb[3] = Y; };
  const wrap = (name, f) => { const o = c[name].bind(c); c[name] = (...a) => { f(...a); return o(...a); }; };
  wrap('moveTo', (x, y) => P(x, y)); wrap('lineTo', (x, y) => P(x, y));
  wrap('quadraticCurveTo', (a, b, x, y) => { P(a, b); P(x, y); });
  wrap('bezierCurveTo', (a, b, d, e, x, y) => { P(a, b); P(d, e); P(x, y); });
  wrap('arc', (x, y, r) => { P(x - r, y - r); P(x + r, y + r); });
  wrap('ellipse', (x, y, rx, ry) => { const r = Math.max(rx, ry); P(x - r, y - r); P(x + r, y + r); });
  for (const n of ['roundRect', 'rect', 'fillRect', 'strokeRect']) wrap(n, (x, y, w, h) => { P(x, y); P(x + w, y + h); });
  wrap('fillText', (t, x, y) => { const w = c.measureText(t).width; P(x - w, y - 30); P(x + w, y + 30); });
  fn(c);
  return bb;
}
function makeSprite(key, fn, extra = {}) {
  const bb = measure(fn);
  if (!isFinite(bb[0])) return null;
  const pad = extra.pad ?? 8;
  const x = Math.floor(bb[0] - pad), y = Math.floor(bb[1] - pad), w = Math.ceil(bb[2] - bb[0] + pad * 2), h = Math.ceil(bb[3] - bb[1] + pad * 2);
  const img = document.createElement('canvas'); img.width = Math.max(1, Math.ceil(w * RES)); img.height = Math.max(1, Math.ceil(h * RES));
  const c = img.getContext('2d'); c.setTransform(RES, 0, 0, RES, -x * RES, -y * RES); fn(c);
  return Object.assign({ key, img, x, y, w, h }, extra);
}

// ---------- fundo (chão, lago, floresta de trás) ----------
function buildBackground(res = RES) {
  const cv = document.createElement('canvas'); cv.width = WORLD.W * res; cv.height = WORLD.H * res;
  const c = cv.getContext('2d'); c.scale(res, res);
  SEED = 5;
  drawGround(c);
  pond(c);
  // sombras fixas (rodoviária)
  c.save(); c.filter = 'blur(7px)';
  for (const [gx, gy, w, d, h] of [[12, 11.3, 6.4, 2.2, 55], [14.75, 11.5, 0.9, 0.9, 200]]) shadowShape(c, gx, gy, w, d, h);
  c.restore();
  // floresta de trás (nunca fica na frente de ninguém)
  const back = [];
  forest((k, x, y, f) => { if (x < -0.6 || y < -0.6) back.push([k, f]); });
  back.sort((a, b) => a[0] - b[0]); for (const [, f] of back) f(c);
  return cv;
}
function shadowShape(c, gx, gy, w, d, h) {
  const k = h / 70;
  fillP(c, P3([[gx, gy + d, 5], [gx + w, gy + d, 5], [gx + w + k, gy + d - k * 0.2, 5], [gx + w + k, gy - k * 0.2, 5], [gx + w, gy, 5]]), 'rgba(30,40,60,0.28)');
  fillP(c, faceT(gx + 0.05, gy + 0.05, w + k * 0.9, d, 5), 'rgba(30,40,60,0.22)');
}
function forest(cb) {
  for (let y = -PAD; y < N + PAD; y += 0.9) for (let x = -PAD; x < N + PAD; x += 0.9) {
    if (x >= -0.6 && y >= -0.6 && x <= N - 0.2 && y <= N - 0.2) continue;
    const jx = x + hash(x, y, 1) * 0.5, jy = y + hash(x, y, 2) * 0.5;
    if ((Math.abs(jx - 15) < 1.3 && (jy < 0 || jy > N - 1)) || (Math.abs(jy - 15) < 1.3 && (jx < 0 || jx > N - 1))) continue;
    if (jx > N + PAD - 0.5 || jy > N + PAD - 0.5) continue;
    const pinho = hash(x, y, 3) < 0.45, s1 = 0.9 + hash(x, y, 4) * 0.25, s2 = 0.9 + hash(x, y, 4) * 0.2, col = ['#4fae4a', '#3f9e44', '#5cba4f'][Math.floor(hash(x, y, 5) * 3)];
    cb(jx + jy, jx, jy, (c) => (pinho ? pine(c, jx, jy, 5, s1) : tree(c, jx, jy, 5, s2, col)));
  }
}

// ---------- objetos fixos (rodoviária, praça, ruas) ----------
function buildFixedSprites() {
  const out = []; const add = (k, f) => { const s = makeSprite(k, f); if (s) out.push(s); };
  station(null, add);
  for (const [x, y] of [[11.5, 17.6], [18.2, 17.6], [11.5, 11.2], [18.4, 11.2]]) add(x + y, (c) => tree(c, x, y, 5, 0.9));
  for (const [x, y] of [[12.6, 18.4], [17.4, 18.4], [11.6, 16.9], [18.6, 16.9]]) add(x + y, (c) => lamp(c, x, y));
  add(13.4 + 18.6, (c) => bench(c, 13.4, 18.4)); add(16.0 + 18.6, (c) => bench(c, 16.0, 18.4));
  for (const [x, y] of [[12.2, 17.2], [17.6, 17.2]]) add(x + y + 1, (c) => { box(c, x, y, 0.8, 0.5, 5, 10, '#c27a46'); bush(c, x + 0.4, y + 0.25, 15, 0.8, '#ff7aa8'); });
  for (const [x, y] of [[13.4, 2], [13.4, 6], [16.6, 2], [16.6, 6], [13.4, 23], [13.4, 27], [16.6, 23], [16.6, 27], [2, 13.5], [6, 13.5], [24, 13.4], [28, 13.4], [2, 16.6], [6, 16.6], [24, 16.6], [28, 16.6], [8.5, 8.5], [21.5, 8.5], [8.5, 21.5], [21.5, 21.5]]) add(x + y, (c) => tree(c, x, y, 5, 0.85, '#4fae4a'));
  for (const [x, y] of [[13.5, 4.2], [16.5, 4.2], [13.5, 25], [16.5, 25], [4, 13.6], [4, 16.4], [26, 13.6], [26, 16.4]]) add(x + y, (c) => lamp(c, x, y));
  for (const [x, y] of [[0.6, 9.6], [6.8, 9.5], [0.8, 13.2], [6.6, 13.3], [2.5, 9.3], [5, 13.4]]) add(x + y, (c) => tree(c, x, y, 5, 0.95, '#5fbf4f'));
  add(15.3 + 23, (c) => bus(c, 14.15, 22.2, '#4a86d8'));
  add(4 + 14.8, (c) => car(c, 3.5, 14.25, '#ef5a48', 'x'));
  add(25 + 15.3, (c) => car(c, 24.6, 15.1, '#ffc43d', 'x'));
  add(15.4 + 4, (c) => car(c, 15.1, 3.4, '#ffffff', 'y'));
  add(10 + 13.3, (c) => car(c, 9.3, 12.6, '#3f9e5a', 'y'));
  add(20 + 19.9, (c) => car(c, 19.4, 19.6, '#c06bff', 'x'));
  forest((k, x, y, f) => { if (!(x < -0.6 || y < -0.6)) add(k, f); });
  return out;
}

// ---------- terrenos (mudam durante a live) ----------
// st = { estado: 'venda' | 'obra' | 'casa', andares: 1 | 2 | 3 }
function plotLabelPos(i, st) {
  const [gx, gy] = PLOTS[i];
  if (st.estado === 'venda') return iso(gx + 1.5, gy + 2.1, 58);
  if (st.estado === 'obra') return iso(gx + 1.5, gy + 1.5, 132);
  if ((st.andares || 1) >= 3) return iso(gx + 1.5, gy + 1.45, 5 + 92 + 34);
  const v = houseVariant(i, st); return iso(gx + 0.55 + v.w / 2, gy + 0.45 + v.d / 2, 5 + v.floors * 30 + 28 + 8);
}
function houseVariant(i, st) {
  return { w: 1.9 + (i % 2) * 0.2, d: 1.6, floors: Math.min(2, st.andares || 1), wall: WALLS[i % WALLS.length], roof: ROOFS[(i * 3) % ROOFS.length], door: ['#a8683c', '#3f7fd6', '#3f9e5a', '#c0392b'][i % 4], dir: i % 2 ? 'x' : 'y' };
}
function buildPlotSprites(i, st) {
  const [gx, gy] = PLOTS[i]; const out = []; const kind = st.estado;
  const add = (k, f, pad) => { const s = makeSprite(k, f, { plot: i, pad }); if (s) out.push(s); };
  const w = 3, d = 3;
  const fenceCol = kind === 'venda' ? '#b98552' : kind === 'obra' ? '#ff9a3a' : '#ffffff';
  add(gx + gy + 0.1, (c) => {
    lawn(c, gx + 0.1, gy + 0.1, w - 0.2, d - 0.2, kind === 'obra' ? '#cfa978' : kind === 'venda' ? '#9ad97c' : '#86d466');
    if (kind === 'casa') fillP(c, faceT(gx + 1.3, gy + 2.2, 0.4, 0.8, 5.7), '#e8dcc4');
    fenceAround(c, gx + 0.1, gy + 0.1, w - 0.2, d - 0.2, fenceCol).back();
  });
  if (kind === 'casa' && (st.andares || 1) >= 3) {
    add(gx + gy + 4.4, (c) => { c.save(); c.filter = 'blur(7px)'; shadowShape(c, gx + 0.5, gy + 0.6, 2, 1.7, 110); c.restore(); apartmentOn(c, gx + 0.5, gy + 0.6, 2, 1.7, ROOFS[i % ROOFS.length]); }, 30);
    add(gx + gy + 4.6, (c) => { bush(c, gx + 0.5, gy + 2.6, 5, 1, '#ff7aa8'); bush(c, gx + 2.6, gy + 2.5, 5, 0.9, '#ffd84a'); });
  } else if (kind === 'casa') {
    const v = houseVariant(i, st); const hx = gx + 0.55, hy = gy + 0.45;
    add(hx + hy + v.w + v.d, (c) => { c.save(); c.filter = 'blur(7px)'; shadowShape(c, hx, hy, v.w, v.d, v.floors * 30 + 28); c.restore(); houseOn(c, hx, hy, v); }, 30);
    add(gx + gy + 4.6, (c) => { bush(c, gx + 0.5, gy + 2.6, 5, 1, '#ff7aa8'); bush(c, gx + 2.6, gy + 2.5, 5, 0.9, '#ffd84a'); });
    add(gx + gy + 0.8, (c) => tree(c, gx + 0.45, gy + 0.35, 5, 0.75, ['#4fae4a', '#5fbf4f', '#3f9e5a'][i % 3]));
  } else if (kind === 'obra') {
    add(gx + gy + 4.2, (c) => construction(c, gx + 0.6, gy + 0.8));
  } else {
    add(gx + gy + 3, (c) => forSaleSign(c, gx + 1.5, gy + 2.1));
    add(gx + gy + 1.2, (c) => bush(c, gx + 0.6, gy + 0.6, 5, 0.8));
  }
  add(gx + gy + 5.8, (c) => fenceAround(c, gx + 0.1, gy + 0.1, w - 0.2, d - 0.2, fenceCol).front());
  return out;
}
