// Mapa oficial v4 (isométrico 2D com efeito 3D) — primitivas de desenho
const TW = 64, TH = 32;
let OX = 1200, OY = 240;
let SEED = 1; function rnd() { SEED = (SEED * 1664525 + 1013904223) >>> 0; return SEED / 4294967296; }
function hash(x, y, s = 0) { let h = (Math.round(x * 97) * 374761393 + Math.round(y * 89) * 668265263 + s * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function sh(h, a) { const n = parseInt(h.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a))).toString(16).padStart(2, '0'); return '#' + f(n >> 16) + f((n >> 8) & 255) + f(n & 255); }
function iso(gx, gy, z = 0) { return [OX + (gx - gy) * TW / 2, OY + (gx + gy) * TH / 2 - z]; }
function path(c, pts) { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); }
function fillP(c, pts, fill, stroke, lw = 1) { path(c, pts); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); } }
function P3(arr) { return arr.map((p) => iso(p[0], p[1], p[2] || 0)); }
function vgrad(c, pts, top, bot) { const ys = pts.map((p) => p[1]); const g = c.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys)); g.addColorStop(0, top); g.addColorStop(1, bot); return g; }
const EDGE = 'rgba(40,30,50,0.35)';

// ---------- primitivas 3D ----------
function faceL(gx, gy, w, d, z0, h) { return P3([[gx, gy + d, z0], [gx + w, gy + d, z0], [gx + w, gy + d, z0 + h], [gx, gy + d, z0 + h]]); }
function faceR(gx, gy, w, d, z0, h) { return P3([[gx + w, gy + d, z0], [gx + w, gy, z0], [gx + w, gy, z0 + h], [gx + w, gy + d, z0 + h]]); }
function faceT(gx, gy, w, d, z) { return P3([[gx, gy, z], [gx + w, gy, z], [gx + w, gy + d, z], [gx, gy + d, z]]); }
function box(c, gx, gy, w, d, z0, h, col, opt = {}) {
  const L = faceL(gx, gy, w, d, z0, h), Rr = faceR(gx, gy, w, d, z0, h), Tp = faceT(gx, gy, w, d, z0 + h);
  fillP(c, L, vgrad(c, L, sh(col, opt.lL ?? -0.02), sh(col, (opt.lL ?? -0.02) - 0.14)), opt.edge === false ? null : EDGE);
  fillP(c, Rr, vgrad(c, Rr, sh(col, opt.lR ?? -0.24), sh(col, (opt.lR ?? -0.24) - 0.14)), opt.edge === false ? null : EDGE);
  fillP(c, Tp, opt.top || sh(col, 0.14), opt.edge === false ? null : EDGE);
}
// ponto numa face: u ∈ [0,1] ao longo da face, z altura
function onL(gx, gy, w, d, u, z) { return iso(gx + u * w, gy + d, z); }
function onR(gx, gy, w, d, u, z) { return iso(gx + w, gy + d - u * d, z); }
function faceQuad(f, gx, gy, w, d, u0, u1, z0, z1) { return [f(gx, gy, w, d, u0, z0), f(gx, gy, w, d, u1, z0), f(gx, gy, w, d, u1, z1), f(gx, gy, w, d, u0, z1)]; }
function windowOn(c, f, b, u0, u1, z0, z1, lit = false, dark = false) {
  const [gx, gy, w, d] = b;
  const fr = faceQuad(f, gx, gy, w, d, u0 - 0.012, u1 + 0.012, z0 - 2, z1 + 2);
  fillP(c, fr, '#fdfbf6', 'rgba(40,30,50,0.45)');
  const gl = faceQuad(f, gx, gy, w, d, u0, u1, z0, z1);
  const g = vgrad(c, gl, lit ? '#fff1b0' : dark ? '#5a8ab8' : '#9fdcff', lit ? '#ffc65a' : dark ? '#3a5f8a' : '#4f9fd8');
  fillP(c, gl, g);
  const um = (u0 + u1) / 2;
  path(c, [f(gx, gy, w, d, um, z0), f(gx, gy, w, d, um, z1)]); c.strokeStyle = '#fdfbf6'; c.lineWidth = 1.6; c.stroke();
  const hl = faceQuad(f, gx, gy, w, d, u0 + (u1 - u0) * 0.08, u0 + (u1 - u0) * 0.28, z0 + (z1 - z0) * 0.45, z1 - 2);
  fillP(c, hl, 'rgba(255,255,255,0.45)');
  const sill = faceQuad(f, gx, gy, w, d, u0 - 0.025, u1 + 0.025, z0 - 4, z0 - 2);
  fillP(c, sill, '#e6dccb', 'rgba(40,30,50,0.3)');
}
function flowerBox(c, f, b, u0, u1, z) {
  const [gx, gy, w, d] = b;
  fillP(c, faceQuad(f, gx, gy, w, d, u0, u1, z - 7, z - 3), '#a8683c', 'rgba(40,30,50,0.4)');
  for (let i = 0; i < 5; i++) { const p = f(gx, gy, w, d, u0 + (u1 - u0) * (0.1 + i * 0.2), z - 2); c.beginPath(); c.arc(p[0], p[1], 2.4, 0, 7); c.fillStyle = ['#ff5c8a', '#ffd84a', '#ffffff', '#ff7a5c', '#c06bff'][i]; c.fill(); }
}
function doorOn(c, f, b, u0, u1, h, col) {
  const [gx, gy, w, d] = b;
  fillP(c, faceQuad(f, gx, gy, w, d, u0 - 0.015, u1 + 0.015, 0 + b[4], b[4] + h + 2), '#fdfbf6', 'rgba(40,30,50,0.45)');
  const q = faceQuad(f, gx, gy, w, d, u0, u1, b[4], b[4] + h);
  fillP(c, q, vgrad(c, q, sh(col, 0.15), sh(col, -0.2)));
  const pn = faceQuad(f, gx, gy, w, d, u0 + (u1 - u0) * 0.2, u1 - (u1 - u0) * 0.2, b[4] + h * 0.55, b[4] + h * 0.85);
  fillP(c, pn, 'rgba(255,255,255,0.18)');
  const k = f(gx, gy, w, d, u1 - (u1 - u0) * 0.2, b[4] + h * 0.45); c.beginPath(); c.arc(k[0], k[1], 1.8, 0, 7); c.fillStyle = '#ffd84a'; c.fill();
}

