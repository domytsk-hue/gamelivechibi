// ============================================================
//  CONFIGURAÇÃO DO JOGO — edite à vontade e recarregue a página
// ============================================================
window.CONFIG = {
  titulo: 'TikCity',

  // Nome em cima do boneco: 'usuario' (@ do TikTok) ou 'apelido' (nome de exibição)
  nomeExibido: 'usuario',

  // Painel de regras no topo da tela: troca de página sozinho.
  // Cada item: [ícone, o que o seguidor faz, o que ganha]
  segundosPorPagina: 8,
  painelDeRegras: [
    { titulo: 'COMO MORAR NA CIDADE', cor: '#5fd068', itens: [
      ['🚌', 'Seguir', 'chega de ônibus'],
      ['❤️', '1.000 curtidas', 'ganha terreno'],
      ['🏠', '3.000 curtidas', 'vira sobrado'],
      ['🏢', '6.000 curtidas', 'vira prédio'],
    ] },
    { titulo: 'GANHE AJUDANDO A LIVE', cor: '#4aa3ff', itens: [
      ['🔁', 'Compartilhar', 'acessório'],
      ['⭐', 'Inscrever-se', 'terreno + roupa épica'],
      ['💜', 'Fã-clube', 'roupa rara'],
      ['🎁', 'Baú de moedas', 'festa + acessório'],
    ] },
    { titulo: 'PRESENTES', cor: '#ff7aa8', itens: [
      ['🌹', 'Rosa', 'roupa surpresa'],
      ['🪙', '1 a 9 moedas', 'acessório'],
      ['🍩', '10 a 99 moedas', 'roupa rara'],
      ['💎', '100+ moedas', 'terreno + roupa épica'],
    ] },
    { titulo: 'PRESENTES ESPECIAIS', cor: '#ffcc33', itens: [
      ['😎', 'Óculos de sol', 'óculos escuros'],
      ['🎂', 'Bolo', 'roupa Festa + festa'],
      ['🚀', 'Planeta / Foguete', 'prédio + Astronauta'],
      ['🦁', 'Leão', 'prédio + Realeza'],
    ] },
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
  //   { acao: 'roupa', nome: 'Astronauta' }           roupa certa (nome igual ao do guarda-roupa)
  //   { acao: 'acessorio' }                           acessório aleatório
  //   { acao: 'acessorio', qual: 'oculos' }           acessório certo (fone, bone, oculos, laco, flores, bandana,
  //                                                   chef, mago, cartola, coroa, aureola, capacete)
  //   { acao: 'terreno' }                             ganha terreno (se já tem, melhora a casa)
  //   { acao: 'melhorarCasa' }                        sobe a casa de nível
  //   { acao: 'predio' }                              casa vira prédio na hora (ganha terreno antes, se não tiver)
  //   { acao: 'acessorioParaTodos' }                  todos os bonecos na tela ganham acessório
  //   { acao: 'curtidas', qtd: 100 }                  conta como curtidas extras
  //   { acao: 'festa' }                               confete e fogos na tela
  // Presentes em sequência (combo): a roupa é sorteada uma vez por presente
  // (até 10) e o boneco fica com a mais rara.
  presentes: {
    // 1º: pelo nome do presente (minúsculo; o TikTok manda os nomes em inglês)
    porNome: {
      'rose': [{ acao: 'roupa' }],
      'rosa': [{ acao: 'roupa' }],
      'confetti': [{ acao: 'terreno' }, { acao: 'roupa', raridadeMinima: 'epico' }, { acao: 'festa' }],
      'sunglasses': [{ acao: 'terreno' }, { acao: 'roupa', raridadeMinima: 'epico' }, { acao: 'acessorio', qual: 'oculos' }],
      'birthday cake': [{ acao: 'terreno' }, { acao: 'roupa', nome: 'Festa' }, { acao: 'festa' }],
      'money gun': [{ acao: 'terreno' }, { acao: 'roupa', raridadeMinima: 'epico' }, { acao: 'festa' }],
      'planet': [{ acao: 'predio' }, { acao: 'roupa', nome: 'Astronauta' }, { acao: 'festa' }],
      'rocket': [{ acao: 'predio' }, { acao: 'roupa', nome: 'Astronauta' }, { acao: 'festa' }],
      'lion': [{ acao: 'predio' }, { acao: 'roupa', nome: 'Realeza' }, { acao: 'festa' }],
      'tiktok universe': [{ acao: 'predio' }, { acao: 'roupa', raridadeMinima: 'lendario' }, { acao: 'festa' }, { acao: 'acessorioParaTodos' }],
      'universe': [{ acao: 'predio' }, { acao: 'roupa', raridadeMinima: 'lendario' }, { acao: 'festa' }, { acao: 'acessorioParaTodos' }],
    },
    // 2º: pelo valor em moedas (moedas do presente × quantidade)
    porMoedas: [
      { de: 1, ate: 9, acoes: [{ acao: 'acessorio' }] },
      { de: 10, ate: 99, acoes: [{ acao: 'roupa', raridadeMinima: 'raro' }] },
      { de: 100, ate: 999, acoes: [{ acao: 'terreno' }, { acao: 'roupa', raridadeMinima: 'epico' }] },
      { de: 1000, ate: 9999, acoes: [{ acao: 'terreno' }, { acao: 'roupa', raridadeMinima: 'lendario' }, { acao: 'festa' }] },
      { de: 10000, ate: Infinity, acoes: [{ acao: 'predio' }, { acao: 'roupa', raridadeMinima: 'lendario' }, { acao: 'festa' }] },
    ],
  },

  // ---------------- OUTRAS INTERAÇÕES ----------------
  // Mesmas ações dos presentes. Deixe [] para não fazer nada.
  compartilhar: [{ acao: 'acessorio' }],
  minutosEntreCompartilhar: 5,   // 1 acessório por pessoa a cada X minutos (evita spam)
  inscrever: [{ acao: 'terreno' }, { acao: 'roupa', raridadeMinima: 'epico' }],
  faclube: [{ acao: 'roupa', raridadeMinima: 'raro' }],
  bau: [{ acao: 'festa' }, { acao: 'acessorio' }],
  entrarAcendeLuz: true,         // quem tem casa e entra na live: sai pelo portão e a luz da casa acende

  // Comentários
  balaoDeChat: true,          // mostra o comentário num balão em cima do boneco
  chegarAoComentar: false,    // true = quem comenta também ganha boneco (mesmo sem seguir)

  // Tela
  maxBonecosNaTela: 60,
  minutosAteIrEmbora: 20,     // boneco sem casa some depois desse tempo sem interagir
  zoomCamera: 1.6,
  passeioDaCamera: true,      // câmera passeia devagar pela cidade quando não há eventos
};
