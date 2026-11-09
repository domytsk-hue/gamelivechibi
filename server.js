// ============================================================
//  Servidor da Cidade da Live
//  - serve o jogo em http://localhost:3000
//  - escuta a live do TikTok (TikTok-Live-Connector) e manda os eventos para o jogo
//  - guarda a cidade em data/cidade.json
//
//  Uso:  npm start                (usa o usuário do config.servidor.json)
//        npm start -- seu_usuario (sem @)
//        npm run simulacao        (sem conectar no TikTok)
// ============================================================
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(DIR, 'public');
const DATA = path.join(DIR, 'data');
fs.mkdirSync(DATA, { recursive: true });

let cfg = { usuarioTikTok: '', porta: 3000, chaveEulerStream: '' };
try { cfg = { ...cfg, ...JSON.parse(fs.readFileSync(path.join(DIR, 'config.servidor.json'), 'utf8')) }; } catch { }
const args = process.argv.slice(2);
const SIMULACAO = args.includes('--simulacao');
const argUser = args.find((a) => !a.startsWith('--'));
const USUARIO = String(argUser || process.env.TIKTOK_USUARIO || cfg.usuarioTikTok || '').replace(/^@/, '').trim();
const PORTA = Number(process.env.PORTA || cfg.porta || 3000);
const CHAVE = process.env.EULER_API_KEY || cfg.chaveEulerStream || '';

// ---------------- site ----------------
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  let file = path.normalize(path.join(PUB, url === '/' ? 'index.html' : url));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('não encontrado'); }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(buf);
  });
});

// ---------------- WebSocket com o jogo ----------------
const wss = new WebSocketServer({ server, path: '/ws' });
const ARQ = path.join(DATA, 'cidade.json');
let status = { tipo: 'status', conectado: false, usuario: USUARIO, msg: SIMULACAO ? 'modo simulação (sem TikTok)' : USUARIO ? 'conectando…' : 'nenhum usuário configurado' };
function enviarTodos(m) { const s = JSON.stringify(m); for (const c of wss.clients) if (c.readyState === 1) c.send(s); }
function setStatus(conectado, msg) { status = { ...status, conectado, msg }; enviarTodos(status); console.log(`[tiktok] ${msg}`); }

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(status));
  try { ws.send(JSON.stringify({ tipo: 'estado', estado: JSON.parse(fs.readFileSync(ARQ, 'utf8')) })); } catch { }
  ws.on('message', (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (m.tipo === 'salvar' && m.estado && m.estado.v === 1) {
      fs.writeFile(ARQ + '.tmp', JSON.stringify(m.estado), (e) => { if (!e) fs.rename(ARQ + '.tmp', ARQ, () => { }); });
    }
  });
});

// ---------------- TikTok ----------------
const user = (u = {}) => ({ id: String(u.uniqueId || u.userId || '').toLowerCase(), usuario: u.uniqueId || '', apelido: u.nickname || '' });
function evento(e) { if (!e.user || !e.user.id) return; enviarTodos({ tipo: 'evento', evento: e }); }

async function conectarTikTok() {
  const { TikTokLiveConnection, WebcastEvent, ControlEvent } = await import('tiktok-live-connector');
  const opts = { enableExtendedGiftInfo: true };
  if (CHAVE) opts.signApiKey = CHAVE;
  let conn = null, tentando = false;

  const ligar = async () => {
    if (tentando) return; tentando = true;
    conn = new TikTokLiveConnection(USUARIO, opts);
    conn.on(WebcastEvent.FOLLOW, (d) => evento({ tipo: 'seguir', user: user(d.user) }));
    conn.on(WebcastEvent.LIKE, (d) => evento({ tipo: 'curtir', user: user(d.user), qtd: d.likeCount || 1 }));
    conn.on(WebcastEvent.CHAT, (d) => evento({ tipo: 'chat', user: user(d.user), texto: d.comment || '' }));
    conn.on(WebcastEvent.SHARE, (d) => evento({ tipo: 'compartilhar', user: user(d.user) }));
    conn.on(WebcastEvent.GIFT, (d) => {
      const det = d.giftDetails || {}; const ext = d.extendedGiftInfo || {};
      if (det.giftType === 1 && !d.repeatEnd) return; // combo ainda rolando: espera terminar
      evento({ tipo: 'presente', user: user(d.user), presente: { id: d.giftId, nome: det.giftName || ext.name || `presente ${d.giftId}`, moedas: det.diamondCount || ext.diamond_count || 1, qtd: d.repeatCount || 1 } });
    });
    conn.on(ControlEvent.DISCONNECTED, () => { setStatus(false, 'live desconectada — tentando de novo em 20s'); setTimeout(() => { tentando = false; ligar(); }, 20000); });
    conn.on(WebcastEvent.STREAM_END, () => setStatus(false, 'a live terminou'));
    try {
      const st = await conn.connect();
      setStatus(true, `conectado na live (sala ${st.roomId})`);
      salvarPresentes(conn);
    } catch (err) {
      const msg = String(err && err.message || err);
      setStatus(false, /offline|not.*live|UserOffline/i.test(msg) ? 'você não está ao vivo — tento de novo em 30s' : 'erro ao conectar: ' + msg.slice(0, 140) + ' — tento de novo em 30s');
      setTimeout(() => { tentando = false; ligar(); }, 30000);
      return;
    }
    tentando = false;
  };
  ligar();
}
// salva a lista de presentes da sua região (nome + moedas) para ajudar a configurar
async function salvarPresentes(conn) {
  try {
    const g = await conn.fetchAvailableGifts();
    const lista = (Array.isArray(g) ? g : g.gifts || g.giftList || []).map((x) => ({ id: x.id, nome: x.name, moedas: x.diamond_count ?? x.diamondCount })).filter((x) => x.nome).sort((a, b) => a.moedas - b.moedas);
    if (lista.length) { fs.writeFileSync(path.join(DATA, 'presentes-disponiveis.json'), JSON.stringify(lista, null, 2)); console.log(`[tiktok] ${lista.length} presentes salvos em data/presentes-disponiveis.json`); }
  } catch (e) { console.log('[tiktok] não consegui baixar a lista de presentes:', e.message); }
}

server.listen(PORTA, () => {
  console.log('');
  console.log('  🏙️  Cidade da Live rodando!');
  console.log(`  Jogo (para o OBS / LIVE Studio):  http://localhost:${PORTA}`);
  console.log(`  Jogo + painel de teste:           http://localhost:${PORTA}/?painel=1`);
  console.log('');
  if (SIMULACAO) console.log('  Modo simulação: sem TikTok. Use o painel de teste.');
  else if (!USUARIO) console.log('  ⚠️  Coloque seu usuário do TikTok em config.servidor.json ou rode: npm start -- seu_usuario');
  else conectarTikTok().catch((e) => setStatus(false, 'erro: ' + e.message));
});
