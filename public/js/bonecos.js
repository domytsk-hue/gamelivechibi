// Bonecos chibi "Vinil brilhante" + guarda-roupa
const VOL = '#2a2340', VLW = 2.6;
function vRR(c, x, y, w, h, r, fill, ol = true) { c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = fill; c.fill(); if (ol) { c.strokeStyle = VOL; c.lineWidth = VLW; c.lineJoin = 'round'; c.stroke(); } }
function vBall(c, x, y, r, col, ol = true) {
  const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.05);
  g.addColorStop(0, sh(col, 0.3)); g.addColorStop(0.6, col); g.addColorStop(1, sh(col, -0.3));
  c.beginPath(); c.arc(x, y, r, 0, 7); c.fillStyle = g; c.fill(); if (ol) { c.strokeStyle = VOL; c.lineWidth = VLW; c.stroke(); }
}
function vGloss(c, x, y, rx, ry, a = 0.85, rot = -0.5) { c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, 7); c.fillStyle = `rgba(255,255,255,${a})`; c.fill(); }
function vPath(c, pts, fill, ol = true) { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.fillStyle = fill; c.fill(); if (ol) { c.strokeStyle = VOL; c.lineWidth = VLW; c.lineJoin = 'round'; c.stroke(); } }
function vStar(c, x, y, r, col) { c.beginPath(); for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath(); c.fillStyle = col; c.fill(); }

