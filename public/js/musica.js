// Rádio TikCity: toca as músicas de fundo uma atrás da outra (com transição suave),
// e mostra no canto da tela o nome da rádio e da música que está tocando.
// Tudo se ajusta em config.js (musica). Tecla M liga/desliga. No painel de teste dá para pular de música.
(() => {
  const CFG = (window.CONFIG && window.CONFIG.musica) || {};
  const FAIXAS = [
    { nome: 'Praça Ensolarada', arq: 'musica/musica-1-praca-ensolarada.ogg' },
    { nome: 'Cidade de Brinquedo', arq: 'musica/musica-2-cidade-de-brinquedo.ogg' },
    { nome: 'Fim de Tarde', arq: 'musica/musica-3-fim-de-tarde.ogg' },
    { nome: 'Passeio de Ônibus', arq: 'musica/musica-4-passeio-de-onibus.ogg' },
    { nome: 'Luzes da Cidade', arq: 'musica/musica-5-luzes-da-cidade.ogg' },
  ];
  const CROSS = 3; // segundos de transição entre uma música e outra
  let ctx = null, master = null, atual = -1, tocando = false, timer = null, inicio = 0;
  let volume = CFG.volume ?? 0.35, ativa = { src: null, g: null, el: null };
  const cache = {};
  const ordem = () => {
    const lista = (CFG.playlist && CFG.playlist.length ? CFG.playlist : [1, 2, 3, 4, 5]).map((n) => n - 1).filter((i) => FAIXAS[i]);
    return lista.length ? lista : [0];
  };
  let fila = [];
  function proxima() {
    if (CFG.radio === false) return atual >= 0 ? atual : ordem()[0];
    if (!fila.length) {
      fila = ordem().slice();
      if (CFG.aleatoria) { for (let i = fila.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [fila[i], fila[j]] = [fila[j], fila[i]]; } if (fila.length > 1 && fila[0] === atual) fila.push(fila.shift()); }
    }
    return fila.shift();
  }
  function soltar(a, quando) { // apaga a música que estava tocando
    if (a.g && ctx) { a.g.gain.cancelScheduledValues(ctx.currentTime); a.g.gain.setValueAtTime(a.g.gain.value, ctx.currentTime); a.g.gain.linearRampToValueAtTime(0, ctx.currentTime + quando); try { a.src.stop(ctx.currentTime + quando + 0.1); } catch (e) { } }
    if (a.el) { const el = a.el; const v0 = el.volume, t0 = performance.now(); const f = () => { const k = (performance.now() - t0) / (quando * 1000); if (k >= 1) { el.pause(); return; } el.volume = v0 * (1 - k); requestAnimationFrame(f); }; f(); }
  }
  async function tocarIndice(i, fade = CROSS) {
    clearTimeout(timer); const antes = ativa; ativa = { src: null, g: null, el: null };
    soltar(antes, fade); atual = i; tocando = true; inicio = performance.now();
    const f = FAIXAS[i];
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (!master) { master = ctx.createGain(); master.connect(ctx.destination); }
      master.gain.value = volume;
      if (!cache[i]) { const r = await fetch(f.arq); if (!r.ok) throw new Error('sem arquivo'); cache[i] = await ctx.decodeAudioData(await r.arrayBuffer()); }
      if (atual !== i || !tocando) return;
      const src = ctx.createBufferSource(), g = ctx.createGain(); src.buffer = cache[i]; src.connect(g); g.connect(master);
      g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(1, ctx.currentTime + fade);
      const unica = CFG.radio === false; src.loop = unica; src.start();
      ativa = { src, g, el: null };
      if (ctx.state === 'suspended') ctx.resume().catch(() => { });
      if (!unica) timer = setTimeout(() => tocando && tocarIndice(proxima()), Math.max(5, cache[i].duration - CROSS) * 1000);
    } catch (e) { // arquivo aberto direto (file://): usa o player simples do navegador
      const el = new Audio(f.arq); el.volume = volume; el.loop = CFG.radio === false;
      el.onended = () => tocando && tocarIndice(proxima(), 0.5);
      el.play().catch(() => { }); ativa = { src: null, g: null, el };
    }
  }
  function ligar() { tocarIndice(proxima()); }
  function parar() { tocando = false; clearTimeout(timer); soltar(ativa, 0.8); ativa = { src: null, g: null, el: null }; }
  function pular() { if (tocando) tocarIndice(proxima(), 1.5); else ligar(); }
  function tocar(n) { fila = []; tocarIndice(Math.max(0, Math.min(FAIXAS.length - 1, n - 1)), 1.5); }
  function setVolume(v) { volume = Math.max(0, Math.min(1, Number(v))); if (master) master.gain.value = volume; if (ativa.el) ativa.el.volume = volume; }

  // navegadores comuns só deixam tocar som depois de um clique; OBS e LIVE Studio tocam direto
  const destravar = () => { if (ctx && ctx.state === 'suspended') ctx.resume(); if (ativa.el && ativa.el.paused && tocando) ativa.el.play().catch(() => { }); };
  window.addEventListener('pointerdown', destravar); window.addEventListener('keydown', destravar);
  window.addEventListener('keydown', (e) => {
    if ((e.key === 'm' || e.key === 'M') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) tocando ? parar() : ligar();
  });

  // Página só da rádio aberta em outro navegador (radio.html): ela toca o som e avisa o nome da música.
  // Enquanto ela estiver avisando, o jogo fica em silêncio e o selo mostra o que ela está tocando.
  let ext = null, extTimer = null;
  function externo(d) {
    if (window.RADIO_PAGINA) return;
    ext = { nome: d.nome, numero: d.numero, radio: d.radio, desde: ext && ext.nome === d.nome ? ext.desde : performance.now() };
    if (tocando) parar();
    clearTimeout(extTimer);
    extTimer = setTimeout(() => { ext = null; if (CFG.ativa !== false) ligar(); }, 20000); // a página fechou: o jogo volta a tocar
  }

  window.MUSICA = {
    externo,
    precisaClique: () => !!((ctx && ctx.state === 'suspended') || (ativa.el && ativa.el.paused && tocando)),
    tocar, parar, pular, ligar, setVolume, volume: () => volume, faixas: FAIXAS,
    info: () => (ext ? { nome: ext.nome, numero: ext.numero, desde: ext.desde, radio: ext.radio || CFG.nomeDaRadio || 'Rádio TikCity', mostrar: CFG.mostrarNaTela !== false } : tocando && atual >= 0 ? { nome: FAIXAS[atual].nome, numero: atual + 1, desde: inicio, radio: CFG.nomeDaRadio || 'Rádio TikCity', mostrar: CFG.mostrarNaTela !== false } : null),
  };
  if (CFG.ativa !== false || window.RADIO_PAGINA) ligar();
})();
