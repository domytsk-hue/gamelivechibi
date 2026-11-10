// ============================================================
//  Casas temáticas: cada prêmio deixa a casa com um visual próprio.
//  Usa as primitivas isométricas de mapa.js (box, iso, fillP, houseOn...).
// ============================================================
const TEMAS = {
  // casas (crescem para sobrado; com 6.000 curtidas viram prédio com a cor do tema)
  estrela:  { nome: 'Casa Estrela',  tipo: 'casa',  wall: '#eef4ff', roof: '#f2b134', door: '#3f7fd6', acc: '#f2b134' },
  doce:     { nome: 'Casa de Doce',  tipo: 'casa',  wall: '#ffd6e6', roof: '#ffd0e4', door: '#d6336c', acc: '#ff7aa8' },
  praia:    { nome: 'Casa de Praia', tipo: 'casa',  wall: '#d9f2ff', roof: '#e8c06a', door: '#2fa3a0', acc: '#2fa3a0' },
  festa:    { nome: 'Casa da Festa', tipo: 'casa',  wall: '#fff4c9', roof: '#8a5ad6', door: '#e0573f', acc: '#ff5c8a' },
  mansao:   { nome: 'Mansão',        tipo: 'casa',  wall: '#ffffff', roof: '#2b3a67', door: '#c9a227', acc: '#c9a227' },
  // prédios especiais (já nascem prontos)
  espacial: { nome: 'Base Espacial', tipo: 'torre', acc: '#3f7fd6' },
  castelo:  { nome: 'Castelo',       tipo: 'torre', acc: '#c8323c' },
  galaxia:  { nome: 'Torre Galáxia', tipo: 'torre', acc: '#8a5ad6' },
};

