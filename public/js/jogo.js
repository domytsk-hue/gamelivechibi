// ============================================================
//  Cidade da Live — lógica do jogo, câmera e desenho da tela 9:16
// ============================================================
(() => {
const CFG = window.CONFIG;
const W = 1080, H = 1920;
const tela = document.getElementById('tela');
const ctx = tela.getContext('2d');
const FONT = '"Fredoka", "DejaVu Sans", Verdana, sans-serif';
const CH_S = 0.6, CH_RES = 3.2;            // escala e resolução dos bonecos
const BG_RES = 1.5;
const RAR_ORDER = ['comum', 'raro', 'epico', 'lendario'];
const COR_NOVO = '#5fd068';
const HEAD = ['bone', 'flores', 'bandana', 'chef', 'mago', 'cartola', 'coroa', 'capacete', 'aureola', 'laco'];
const ACCS = [['fone', 'Fone'], ['bone', 'Boné'], ['oculos', 'Óculos escuros'], ['laco', 'Laço'], ['flores', 'Coroa de flores'], ['bandana', 'Bandana'], ['chef', 'Chapéu de chef'], ['mago', 'Chapéu de mago'], ['cartola', 'Cartola'], ['coroa', 'Coroa'], ['aureola', 'Auréola'], ['capacete', 'Capacete']];
const HAIRS = ['curto', 'longo', 'rabo', 'coque', 'black', 'espetado', 'chiquinha', 'moicano', 'franja', 'careca'];
const HAIR_C = ['#5a3a24', '#e8c26a', '#e85d9a', '#2a1e1a', '#1a1a22', '#d9653b', '#4a7bd6', '#6fcf97', '#9a9aa8', '#c9a7ff'];
const TOPS = ['#ff7a5c', '#7fc3e8', '#ffc43d', '#a6e3a1', '#c9a7ff', '#ff9ec0', '#f4f1ea', '#59c3a6'];
const PANTS = ['#3f6fb5', '#3a3a48', '#c99a5a', '#6b4423', '#2f8f6a'];
const SHOES = ['#ff5c5c', '#ffffff', '#ffc43d', '#2a2a3a', '#4aa3ff'];
const now = () => Date.now();
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const strHash = (s, k = 0) => { let h = 2166136261 ^ k; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const pickH = (arr, id, k) => arr[Math.floor(strHash(id, k) * arr.length)];

// ---------------- estado salvo ----------------
const KEY = 'cidadeDaLive.v1';
function novoEstado() { return { v: 1, salvoEm: 0, plots: PLOTS.map(() => ({ estado: 'venda', dono: null, andares: 1, obraFim: 0 })), pessoas: {} }; }
let S = novoEstado();
try { const j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j && j.v === 1 && j.plots && j.plots.length === PLOTS.length) S = j; } catch (e) { }
let saveTimer = null;
function salvar() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    S.salvoEm = now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { }
    enviarServidor({ tipo: 'salvar', estado: S });
  }, 800);
}

// ---------------- pessoas e visual ----------------
function nomeDe(p) { const n = (CFG.nomeExibido === 'apelido' ? p.apelido || p.usuario : p.usuario || p.apelido) || '???'; return n.length > 16 ? n.slice(0, 15) + '…' : n; }
function pessoa(u) {
  const id = String(u.id || u.usuario || u.apelido || 'anon').toLowerCase();
  let p = S.pessoas[id];
  if (!p) p = S.pessoas[id] = { id, usuario: u.usuario || id, apelido: u.apelido || '', curtidas: 0, morador: false, roupa: null, extra: null, terreno: null, desde: 0, visto: now() };
  if (u.usuario) p.usuario = u.usuario; if (u.apelido) p.apelido = u.apelido;
  p.visto = now();
  return p;
}
function lookDe(p) {
  const id = p.id;
  const base = { skin: pickH(SKINS2, id, 1), hairStyle: pickH(HAIRS, id, 2), hair: pickH(HAIR_C, id, 3), top: pickH(TOPS, id, 4), pants: pickH(PANTS, id, 5), shoes: pickH(SHOES, id, 6), f: 1 };
  let o = Object.assign({}, base);
  if (p.roupa != null && OUTFITS[p.roupa]) o = Object.assign(o, OUTFITS[p.roupa][2]);
  let acc = (o.acc || []).slice();
  if (p.extra) {
    if (HEAD.includes(p.extra)) acc = acc.filter((a) => !HEAD.includes(a));
    if (p.extra === 'oculos') acc = acc.filter((a) => a !== 'tapa');
    if (!acc.includes(p.extra)) acc.push(p.extra);
  }
  o.acc = acc; o.hatC = pickH(['#3f7fd6', '#e0573f', '#3f9e5a', '#2b2f3e', '#8a5ad6'], id, 7);
  return o;
}
function raridadeDe(p) { return p.roupa != null && OUTFITS[p.roupa] ? OUTFITS[p.roupa][0] : 'comum'; }
function corTag(p) { if (p.roupa == null && now() - (p.desde || 0) < 90000) return COR_NOVO; return RARC[raridadeDe(p)]; }

// ---------------- mundo (sprites) ----------------
let BG = null, FIXED = [], PLOT_SPR = [];
function buildWorld() {
  if (!BG) BG = buildBackground(BG_RES);
  if (!FIXED.length) FIXED = buildFixedSprites();
  PLOT_SPR = S.plots.map((st, i) => buildPlotSprites(i, st));
}
function rebuildPlot(i) { PLOT_SPR[i] = buildPlotSprites(i, S.plots[i]); }