// telhado de duas águas. dir 'x' = cumeeira ao longo de gx
function gableRoof(c, gx, gy, w, d, H, rh, roof, wall, dir, e = 0.14) {
  const lines = (q0, q1, n, col) => { for (let i = 1; i < n; i++) { const t = i / n; path(c, [[q0[0][0] + (q0[1][0] - q0[0][0]) * t, q0[0][1] + (q0[1][1] - q0[0][1]) * t], [q1[0][0] + (q1[1][0] - q1[0][0]) * t, q1[0][1] + (q1[1][1] - q1[0][1]) * t]]); c.strokeStyle = col; c.lineWidth = 1.3; c.stroke(); } };
  if (dir === 'x') {
    const back = P3([[gx - e, gy - e, H], [gx + w + e, gy - e, H], [gx + w + e, gy + d / 2, H + rh], [gx - e, gy + d / 2, H + rh]]);
    const front = P3([[gx - e, gy + d + e, H - 2], [gx + w + e, gy + d + e, H - 2], [gx + w + e, gy + d / 2, H + rh], [gx - e, gy + d / 2, H + rh]]);
    const gab = P3([[gx + w, gy, H], [gx + w, gy + d, H], [gx + w, gy + d / 2, H + rh]]);
    fillP(c, back, sh(roof, 0.22), EDGE);
    fillP(c, gab, vgrad(c, gab, sh(wall, -0.18), sh(wall, -0.3)), EDGE);
    // janelinha redonda no oitão
    const gc = iso(gx + w, gy + d / 2, H + rh * 0.38); c.beginPath(); c.ellipse(gc[0], gc[1], 4, 5, 0, 0, 7); c.fillStyle = '#7fc0e8'; c.fill(); c.strokeStyle = '#fdfbf6'; c.lineWidth = 1.5; c.stroke();
    fillP(c, front, vgrad(c, front, sh(roof, 0.05), sh(roof, -0.12)), EDGE);
    for (let i = 1; i < 5; i++) { const t = i / 5; const a = iso(gx - e, gy + d + e - (d / 2 + e) * t, H - 2 + (rh + 2) * t), b2 = iso(gx + w + e, gy + d + e - (d / 2 + e) * t, H - 2 + (rh + 2) * t); path(c, [a, b2]); c.strokeStyle = sh(roof, -0.22); c.lineWidth = 1.4; c.stroke(); }
    // telhas (tracinhos)
    for (let i = 0; i < 5; i++) for (let j = 0; j < w * 6; j++) { const t = (i + 0.5) / 5, u = (j + (i % 2) * 0.5) / (w * 6); const p = iso(gx - e + (w + 2 * e) * u, gy + d + e - (d / 2 + e) * t, H - 2 + (rh + 2) * t); path(c, [p, [p[0], p[1] + 5]]); c.strokeStyle = sh(roof, -0.16); c.lineWidth = 1; c.stroke(); }
    path(c, [iso(gx - e, gy + d / 2, H + rh), iso(gx + w + e, gy + d / 2, H + rh)]); c.strokeStyle = sh(roof, -0.35); c.lineWidth = 3; c.lineCap = 'round'; c.stroke();
    path(c, [iso(gx - e, gy + d + e, H - 2), iso(gx + w + e, gy + d + e, H - 2)]); c.strokeStyle = sh(roof, -0.4); c.lineWidth = 2.5; c.stroke();
  } else {
    const left = P3([[gx - e, gy - e, H], [gx - e, gy + d + e, H], [gx + w / 2, gy + d + e, H + rh], [gx + w / 2, gy - e, H + rh]]);
    const right = P3([[gx + w + e, gy - e, H - 2], [gx + w + e, gy + d + e, H - 2], [gx + w / 2, gy + d + e, H + rh], [gx + w / 2, gy - e, H + rh]]);
    const gab = P3([[gx, gy + d, H], [gx + w, gy + d, H], [gx + w / 2, gy + d, H + rh]]);
    fillP(c, gab, vgrad(c, gab, sh(wall, 0.02), sh(wall, -0.1)), EDGE);
    const gc = iso(gx + w / 2, gy + d, H + rh * 0.38); c.beginPath(); c.ellipse(gc[0], gc[1], 5, 5.5, 0, 0, 7); c.fillStyle = '#7fc0e8'; c.fill(); c.strokeStyle = '#fdfbf6'; c.lineWidth = 1.5; c.stroke();
    fillP(c, left, sh(roof, 0.2), EDGE);
    fillP(c, right, vgrad(c, right, sh(roof, -0.12), sh(roof, -0.28)), EDGE);
    for (let i = 1; i < 5; i++) { const t = i / 5; const a = iso(gx + w + e - (w / 2 + e) * t, gy - e, H - 2 + (rh + 2) * t), b2 = iso(gx + w + e - (w / 2 + e) * t, gy + d + e, H - 2 + (rh + 2) * t); path(c, [a, b2]); c.strokeStyle = sh(roof, -0.38); c.lineWidth = 1.4; c.stroke(); }
    for (let i = 0; i < 5; i++) for (let j = 0; j < d * 6; j++) { const t = (i + 0.5) / 5, u = (j + (i % 2) * 0.5) / (d * 6); const p = iso(gx + w + e - (w / 2 + e) * t, gy - e + (d + 2 * e) * u, H - 2 + (rh + 2) * t); path(c, [p, [p[0], p[1] + 5]]); c.strokeStyle = sh(roof, -0.34); c.lineWidth = 1; c.stroke(); }
    path(c, [iso(gx + w / 2, gy - e, H + rh), iso(gx + w / 2, gy + d + e, H + rh)]); c.strokeStyle = sh(roof, -0.35); c.lineWidth = 3; c.lineCap = 'round'; c.stroke();
    path(c, [iso(gx + w + e, gy - e, H - 2), iso(gx + w + e, gy + d + e, H - 2)]); c.strokeStyle = sh(roof, -0.45); c.lineWidth = 2.5; c.stroke();
  }
}
function pyramidRoof(c, gx, gy, w, d, H, rh, col, e = 0.1) {
  const a = [gx + w / 2, gy + d / 2, H + rh];
  const p = [[gx - e, gy - e, H], [gx + w + e, gy - e, H], [gx + w + e, gy + d + e, H], [gx - e, gy + d + e, H]];
  fillP(c, P3([p[0], p[1], a]), sh(col, 0.25), EDGE); fillP(c, P3([p[3], p[0], a]), sh(col, 0.15), EDGE);
  fillP(c, P3([p[3], p[2], a]), sh(col, -0.02), EDGE); fillP(c, P3([p[2], p[1], a]), sh(col, -0.25), EDGE);
}

