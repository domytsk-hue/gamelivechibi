# Como fazer a live com o TikCity

Passo a passo para rodar a TikCity numa live de verdade no TikTok.

## Resumo em 30 segundos

1. O jogo roda **no seu PC** (Windows ou Mac): um programa (`npm start`) abre a cidade em `http://localhost:3000` e escuta a sua live.
2. Você transmite essa tela para o TikTok com o **TikTok LIVE Studio** (mais fácil) ou com o **OBS** (precisa de chave de transmissão).
3. O jogo **não precisa da sua senha**. Ele só precisa do seu **@usuário**: ele "assiste" a sua live como um espectador e transforma seguir, curtidas e presentes em ações na cidade.

```
 Seu PC
 ┌───────────────────────────────────────────────────────────┐
 │  npm start  ──►  cidade em http://localhost:3000           │
 │      ▲                    │                               │
 │      │ eventos            ▼                               │
 │      │            LIVE Studio / OBS (fonte de navegador)  │
 └──────┼────────────────────┼───────────────────────────────┘
        │                    ▼ vídeo
   TikTok (seguir,      sua live no TikTok
   curtidas, presentes)
```

---

## 1. O que a sua conta precisa ter

| Requisito | Detalhe |
|---|---|
| **Idade** | 18 anos ou mais (para receber presentes é obrigatório 18+) |
| **Seguidores** | em geral **1.000 seguidores** para liberar a LIVE. Às vezes o TikTok libera antes, por convite ou teste por região |
| **Conta em dia** | sem banimento de LIVE nem violações recentes das diretrizes |
| **Para usar o PC** | o TikTok costuma pedir que você já tenha feito **pelo menos uma live pelo celular** (relatos falam em ~25 min) antes de liberar o LIVE Studio |
| **Para usar o OBS** | precisa de **chave de transmissão** (stream key). Nem todo mundo recebe, mesmo com 1.000+ seguidores |

Para conferir se a sua conta já pode: abra o app do TikTok → botão **+** → deslize até **LIVE**. Se aparecer o botão "Fazer LIVE", a conta está liberada.

> Essas regras são do TikTok e mudam com frequência e por país. Confira na Central de Ajuda do TikTok antes ("Requisitos para LIVE").

---

## 2. Instalar no PC (uma vez só)

1. Instale o **Node.js 20 ou mais novo**: https://nodejs.org (botão "LTS").
2. Baixe o projeto: no GitHub, **Code → Download ZIP** e descompacte (ou `git clone`).
3. Abra o terminal **dentro da pasta** do projeto (no Windows: clique com o botão direito na pasta → "Abrir no Terminal") e rode:

```bash
npm install
```

4. Coloque o seu usuário do TikTok em `config.servidor.json` (sem o @):

```json
{
  "usuarioTikTok": "seu_usuario",
  "porta": 3000,
  "chaveEulerStream": ""
}
```

### Chave Euler Stream (recomendado)

A biblioteca que lê a live (TikTok-Live-Connector) precisa de um "assinador" para conectar, o serviço **Euler Stream**. Sem chave funciona, mas com um limite gratuito de conexões mais apertado. Como o jogo tenta reconectar sozinho quando cai, você pode bater no limite no meio da live.

1. Crie uma conta grátis em https://www.eulerstream.com e gere uma **API key**.
2. Cole em `chaveEulerStream` no `config.servidor.json`.

Não precisa de **sessionid** nem de login: ler uma live pública não usa a sua conta. O sessionid só seria necessário para o jogo **escrever no chat**, o que o TikCity não faz. Se algum tutorial pedir o seu sessionid, não passe, porque ele dá acesso à sua conta.

---

## 3. Testar antes de entrar ao vivo

### Teste 1: o jogo sozinho (sem TikTok)

```bash
npm run simulacao
```

Abra **http://localhost:3000/?painel=1** no navegador. Use os botões do painel (seguir, curtidas, rosa, comentário, "live automática") e veja se tudo acontece na cidade. A tecla **P** esconde o painel.

### Teste 2: conexão real usando a live de outra pessoa

Dá para testar a conexão com o TikTok **sem você estar ao vivo**: aponte o jogo para qualquer pessoa que esteja ao vivo agora.

1. Abra `http://localhost:3000/?painel=1` e clique em **💾 Baixar cidade** para guardar uma cópia da sua cidade (arquivo `tikcity.json`).
2. Rode, trocando pelo @ de alguém que está ao vivo:

```bash
npm start -- usuario_de_alguem_ao_vivo
```

3. O terminal deve mostrar `conectado na live (sala ...)` e a cidade começa a receber os seguidores, curtidas e presentes daquela live.
4. Depois do teste, pare com **Ctrl+C**, rode `npm run simulacao`, abra `?painel=1` e use **📂 Carregar cidade** (escolha o `tikcity.json`) ou **🗑️ Zerar cidade** para tirar os moradores de teste.

### Teste 3: a captura