// ---------------- bonecos ----------------
const ents = new Map();   // id -> boneco na tela
function charSprite(p) {
  const look = lookDe(p); const out = {};
  for (const f of [1, -1]) {
    const o = Object.assign({}, look, { f }); let top = 0;
    const bb = measure((c) => { top = vinyl(c, 0, 0, o, CH_S); });
    const pad = 6, x = Math.floor(bb[0] - pad), y = Math.floor(bb[1] - pad), w = Math.ceil(bb[2] - bb[0] + pad * 2), h = Math.ceil(bb[3] - bb[1] + pad * 2);
    const img = document.createElement('canvas'); img.width = Math.ceil(w * CH_RES); img.height = Math.ceil(h * CH_RES);
    const c = img.getContext('2d'); c.setTransform(CH_RES, 0, 0, CH_RES, -x * CH_RES, -y * CH_RES); vinyl(c, 0, 0, o, CH_S);
    out[f] = { img, x, y, w, h, top };
  }
  return out;
}
const P0 = [15.6, 19.6];
const OBST = [[11.5, 17.6], [18.2, 17.6], [11.6, 16.9], [18.6, 16.9], [12.6, 18.4], [17.4, 18.4], [13.75, 18.5], [16.35, 18.5], [12.6, 17.45], [18.0, 17.45]];
const SLOTS = (() => {
  const s = [];
  for (let y = 16.9; y <= 18.8; y += 0.6) for (let x = 11.3; x <= 18.8; x += 0.62) { if (x > 14.4 && x < 16.1) continue; if (OBST.some(([a, b]) => Math.hypot(a - x, b - y) < 0.5)) continue; s.push([x, y]); }
  for (const xs of [[10.4, 13.6], [16.6, 19.8]]) for (let x = xs[0]; x <= xs[1]; x += 0.65) s.push([x, 21.35]);
  return s;
})();
const slotDono = new Map(); // índice do slot -> id
const U = [[9.6, 9.6], [9.6, 19.6], [20.4, 19.6], [20.4, 9.6]];

function freeSlot(id) { const livres = SLOTS.map((_, i) => i).filter((i) => !slotDono.has(i)); if (!livres.length) return -1; const i = rand(livres); slotDono.set(i, id); return i; }
function releaseSlot(e) { if (e.slot >= 0) { slotDono.delete(e.slot); e.slot = -1; } }
function toRoad(from) { const pts = []; if (from[0] < 11) pts.push([9.6, 19.6]); else if (from[0] > 19.4) pts.push([20.4, 19.6]); else pts.push([from[0], 19.6]); pts.push(P0); return pts; }
function routeToGate(from, i) {
  const g = gateOf(i); const pts = toRoad(from);
  if (g[1] >= 20) { pts.push([15.5, g[1]]); }
  else if (g[1] > 12 && g[1] < 14) { pts.push([20.4, 19.6], [20.4, g[1]]); }
  else {
    const side = g[0] < 15 ? 9.6 : 20.4; pts.push([side, 19.6]);
    if (g[1] > 7) pts.push([side, g[1]]);
    else pts.push([side, 8.6], [15.0, 8.6], [15.0, g[1]]);
  }
  pts.push(g); return pts;
}

function spawnEnt(p, modo) {
  if (ents.has(p.id)) return ents.get(p.id);
  const e = { id: p.id, x: 0, y: 0, path: [], mode: 'onibus', slot: -1, f: 1, walkT: 0, spr: charSprite(p), bubble: null, alpha: 1, uIdx: 0, uDir: 1, off: (strHash(p.id, 9) - 0.5) * 0.6, idleT: Math.random() * 10, bornT: performance.now() };
  ents.set(p.id, e);
  if (modo === 'portao' && p.terreno != null) { const g = gateOf(p.terreno); e.x = g[0]; e.y = g[1]; e.mode = 'casa'; }
  else if (modo === 'praca') { const sl = freeSlot(e.id); if (sl >= 0) { e.slot = sl; [e.x, e.y] = SLOTS[sl]; e.mode = 'praca'; } else { [e.x, e.y] = U[1 + Math.floor(Math.random() * 2)]; e.mode = 'passeio'; e.after = 'passeio'; e.uIdx = 1; } }
  else BUS.queue.push(e.id);
  limitarBonecos();
  return e;
}
function destino(e) {
  const p = S.pessoas[e.id]; if (!p) return;
  releaseSlot(e);
  if (p.terreno != null) { e.path = routeToGate([e.x, e.y], p.terreno); e.after = 'casa'; e.mode = 'andando'; return; }
  const s = freeSlot(e.id);
  if (s >= 0) { e.slot = s; e.path = [SLOTS[s]]; e.after = 'praca'; e.mode = 'andando'; }
  else { e.path = toRoad([e.x, e.y]).slice(0, 1); e.after = 'passeio'; e.mode = 'andando'; e.uIdx = Math.random() < 0.5 ? 1 : 2; e.uDir = Math.random() < 0.5 ? 1 : -1; }
}
function irEmbora(e) {
  releaseSlot(e); e.path = toRoad([e.x, e.y]).concat([[15.5, 24], [15.5, 33.5]]); e.after = 'sumir'; e.mode = 'andando';
}
function limitarBonecos() {
  const max = CFG.maxBonecosNaTela || 60; if (ents.size <= max) return;
  const lista = [...ents.values()].filter((e) => e.mode !== 'onibus' && e.after !== 'sumir').map((e) => [e, S.pessoas[e.id]]).filter(([, p]) => p && p.terreno == null).sort((a, b) => a[1].visto - b[1].visto);
  for (const [e] of lista.slice(0, ents.size - max)) { releaseSlot(e); e.mode = 'sumindo'; }
}
function atualizarSprite(p) { const e = ents.get(p.id); if (e) e.spr = charSprite(p); }