// ---------- natureza ----------
function sphere(c, x, y, r, col) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.05);
  g.addColorStop(0, sh(col, 0.35)); g.addColorStop(0.55, col); g.addColorStop(1, sh(col, -0.35));
  c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = g; c.fill();
}
function tree(c, gx, gy, z = 5, s = 1, pal = '#4fae4a') {
  const [x, y] = iso(gx, gy, z);
  c.fillStyle = '#7a4e2b'; c.beginPath(); c.roundRect(x - 3 * s, y - 20 * s, 6 * s, 22 * s, 3 * s); c.fill();
  c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x, y - 20 * s, 3 * s, 22 * s);
  sphere(c, x - 9 * s, y - 28 * s, 14 * s, sh(pal, -0.08)); sphere(c, x + 10 * s, y - 27 * s, 13 * s, sh(pal, -0.15)); sphere(c, x, y - 42 * s, 17 * s, pal);
  c.beginPath(); c.arc(x - 6 * s, y - 50 * s, 4 * s, 0, 7); c.fillStyle = 'rgba(255,255,255,0.25)'; c.fill();
}
function pine(c, gx, gy, z = 5, s = 1) {
  const [x, y] = iso(gx, gy, z);
  c.fillStyle = '#6a4226'; c.fillRect(x - 3 * s, y - 12 * s, 6 * s, 13 * s);
  for (let i = 0; i < 3; i++) {
    const by = y - 10 * s - i * 16 * s, w = (22 - i * 5) * s, h = 30 * s;
    c.beginPath(); c.moveTo(x - w, by); c.lineTo(x, by - h); c.lineTo(x + w, by); c.quadraticCurveTo(x, by + 7 * s, x - w, by); c.closePath();
    const g = c.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, '#5cbf6a'); g.addColorStop(0.5, '#3a9a52'); g.addColorStop(1, '#246b3a'); c.fillStyle = g; c.fill();
  }
}
function bush(c, gx, gy, z = 5, s = 1, flower) {
  const [x, y] = iso(gx, gy, z);
  sphere(c, x - 6 * s, y - 6 * s, 8 * s, '#4aa64a'); sphere(c, x + 6 * s, y - 6 * s, 8 * s, '#3f9a44'); sphere(c, x, y - 11 * s, 9 * s, '#58b856');
  if (flower) for (const [dx, dy] of [[-6, -10], [4, -15], [8, -7], [-1, -5]]) { c.beginPath(); c.arc(x + dx * s, y + dy * s, 2.4 * s, 0, 7); c.fillStyle = flower; c.fill(); }
}
function lamp(c, gx, gy, z = 5) {
  const [x, y] = iso(gx, gy, z);
  c.fillStyle = '#3d3a4f'; c.fillRect(x - 1.5, y - 44, 3, 44); c.fillRect(x - 4, y - 3, 8, 3);
  const g = c.createRadialGradient(x, y - 48, 1, x, y - 48, 16); g.addColorStop(0, 'rgba(255,240,170,0.55)'); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y - 48, 16, 0, 7); c.fill();
  c.beginPath(); c.arc(x, y - 48, 5.5, 0, 7); c.fillStyle = '#fff3b0'; c.fill(); c.strokeStyle = '#3d3a4f'; c.lineWidth = 2; c.stroke();
}
function bench(c, gx, gy, z = 5) { box(c, gx, gy, 0.7, 0.18, z + 6, 3, '#b8774a'); box(c, gx, gy - 0.02, 0.7, 0.05, z + 9, 8, '#a0643a'); box(c, gx + 0.05, gy + 0.05, 0.05, 0.08, z, 6, '#4a4560', { edge: false }); box(c, gx + 0.6, gy + 0.05, 0.05, 0.08, z, 6, '#4a4560', { edge: false }); }

