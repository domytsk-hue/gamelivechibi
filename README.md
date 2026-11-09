# TikCity 🏙️

Jogo de navegador para lives no TikTok. Quem segue a live vira um bonequinho chibi que chega de ônibus na rodoviária da cidade, ganha terreno com curtidas e troca de roupa com presentes. A tela é vertical (1080×1920) e fica pronta para colocar no OBS ou no TikTok LIVE Studio.

<p align="center"><img src="docs/tela-da-live.png" width="320" alt="Tela da live"></p>

## Como funciona

| Na live | No jogo |
|---|---|
| **Seguir** | o boneco chega de ônibus com o nome em cima e vai para a praça |
| **1000 curtidas** (somando entre lives) | ganha um terreno: vira obra e depois casa com o nome. Com 3000 vira sobrado e com 6000 vira prédio |
| **Rosa** | roupa surpresa (comum, raro, épico ou lendário). A cor da etiqueta do nome mostra a raridade |
| **Outros presentes** | configuráveis por nome ou por valor em moedas (acessório, roupa rara, terreno, festa…) |
| **Comentário** | aparece num balão em cima do boneco |
| **Compartilhar** | ganha um acessório |

Onde cada boneco fica: chega de ônibus → praça em frente à rodoviária → quando a praça lota, passeia pelas ruas → quem tem casa fica no portão.

A cidade fica salva (no navegador e em `data/cidade.json`), então os moradores e as casas continuam na próxima live.

## Instalar (uma vez)

1. Instale o [Node.js](https://nodejs.org) versão 20 ou mais nova.
2. Baixe este repositório e, dentro da pasta, rode:

```bash
npm install
```

## Testar sem estar ao vivo

```bash
npm run simulacao
```

Abra **http://localhost:3000/?painel=1**. O painel do lado direito simula seguir, curtidas, rosas, outros presentes, comentários e tem uma "live automática" que gera eventos sozinha. A tecla **P** mostra ou esconde o painel.

Também dá para abrir `public/index.html` direto no navegador (dois cliques) e testar com o painel, sem servidor.

## Usar na live

> 📖 Guia completo (requisitos da conta, LIVE Studio x OBS, chave de transmissão, testes e problemas comuns): **[docs/COMO-FAZER-LIVE.md](docs/COMO-FAZER-LIVE.md)**

1. Coloque seu usuário do TikTok (sem @) em `config.servidor.json`, ou rode direto:

```bash
npm start -- seu_usuario
```

2. Comece a live e deixe o terminal aberto. Ele mostra "conectado na live" quando estiver tudo certo (se você ainda não estiver ao vivo, ele tenta de novo a cada 30 segundos).
3. No **OBS** ou no **TikTok LIVE Studio**, adicione uma fonte de **Navegador (Browser Source)**:
   - URL: `http://localhost:3000`
   - Largura `1080`, altura `1920`

Ao conectar, o servidor salva em `data/presentes-disponiveis.json` a lista de presentes da sua região com o valor em moedas, para ajudar a configurar.

> A conexão com a live usa a biblioteca [TikTok-Live-Connector](https://github.com/zerodytrash/TikTok-Live-Connector), que não é oficial do TikTok. Ela assina a conexão pelo serviço Euler Stream; se aparecer erro de limite, crie uma chave grátis em eulerstream.com e coloque em `chaveEulerStream` no `config.servidor.json`.

## Configurar

Tudo fica em **`public/config.js`** (é só editar e recarregar a página):

- `curtidas`: quantas curtidas para terreno, sobrado e prédio
- `chances`: chance de cada raridade de roupa
- `presentes.porNome`: ação para um presente específico (ex.: `'rose'`)
- `presentes.porMoedas`: ação por faixa de valor (1–9, 10–99, 100–999, 1000+)
- `regrasNaTela`: as 3 regras que aparecem no topo
- `chegarAoComentar`: se quem só comenta também ganha boneco
- `nomeExibido`: mostrar o @ (`usuario`) ou o nome de exibição (`apelido`)

## Arquivos

```
server.js            servidor: site + conexão com a live + salvar a cidade
config.servidor.json usuário do TikTok, porta e chave Euler
public/config.js     regras do jogo (presentes, curtidas, chances)
public/js/mapa.js    desenho da cidade (mapa oficial v4, isométrico)
public/js/bonecos.js bonecos chibi "Vinil brilhante" e guarda-roupa
public/js/mundo.js   monta a cidade em camadas para os bonecos passarem atrás/na frente
public/js/jogo.js    regras, ônibus, câmera, etiquetas, avisos e efeitos
public/js/painel.js  painel de simulação
```