function updateEnts(dt, t) {
  for (const e of [...ents.values()]) {
    if (e.mode === 'sumindo') { e.alpha -= dt * 1.5; if (e.alpha <= 0) { ents.delete(e.id); } continue; }
    if (e.mode === 'onibus') continue;
    if (e.path.length) {
      const [tx, ty] = e.path[0]; const ox = e.after === 'passeio' || (e.mode === 'andando' && e.after !== 'praca' && e.path.length > 1) ? e.off : 0;
      const dx = tx + ox * 0.5 - e.x, dy = ty + ox * 0.5 - e.y, d = Math.hypot(dx, dy), sp = 2.3 * dt;
      const sxDir = dx - dy; if (Math.abs(sxDir) > 0.02) e.f = sxDir > 0 ? 1 : -1;
      e.walkT += dt;
      if (d <= sp) { e.x = tx + ox * 0.5; e.y = ty + ox * 0.5; e.path.shift(); } else { e.x += dx / d * sp; e.y += dy / d * sp; }
      if (!e.path.length) {
        if (e.after === 'sumir') { ents.delete(e.id); continue; }
        if (e.after === 'passeio') { e.mode = 'passeio'; }
        else { e.mode = e.after; e.walkT = 0; if (e.mode === 'casa' || e.mode === 'praca') e.f = Math.random() < 0.5 ? 1 : -1; }
      }
    } else if (e.mode === 'passeio') {
      let n = e.uIdx + e.uDir; if (n < 0 || n >= U.length) { e.uDir *= -1; n = e.uIdx + e.uDir; }
      e.uIdx = n; e.path = [U[n]];
    } else {
      e.idleT -= dt; if (e.idleT <= 0) { e.idleT = 4 + Math.random() * 8; if (Math.random() < 0.4) e.f *= -1; e.hop = 0.5; }
    }
    if (e.hop > 0) e.hop -= dt;
  }
}

// ---------------- ônibus ----------------
const BUS = { estado: 'fora', t: 0, y: 36, queue: [], aBordo: [], cor: '#ff5c8a', saida: 0 };
const BUS_X = 14.9, BUS_PARK = 14.35, BUS_START = 35;
function updateBus(dt) {
  const B = BUS; B.t += dt;
  if (B.estado === 'fora') {
    B.queue = B.queue.filter((id) => ents.has(id));
    if (B.queue.length) { B.aBordo = B.queue.splice(0, 12); B.estado = 'chegando'; B.t = 0; B.cor = rand(['#ffc43d', '#ef5a48', '#4aa86a', '#4a86d8', '#c06bff', '#ff7aa8']); focar(iso(15.3, 16.3, 0), 1.9, 2.6 + B.aBordo.length * 0.4, 1); }
  } else if (B.estado === 'chegando') {
    const k = Math.min(1, B.t / 2.4), e = 1 - Math.pow(1 - k, 3); B.y = BUS_START + (BUS_PARK - BUS_START) * e;
    if (k >= 1) { B.estado = 'desembarque'; B.t = 0; B.saida = 0; }
  } else if (B.estado === 'desembarque') {
    if (B.t >= B.saida) {
      const id = B.aBordo.shift();
      if (id && ents.has(id)) { const e = ents.get(id); e.x = 15.75; e.y = 16.45; e.mode = 'parado'; destino(e); fx.burst(id, 6, '#ffffff'); }
      B.saida = B.t + 0.45;
      if (!B.aBordo.length) { B.estado = 'parado'; B.t = 0; }
    }
  } else if (B.estado === 'parado') { if (B.t > 0.8) { B.estado = 'partindo'; B.t = 0; } }
  else if (B.estado === 'partindo') {
    const k = Math.min(1, B.t / 2.2), e = k * k * k; B.y = BUS_PARK + (BUS_START - BUS_PARK) * e;
    if (k >= 1) { B.estado = 'fora'; B.t = 0; }
  }
}