// ---------- carros e ônibus ----------
function bus(c, gx, gy, col, along = 'y') {
  const z = 2, h = 26;
  if (along === 'y') {
    const w = 0.62, d = 1.9;
    box(c, gx, gy, w, d, z, h, col, { top: '#f2f2f6' });
    const b = [gx, gy, w, d];
    fillP(c, faceQuad(onR, gx, gy, w, d, 0.06, 0.94, z + 12, z + 22), vgrad(c, faceQuad(onR, gx, gy, w, d, 0, 1, z + 12, z + 22), '#3c5a80', '#26405f'));
    for (let i = 1; i < 6; i++) { const u = 0.06 + i * 0.147; path(c, [onR(gx, gy, w, d, u, z + 12), onR(gx, gy, w, d, u, z + 22)]); c.strokeStyle = col; c.lineWidth = 1.5; c.stroke(); }
    fillP(c, faceQuad(onL, gx, gy, w, d, 0.1, 0.9, z + 12, z + 23), vgrad(c, faceQuad(onL, gx, gy, w, d, 0, 1, z + 12, z + 23), '#4a6e98', '#2a456a'));
    fillP(c, faceQuad(onL, gx, gy, w, d, 0.12, 0.3, z + 18, z + 22), 'rgba(255,255,255,0.35)');
    for (const u of [0.15, 0.85]) { const p = onL(gx, gy, w, d, u, z + 6); c.beginPath(); c.arc(p[0], p[1], 2.6, 0, 7); c.fillStyle = '#fff3b0'; c.fill(); }
    fillP(c, faceT(gx + 0.14, gy + 0.4, 0.34, 0.4, z + h + 3), '#d8dae2', EDGE); box(c, gx + 0.14, gy + 0.4, 0.34, 0.4, z + h, 3, '#d8dae2');
    const lp = onL(gx, gy, w, d, 0.5, z + 26); c.font = 'bold 7px "Fredoka", "DejaVu Sans", sans-serif'; c.fillStyle = '#ffb63b'; c.textAlign = 'center'; c.fillText('LIVE', lp[0], lp[1] + 1);
  } else {
    const w = 1.9, d = 0.62;
    box(c, gx, gy, w, d, z, h, col, { top: '#f2f2f6' });
    fillP(c, faceQuad(onL, gx, gy, w, d, 0.2, 0.96, z + 12, z + 22), vgrad(c, faceQuad(onL, gx, gy, w, d, 0, 1, z + 12, z + 22), '#4a6e98', '#2a456a'));
    fillP(c, faceQuad(onR, gx, gy, w, d, 0.1, 0.9, z + 12, z + 23), '#2a456a');
    box(c, gx + 0.7, gy + 0.14, 0.5, 0.34, z + h, 3, '#d8dae2');
  }
}
function car(c, gx, gy, col, along = 'x') {
  const z = 1;
  const [w, d] = along === 'x' ? [0.8, 0.42] : [0.42, 0.8];
  box(c, gx, gy, w, d, z + 3, 9, col);
  const [cw, cd, cx, cy] = along === 'x' ? [0.42, 0.36, gx + 0.18, gy + 0.03] : [0.36, 0.42, gx + 0.03, gy + 0.18];
  box(c, cx, cy, cw, cd, z + 12, 7, '#cfe8f7', { top: col });
}

