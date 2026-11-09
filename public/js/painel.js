// Painel de simulação — testa o jogo sem estar ao vivo
(() => {
  const qs = new URLSearchParams(location.search);
  const painel = document.getElementById('painel');
  const mostrar = (v) => { painel.hidden = !v; document.body.classList.toggle('com-painel', v); };
  mostrar(qs.has('painel'));
  window.addEventListener('keydown', (e) => { if ((e.key === 'p' || e.key === 'P') && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) mostrar(painel.hidden); });

  const NOMES = ['duda', 'manu', 'lucas', 'vivi', 'paulinho', 'rafa.gamer', 'bia_arte', 'lelo', 'gabi', 'teto', 'lari', 'nando', 'pri.s', 'vitor', 'cami', 'mel', 'igor', 'sofia', 'dudu', 'luiza', 'thais', 'pedro', 'alice', 'kauã', 'isa', 'leo', 'juju', 'zeca', 'nina', 'caio', 'mari', 'teteu', 'kaka', 'luh.games', 'bruno_', 'dani'];
  const sufixo = () => (Math.random() < 0.5 ? '' : Math.random() < 0.5 ? '_' + Math.floor(Math.random() * 99) : String(Math.floor(Math.random() * 9)));
  const aleatorio = () => NOMES[Math.floor(Math.random() * NOMES.length)] + sufixo();
  const $nome = document.getElementById('nome'), $texto = document.getElementById('texto');
  const user = (n) => { const u = (n || $nome.value.trim() || aleatorio()).replace(/^@/, ''); return { id: u.toLowerCase(), usuario: u, apelido: u }; };
  document.getElementById('sortear').onclick = () => { $nome.value = aleatorio(); };

  // ao vivo, curtidas chegam em pacotes de até ~15
  function curtir(u, qtd) { let r = qtd; const step = () => { const n = Math.min(r, 15 + Math.floor(Math.random() * 20)); r -= n; JOGO.evento({ tipo: 'curtir', user: u, qtd: n }); if (r > 0) setTimeout(step, 60); }; step(); }

  painel.querySelectorAll('[data-ev]').forEach((b) => b.onclick = () => {
    const u = user(), t = b.dataset.ev;
    if (t === 'curtir') return curtir(u, +b.dataset.qtd);
    JOGO.evento({ tipo: t, user: u, texto: $texto.value });
  });
  painel.querySelectorAll('[data-gift]').forEach((b) => b.onclick = () => {
    JOGO.evento({ tipo: 'presente', user: user(), presente: { nome: b.dataset.gift, moedas: +b.dataset.moedas, qtd: +(b.dataset.qtd || 1) } });
  });
  document.getElementById('chuva').onclick = () => { for (let i = 0; i < 10; i++) setTimeout(() => JOGO.evento({ tipo: 'seguir', user: user(aleatorio()) }), i * 150); };

  // live automática: eventos aleatórios
  let auto = null; const $auto = document.getElementById('auto');
  const FRASES = ['oi gente!!', 'que cidade linda', 'quero uma casa 😭', 'cheguei!!', 'manda rosa pra mim', 'kkkkkk', 'boa noite live', 'olha meu boneco ali', 'bora 1000 curtidas', 'amei a roupa'];
  function passo() {
    const st = JOGO.estado(); const moradores = Object.values(st.pessoas).filter((p) => p.morador);
    const conhecido = () => { const p = moradores[Math.floor(Math.random() * moradores.length)]; return p ? { id: p.id, usuario: p.usuario, apelido: p.apelido } : user(aleatorio()); };
    const r = Math.random();
    if (r < 0.25 || moradores.length < 5) JOGO.evento({ tipo: 'seguir', user: user(aleatorio()) });
    else if (r < 0.6) curtir(conhecido(), 20 + Math.floor(Math.random() * 120));
    else if (r < 0.8) JOGO.evento({ tipo: 'chat', user: conhecido(), texto: FRASES[Math.floor(Math.random() * FRASES.length)] });
    else if (r < 0.93) JOGO.evento({ tipo: 'presente', user: conhecido(), presente: { nome: 'Rose', moedas: 1, qtd: 1 + Math.floor(Math.random() * 3) } });
    else JOGO.evento({ tipo: 'presente', user: conhecido(), presente: { nome: 'Doughnut', moedas: 30, qtd: 1 } });
    auto = setTimeout(passo, 700 + Math.random() * 1800);
  }
  $auto.onclick = () => { if (auto) { clearTimeout(auto); auto = null; $auto.classList.remove('ativo'); $auto.textContent = '▶️ Live automática'; } else { passo(); $auto.classList.add('ativo'); $auto.textContent = '⏸️ Parar live automática'; } };

  // salvar / carregar / zerar
  document.getElementById('exportar').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JOGO.exportar()], { type: 'application/json' })); a.download = 'tikcity.json'; a.click(); };
  const $imp = document.getElementById('importar');
  document.getElementById('importarBtn').onclick = () => $imp.click();
  $imp.onchange = async () => { const f = $imp.files[0]; if (!f) return; try { JOGO.importar(await f.text()); } catch (e) { alert('Não consegui carregar: ' + e.message); } $imp.value = ''; };
  document.getElementById('resetar').onclick = () => { if (confirm('Zerar a cidade? Todos os moradores, casas e curtidas somem.')) JOGO.resetar(); };

  const $st = document.getElementById('status');
  window.addEventListener('jogo-status', (e) => {
    const s = e.detail;
    $st.className = 'status ' + (s.tiktok ? 'ok' : 'aviso');
    $st.textContent = s.tiktok ? `🔴 Ao vivo: @${s.usuario} — ${s.msg}` : (s.servidor ? `Servidor ok · TikTok: ${s.msg}` : 'Sem servidor: modo simulação (só este painel)');
  });
})();