// ---------------- mecânicas ----------------
function ensureMorador(p, motivo) {
  let novo = false;
  if (!p.morador) { p.morador = true; p.desde = now(); novo = true; toast(nomeDe(p), 'chegou na cidade de ônibus!', COR_NOVO); }
  if (!ents.has(p.id)) { spawnEnt(p, 'onibus'); if (!novo && motivo) toast(nomeDe(p), 'voltou para a cidade', '#7fd0d8', true); }
  salvar(); return novo;
}
function rollRaridade(min) {
  const mi = Math.max(0, RAR_ORDER.indexOf(min || 'comum'));
  const opts = RAR_ORDER.slice(mi); const tot = opts.reduce((a, r) => a + (CFG.chances[r] || 0), 0);
  let x = Math.random() * (tot || 1); for (const r of opts) { x -= CFG.chances[r] || 0; if (x <= 0) return r; } return opts[opts.length - 1];
}
function darRoupa(p, min, tentativas = 1) {
  let best = null;
  for (let i = 0; i < Math.max(1, Math.min(10, tentativas)); i++) { const r = rollRaridade(min); if (!best || RAR_ORDER.indexOf(r) > RAR_ORDER.indexOf(best)) best = r; }
  const opts = OUTFITS.map((o, k) => [o, k]).filter(([o, k]) => o[0] === best && k !== p.roupa);
  const [o, k] = rand(opts.length ? opts : OUTFITS.map((o, k) => [o, k]).filter(([o]) => o[0] === best));
  p.roupa = k; atualizarSprite(p);
  toast(nomeDe(p), `ganhou roupa ${RARN[o[0]]}: ${o[1]}`, RARC[o[0]]);
  fx.burst(p.id, o[0] === 'lendario' ? 40 : o[0] === 'epico' ? 24 : 12, RARC[o[0]]);
  if (o[0] === 'lendario' || o[0] === 'epico') focarEnt(p.id, 2.2, 3);
  salvar();
}
function darAcessorio(p) {
  const opts = ACCS.filter(([a]) => a !== p.extra); const [a, nome] = rand(opts);
  p.extra = a; atualizarSprite(p); toast(nomeDe(p), `ganhou acessório: ${nome}`, '#ffd84a'); fx.burst(p.id, 10, '#ffd84a'); salvar();
}
function darTerreno(p, motivo) {
  if (p.terreno != null) return melhorarCasa(p);
  const livres = S.plots.map((s, i) => [s, i]).filter(([s]) => s.estado === 'venda').map(([, i]) => i);
  if (!livres.length) { toast(nomeDe(p), 'queria um terreno, mas a cidade lotou!', '#ff8a5c'); return; }
  livres.sort((a, b) => dist15(a) - dist15(b));
  const i = rand(livres.slice(0, 3));
  p.terreno = i; Object.assign(S.plots[i], { estado: 'obra', dono: p.id, andares: 1, obraFim: now() + (CFG.tempoObraSegundos || 20) * 1000 });
  rebuildPlot(i);
  ensureMorador(p);
  const e = ents.get(p.id); if (e && e.mode !== 'onibus' && e.after !== 'sumir') { releaseSlot(e); e.path = routeToGate([e.x, e.y], i); e.after = 'casa'; e.mode = 'andando'; }
  toast(nomeDe(p), `ganhou o terreno Nº ${i + 1}${motivo ? ' (' + motivo + ')' : ''}!`, '#ffcc33');
  focarPlot(i, 4); salvar();
}
function dist15(i) { const [gx, gy] = PLOTS[i]; return Math.hypot(gx + 1.5 - 15, gy + 1.5 - 17); }
function melhorarCasa(p) {
  const st = S.plots[p.terreno]; if (!st || st.andares >= 3) return;
  st.andares++;
  if (st.estado === 'casa') { rebuildPlot(p.terreno); toast(nomeDe(p), st.andares === 2 ? 'ganhou um sobrado!' : 'agora mora num prédio!', '#c06bff'); focarPlot(p.terreno, 3.5); fx.confete(60); }
  salvar();
}
function checarCurtidas(p) {
  const C = CFG.curtidas;
  if (p.terreno == null && p.curtidas >= C.terreno) darTerreno(p, `${C.terreno} curtidas`);
  else if (p.terreno != null) { const st = S.plots[p.terreno]; if (st.estado === 'casa' && ((st.andares === 1 && p.curtidas >= C.sobrado) || (st.andares === 2 && p.curtidas >= C.predio))) melhorarCasa(p); }
}
function tickObras() {
  S.plots.forEach((st, i) => {
    if (st.estado === 'obra' && now() >= st.obraFim) {
      st.estado = 'casa'; rebuildPlot(i);
      const p = S.pessoas[st.dono]; toast(p ? nomeDe(p) : '?', 'tem casa nova pronta!', '#86d466'); focarPlot(i, 3.5); fx.confete(80); salvar();
      if (p) checarCurtidas(p);
    }
  });
}
function executar(p, acoes, qtd) {
  for (const a of acoes || []) {
    if (a.acao === 'roupa') darRoupa(p, a.raridadeMinima, qtd);
    else if (a.acao === 'acessorio') darAcessorio(p);
    else if (a.acao === 'terreno') darTerreno(p, 'presente');
    else if (a.acao === 'melhorarCasa') { if (p.terreno != null) melhorarCasa(p); }
    else if (a.acao === 'curtidas') { p.curtidas += (a.qtd || 0) * (qtd || 1); checarCurtidas(p); }
    else if (a.acao === 'festa') fx.festa();
  }
}

// evento padronizado: { tipo: 'seguir'|'curtir'|'presente'|'chat'|'compartilhar', user:{id,usuario,apelido}, qtd, presente:{nome,id,moedas,qtd}, texto }
function evento(ev) {
  if (!ev || !ev.user) return;
  const p = pessoa(ev.user);
  if (ev.tipo === 'seguir') { if (p.morador && ents.has(p.id)) toast(nomeDe(p), 'seguiu a live!', COR_NOVO); ensureMorador(p, 'seguir'); }
  else if (ev.tipo === 'curtir') {
    const n = Math.max(1, ev.qtd | 0); p.curtidas += n;
    if (p.morador && !ents.has(p.id)) ensureMorador(p, 'curtir');
    fx.coracoes(p.id, Math.min(6, 1 + Math.floor(n / 5)));
    checarCurtidas(p); salvar();
  }
  else if (ev.tipo === 'presente') {
    const g = ev.presente || {}; const qtd = Math.max(1, g.qtd | 0); const nome = String(g.nome || 'presente');
    ensureMorador(p, 'presente');
    toast(nomeDe(p), `enviou ${qtd > 1 ? qtd + '× ' : ''}${nome}`, '#ff7aa8', true);
    const por = CFG.presentes.porNome[nome.toLowerCase()];
    let acoes = por;
    if (!acoes) { const total = (g.moedas || 1) * qtd; const f = CFG.presentes.porMoedas.find((x) => total >= x.de && total <= x.ate); acoes = f ? f.acoes : []; }
    executar(p, acoes, qtd);
  }
  else if (ev.tipo === 'chat') {
    if (!p.morador && CFG.chegarAoComentar) ensureMorador(p, 'chat');
    else if (p.morador && !ents.has(p.id)) ensureMorador(p, 'chat');
    const e = ents.get(p.id); if (e && CFG.balaoDeChat && ev.texto) e.bubble = { texto: String(ev.texto).slice(0, 60), ate: performance.now() + 6000 };
  }
  else if (ev.tipo === 'compartilhar') { if (CFG.compartilhar && CFG.compartilhar.length) { ensureMorador(p, 'compartilhar'); toast(nomeDe(p), 'compartilhou a live!', '#4aa3ff', true); executar(p, CFG.compartilhar, 1); } }
}