// ---------- casas ----------
const ROOFS = ['#e0573f', '#3f7fd6', '#e8932f', '#3f9e5a', '#8a5ad6', '#d64a7a', '#2fa3a0', '#6b5a4a'];
const WALLS = ['#fbf3e4', '#ffe6c7', '#e4f0fb', '#ffe1e1', '#e9f6dc', '#f1e6ff', '#fff4c9'];
function houseOn(c, gx, gy, v) {
  const z = 5, floors = v.floors, H = floors * 30, rh = 28;
  const w = v.w, d = v.d;
  const b = [gx, gy, w, d, z];
  box(c, gx - 0.04, gy - 0.04, w + 0.08, d + 0.08, z, 5, '#c9bfae');
  box(c, gx, gy, w, d, z, H, v.wall);
  // rodapé
  fillP(c, faceQuad(onL, gx, gy, w, d, 0, 1, z, z + 5), sh(v.wall, -0.25)); fillP(c, faceQuad(onR, gx, gy, w, d, 0, 1, z, z + 5), sh(v.wall, -0.4));
  if (floors === 2) { fillP(c, faceQuad(onL, gx, gy, w, d, 0, 1, z + 29, z + 31), sh(v.wall, -0.15)); fillP(c, faceQuad(onR, gx, gy, w, d, 0, 1, z + 29, z + 31), sh(v.wall, -0.3)); }
  // porta e janelas frente (face L)
  doorOn(c, onL, b, 0.42, 0.58, 20, v.door);
  const nw = Math.round(w * 2);
  for (let f = 0; f < floors; f++) {
    const z0 = z + f * 30 + 10, z1 = z0 + 13;
    const us = f === 0 ? [0.16, 0.76] : [0.16, 0.44, 0.72];
    for (const u of us) { windowOn(c, onL, b, u, u + 0.12, z0, z1, hash(gx, gy, f * 7 + u * 10) < 0.25); if (f === 0) flowerBox(c, onL, b, u - 0.01, u + 0.13, z0); }
    for (let k = 0; k < Math.max(1, Math.round(d * 1.5)); k++) { const u = 0.18 + k * (0.64 / Math.max(1, Math.round(d * 1.5) - 1 || 1)); windowOn(c, onR, b, Math.min(u, 0.7), Math.min(u, 0.7) + 0.16, z0, z1, false, true); }
  }
  // degrau + toldo
  box(c, gx + w * 0.38, gy + d, w * 0.24, 0.12, z, 3, '#d8d0c2');
  const aw = faceQuad(onL, gx, gy + 0.001, w, d + 0.12, 0.36, 0.64, z + 25, z + 29); fillP(c, aw, v.roof, EDGE);
  // chaminé
  if (v.dir === 'x') box(c, gx + w * 0.7, gy + d * 0.15, 0.2, 0.2, z + H, rh * 0.85, '#b5735a'); else box(c, gx + w * 0.15, gy + d * 0.2, 0.2, 0.2, z + H, rh * 0.85, '#b5735a');
  gableRoof(c, gx, gy, w, d, z + H, rh, v.roof, v.wall, v.dir);
  if (v.dir !== 'x') box(c, gx + w * 0.15, gy + d * 0.2, 0.2, 0.2, z + H + rh * 0.5, rh * 0.35, '#b5735a');
  return iso(gx + w / 2, gy + d / 2, z + H + rh + 8);
}
function apartmentOn(c, gx, gy, w, d, accent) {
  const z = 5, H = 92, b = [gx, gy, w, d, z];
  box(c, gx, gy, w, d, z, H, '#f4f1ea');
  for (let f = 0; f < 3; f++) {
    const z0 = z + 10 + f * 28, z1 = z0 + 15;
    for (let u = 0.08; u < 0.9; u += 0.2) windowOn(c, onL, b, u, u + 0.12, z0, z1, hash(gx + u, f, 3) < 0.3);
    for (let u = 0.12; u < 0.85; u += 0.3) windowOn(c, onR, b, u, u + 0.16, z0, z1, false, true);
    fillP(c, faceQuad(onL, gx, gy, w, d, 0, 1, z0 - 7, z0 - 5), accent);
    fillP(c, faceQuad(onR, gx, gy, w, d, 0, 1, z0 - 7, z0 - 5), sh(accent, -0.25));
  }
  box(c, gx - 0.05, gy - 0.05, w + 0.1, d + 0.1, z + H, 6, '#e2ded6');
  fillP(c, faceT(gx + 0.12, gy + 0.12, w - 0.24, d - 0.24, z + H + 6.1), '#8f949e');
  box(c, gx + w * 0.6, gy + d * 0.3, 0.4, 0.35, z + H + 6, 12, '#c7cbd2');
  box(c, gx + w * 0.2, gy + d * 0.25, 0.25, 0.25, z + H + 6, 18, '#5aa9d6');
  return iso(gx + w / 2, gy + d / 2, z + H + 34);
}

