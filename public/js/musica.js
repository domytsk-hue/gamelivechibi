// Música de fundo da TikCity: toca em loop sem emenda enquanto a cidade está aberta.
// Escolha a faixa e o volume em config.js (musica). No painel de teste dá para ouvir as 3.
(() => {
  const CFG = (window.CONFIG && window.CONFIG.musica) || {};
  const FAIXAS = {
    1: 'musica/musica-1-praca-ensolarada.ogg',
    2: 'musica/musica-2-cidade-de-brinquedo.ogg',
    3: 'musica/musica-3-fim-de-tarde.ogg',
  };
  let ctx = null, ganho = null, fonte = null, el = null, atual = 0;
  let volume = CFG.volume ?? 0.35;
  const cache = {};

  function parar() {
    if (fonte) { try { fonte.stop(); } catch (e) { } fonte = null; }
    if (el) { el.pause(); el = null; }
    atual = 0;
  }
  async function tocar(n) {
    n = Number(n); parar();
    if (!FAIXAS[n]) return;
    atual = n;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (!ganho) { ganho = ctx.createGain(); ganho.connect(ctx.destination); }
      ganho.gain.value = volume;
      if (!cache[n]) { const r = await fetch(FAIXAS[n]); if (!r.ok) throw new Error('sem arquivo'); cache[n] = await ctx.decodeAudioData(await r.arrayBuffer()); }
      if (atual !== n) return;
      fonte = ctx.createBufferSource(); fonte.buffer = cache[n]; fonte.loop = true; fonte.connect(ganho);
      ganho.gain.setValueAtTime(0, ctx.currentTime); ganho.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
      fonte.start();
      if (ctx.state === 'suspended') ctx.resume().catch(() => { });
    } catch (e) { // arquivo aberto direto (file://): usa o player simples do navegador
      el = new Audio(FAIXAS[n]); el.loop = true; el.volume = volume; el.play().catch(() => { });
    }
  }
  function setVolume(v) { volume = Math.max(0, Math.min(1, Number(v))); if (ganho) ganho.gain.value = volume; if (el) el.volume = volume; }

  // navegadores comuns só deixam tocar som depois de um clique; OBS e LIVE Studio tocam direto
  const destravar = () => { if (ctx && ctx.state === 'suspended') ctx.resume(); if (el && el.paused) el.play().catch(() => { }); };
  window.addEventListener('pointerdown', destravar); window.addEventListener('keydown', destravar);
  // tecla M liga/desliga a música
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'm' || e.key === 'M') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) atual ? parar() : tocar(CFG.faixa || 1);
  });

  window.MUSICA = { tocar, parar, setVolume, faixaAtual: () => atual, volume: () => volume };
  if (CFG.ativa !== false) tocar(CFG.faixa || 1);
})();