// ---------------- câmera ----------------
const cam = { x: 0, y: 0, z: CFG.zoomCamera || 1.6 };
const HOME = () => iso(15.2, 16.4, 0);
let foco = null; // {x,y,z,ate,prio}
function focar(pt, z, seg, prio = 2) { const t = performance.now(); if (foco && foco.ate > t && foco.prio > prio) return; foco = { x: pt[0], y: pt[1], z, ate: t + seg * 1000, prio }; }
function focarPlot(i, seg) { const [gx, gy] = PLOTS[i]; focar(iso(gx + 1.5, gy + 1.5, 40), 1.9, seg, 3); }
function focarEnt(id, z, seg) { const e = ents.get(id); if (e && e.mode !== 'onibus') focar(iso(e.x, e.y, 30), z, seg, 3); }
function updateCam(dt, t) {
  let tx, ty, tz;
  if (foco && foco.ate > t) { tx = foco.x; ty = foco.y; tz = foco.z; }
  else { foco = null; const h = HOME(); const s = t / 1000; const pan = CFG.passeioDaCamera !== false; tx = h[0] + (pan ? Math.sin(s * 0.07) * 360 : 0); ty = h[1] + (pan ? Math.sin(s * 0.045) * 110 : 0); tz = CFG.zoomCamera || 1.6; }
  const k = 1 - Math.exp(-dt * 1.8); cam.x += (tx - cam.x) * k; cam.y += (ty - cam.y) * k; cam.z += (tz - cam.z) * k;
}
const CAM_Y = 0.6; // ponto da tela onde fica o centro da câmera (abaixo do topo)
function toScreen(wx, wy) { return [(wx - cam.x) * cam.z + W / 2, (wy - cam.y) * cam.z + H * CAM_Y]; }
function entScreen(e) { const p = iso(e.x, e.y, 5); return toScreen(p[0], p[1]); }

// ---------------- avisos (toasts) ----------------
const toasts = []; let toastAtual = null;
function toast(nome, texto, cor, leve) { if (leve && toasts.length > 6) return; toasts.push({ nome, texto, cor }); if (toasts.length > 14) toasts.splice(0, toasts.length - 14); feed.unshift({ nome, texto, cor, t: performance.now() }); if (feed.length > 5) feed.pop(); }
const feed = [];

// ---------------- efeitos ----------------
const parts = [];
const fx = {
  burst(id, n, cor) { const e = ents.get(id); if (!e || e.mode === 'onibus') return; for (let i = 0; i < n; i++) parts.push({ w: true, ex: e, ox: 0, oy: -18, vx: (Math.random() - 0.5) * 120, vy: -40 - Math.random() * 120, g: 160, life: 1 + Math.random() * 0.6, t: 0, cor, tipo: 'estrela', r: 3 + Math.random() * 4 }); },
  coracoes(id, n) { const e = ents.get(id); if (!e || e.mode === 'onibus') return; for (let i = 0; i < n; i++) parts.push({ w: true, ex: e, ox: (Math.random() - 0.5) * 20, oy: -30, vx: (Math.random() - 0.5) * 30, vy: -50 - Math.random() * 40, g: 0, life: 1.4, t: -i * 0.12, cor: rand(['#ff5c8a', '#ff7aa8', '#ff3b6b']), tipo: 'coracao', r: 7 + Math.random() * 4 }); },
  confete(n) { for (let i = 0; i < n; i++) parts.push({ x: Math.random() * W, y: -20 - Math.random() * 300, vx: (Math.random() - 0.5) * 80, vy: 200 + Math.random() * 200, g: 30, life: 5, t: 0, cor: rand(['#ffcc33', '#ff5c8a', '#4aa3ff', '#5fd068', '#c06bff', '#ffffff']), tipo: 'confete', r: 7 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 10 }); },
  festa() { fx.confete(160); for (let k = 0; k < 6; k++) setTimeout(() => { const cx = 150 + Math.random() * (W - 300), cy = 600 + Math.random() * 500, cor = rand(['#ffcc33', '#ff5c8a', '#4aa3ff', '#5fd068', '#c06bff']); for (let i = 0; i < 46; i++) { const a = (i / 46) * Math.PI * 2, v = 260 + Math.random() * 120; parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 140, life: 1.3, t: 0, cor, tipo: 'faisca', r: 4 }); } }, k * 450); },
};
function updateParts(dt) {
  for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.t += dt; if (q.t < 0) continue; if (q.t > q.life) { parts.splice(i, 1); continue; } if (q.w) { q.ox += q.vx * dt; q.oy += q.vy * dt; } else { q.x += q.vx * dt; q.y += q.vy * dt; } q.vy += q.g * dt; if (q.vr) q.rot += q.vr * dt; }
  if (parts.length > 900) parts.splice(0, parts.length - 900);
}
function drawParts(c) {
  for (const q of parts) {
    if (q.t < 0) continue;
    let x = q.x, y = q.y; if (q.w) { const s = entScreen(q.ex); x = s[0] + q.ox; y = s[1] + q.oy - 30 * cam.z; }
    const a = Math.min(1, (q.life - q.t) * 2); c.globalAlpha = a; c.fillStyle = q.cor;
    if (q.tipo === 'estrela') vStar(c, x, y, q.r, q.cor);
    else if (q.tipo === 'coracao') heart(c, x, y, q.r, q.cor);
    else if (q.tipo === 'confete') { c.save(); c.translate(x, y); c.rotate(q.rot); c.fillRect(-q.r / 2, -q.r / 4, q.r, q.r / 2); c.restore(); }
    else { c.beginPath(); c.arc(x, y, q.r, 0, 7); c.fill(); }
  }
  c.globalAlpha = 1;
}
function heart(c, x, y, r, col) { c.beginPath(); c.moveTo(x, y + r * 0.9); c.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.4, x, y - r * 0.5); c.bezierCurveTo(x + r * 0.7, y - r * 1.4, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); c.fillStyle = col; c.fill(); c.strokeStyle = '#2a2340'; c.lineWidth = 2; c.stroke(); }