// ---------- terreno ----------
function fenceAround(c, gx, gy, w, d, col) {
  const z = 5, ph = 9;
  const post = (x, y) => { const a = iso(x, y, z), b2 = iso(x, y, z + ph); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b2[0], b2[1]); c.strokeStyle = col; c.lineWidth = 2.2; c.lineCap = 'round'; c.stroke(); };
  const rail = (x0, y0, x1, y1, h) => { path(c, [iso(x0, y0, z + h), iso(x1, y1, z + h)]); c.strokeStyle = col; c.lineWidth = 1.6; c.stroke(); };
  // só lados de trás desenhados aqui (frente é desenhada depois com 'front')
  return {
    back: () => { for (let t = 0; t <= w; t += 0.25) post(gx + t, gy); for (let t = 0; t <= d; t += 0.25) post(gx, gy + t); rail(gx, gy, gx + w, gy, 6); rail(gx, gy, gx, gy + d, 6); },
    front: () => { for (let t = 0; t <= w; t += 0.25) if (Math.abs(t - w / 2) > 0.3) post(gx + t, gy + d); for (let t = 0; t <= d; t += 0.25) post(gx + w, gy + t); rail(gx, gy + d, gx + w / 2 - 0.3, gy + d, 6); rail(gx + w / 2 + 0.3, gy + d, gx + w, gy + d, 6); rail(gx + w, gy, gx + w, gy + d, 6); },
  };
}
function lawn(c, gx, gy, w, d, col) {
  const pts = faceT(gx, gy, w, d, 5.5);
  const g = c.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]); g.addColorStop(0, sh(col, 0.08)); g.addColorStop(1, sh(col, -0.06));
  fillP(c, pts, g);
  for (let i = 0; i < w * d * 10; i++) { const p = iso(gx + 0.1 + hash(gx, gy, i) * (w - 0.2), gy + 0.1 + hash(gy, gx, i + 3) * (d - 0.2), 5.5); c.fillStyle = 'rgba(40,90,30,0.18)'; c.fillRect(p[0], p[1], 2, 1.5); }
}
function forSaleSign(c, gx, gy) {
  const z = 5; const a = iso(gx, gy, z);
  c.fillStyle = '#7a4e2b'; c.fillRect(a[0] - 1.5, a[1] - 26, 3, 26);
  const q = P3([[gx - 0.32, gy, z + 22], [gx + 0.32, gy, z + 22], [gx + 0.32, gy, z + 42], [gx - 0.32, gy, z + 42]]);
  fillP(c, q, '#ffffff', 'rgba(40,30,50,0.6)', 1.5);
  const s = P3([[gx - 0.28, gy, z + 35], [gx + 0.28, gy, z + 35], [gx + 0.28, gy, z + 40], [gx - 0.28, gy, z + 40]]); fillP(c, s, '#e8483a');
  c.save(); const o = iso(gx - 0.25, gy, z + 26); c.transform(1, 0.5, 0, 1, o[0], o[1]); c.font = 'bold 8px "Fredoka", "DejaVu Sans", sans-serif'; c.fillStyle = '#2f2a3a'; c.textAlign = 'left'; c.fillText('VENDE-SE', 0, 0); c.restore();
}
function construction(c, gx, gy) {
  const z = 5;
  box(c, gx, gy, 1.8, 1.4, z, 6, '#c9c3ba');
  for (const [px, py] of [[0, 0], [1.8, 0], [0, 1.4], [1.8, 1.4], [0.9, 1.4]]) box(c, gx + px - 0.04, gy + py - 0.04, 0.08, 0.08, z + 6, 40, '#e0a466', { edge: false });
  box(c, gx - 0.05, gy + 1.36, 1.9, 0.08, z + 26, 3, '#d9934f'); box(c, gx + 1.76, gy - 0.05, 0.08, 1.5, z + 26, 3, '#c57f3f');
  box(c, gx - 0.05, gy + 1.36, 1.9, 0.08, z + 44, 3, '#d9934f'); box(c, gx + 1.76, gy - 0.05, 0.08, 1.5, z + 44, 3, '#c57f3f');
  box(c, gx + 0.3, gy + 0.3, 0.6, 0.4, z + 6, 10, '#c8603a');
  // guindaste
  box(c, gx - 0.3, gy - 0.3, 0.16, 0.16, z, 120, '#ffc43d');
  box(c, gx - 0.5, gy - 0.3, 2.6, 0.12, z + 118, 5, '#ffc43d');
  const h1 = iso(gx + 1.6, gy - 0.25, z + 118), h2 = iso(gx + 1.6, gy - 0.25, z + 70); c.beginPath(); c.moveTo(...h1); c.lineTo(...h2); c.strokeStyle = '#3d3a4f'; c.lineWidth = 1.2; c.stroke();
  box(c, gx + 1.5, gy - 0.35, 0.2, 0.2, z + 60, 10, '#a8683c');
  for (const [px, py] of [[2.1, 1.7], [-0.2, 1.8]]) { const a = iso(gx + px, gy + py, z); c.beginPath(); c.moveTo(a[0] - 6, a[1]); c.lineTo(a[0], a[1] - 16); c.lineTo(a[0] + 6, a[1]); c.closePath(); c.fillStyle = '#ff8a2a'; c.fill(); c.fillStyle = '#fff'; c.fillRect(a[0] - 3, a[1] - 9, 6, 3); }
}