Abra o LIVE Studio ou o OBS (passo 4), monte a cena e confira se a cidade aparece inteira, em pé, sem bordas pretas. No OBS dá para gravar um vídeo curto para conferir antes.

---

## 4. Transmitir a tela do jogo

### Opção A: TikTok LIVE Studio (recomendado para começar)

Não precisa de chave de transmissão. É só para **Windows**. Baixe em https://www.tiktok.com/studio/download e entre com a sua conta.

1. Escolha o modo **vertical (retrato)**.
2. Adicione uma fonte **Link / Navegador** com:
   - URL: `http://localhost:3000`
   - Largura **1080**, altura **1920**
3. Ajuste a fonte para ocupar a tela inteira.
4. Se quiser aparecer, adicione a **câmera** por cima, num canto (de preferência embaixo, longe do painel de regras do topo).
5. Se o LIVE Studio da sua versão não tiver fonte de navegador: abra `http://localhost:3000` no Chrome numa janela separada e use **Captura de janela**, recortando só a área do jogo.

### Opção B: OBS Studio (Windows, Mac ou Linux)

Precisa da chave de transmissão do TikTok.

1. **Configurações → Vídeo**: resolução base e de saída **1080x1920**, 30 FPS.
2. **Configurações → Saída**: taxa de bits de vídeo entre **3000 e 5000 kbps** (internet de upload de 5 Mbps ou mais).
3. Na cena, **+ → Navegador**: URL `http://localhost:3000`, largura **1080**, altura **1920**. Marque "Atualizar navegador quando a cena ficar ativa".
4. Pegue a chave: no navegador do PC, entre no TikTok, vá em https://livecenter.tiktok.com/producer, escolha título e categoria. O **URL do servidor** e a **chave** aparecem na página.
5. No OBS: **Configurações → Transmissão → Serviço: Personalizado** e cole o servidor e a chave.
6. Clique em **Iniciar transmissão**.

A chave costuma mudar a cada live: pegue de novo sempre que for transmitir.

### Dá para fazer só pelo celular?

Não. O jogo precisa de um computador rodando o `npm start` e transmitindo a tela. O celular pode ficar do lado para você acompanhar o chat e responder as pessoas. A live do TikTok sai do PC.

---

## 5. No dia da live (checklist)

1. Feche a aba `?painel=1` do navegador. **Deixe aberta só a fonte do LIVE Studio/OBS**, para a cidade não ser controlada por duas telas ao mesmo tempo.
2. Abra o terminal na pasta e rode `npm start`.
3. Abra o LIVE Studio/OBS e **comece a live**.
4. Olhe o terminal (ou a linha de status no topo do painel, se abrir `?painel=1` só para conferir). Em até ~30 segundos ele deve mostrar `conectado na live (sala ...)`. Enquanto você não está ao vivo, ele mostra "tento de novo em 30s", e isso é normal.
5. Peça para alguém seguir ou mandar curtidas e confira se o boneco aparece.
6. No final, encerre a live e depois feche o terminal (Ctrl+C). A cidade fica salva para a próxima.

Na primeira conexão, o jogo cria `data/presentes-disponiveis.json` com os presentes da sua região e quanto cada um vale em moedas. Use essa lista para ajustar `public/config.js`.

---

## 6. Se algo der errado

| O que aparece | O que fazer |
|---|---|
| `você não está ao vivo — tento de novo em 30s` | normal antes de começar a live. Se continuar depois de 1 min ao vivo, confira o usuário em `config.servidor.json` (sem @) |
| `erro ao conectar: Failed to retrieve Room ID` | o TikTok não achou uma live ativa nesse usuário. Em geral é usuário errado ou a live ainda não começou de fato |
| erro com "rate limit", "429" ou "limit" | limite gratuito do Euler Stream: coloque a `chaveEulerStream` (passo 2) |
| a cidade aparece no navegador mas não no OBS/LIVE Studio | confira se o `npm start` está rodando e se a URL é `http://localhost:3000` (sem `?painel=1`) |
| a cidade aparece cortada ou com bordas | a fonte precisa ser 1080x1920 e a cena/tela do programa também vertical |
| nada acontece com seguir/curtir | veja se o terminal diz "conectado". Se a live estiver marcada como **só para maiores de 18**, desmarque: lives restritas podem não ser lidas sem login |
| porta 3000 ocupada | troque `porta` no `config.servidor.json` (ex.: 3001) e use a mesma porta na URL |

### Importante saber

- A leitura da live usa uma biblioteca **não oficial** (TikTok-Live-Connector). Ela funciona hoje, mas o TikTok pode mudar algo e quebrar a conexão de um dia para o outro. Se isso acontecer, rode `npm update tiktok-live-connector`. O plano B sem código é o **TikFinity**.
- As regras de LIVE do TikTok proíbem conteúdo repetido/gravado sem interação. A TikCity reage ao público em tempo real. Ainda assim, **apareça e fale com o público** (câmera ou microfone) para a live não ser tratada como conteúdo sem criador.
