// ============================================================
//  CONFIGURAÇÃO DO JOGO — edite à vontade e recarregue a página
// ============================================================
window.CONFIG = {
  titulo: 'CIDADE DA LIVE',

  // Nome em cima do boneco: 'usuario' (@ do TikTok) ou 'apelido' (nome de exibição)
  nomeExibido: 'usuario',

  // Regras que aparecem no topo da tela (3 linhas)
  regrasNaTela: [
    ['Seguir', 'você chega de ônibus'],
    ['1000 curtidas', 'ganha um terreno'],
    ['Rosa', 'roupa surpresa'],
  ],

  // Curtidas acumuladas por pessoa (somam entre lives)
  curtidas: {
    terreno: 1000,  // ganha um terreno (vira obra e depois casa)
    sobrado: 3000,  // a casa ganha 2º andar
    predio: 6000,   // vira prédio
  },
  tempoObraSegundos: 20,

  // Chance de cada raridade quando sai uma roupa (soma não precisa dar 100)
  chances: { comum: 60, raro: 28, epico: 10, lendario: 2 },

  // ---------------- PRESENTES ----------------
  // Ações possíveis:
  //   { acao: 'roupa' }                               roupa aleatória (respeita as chances)
  //   { acao: 'roupa', raridadeMinima: 'epico' }      roupa de no mínimo essa raridade
  //   { acao: 'acessorio' }                           acessório aleatório
  //   { acao: 'terreno' }                             ganha terreno (se já tem, melhora a casa)
  //   { acao: 'melhorarCasa' }                        sobe a casa de nível
  //   { acao: 'curtidas', qtd: 100 }                  conta como curtidas extras
  //   { acao: 'festa' }                               confete e fogos na tela
  // Presentes em sequência (combo): a roupa é sorteada uma vez por presente
  // (até 10) e o boneco fica com a mais rara.
  presentes: {
    // 1º: pelo nome do presente (minúsculo; o TikTok manda os nomes em inglês)
    porNome: {
      'rose': [{ acao: 'roupa' }],
      'rosa': [{ acao: 'roupa' }],
    },
    // 2º: pelo valor em moedas (moedas do presente × quantidade)
    porMoedas: [
      { de: 1, ate: 9, acoes: [{ acao: 'acessorio' }] },
      { de: 10, ate: 99, acoes: [{ acao: 'roupa', raridadeMinima: 'raro' }] },
      { de: 100, ate: 999, acoes: [{ acao: 'terreno' }, { acao: 'roupa', raridadeMinima: 'epico' }] },
      { de: 1000, ate: Infinity, acoes: [{ acao: 'terreno' }, { acao: 'roupa', raridadeMinima: 'lendario' }, { acao: 'festa' }] },
    ],
  },

  // Compartilhar a live (deixe [] para não fazer nada)
  compartilhar: [{ acao: 'acessorio' }],

  // Comentários
  balaoDeChat: true,          // mostra o comentário num balão em cima do boneco
  chegarAoComentar: false,    // true = quem comenta também ganha boneco (mesmo sem seguir)

  // Tela
  maxBonecosNaTela: 60,
  minutosAteIrEmbora: 20,     // boneco sem casa some depois desse tempo sem interagir
  zoomCamera: 1.6,
  passeioDaCamera: true,      // câmera passeia devagar pela cidade quando não há eventos
};