// ---------- rodoviária ----------
function station(c, add) {
  const z = 5;
  // bloco principal
  add(18.4 + 13.6, (c) => {
    const b1 = [12, 11.3, 6.4, 2.2];
    box(c, 12, 11.3, 6.4, 2.2, z, 50, '#f6efe2');
    for (let u = 0.05; u < 0.95; u += 0.075) { if (u > 0.36 && u < 0.62) continue; windowOn(c, onL, [...b1, z], u, u + 0.045, z + 14, z + 40); }
    for (let u = 0.1; u < 0.9; u += 0.28) windowOn(c, onR, [...b1, z], u, u + 0.16, z + 14, z + 40, false, true);
    fillP(c, faceQuad(onL, ...b1, 0, 1, z, z + 7), '#c79a6a'); fillP(c, faceQuad(onR, ...b1, 0, 1, z, z + 7), '#a87c50');
    box(c, 11.95, 11.25, 6.5, 2.3, z + 50, 5, '#e2dacb');
    fillP(c, faceT(12.1, 11.4, 6.2, 2.0, z + 55.1), '#9aa2ad');
    for (let i = 0; i < 6; i++) fillP(c, faceT(12.3 + i * 1.0, 11.6, 0.6, 1.6, z + 55.2), '#bfe4f2', 'rgba(60,90,120,0.4)');
    // torre
    box(c, 14.75, 11.5, 0.9, 0.9, z + 55, 105, '#fbf5ea');
    fillP(c, faceQuad(onL, 14.75, 11.5, 0.9, 0.9, 0, 1, z + 140, z + 145), '#4fb3bf');
    const ck = onL(14.75, 11.5, 0.9, 0.9, 0.5, z + 120);
    c.save(); c.transform(1, 0.5, 0, 1, ck[0], ck[1]); c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = '#3d3554'; c.lineWidth = 2.5; c.stroke();
    c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -8); c.moveTo(0, 0); c.lineTo(6, 2); c.strokeStyle = '#3d3554'; c.lineWidth = 2; c.stroke(); c.restore();
    const ck2 = onR(14.75, 11.5, 0.9, 0.9, 0.5, z + 120);
    c.save(); c.transform(1, -0.5, 0, 1, ck2[0], ck2[1]); c.beginPath(); c.arc(0, 0, 11, 0, 7); c.fillStyle = '#e8e4dc'; c.fill(); c.strokeStyle = '#3d3554'; c.lineWidth = 2.5; c.stroke(); c.restore();
    pyramidRoof(c, 14.75, 11.5, 0.9, 0.9, z + 160, 46, '#3fa7b3');
    const tp = iso(15.2, 11.95, z + 206); c.fillStyle = '#3d3a4f'; c.fillRect(tp[0] - 1, tp[1] - 22, 2, 22); c.beginPath(); c.moveTo(tp[0] + 1, tp[1] - 22); c.lineTo(tp[0] + 16, tp[1] - 17); c.lineTo(tp[0] + 1, tp[1] - 12); c.fillStyle = '#ff5c8a'; c.fill();
  });
  // entrada de vidro + letreiro em cima do telhado
  add(18.4 + 13.65, (c) => {
    const b = [12, 11.3, 6.4, 2.2];
    const q = faceQuad(onL, ...b, 0.38, 0.6, z, z + 42); fillP(c, q, vgrad(c, q, '#9fdcff', '#3f8fc8'), 'rgba(40,30,50,0.5)', 1.5);
    for (let u = 0.38; u <= 0.6; u += 0.055) { path(c, [onL(...b, u, z), onL(...b, u, z + 42)]); c.strokeStyle = '#fdfbf6'; c.lineWidth = 2; c.stroke(); }
    const bb = [12.7, 12.95, 5.0, 0.3];
    for (const u of [0.1, 0.9]) box(c, 12.7 + u * 5.0, 13.0, 0.12, 0.12, z + 55, 10, '#5a5470', { edge: false });
    box(c, ...bb, z + 63, 30, '#2f6f8f', { top: '#4b9ec0' });
    fillP(c, faceQuad(onL, ...bb, 0.02, 0.98, z + 65, z + 91), '#24607d');
    const o = onL(...bb, 0.5, z + 72); c.save(); c.transform(1, 0.5, 0, 1, o[0], o[1]); c.font = 'bold 22px "Fredoka", "DejaVu Sans", sans-serif'; c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RODOVIÁRIA', 0, 0); c.restore();
    for (const u of [0.04, 0.96]) { const p = onL(...bb, u, z + 78); c.beginPath(); c.arc(p[0], p[1], 3, 0, 7); c.fillStyle = '#ffd84a'; c.fill(); }
  });
  // plataforma + cobertura + ônibus
  add(18.4 + 14.3, (c) => {
    box(c, 11.8, 13.6, 6.8, 2.9, 0, 5, '#9a9aa5', { top: '#8a8d98' });
    for (let i = 0; i <= 5; i++) { path(c, [iso(12.2 + i * 1.2, 14.0, 5.2), iso(12.2 + i * 1.2, 16.3, 5.2)]); c.strokeStyle = '#f4f4f4'; c.lineWidth = 2; c.stroke(); }
    const yl = P3([[11.8, 16.3, 5.3], [18.6, 16.3, 5.3], [18.6, 16.5, 5.3], [11.8, 16.5, 5.3]]); fillP(c, yl, '#ffd23f');
  });
  const cols = ['#ffc43d', '#ef5a48', null, '#4aa86a', '#4a86d8', '#c06bff'];
  cols.forEach((col, i) => { if (col) add(32.8 + i * 0.01, (c) => bus(c, 12.5 + i * 1.2, 14.35, col)); });
  add(18.6 + 14.4, (c) => { for (const x of [11.9, 15.2, 18.5]) box(c, x, 13.6, 0.08, 0.08, 5, 40, '#5a5470', { edge: false }); box(c, 11.8, 13.55, 6.8, 0.75, 45, 5, '#4fb3bf', { top: '#7fd0d8' }); });
}

