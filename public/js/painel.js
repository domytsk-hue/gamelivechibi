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
    if (t === 'entrar' && !$nome.value.trim()) { // sem nome: escolhe alguém que já tem casa
      const donos = Object.values(JOGO.estado().pessoas).filter((p) => p.terreno != null);
      if (donos.length) { const p = donos[Math.floor(Math.random() * donos.length)]; return JOGO.evento({ tipo: 'entrar', user: { id: p.id, usuario: p.usuario, apelido: p.apelido } }); }
    }
    JOGO.evento({ tipo: t, user: u, texto: $texto.value });
  });
  painel.querySelectorAll('[data-gift]').forEach((b) => b.onclick = () => {
    JOGO.evento({ tipo: 'presente', user: user(), presente: { nome: b.dataset.gift, moedas: +b.dataset.moedas, qtd: +(b.dataset.qtd || 1) } });
  });
  document.getElementById('chuva').onclick = () => { for (let i = 0; i < 10; i++) setTimeout(() => JOGO.evento({ tipo: 'seguir', user: user(aleatorio()) }), i * 150); };

  // leilão: lotar a cidade e simular desafio/defesa
  document.getElementById('encher').onclick = () => JOGO.encherCidade(NOMES);
  document.getElementById('desafiar').onclick = () => {
    const L = JOGO.infoLeilao(); if (L.alvo < 0) return alert(L.lotada ? 'Já tem um desafio rolando (ou todos estão protegidos).' : 'A cidade ainda tem terreno à venda. Use "Lotar a cidade" primeiro.');
    const st = JOGO.estado(); let u = user(); const p = st.pessoas[u.id];
    if (p && p.terreno != null) u = user(aleatorio()); // quem já tem terreno não desafia
    const falta = Math.max(1, L.meta - JOGO.pontos(u.id)) + 30; $nome.value = u.usuario; curtir(u, falta);
  };
  document.getElementById('defender').onclick = () => {
    const L = JOGO.infoLeilao(); const D = L.desafio; if (!D) return alert('Nenhum desafio rolando agora.');
    const p = JOGO.estado().pessoas[D.dono]; curtir({ id: p.id, usuario: p.usuario, apelido: p.apelido }, JOGO.pontos(D.desafiante) - JOGO.pontos(D.dono) + 50);
  };
  document.getElementById('terminar').onclick = () => { const D = JOGO.estado().leilao; if (D) D.fim = Date.now(); };
  const $info = document.getElementById('infoLeilao');
  setInterval(() => {
    const L = JOGO.infoLeilao(), st = JOGO.estado();
    if (L.desafio) { const D = L.desafio; $info.textContent = `Desafio no Nº ${D.terreno + 1}: ${D.desafiante} ${JOGO.pontos(D.desafiante)} pts × ${D.dono} ${JOGO.pontos(D.dono)} pts · ${Math.max(0, Math.ceil((D.fim - Date.now()) / 1000))}s`; }
    else if (L.lotada && L.alvo >= 0) $info.textContent = `Mais fraco: Nº ${L.alvo + 1} (${st.plots[L.alvo].dono}, ${JOGO.pontos(st.plots[L.alvo].dono)} pts). Para desafiar: ${L.meta} pts.`;
    else $info.textContent = L.lotada ? 'Cidade lotada.' : `Leilão abre quando os ${st.plots.length} terrenos estiverem ocupados.`;
  }, 500);

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