function vinyl(c, x, y, o, s = 1) {
  const Y0 = y; c.save(); c.translate(x, y); c.scale(s, s);
  const f = o.f || 1, acc = o.acc || [], r = 17, bodyTop = -27, hy = bodyTop - r + 0.5;
  const top = o.top, pants = o.pants || '#3f6fb5', shoes = o.shoes || '#ffffff', skin = o.skin, hair = o.hair;
  c.beginPath(); c.ellipse(0, 0, 15, 5.5, 0, 0, 7); c.fillStyle = 'rgba(30,30,50,0.25)'; c.fill();
  // capa
  if (o.cape) { vPath(c, [[-11, bodyTop + 1], [11, bodyTop + 1], [16, -3], [-16, -3]], o.cape); vPath(c, [[-11, bodyTop + 1], [-16, -3], [-12, -3]], sh(o.cape, -0.25), false); }
  // cabelo de trás
  const hs = o.hairStyle;
  if (!acc.includes('capacete')) {
    if (hs === 'longo') vRR(c, -r * 1.02, hy - r * 0.3, r * 2.04, r * 1.6, r * 0.6, hair);
    if (hs === 'rabo') vBall(c, -f * r * 0.98, hy + r * 0.1, r * 0.45, hair);
    if (hs === 'coque') vBall(c, 0, hy - r * 1.02, r * 0.45, hair);
    if (hs === 'black') vBall(c, 0, hy - r * 0.15, r * 1.3, hair);
    if (hs === 'chiquinha') { vBall(c, -r * 1.05, hy - r * 0.35, r * 0.42, hair); vBall(c, r * 1.05, hy - r * 0.35, r * 0.42, hair); }
  }
  // pernas
  if (!o.robe) {
    if (o.skirt) { vRR(c, -7, -10, 5.5, 8, 2.5, skin); vRR(c, 1.5, -10, 5.5, 8, 2.5, sh(skin, -0.1)); }
    else { vRR(c, -8, -14, 7, 12, 3.5, pants); vRR(c, 1, -14, 7, 12, 3.5, sh(pants, -0.12)); if (o.det === 'chef') { for (const [a, b] of [[-7, -12], [-5, -8], [3, -11], [5, -7]]) { c.fillStyle = '#f4f4f4'; c.fillRect(a, b, 2, 2); } } }
    for (const sx of [-4.5, 4.5]) { c.beginPath(); c.ellipse(sx + f, -2, 5.4, 3.4, 0, 0, 7); c.fillStyle = shoes; c.fill(); c.strokeStyle = VOL; c.lineWidth = VLW; c.stroke(); vGloss(c, sx + f - 1.8, -3.5, 2, 1, 0.7, 0); }
  }
  // corpo
  const bg = c.createLinearGradient(-10, 0, 10, 0); bg.addColorStop(0, sh(top, 0.2)); bg.addColorStop(1, sh(top, -0.2));
  if (o.robe) { vPath(c, [[-10.5, bodyTop + 2], [10.5, bodyTop + 2], [14, -3], [-14, -3]], bg); c.beginPath(); c.ellipse(-4 + f, -2, 4, 2.5, 0, 0, 7); c.ellipse(5 + f, -2, 4, 2.5, 0, 0, 7); c.fillStyle = shoes; c.fill(); }
  vRR(c, -10.5, bodyTop, 21, 15, 7, bg);
  if (o.skirt) { vPath(c, [[-10, -14], [10, -14], [15, -6], [-15, -6]], o.skirt); c.fillStyle = 'rgba(255,255,255,0.5)'; for (const dx of [-8, -2, 4, 10]) { c.beginPath(); c.arc(dx, -7.5, 1.3, 0, 7); c.fill(); } }
  const d = o.det;
  if (d === 'listra') { c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(-9.5, bodyTop + 6, 19, 3); }
  if (d === 'regata') { }
  if (d === 'moletom') { vRR(c, -10, bodyTop - 2, 20, 6, 3, sh(top, -0.2), false); vRR(c, -5, bodyTop + 8, 10, 5, 2, sh(top, -0.12), false); c.fillStyle = '#ffffff'; c.fillRect(-3, bodyTop + 2, 1.5, 4); c.fillRect(1.5, bodyTop + 2, 1.5, 4); }
  if (d === 'numero') { c.font = 'bold 9px "Fredoka", "DejaVu Sans", sans-serif'; c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('10', 0, bodyTop + 8); c.fillRect(-10, bodyTop + 1, 2, 12); }
  if (d === 'gravata') { vPath(c, [[-5, bodyTop], [0, bodyTop + 9], [5, bodyTop]], '#ffffff', false); vPath(c, [[-1.6, bodyTop + 2], [1.6, bodyTop + 2], [2.2, bodyTop + 10], [0, bodyTop + 13], [-2.2, bodyTop + 10]], '#d6303e', false); }
  if (d === 'chef') { c.fillStyle = '#c9c9d2'; for (const [a, b] of [[-4, 4], [-4, 9], [4, 4], [4, 9]]) { c.beginPath(); c.arc(a, bodyTop + b, 1.4, 0, 7); c.fill(); } vRR(c, -6, bodyTop - 1, 12, 3, 1.5, '#ff5a5a', false); }
  if (d === 'pirata') { c.fillStyle = '#2f4f9f'; for (let i = 0; i < 3; i++) c.fillRect(-10, bodyTop + 2 + i * 4.5, 20, 2.2); vRR(c, -10.5, -15, 21, 3, 1, '#3a2a1e', false); c.fillStyle = '#ffd84a'; c.fillRect(-2, -15, 4, 3); }
  if (d === 'estrelas') { vStar(c, -4, bodyTop + 6, 2.6, '#ffd84a'); vStar(c, 5, bodyTop + 10, 2, '#ffd84a'); vStar(c, 8, -6, 2.2, '#ffd84a'); vStar(c, -8, -9, 1.8, '#ffd84a'); vRR(c, -10, -15, 20, 2.5, 1, '#ffd84a', false); }
  if (d === 'arminho') { vRR(c, -12, bodyTop - 1, 24, 6, 3, '#ffffff'); c.fillStyle = '#1a1a22'; for (const a of [-7, 0, 7]) c.fillRect(a, bodyTop + 1, 1.5, 2); c.fillStyle = '#f2c230'; c.fillRect(-1.5, bodyTop + 5, 3, 10); }
  if (d === 'astro') { vRR(c, -6, bodyTop + 4, 12, 8, 2, '#cfd6e3'); c.fillStyle = '#ff5a5a'; c.beginPath(); c.arc(-2.5, bodyTop + 8, 1.6, 0, 7); c.fill(); c.fillStyle = '#4aa3ff'; c.beginPath(); c.arc(2.5, bodyTop + 8, 1.6, 0, 7); c.fill(); }
  if (d === 'traje') { vPath(c, [[-4, bodyTop], [0, bodyTop + 10], [4, bodyTop]], '#ffffff', false); vPath(c, [[-1.5, bodyTop + 1], [1.5, bodyTop + 1], [0, bodyTop + 4]], '#2b2f3e', false); vBall(c, 6, bodyTop + 4, 2.6, '#ff9ec0', false); c.fillStyle = '#3c9a4a'; c.fillRect(5, bodyTop + 6, 2, 3); }
  if (d === 'festa') { vRR(c, -10, -16, 20, 2.5, 1, '#ffd0e0', false); vBall(c, 0, bodyTop + 3, 2, '#ffffff', false); }
  vGloss(c, -5, bodyTop + 4, 3.5, 2, 0.6);
  // braços
  const sl = d === 'regata' || d === 'festa' ? skin : (o.sleeve || top);
  vRR(c, -15.5, bodyTop + 1, 6, 13, 3, sh(sl, 0.05)); vRR(c, 9.5, bodyTop + 1, 6, 13, 3, sh(sl, -0.2));
  const hand = o.gloves || skin; vBall(c, -12.5, bodyTop + 15, 3.4, hand); vBall(c, 12.5, bodyTop + 15, 3.4, hand);
  // cabeça
  vBall(c, 0, hy, r, skin);
  const fx = f * r * 0.16;
  if (!acc.includes('oculos')) for (const dx of [-0.38, 0.38]) {
    if (acc.includes('tapa') && dx > 0) continue;
    c.beginPath(); c.ellipse(fx + dx * r, hy + r * 0.15, r * 0.2, r * 0.26, 0, 0, 7); c.fillStyle = '#1e1a2e'; c.fill();
    c.beginPath(); c.arc(fx + dx * r - r * 0.07, hy + r * 0.06, r * 0.08, 0, 7); c.fillStyle = '#fff'; c.fill();
    c.beginPath(); c.arc(fx + dx * r + r * 0.07, hy + r * 0.25, r * 0.04, 0, 7); c.fill();
  }
  c.fillStyle = 'rgba(255,110,120,0.4)'; for (const dx of [-0.6, 0.6]) { c.beginPath(); c.ellipse(fx + dx * r, hy + r * 0.47, r * 0.17, r * 0.1, 0, 0, 7); c.fill(); }
  c.beginPath(); c.arc(fx, hy + r * 0.42, r * 0.12, 0.15 * Math.PI, 0.85 * Math.PI); c.strokeStyle = VOL; c.lineWidth = 1.5; c.stroke();
  // cabelo da frente
  if (hs !== 'careca' && !acc.includes('capacete')) {
    c.beginPath(); c.arc(0, hy, r * 1.04, Math.PI * 1.02, Math.PI * 1.98);
    for (let i = 5; i >= 0; i--) { const t = i / 5; c.lineTo(-r + 2 * r * t, hy - r * 0.18 + Math.sin(t * Math.PI * 3 + f) * r * 0.1); }
    c.closePath(); const hg = c.createLinearGradient(0, hy - r, 0, hy); hg.addColorStop(0, sh(hair, 0.3)); hg.addColorStop(1, hair); c.fillStyle = hg; c.fill(); c.strokeStyle = VOL; c.lineWidth = VLW; c.stroke();
    if (hs === 'espetado') for (let i = 0; i < 4; i++) { const a = Math.PI * (1.15 + i * 0.23); const bx = Math.cos(a) * r, by = hy + Math.sin(a) * r; vPath(c, [[bx - 4.5, by + 2], [bx + Math.cos(a) * 8, by + Math.sin(a) * 8], [bx + 4.5, by + 2]], hair); }
    if (hs === 'moicano') { vRR(c, -4, hy - r * 1.45, 8, r * 0.75, 4, hair); }
    if (hs === 'franja') vPath(c, [[-r * 0.95, hy - r * 0.2], [r * 0.2, hy - r * 0.95], [r * 0.6, hy - r * 0.05], [r * 0.2, hy - r * 0.35]], hair);
    vGloss(c, -r * 0.35, hy - r * 0.72, r * 0.32, r * 0.12, 0.7);
  }
  vGloss(c, -r * 0.5, hy - r * 0.05, r * 0.14, r * 0.08, 0.55);
  // acessórios
  for (const a of acc) {
    if (a === 'fone') { c.beginPath(); c.arc(0, hy, r * 1.1, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = VOL; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#5a5470'; c.lineWidth = 2.5; c.stroke(); for (const sd of [-1, 1]) { vRR(c, sd * r * 1.05 - 4.5, hy - 4, 9, 13, 4.5, '#ff5c8a'); vGloss(c, sd * r * 1.05 - 1.5, hy - 1, 1.5, 3, 0.7, 0); } }
    if (a === 'bone') { const hc = o.hatC || '#3f7fd6'; c.beginPath(); c.arc(0, hy - r * 0.1, r * 1.05, Math.PI, 0); c.closePath(); c.fillStyle = hc; c.fill(); c.strokeStyle = VOL; c.lineWidth = VLW; c.stroke(); c.beginPath(); c.ellipse(f * r * 0.7, hy - r * 0.08, r * 0.78, r * 0.22, 0, 0, 7); c.fillStyle = sh(hc, -0.25); c.fill(); c.stroke(); vGloss(c, -r * 0.35, hy - r * 0.75, r * 0.3, r * 0.1); vBall(c, 0, hy - r * 1.12, 2.4, sh(hc, -0.2), false); }
    if (a === 'coroa') { const w = r * 0.9, b = hy - r * 0.78; const cg = c.createLinearGradient(0, b - 14, 0, b); cg.addColorStop(0, '#fff2a8'); cg.addColorStop(1, '#f2b81f'); vPath(c, [[-w, b], [-w, b - 11], [-w / 2, b - 5], [0, b - 15], [w / 2, b - 5], [w, b - 11], [w, b]], cg); vBall(c, 0, b - 5, 2.6, '#e0324a', false); vBall(c, -w * 0.6, b - 3, 1.8, '#3a8fd6', false); vBall(c, w * 0.6, b - 3, 1.8, '#3fbf6a', false); vGloss(c, -w * 0.6, b - 8, 1.5, 3, 0.8, 0); }
    if (a === 'oculos') { for (const dx of [-0.38, 0.38]) { vRR(c, fx + dx * r - 6.5, hy + r * 0.02, 13, 9, 4, '#1e1a2e'); vGloss(c, fx + dx * r - 2.5, hy + r * 0.12, 2.5, 1.2, 0.8); } c.fillStyle = '#1e1a2e'; c.fillRect(fx - 2, hy + r * 0.1, 4, 2); }
    if (a === 'tapa') { c.beginPath(); c.moveTo(-r * 0.95, hy - r * 0.35); c.lineTo(r * 0.9, hy + r * 0.05); c.strokeStyle = '#1e1a2e'; c.lineWidth = 2; c.stroke(); vRR(c, fx + 0.38 * r - 5, hy + r * 0.0, 10, 9, 4, '#1e1a2e'); }
    if (a === 'bandana') { c.beginPath(); c.arc(0, hy - r * 0.05, r * 1.06, Math.PI * 1.02, Math.PI * 1.98); c.closePath(); c.fillStyle = '#d63a3a'; c.fill(); c.strokeStyle = VOL; c.lineWidth = VLW; c.stroke(); c.fillStyle = '#ffffff'; for (const [a2, b] of [[-8, -10], [2, -14], [9, -6], [-2, -5]]) { c.beginPath(); c.arc(a2, hy + b, 1.6, 0, 7); c.fill(); } vPath(c, [[-f * r, hy - 2], [-f * (r + 8), hy + 4], [-f * (r + 3), hy + 8]], '#b02a2a'); vGloss(c, -r * 0.35, hy - r * 0.7, r * 0.3, r * 0.1, 0.6); }
    if (a === 'mago') { const hc = '#5b3fa8'; vPath(c, [[-r * 0.85, hy - r * 0.6], [r * 0.85, hy - r * 0.6], [r * 0.5, hy - r * 1.5], [r * 0.9, hy - r * 2.2], [-r * 0.1, hy - r * 1.7]], hc); vRR(c, -r * 1.3, hy - r * 0.75, r * 2.6, 6, 3, sh(hc, -0.15)); c.fillStyle = '#ffd84a'; c.fillRect(-r * 0.8, hy - r * 0.9, r * 1.6, 3); vStar(c, 0, hy - r * 1.25, 3.5, '#ffd84a'); vStar(c, r * 0.9, hy - r * 2.2, 2.5, '#ffd84a'); vGloss(c, -r * 0.35, hy - r * 1.1, 2, 5, 0.5, 0.3); }
    if (a === 'cartola') { const hc = o.hatC || '#2b2f3e'; vRR(c, -r * 0.62, hy - r * 1.95, r * 1.24, r * 1.3, 4, hc); vRR(c, -r * 1.15, hy - r * 0.78, r * 2.3, 6, 3, hc); c.fillStyle = '#e8335a'; c.fillRect(-r * 0.62 + 1, hy - r * 1.0, r * 1.24 - 2, 4); vBall(c, r * 0.4, hy - r * 0.9, 3, '#ff5c8a', false); vGloss(c, -r * 0.3, hy - r * 1.6, 1.8, 5, 0.6, 0); }
    if (a === 'chef') { for (const [a2, b, rr] of [[-8, -1.25, 7], [8, -1.25, 7], [0, -1.6, 8.5]]) vBall(c, a2, hy + r * b, rr, '#ffffff'); vRR(c, -r * 0.7, hy - r * 1.2, r * 1.4, r * 0.5, 3, '#f0f0f4'); }
    if (a === 'laco') { const bx = f * r * 0.65, by = hy - r * 0.8; vPath(c, [[bx, by], [bx - 9, by - 7], [bx - 9, by + 6]], '#ff5c8a'); vPath(c, [[bx, by], [bx + 9, by - 7], [bx + 9, by + 6]], '#ff5c8a'); vBall(c, bx, by, 3, '#ff8fb3'); }
    if (a === 'flores') { const cols = ['#ff7aa8', '#ffffff', '#ffd84a', '#c9a7ff', '#ff7aa8']; for (let i = 0; i < 5; i++) { const ang = Math.PI * (1.12 + i * 0.19); const px = Math.cos(ang) * r * 0.98, py = hy + Math.sin(ang) * r * 0.98; vBall(c, px, py, 3.6, cols[i]); c.fillStyle = '#ffd84a'; c.beginPath(); c.arc(px, py, 1.2, 0, 7); c.fill(); } }
    if (a === 'aureola') { c.beginPath(); c.ellipse(0, hy - r * 1.35, r * 0.75, r * 0.22, 0, 0, 7); c.strokeStyle = 'rgba(255,230,120,0.5)'; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#ffd84a'; c.lineWidth = 3; c.stroke(); }
    if (a === 'capacete') { c.beginPath(); c.arc(0, hy, r * 1.32, 0, 7); c.fillStyle = 'rgba(180,225,255,0.28)'; c.fill(); c.strokeStyle = VOL; c.lineWidth = VLW; c.stroke(); c.beginPath(); c.arc(0, hy, r * 1.32, Math.PI * 0.15, Math.PI * 0.85); c.strokeStyle = '#cfd6e3'; c.lineWidth = 5; c.stroke(); vGloss(c, -r * 0.6, hy - r * 0.7, r * 0.45, r * 0.18, 0.75); vBall(c, r * 0.9, hy - r * 1.05, 2.5, '#ff5a5a', false); }
  }
  if (o.sparkle) for (const [dx, dy, rr] of [[-24, -40, 4], [24, -55, 3], [22, -18, 4.5]]) vStar(c, dx, dy, rr, '#fff27a');
  c.restore();
  return Y0 - (r * 2 + 34 + (acc.some((a) => ['mago', 'cartola', 'chef', 'coroa'].includes(a)) ? 20 : acc.includes('aureola') ? 12 : 0)) * s;
}

// ---------- folha do guarda-roupa ----------
const VBASE = { skin: '#f5c9a3', hair: '#5a3a24', hairStyle: 'curto', top: '#f4f1ea', pants: '#3f6fb5', shoes: '#ff5c5c', f: 1 };
const OUTFITS = [
  ['comum', 'Camiseta', { top: '#ff7a5c', det: 'listra' }],
  ['comum', 'Moletom', { top: '#8f7ac8', det: 'moletom', pants: '#3a3a48', shoes: '#f4f4f4' }],
  ['comum', 'Regata', { top: '#59c3a6', det: 'regata', pants: '#c99a5a', shoes: '#ffc43d' }],
  ['raro', 'Esportivo', { top: '#2fa84f', det: 'numero', pants: '#f4f4f4', shoes: '#2a2a3a' }],
  ['raro', 'Social', { top: '#2b2f3e', det: 'gravata', pants: '#2b2f3e', shoes: '#7a4a28' }],
  ['raro', 'Chef', { top: '#fbfbf7', det: 'chef', pants: '#3a3a48', shoes: '#2a2a3a', acc: ['chef'] }],
  ['epico', 'Pirata', { top: '#f4f1ea', det: 'pirata', pants: '#6b4423', shoes: '#2a1e2e', acc: ['bandana', 'tapa'] }],
  ['epico', 'Mago', { top: '#5b3fa8', det: 'estrelas', robe: true, shoes: '#3a2a5a', acc: ['mago'] }],
  ['epico', 'Festa', { top: '#ff7aa8', det: 'festa', skirt: '#ff7aa8', shoes: '#c2185b', acc: ['flores'] }],
  ['lendario', 'Realeza', { top: '#c8323c', det: 'arminho', pants: '#7a1f2b', shoes: '#f2c230', cape: '#b02a35', acc: ['coroa'], sparkle: true }],
  ['lendario', 'Astronauta', { top: '#eef1f6', det: 'astro', pants: '#eef1f6', shoes: '#9aa3b5', gloves: '#cfd6e3', acc: ['capacete'], sparkle: true }],
  ['lendario', 'Traje Rosa', { top: '#e8335a', det: 'traje', pants: '#2b2f3e', shoes: '#2a1e2e', acc: ['cartola'], sparkle: true }],
];
const RARC = { comum: '#e6e3f0', raro: '#4aa3ff', epico: '#c06bff', lendario: '#ffcc33' };
const RARN = { comum: 'COMUM', raro: 'RARO', epico: 'ÉPICO', lendario: 'LENDÁRIO' };
const SKINS2 = ['#ffe0c4', '#f5c9a3', '#e8b088', '#c68a5a', '#9c6644', '#6e4630'];