// ---------------- desenho ----------------
const clouds = Array.from({ length: 7 }, (_, i) => ({ x: Math.random() * W, y: 120 + i * 260 + Math.random() * 80, s: 0.7 + Math.random() * 0.8, v: 6 + Math.random() * 10 }));
function drawSky(c, dt) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8fd3ff'); g.addColorStop(1, '#d9f1ff'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  for (const k of clouds) { k.x += k.v * dt; if (k.x > W + 200) k.x = -200; for (const [dx, dy, r] of [[0, 0, 40], [45, -10, 50], [95, 5, 38], [40, 15, 40]]) { c.beginPath(); c.arc(k.x + dx * k.s, k.y + dy * k.s, r * k.s, 0, 7); c.fill(); } }
}
function busDrawable() {
  if (BUS.estado === 'fora') return null;
  const y = BUS.y; return { key: BUS_X + y + 2.5, bus: true, draw: (c) => { c.globalAlpha = Math.max(0, Math.min(1, (BUS_START - y) / 3)); bus(c, BUS_X, y, BUS.cor); c.globalAlpha = 1; } };
}
function pillS(c, s, x, y, border, size, fg = '#ffffff', bg = '#2a2340') {
  c.font = `600 ${size}px ${FONT}`; const w = c.measureText(s).width + size * 1.2, h = size * 1.65, px = x - w / 2, py = y - h - 6;
  c.fillStyle = 'rgba(20,10,40,0.25)'; c.beginPath(); c.roundRect(px, py + 3, w, h, h / 2); c.fill();
  c.fillStyle = border; c.beginPath(); c.moveTo(x - 6, py + h - 1); c.lineTo(x, py + h + 7); c.lineTo(x + 6, py + h - 1); c.fill();
  c.beginPath(); c.roundRect(px, py, w, h, h / 2); c.fillStyle = bg; c.fill(); c.lineWidth = 3.5; c.strokeStyle = border; c.stroke();
  c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x, py + h / 2 + 1);
  return py;
}
function wrapText(c, t, maxW) { const ws = t.split(/\s+/), lines = []; let cur = ''; for (const w of ws) { const n = cur ? cur + ' ' + w : w; if (c.measureText(n).width > maxW && cur) { lines.push(cur); cur = w; } else cur = n; } if (cur) lines.push(cur); return lines.slice(0, 3); }
function bubble(c, t, x, y) {
  c.font = `500 22px ${FONT}`; const lines = wrapText(c, t, 300); const w = Math.max(...lines.map((l) => c.measureText(l).width)) + 30, h = lines.length * 27 + 18, px = x - w / 2, py = y - h - 14;
  c.fillStyle = '#ffffff'; c.strokeStyle = '#2a2340'; c.lineWidth = 3; c.beginPath(); c.roundRect(px, py, w, h, 16); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(x - 8, py + h - 1.5); c.lineTo(x, py + h + 11); c.lineTo(x + 8, py + h - 1.5); c.fill(); c.stroke(); c.fillRect(x - 7, py + h - 4, 14, 4);
  c.fillStyle = '#2a2340'; c.textAlign = 'center'; c.textBaseline = 'top'; lines.forEach((l, i) => c.fillText(l, x, py + 10 + i * 27));
}