function estrela2D(c, x, y, r, cor, borda = '#7a4a10') {
  c.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  c.closePath(); c.fillStyle = cor; c.fill(); c.strokeStyle = borda; c.lineWidth = 1.6; c.stroke();
}
function bandeira(c, gx, gy, z, h, cor) {
  const a = iso(gx, gy, z), b = iso(gx, gy, z + h);
  c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.strokeStyle = '#5a4a3a'; c.lineWidth = 1.6; c.stroke();
  c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] + 14, b[1] + 4); c.lineTo(b[0], b[1] + 9); c.closePath(); c.fillStyle = cor; c.fill(); c.strokeStyle = 'rgba(40,30,50,0.4)'; c.lineWidth = 1; c.stroke();
}
// borda da frente do telhado (onde pendurar enfeites)
function beiral(hx, hy, w, d, H, dir, e = 0.14) {
  return dir === 'x' ? [[hx - e, hy + d + e, H - 2], [hx + w + e, hy + d + e, H - 2]] : [[hx + w + e, hy - e, H - 2], [hx + w + e, hy + d + e, H - 2]];
}
function cumeeira(hx, hy, w, d, H, rh, dir, e = 0.14) {
  return dir === 'x' ? [[hx - e, hy + d / 2, H + rh], [hx + w + e, hy + d / 2, H + rh]] : [[hx + w / 2, hy - e, H + rh], [hx + w / 2, hy + d + e, H + rh]];
}
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ---------- enfeites por tema (desenhados depois da casa) ----------
function enfeiteCasa(c, tema, hx, hy, v) {
  const z = 5, H = z + v.floors * 30, rh = 28, w = v.w, d = v.d;
  const [e0, e1] = beiral(hx, hy, w, d, H, v.dir), [r0, r1] = cumeeira(hx, hy, w, d, H, rh, v.dir);
  if (tema === 'estrela') {
    const m = lerp3(r0, r1, 0.5); const p = iso(m[0], m[1], m[2] + 16);
    const a = iso(m[0], m[1], m[2]); c.beginPath(); c.moveTo(...a); c.lineTo(p[0], p[1] + 6); c.strokeStyle = '#7a4a10'; c.lineWidth = 2; c.stroke();
    const g = c.createRadialGradient(p[0], p[1], 2, p[0], p[1], 26); g.addColorStop(0, 'rgba(255,230,120,0.7)'); g.addColorStop(1, 'rgba(255,230,120,0)'); c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], 26, 0, 7); c.fill();
    estrela2D(c, p[0], p[1], 11, '#ffd84a');
  } else if (tema === 'doce') {
    // cobertura escorrendo + confeitos + cereja
    const n = Math.round(w * 9);
    for (let i = 0; i <= n; i++) { const p = iso(...lerp3(e0, e1, i / n)); const len = 4 + ((i * 7) % 5) * 1.6; c.beginPath(); c.ellipse(p[0], p[1] + len / 2, 3.2, len / 2 + 1.5, 0, 0, 7); c.fillStyle = '#ff7aa8'; c.fill(); }
    const lin = iso(...e0), lin2 = iso(...e1); c.beginPath(); c.moveTo(...lin); c.lineTo(...lin2); c.strokeStyle = '#ff7aa8'; c.lineWidth = 4; c.lineCap = 'round'; c.stroke();
    const cores = ['#ff5c8a', '#4aa3ff', '#ffd84a', '#5fd068', '#c06bff'];
    for (let i = 0; i < 26; i++) { const t = hash(hx, i, 1), s = 0.15 + hash(hy, i, 2) * 0.7; const p = iso(...lerp3(lerp3(e0, e1, t), lerp3(r0, r1, t), s)); c.save(); c.translate(p[0], p[1]); c.rotate(hash(i, hx, 3) * 3); c.fillStyle = cores[i % 5]; c.fillRect(-2.5, -1, 5, 2); c.restore(); }
    const m = iso(...lerp3(r0, r1, 0.5)); sphere(c, m[0], m[1] - 6, 6.5, '#e0233f');
    c.beginPath(); c.moveTo(m[0], m[1] - 12); c.quadraticCurveTo(m[0] + 4, m[1] - 20, m[0] + 8, m[1] - 20); c.strokeStyle = '#3f7a2a'; c.lineWidth = 1.6; c.stroke();
  } else if (tema === 'praia') {
    // franja de palha no beiral
    const n = Math.round(w * 14);
    for (let i = 0; i <= n; i++) { const p = iso(...lerp3(e0, e1, i / n)); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(p[0] + (i % 2 ? 1 : -1), p[1] + 6 + (i % 3) * 1.5); c.strokeStyle = '#b8862e'; c.lineWidth = 1.6; c.stroke(); }
  } else if (tema === 'festa') {
    // bandeirinhas no beiral
    const n = Math.round(w * 6), cores = ['#ff5c8a', '#ffd84a', '#4aa3ff', '#5fd068', '#c06bff', '#ff8a2a'];
    for (let i = 0; i < n; i++) {
      const a = iso(...lerp3(e0, e1, i / n)), b = iso(...lerp3(e0, e1, (i + 1) / n)); const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 + 3;
      c.beginPath(); c.moveTo(a[0], a[1] + 2); c.lineTo(b[0], b[1] + 2); c.lineTo(mx, my + 9); c.closePath(); c.fillStyle = cores[i % cores.length]; c.fill(); c.strokeStyle = 'rgba(40,30,50,0.35)'; c.lineWidth = 1; c.stroke();
    }
  } else if (tema === 'mansao') {
    // colunas douradas na frente + friso dourado
    for (const u of [0.18, 0.36, 0.64, 0.82]) box(c, hx + u * w - 0.05, hy + d + 0.02, 0.1, 0.1, z, v.floors * 30, '#f4ead0');
    box(c, hx - 0.02, hy + d + 0.02, w + 0.04, 0.14, z + v.floors * 30 - 4, 5, '#c9a227');
  }
}
// ---------- quintal por tema (atrás / na frente da casa) ----------
function quintalTras(c, tema, gx, gy) {
  if (tema === 'praia') coqueiro(c, gx + 2.65, gy + 0.45);
  else tree(c, gx + 0.45, gy + 0.35, 5, 0.75, '#4fae4a');
}
function quintalFrente(c, tema, gx, gy) {
  if (tema === 'praia') { guardaSol(c, gx + 0.6, gy + 2.55); bush(c, gx + 2.6, gy + 2.5, 5, 0.9, '#ffd84a'); }
  else if (tema === 'festa') { baloes(c, gx + 1.05, gy + 2.85); baloes(c, gx + 1.95, gy + 2.85, 1); }
  else if (tema === 'mansao') { piscina(c, gx + 0.2, gy + 2.15, 1.0, 0.65); bush(c, gx + 2.6, gy + 2.5, 5, 0.9, '#ffd84a'); }
  else if (tema === 'doce') { pirulito(c, gx + 0.5, gy + 2.6, '#ff5c8a'); pirulito(c, gx + 2.6, gy + 2.5, '#4aa3ff'); }
  else if (tema === 'estrela') { bush(c, gx + 0.5, gy + 2.6, 5, 1, '#ffd84a'); bush(c, gx + 2.6, gy + 2.5, 5, 0.9, '#ffd84a'); }
  else { bush(c, gx + 0.5, gy + 2.6, 5, 1, '#ff7aa8'); bush(c, gx + 2.6, gy + 2.5, 5, 0.9, '#ffd84a'); }
}
function coqueiro(c, gx, gy) {
  const z = 5; let p = iso(gx, gy, z);
  for (let i = 0; i < 7; i++) { const q = iso(gx + i * 0.03, gy, z + (i + 1) * 9); c.beginPath(); c.moveTo(...p); c.lineTo(...q); c.strokeStyle = i % 2 ? '#a8763c' : '#8f6230'; c.lineWidth = 6 - i * 0.4; c.lineCap = 'round'; c.stroke(); p = q; }
  for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; c.beginPath(); c.moveTo(p[0], p[1]); c.quadraticCurveTo(p[0] + Math.cos(a) * 18, p[1] - 10 + Math.sin(a) * 6, p[0] + Math.cos(a) * 30, p[1] + 6 + Math.sin(a) * 10); c.strokeStyle = k % 2 ? '#3f9e44' : '#5cba4f'; c.lineWidth = 6; c.stroke(); }
  for (const dx of [-3, 3]) sphere(c, p[0] + dx, p[1] + 4, 3.5, '#7a5a2a');
}
function guardaSol(c, gx, gy) {
  const z = 5, a = iso(gx, gy, z), b = iso(gx, gy, z + 26);
  c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.strokeStyle = '#fdfbf6'; c.lineWidth = 2; c.stroke();
  for (let i = 0; i < 6; i++) { const a0 = Math.PI + i * Math.PI / 6, a1 = a0 + Math.PI / 6; c.beginPath(); c.moveTo(b[0], b[1] - 6); c.lineTo(b[0] + Math.cos(a0) * 22, b[1] + 4 + Math.sin(a0) * 4); c.lineTo(b[0] + Math.cos(a1) * 22, b[1] + 4 + Math.sin(a1) * 4); c.closePath(); c.fillStyle = i % 2 ? '#ffffff' : '#ef5a48'; c.fill(); c.strokeStyle = 'rgba(40,30,50,0.35)'; c.lineWidth = 1; c.stroke(); }
  box(c, gx + 0.15, gy - 0.1, 0.45, 0.22, z, 4, '#2fa3a0');
}
function baloes(c, gx, gy, k = 0) {
  const z = 5, a = iso(gx, gy, z + 8), cores = k ? ['#4aa3ff', '#ffd84a', '#5fd068'] : ['#ff5c8a', '#c06bff', '#ff8a2a'];
  [[-8, -40], [4, -48], [12, -36]].forEach(([dx, dy], i) => { c.beginPath(); c.moveTo(...a); c.quadraticCurveTo(a[0] + dx / 2, a[1] + dy / 2, a[0] + dx, a[1] + dy + 8); c.strokeStyle = 'rgba(60,50,70,0.6)'; c.lineWidth = 1; c.stroke(); sphere(c, a[0] + dx, a[1] + dy, 7.5, cores[i]); });
}
function piscina(c, gx, gy, w, d) {
  const z = 5.6; fillP(c, faceT(gx - 0.06, gy - 0.06, w + 0.12, d + 0.12, z), '#f4ead0', EDGE);
  const q = faceT(gx, gy, w, d, z + 0.2); fillP(c, q, vgrad(c, q, '#7fd6ff', '#2f8fd8'));
  for (let i = 0; i < 3; i++) { const p = iso(gx + 0.2 + i * 0.3, gy + 0.2 + (i % 2) * 0.25, z); c.beginPath(); c.ellipse(p[0], p[1], 6, 2, 0, 0, 7); c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1.2; c.stroke(); }
}
function pirulito(c, gx, gy, cor) {
  const z = 5, a = iso(gx, gy, z), b = iso(gx, gy, z + 22);
  c.beginPath(); c.moveTo(...a); c.lineTo(...b); c.strokeStyle = '#fdfbf6'; c.lineWidth = 2.5; c.stroke();
  c.beginPath(); c.arc(b[0], b[1] - 6, 9, 0, 7); c.fillStyle = '#ffffff'; c.fill(); c.strokeStyle = 'rgba(40,30,50,0.4)'; c.lineWidth = 1; c.stroke();
  c.beginPath(); for (let t = 0; t < 12; t += 0.2) { const r = t * 0.7; c.lineTo(b[0] + Math.cos(t) * r, b[1] - 6 + Math.sin(t) * r); } c.strokeStyle = cor; c.lineWidth = 2.5; c.stroke();
}