// ---------- mapa ----------
const N = 30, PAD = 4;
function tileType(x, y) {
  if (x < 0 || y < 0 || x >= N || y >= N) return 'G';
  const ring = x >= 9 && x <= 20 && y >= 9 && y <= 20 && (x <= 10 || x >= 19 || y <= 10 || y >= 19);
  if (ring) return 'R';
  if (x >= 11 && x <= 18 && y >= 11 && y <= 18) return 'Q';
  if ((x === 14 || x === 15) && (y < 9 || y > 20)) return 'R';
  if ((y === 14 || y === 15) && (x < 9 || x > 20)) return 'R';
  if (x <= 7 && y >= 9 && y <= 13 && x >= 0) return 'K';
  return 'S';
}
function zOf(t) { return t === 'R' ? 0 : 5; }
function drawGround(c) {
  const tiles = [];
  for (let y = -PAD; y < N + PAD; y++) for (let x = -PAD; x < N + PAD; x++) tiles.push([x, y]);
  tiles.sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  for (const [x, y] of tiles) {
    const t = tileType(x, y), z = zOf(t);
    const top = faceT(x, y, 1, 1, z);
    let col;
    if (t === 'G' || t === 'K') col = sh('#7fcf5e', (hash(x, y, 1) - 0.5) * 0.08);
    else if (t === 'R') col = sh('#666c7c', (hash(x, y, 2) - 0.5) * 0.04);
    else if (t === 'Q') col = (x + y) % 2 ? '#efe2c9' : '#e6d6b8';
    else col = sh('#dcd6cc', (hash(x, y, 3) - 0.5) * 0.05);
    fillP(c, top, col, t === 'S' || t === 'Q' ? 'rgba(120,100,80,0.18)' : null);
    if (t === 'S') { const m = faceT(x + 0.5, y, 0.001, 1, z); }
    const nL = tileType(x, y + 1), nR = tileType(x + 1, y);
    if (zOf(nL) < z) fillP(c, faceL(x, y, 1, 1, zOf(nL), z - zOf(nL)), t === 'G' || t === 'K' ? '#5fa648' : '#b9b1a3');
    if (zOf(nR) < z) fillP(c, faceR(x, y, 1, 1, zOf(nR), z - zOf(nR)), t === 'G' || t === 'K' ? '#4c8c3a' : '#a39b8d');
    if ((t === 'G' || t === 'K') && hash(x, y, 9) < 0.3) { const p = iso(x + 0.5, y + 0.5, z); c.fillStyle = ['#ffffff', '#ffe066', '#ff9ec0'][Math.floor(hash(x, y, 8) * 3)]; c.beginPath(); c.arc(p[0], p[1], 2, 0, 7); c.fill(); }
  }
  // faixas
  c.strokeStyle = '#fff1b8'; c.lineWidth = 2.5; c.lineCap = 'round';
  const dash = (x0, y0, x1, y1) => { path(c, [iso(x0, y0, 0.3), iso(x1, y1, 0.3)]); c.stroke(); };
  for (let t = -PAD; t < N + PAD; t++) {
    if (t < 9 || t > 20) { dash(15, t + 0.2, 15, t + 0.6); dash(t + 0.2, 15, t + 0.6, 15); }
  }
  for (let t = 9; t <= 20; t++) { dash(t + 0.2, 10, t + 0.6, 10); dash(t + 0.2, 20, t + 0.6, 20); dash(10, t + 0.2, 10, t + 0.6); dash(20, t + 0.2, 20, t + 0.6); }
  // faixas de pedestre
  const zebra = (x, y, alongX) => { for (let i = 0; i < 6; i++) { const q = alongX ? faceT(x + 0.1 + i * 0.32, y, 0.16, 0.7, 0.4) : faceT(x, y + 0.1 + i * 0.32, 0.7, 0.16, 0.4); fillP(c, q, 'rgba(255,255,255,0.9)'); } };
  zebra(14, 8.15, true); zebra(14, 21.15, true); zebra(8.15, 14, false); zebra(21.15, 14, false);
  // borda da ilha
  const D = 110, a = -PAD, b = N + PAD;
  const lf = P3([[a, b, 0], [b, b, 0], [b, b, -D], [a, b, -D]]);
  const rf = P3([[b, b, 0], [b, a, 0], [b, a, -D], [b, b, -D]]);
  const soil = (pts, dk) => { const g = vgrad(c, pts, sh('#a0703f', dk), sh('#5a3a22', dk)); fillP(c, pts, g); };
  soil(P3([[a, b, 5], [b, b, 5], [b, b, -D], [a, b, -D]]), 0); soil(P3([[b, b, 5], [b, a, 5], [b, a, -D], [b, b, -D]]), -0.25);
  fillP(c, P3([[a, b, 5], [b, b, 5], [b, b, -6], [a, b, -6]]), '#5fa648'); fillP(c, P3([[b, b, 5], [b, a, 5], [b, a, -6], [b, b, -6]]), '#4c8c3a');
  for (let i = 0; i < 70; i++) { const t = hash(i, 1, 5) * (b - a), zz = -20 - hash(i, 2, 5) * (D - 30); const p = i % 2 ? iso(a + t, b, zz) : iso(b, a + t, zz); c.fillStyle = i % 3 ? 'rgba(60,35,20,0.35)' : 'rgba(150,140,130,0.6)'; c.beginPath(); c.ellipse(p[0], p[1], 6 + hash(i, 3) * 8, 3 + hash(i, 4) * 3, i % 2 ? 0.45 : -0.45, 0, 7); c.fill(); }
  for (let i = 0; i < 40; i++) { const t = hash(i, 7, 5) * (b - a); const p = i % 2 ? iso(a + t, b, -5) : iso(b, a + t, -5); c.strokeStyle = '#6a4a2a'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(p[0] + 3, p[1] + 12, p[0] - 1, p[1] + 22 + hash(i, 8) * 14); c.stroke(); }
  // estradas saem para pontes cortadas — tampas de asfalto na borda
}
function pond(c) {
  const cx = 3.6, cy = 11.2, rx = 3.0, ry = 1.9; const pts = [], pts2 = [];
  for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; pts.push(iso(cx + Math.cos(a) * rx * 1.1, cy + Math.sin(a) * ry * 1.15, 5.5)); pts2.push(iso(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, 0)); }
  fillP(c, pts, '#f0dfa8');
  const g = c.createLinearGradient(0, pts2[36][1], 0, pts2[12][1]); g.addColorStop(0, '#2f86c8'); g.addColorStop(1, '#5cc4f0');
  fillP(c, pts2, g, '#2a6fa8', 2);
  for (let i = 0; i < 6; i++) { const p = iso(cx - 1.5 + hash(i, 1, 2) * 3, cy - 1 + hash(i, 2, 2) * 2, 0); c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(p[0] - 7, p[1]); c.quadraticCurveTo(p[0], p[1] - 3, p[0] + 7, p[1]); c.stroke(); }
  for (const [dx, dy] of [[0.6, -0.3], [1.0, 0.1]]) { const p = iso(cx + dx, cy + dy, 2); sphere(c, p[0], p[1], 5, '#ffffff'); sphere(c, p[0] - 4, p[1] - 5, 3.5, '#ffffff'); c.fillStyle = '#ffb63b'; c.fillRect(p[0] - 9, p[1] - 6, 3, 2); }
  // pontezinha de madeira
  box(c, 5.6, 10.9, 1.6, 0.5, 4, 3, '#b47a46', { top: '#c98a55' });
}