function drawWorld(c, t) {
  c.save();
  c.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H * CAM_Y - cam.y * cam.z);
  c.drawImage(BG, 0, 0, WORLD.W, WORLD.H);
  const vx0 = cam.x - (W / 2) / cam.z - 40, vx1 = cam.x + (W / 2) / cam.z + 40, vy0 = cam.y - (H * CAM_Y) / cam.z - 40, vy1 = cam.y + (H * (1 - CAM_Y)) / cam.z + 40;
  const list = [];
  const vis = (s) => s.x + s.w > vx0 && s.x < vx1 && s.y + s.h > vy0 && s.y < vy1;
  for (const s of FIXED) if (vis(s)) list.push(s);
  for (const arr of PLOT_SPR) for (const s of arr) if (vis(s)) list.push(s);
  const b = busDrawable(); if (b) list.push(b);
  for (const e of ents.values()) { if (e.mode === 'onibus') continue; list.push({ key: e.x + e.y + 1, ent: e }); }
  list.sort((a, b2) => a.key - b2.key);
  for (const it of list) {
    if (it.img) c.drawImage(it.img, it.x, it.y, it.w, it.h);
    else if (it.bus) it.draw(c);
    else {
      const e = it.ent, s = e.spr[e.f], p = iso(e.x, e.y, 5);
      const walking = e.mode === 'andando' || e.mode === 'passeio';
      const bob = walking ? -Math.abs(Math.sin(e.walkT * 11)) * 3 : (e.hop > 0 ? -Math.sin((0.5 - e.hop) / 0.5 * Math.PI) * 7 : Math.sin(t / 400 + e.off * 10) * 0.6);
      e._sx = p[0]; e._sy = p[1] + bob;
      if (e.alpha < 1) c.globalAlpha = Math.max(0, e.alpha);
      c.drawImage(s.img, p[0] + s.x, p[1] + bob + s.y, s.w, s.h);
      c.globalAlpha = 1;
    }
  }
  c.restore();
}
function drawLabels(c, t) {
  // terrenos
  S.plots.forEach((st, i) => {
    const wp = plotLabelPos(i, st); const [x, y] = toScreen(wp[0], wp[1]); if (x < -200 || x > W + 200 || y < -100 || y > H + 100) return;
    if (st.estado === 'venda') pillS(c, `À VENDA · Nº ${i + 1}`, x, y, '#e8483a', 17, '#d23a2a', '#ffffff');
    else {
      const p = S.pessoas[st.dono]; const nome = p ? nomeDe(p) : '?';
      if (st.estado === 'obra') {
        const py = pillS(c, nome, x, y, '#4aa3ff', 21);
        const k = Math.max(0, Math.min(1, 1 - (st.obraFim - now()) / ((CFG.tempoObraSegundos || 20) * 1000)));
        c.fillStyle = '#2a2340'; c.beginPath(); c.roundRect(x - 60, py - 26, 120, 16, 8); c.fill(); c.fillStyle = '#ffc43d'; c.beginPath(); c.roundRect(x - 58, py - 24, 116 * k, 12, 6); c.fill();
        c.font = `700 15px ${FONT}`; c.fillStyle = '#2a2340'; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillText('EM OBRA ' + Math.round(k * 100) + '%', x, py - 30);
      } else pillS(c, nome, x, y, p ? RARC[raridadeDe(p)] : '#e6e3f0', 21);
    }
  });
  // bonecos
  const arr = [...ents.values()].filter((e) => e.mode !== 'onibus' && e._sx != null).sort((a, b) => a.x + a.y - (b.x + b.y));
  for (const e of arr) {
    const p = S.pessoas[e.id]; if (!p) continue;
    const [x, y] = toScreen(e._sx, e._sy + e.spr[e.f].top);
    if (x < -150 || x > W + 150 || y < -100 || y > H + 150) continue;
    c.globalAlpha = Math.max(0, Math.min(1, e.alpha));
    const py = pillS(c, nomeDe(p), x, y, corTag(p), 22);
    if (e.bubble) { if (e.bubble.ate < t) e.bubble = null; else bubble(c, e.bubble.texto, x, py - 4); }
    c.globalAlpha = 1;
  }
}
function panel(c, x, y, w, h, r = 28) { c.fillStyle = 'rgba(20,10,40,0.22)'; c.beginPath(); c.roundRect(x, y + 6, w, h, r); c.fill(); c.fillStyle = 'rgba(42,35,64,0.92)'; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.strokeStyle = '#ffd84a'; c.lineWidth = 4; c.stroke(); }
function drawHUD(c, t) {
  // título + números
  panel(c, 30, 30, W - 60, 104);
  c.textBaseline = 'middle'; c.textAlign = 'left'; c.font = `700 46px ${FONT}`; c.fillStyle = '#ffd84a'; c.fillText(CFG.titulo, 62, 84);
  const moradores = Object.values(S.pessoas).filter((p) => p.morador).length, casas = S.plots.filter((s) => s.estado !== 'venda').length;
  c.textAlign = 'right'; c.font = `600 27px ${FONT}`; c.fillStyle = '#ffffff'; c.fillText(`${moradores} moradores`, W - 62, 66); c.fillStyle = '#b9b0d8'; c.fillText(`${casas}/${PLOTS.length} casas`, W - 62, 102);
  // regras
  const R = CFG.regrasNaTela || []; const cw = (W - 60 - (R.length - 1) * 14) / Math.max(1, R.length);
  R.forEach(([k, v], i) => {
    const x = 30 + i * (cw + 14), y = 150; c.fillStyle = 'rgba(42,35,64,0.93)'; c.beginPath(); c.roundRect(x, y, cw, 88, 22); c.fill(); c.strokeStyle = ['#5fd068', '#ff5c8a', '#ffcc33'][i % 3]; c.lineWidth = 3.5; c.stroke();
    c.textAlign = 'center'; c.font = `700 27px ${FONT}`; c.fillStyle = c.strokeStyle; c.fillText(k, x + cw / 2, y + 30); c.font = `500 22px ${FONT}`; c.fillStyle = '#ffffff'; c.fillText(v, x + cw / 2, y + 62);
  });
  // corrida das curtidas
  const C = CFG.curtidas;
  const meta = (p) => (p.terreno == null ? C.terreno : S.plots[p.terreno].andares === 1 ? C.sobrado : S.plots[p.terreno].andares === 2 ? C.predio : null);
  const top = Object.values(S.pessoas).filter((p) => p.curtidas > 0 && meta(p)).sort((a, b) => b.curtidas / meta(b) - a.curtidas / meta(a)).slice(0, 3);
  if (top.length) {
    const y0 = 254, hh = 52 + top.length * 44; c.fillStyle = 'rgba(42,35,64,0.93)'; c.beginPath(); c.roundRect(30, y0, W - 60, hh, 22); c.fill();
    c.textAlign = 'left'; c.font = `700 24px ${FONT}`; c.fillStyle = '#ff7aa8'; c.fillText('CORRIDA DAS CURTIDAS', 56, y0 + 28);
    top.forEach((p, i) => {
      const m = meta(p), k = Math.min(1, p.curtidas / m), y = y0 + 62 + i * 44, pr = p.terreno == null ? 'terreno' : S.plots[p.terreno].andares === 1 ? 'sobrado' : 'prédio';
      c.textAlign = 'left'; c.font = `600 23px ${FONT}`; c.fillStyle = '#ffffff'; c.fillText(`${i + 1}. ${nomeDe(p)}`, 56, y);
      c.fillStyle = '#1b1530'; c.beginPath(); c.roundRect(360, y - 13, 420, 26, 13); c.fill(); const gr = c.createLinearGradient(360, 0, 780, 0); gr.addColorStop(0, '#ff5c8a'); gr.addColorStop(1, '#ffcc33'); c.fillStyle = gr; c.beginPath(); c.roundRect(362, y - 11, Math.max(22, 416 * k), 22, 11); c.fill();
      c.textAlign = 'right'; c.font = `500 20px ${FONT}`; c.fillStyle = '#b9b0d8'; c.fillText(`${p.curtidas}/${m} ${pr}`, W - 56, y);
    });
  }
}
function drawToast(c, t, dt) {
  if (!toastAtual && toasts.length) { toastAtual = Object.assign(toasts.shift(), { t: 0 }); }
  if (!toastAtual) return;
  const T = toastAtual; T.t += dt; const dur = toasts.length > 3 ? 1.6 : 3.0;
  if (T.t > dur) { toastAtual = null; return; }
  const a = Math.min(1, T.t * 5, (dur - T.t) * 4); const s = 0.85 + 0.15 * Math.min(1, T.t * 6);
  c.save(); c.globalAlpha = Math.max(0, a); c.translate(W / 2, 560); c.scale(s, s);
  c.font = `700 40px ${FONT}`; const w1 = c.measureText(T.nome).width; c.font = `500 34px ${FONT}`; const w2 = c.measureText(T.texto).width; const w = Math.min(W - 40, Math.max(w1, w2) + 80);
  c.fillStyle = 'rgba(20,10,40,0.3)'; c.beginPath(); c.roundRect(-w / 2, -60, w, 128, 34); c.fill();
  c.fillStyle = '#2a2340'; c.beginPath(); c.roundRect(-w / 2, -66, w, 128, 34); c.fill(); c.strokeStyle = T.cor; c.lineWidth = 6; c.stroke();
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = `700 40px ${FONT}`; c.fillStyle = T.cor; c.fillText(T.nome, 0, -28, w - 40); c.font = `500 34px ${FONT}`; c.fillStyle = '#ffffff'; c.fillText(T.texto, 0, 20, w - 40);
  c.restore();
}