// ---------- prédios especiais ----------
function torreEspacial(c, gx, gy) {
  const z = 5, w = 1.5, d = 1.4, x = gx + 0.75, y = gy + 0.55, H = 78, b = [x, y, w, d, z];
  box(c, x, y, w, d, z, H, '#f1f4fa');
  for (const zz of [z + 24, z + 50]) { fillP(c, faceQuad(onL, x, y, w, d, 0, 1, zz, zz + 5), '#3f7fd6'); fillP(c, faceQuad(onR, x, y, w, d, 0, 1, zz, zz + 5), '#2b5aa8'); }
  for (const zz of [z + 12, z + 36, z + 62]) for (const u of [0.25, 0.75]) { const p = onL(x, y, w, d, u, zz); c.beginPath(); c.ellipse(p[0], p[1], 6.5, 6.5, 0, 0, 7); c.fillStyle = '#9fdcff'; c.fill(); c.strokeStyle = '#8a95a8'; c.lineWidth = 2.5; c.stroke(); }
  for (const zz of [z + 12, z + 36, z + 62]) { const p = onR(x, y, w, d, 0.5, zz); c.beginPath(); c.ellipse(p[0], p[1], 5.5, 6.5, 0, 0, 7); c.fillStyle = '#5a8ab8'; c.fill(); c.strokeStyle = '#8a95a8'; c.lineWidth = 2.5; c.stroke(); }
  doorOn(c, onL, b, 0.42, 0.58, 18, '#8a95a8');
  // cúpula
  const m = iso(x + w / 2, y + d / 2, z + H); const g = c.createRadialGradient(m[0] - 12, m[1] - 26, 4, m[0], m[1] - 10, 44);
  g.addColorStop(0, 'rgba(230,248,255,0.95)'); g.addColorStop(0.6, 'rgba(120,200,255,0.85)'); g.addColorStop(1, 'rgba(60,120,200,0.9)');
  c.beginPath(); c.ellipse(m[0], m[1], 40, 20, 0, Math.PI, 0); c.ellipse(m[0], m[1], 40, 34, 0, 0, Math.PI, true); c.closePath(); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(40,30,50,0.4)'; c.lineWidth = 1.2; c.stroke();
  c.beginPath(); c.ellipse(m[0] - 14, m[1] - 18, 6, 10, -0.5, 0, 7); c.fillStyle = 'rgba(255,255,255,0.6)'; c.fill();
  // antena
  const a = iso(x + w * 0.9, y + d * 0.2, z + H), t = iso(x + w * 0.9, y + d * 0.2, z + H + 44);
  c.beginPath(); c.moveTo(...a); c.lineTo(...t); c.strokeStyle = '#8a95a8'; c.lineWidth = 2; c.stroke(); sphere(c, t[0], t[1], 4, '#ff3b3b');
  c.beginPath(); c.ellipse(t[0], t[1] + 14, 10, 4, 0, 0, 7); c.strokeStyle = '#c7cbd2'; c.lineWidth = 2; c.stroke();
  return iso(x + w / 2, y + d / 2, z + H + 40);
}
function foguete(c, gx, gy) {
  const z = 5, p = iso(gx, gy, z);
  for (const [dx, dy] of [[-9, 0], [9, 0]]) { c.beginPath(); c.moveTo(p[0] + dx * 0.6, p[1] - 14 + dy); c.lineTo(p[0] + dx * 1.4, p[1] + dy); c.lineTo(p[0] + dx * 0.6, p[1] - 4 + dy); c.closePath(); c.fillStyle = '#e0573f'; c.fill(); c.strokeStyle = 'rgba(40,30,50,0.4)'; c.stroke(); }
  const g = c.createLinearGradient(p[0] - 7, 0, p[0] + 7, 0); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b9c2d0');
  c.beginPath(); c.moveTo(p[0] - 7, p[1] - 4); c.lineTo(p[0] - 7, p[1] - 34); c.quadraticCurveTo(p[0], p[1] - 52, p[0] + 7, p[1] - 34); c.lineTo(p[0] + 7, p[1] - 4); c.closePath(); c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(40,30,50,0.45)'; c.lineWidth = 1.2; c.stroke();
  c.beginPath(); c.arc(p[0], p[1] - 26, 3.5, 0, 7); c.fillStyle = '#9fdcff'; c.fill(); c.strokeStyle = '#8a95a8'; c.stroke();
  c.fillStyle = '#e0573f'; c.beginPath(); c.moveTo(p[0] - 5.5, p[1] - 40); c.quadraticCurveTo(p[0], p[1] - 52, p[0] + 5.5, p[1] - 40); c.closePath(); c.fill();
}
function castelo(c, gx, gy) {
  const z = 5, x = gx + 0.6, y = gy + 0.5, w = 1.9, d = 1.5, H = 46, pedra = '#d9d2c5', b = [x, y, w, d, z];
  box(c, x, y, w, d, z, H, pedra);
  // tijolinhos
  for (let r = 0; r < 5; r++) for (let k = 0; k < 8; k++) { const u = (k + (r % 2) * 0.5) / 8; if (u > 0.95) continue; const q = faceQuad(onL, x, y, w, d, u, u + 0.002, z + 6 + r * 8, z + 10 + r * 8); fillP(c, q, null, 'rgba(120,100,80,0.25)'); }
  // ameias
  for (let k = 0; k < 7; k++) { box(c, x + k * (w / 6.5), y + d - 0.14, 0.14, 0.14, z + H, 7, pedra); box(c, x + w - 0.14, y + k * (d / 6.5), 0.14, 0.14, z + H, 7, pedra); }
  // portão em arco
  const pa = faceQuad(onL, x, y, w, d, 0.4, 0.6, z, z + 22); fillP(c, pa, '#6b4423', 'rgba(40,30,50,0.5)');
  const ta = onL(x, y, w, d, 0.5, z + 22); c.beginPath(); c.ellipse(ta[0], ta[1], 9, 7, 0.46, Math.PI, 0); c.fillStyle = '#6b4423'; c.fill();
  for (const u of [0.15, 0.82]) windowOn(c, onL, b, u, u + 0.07, z + 26, z + 38, true);
  windowOn(c, onR, b, 0.45, 0.55, z + 26, z + 38, false, true);
  // coroa sobre o portão
  const cr = onL(x, y, w, d, 0.5, z + 36); c.beginPath(); c.moveTo(cr[0] - 9, cr[1] + 4); c.lineTo(cr[0] - 9, cr[1] - 5); c.lineTo(cr[0] - 4, cr[1]); c.lineTo(cr[0], cr[1] - 8); c.lineTo(cr[0] + 4, cr[1]); c.lineTo(cr[0] + 9, cr[1] - 5); c.lineTo(cr[0] + 9, cr[1] + 4); c.closePath(); c.fillStyle = '#f2c230'; c.fill(); c.strokeStyle = '#8a5a10'; c.lineWidth = 1.2; c.stroke();
  // torres nos cantos
  for (const [tx, ty, f] of [[x - 0.2, y - 0.2, 0], [x + w - 0.3, y - 0.2, 1], [x - 0.2, y + d - 0.3, 2], [x + w - 0.3, y + d - 0.3, 3]]) {
    box(c, tx, ty, 0.5, 0.5, z, H + 22, sh(pedra, f === 3 ? 0.04 : 0));
    pyramidRoof(c, tx, ty, 0.5, 0.5, z + H + 22, 30, '#c8323c', 0.06);
    bandeira(c, tx + 0.25, ty + 0.25, z + H + 52, 14, '#f2c230');
  }
  return iso(x + w / 2, y + d / 2, z + H + 60);
}
function torreGalaxia(c, gx, gy) {
  const z = 5, w = 1.5, d = 1.4, x = gx + 0.75, y = gy + 0.55, H = 100, b = [x, y, w, d, z];
  const L = faceL(x, y, w, d, z, H), R = faceR(x, y, w, d, z, H);
  fillP(c, L, vgrad(c, L, '#8a5ad6', '#3a2470'), EDGE); fillP(c, R, vgrad(c, R, '#6a40b0', '#2a1a55'), EDGE); fillP(c, faceT(x, y, w, d, z + H), '#a07ae0', EDGE);
  for (let i = 0; i < 40; i++) { const f = i % 3 ? onL : onR; const p = f(x, y, w, d, 0.05 + hash(i, x, 4) * 0.9, z + 8 + hash(y, i, 5) * (H - 14)); c.fillStyle = i % 7 ? 'rgba(255,255,255,0.85)' : '#ffd84a'; c.beginPath(); c.arc(p[0], p[1], i % 7 ? 1.2 : 2.2, 0, 7); c.fill(); }
  for (let f = 0; f < 4; f++) for (const u of [0.15, 0.55]) windowOn(c, onL, b, u, u + 0.25, z + 12 + f * 22, z + 24 + f * 22, true);
  doorOn(c, onL, b, 0.4, 0.6, 16, '#2a1a55');
  // planeta com anel flutuando
  const m = iso(x + w / 2, y + d / 2, z + H + 36);
  const g = c.createRadialGradient(m[0], m[1], 4, m[0], m[1], 50); g.addColorStop(0, 'rgba(200,160,255,0.55)'); g.addColorStop(1, 'rgba(200,160,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(m[0], m[1], 50, 0, 7); c.fill();
  c.beginPath(); c.ellipse(m[0], m[1], 30, 9, -0.25, Math.PI, 0); c.strokeStyle = '#ffd84a'; c.lineWidth = 3.5; c.stroke();
  sphere(c, m[0], m[1], 16, '#ff7aa8');
  c.beginPath(); c.ellipse(m[0], m[1], 30, 9, -0.25, 0, Math.PI); c.strokeStyle = '#ffd84a'; c.lineWidth = 3.5; c.stroke();
  estrela2D(c, m[0] + 34, m[1] - 22, 6, '#fff27a', '#b08a10'); estrela2D(c, m[0] - 36, m[1] - 10, 4.5, '#ffffff', '#8a7ad0');
  return iso(x + w / 2, y + d / 2, z + H + 60);
}
// altura do nome em cima do prédio especial
function alturaTorre(tema) { return tema === 'castelo' ? 112 : tema === 'galaxia' ? 158 : 128; }