// ---------------- laço principal ----------------
let last = performance.now(), slowT = 0, pronto = false;
function frame(t) {
  const dt = Math.min(0.05, (t - last) / 1000); last = t;
  if (pronto) {
    slowT += dt; if (slowT > 1) { slowT = 0; tickObras(); limparInativos(); }
    updateBus(dt); updateEnts(dt, t); updateCam(dt, t); updateParts(dt);
    drawSky(ctx, dt); drawWorld(ctx, t); drawLabels(ctx, t); drawParts(ctx); drawHUD(ctx, t); drawToast(ctx, t, dt);
  }
  requestAnimationFrame(frame);
}
function limparInativos() {
  const lim = (CFG.minutosAteIrEmbora || 20) * 60000;
  for (const e of ents.values()) { const p = S.pessoas[e.id]; if (p && p.terreno == null && e.mode !== 'onibus' && e.after !== 'sumir' && e.mode !== 'sumindo' && now() - p.visto > lim) irEmbora(e); }
}
function iniciarBonecos() {
  ents.clear(); slotDono.clear(); BUS.queue = []; BUS.estado = 'fora'; BUS.y = BUS_START;
  const lim = (CFG.minutosAteIrEmbora || 20) * 60000;
  for (const p of Object.values(S.pessoas)) {
    if (p.morador && p.terreno != null) spawnEnt(p, 'portao');
    else if (p.morador && now() - p.visto < lim) spawnEnt(p, 'praca'); // quem estava na live agora há pouco volta direto para a praça
  }
}

// ---------------- conexão com o servidor (live) ----------------
let ws = null; const status = { servidor: false, tiktok: false, msg: 'sem servidor (modo simulação)' };
function enviarServidor(m) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)); }
function conectar() {
  if (location.protocol === 'file:') return;
  try { ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`); } catch (e) { return; }
  ws.onopen = () => { status.servidor = true; status.msg = 'conectado ao servidor'; emitirStatus(); };
  ws.onclose = () => { status.servidor = false; status.tiktok = false; status.msg = 'servidor desconectado — tentando de novo…'; emitirStatus(); setTimeout(conectar, 3000); };
  ws.onmessage = (m) => {
    let d; try { d = JSON.parse(m.data); } catch (e) { return; }
    if (d.tipo === 'evento') evento(d.evento);
    else if (d.tipo === 'status') { status.tiktok = !!d.conectado; status.msg = d.msg; status.usuario = d.usuario; emitirStatus(); }
    else if (d.tipo === 'estado' && d.estado && d.estado.v === 1 && (d.estado.salvoEm || 0) > (S.salvoEm || 0)) { carregar(d.estado); }
  };
}
function emitirStatus() { window.dispatchEvent(new CustomEvent('jogo-status', { detail: status })); }
function carregar(est) { S = est; buildWorld(); iniciarBonecos(); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

window.JOGO = {
  evento,
  status,
  resetar() { S = novoEstado(); S.salvoEm = now(); buildWorld(); iniciarBonecos(); salvar(); toast(CFG.titulo, 'cidade nova em folha!', '#ffd84a'); },
  exportar() { return JSON.stringify(S); },
  importar(txt) { const j = JSON.parse(txt); if (!j || j.v !== 1) throw new Error('arquivo inválido'); j.salvoEm = now(); carregar(j); salvar(); },
  estado: () => S,
};

// ---------------- início ----------------
(async () => {
  try { await Promise.race([Promise.all([document.fonts.load(`700 40px ${FONT}`), document.fonts.load(`500 20px ${FONT}`), document.fonts.load(`600 20px ${FONT}`)]), new Promise((r) => setTimeout(r, 2500))]); } catch (e) { }
  buildWorld(); iniciarBonecos();
  const h = HOME(); cam.x = h[0]; cam.y = h[1];
  pronto = true; document.body.classList.add('pronto');
  conectar(); emitirStatus();
})();
requestAnimationFrame(frame);
})();
