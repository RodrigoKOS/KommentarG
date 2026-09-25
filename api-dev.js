// Servidor local simples para testar sem a Vercel (só para ver na sua máquina)
// Rode: node api-dev.js -> abra http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

// Carrega .env local (sem precisar de pacote)
try {
  const envFile = path.join(__dirname, '.env');
  if (fs.existsSync(envFile)) {
    fs.readFileSync(envFile, 'utf8').split('\n').forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (v && !v.startsWith('#')) process.env[m[1]] = v;
      }
    });
  }
} catch {}

const PORT = 3000;

function sendJson(res, obj, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

async function handleSummary(req, res) {
  // lê corpo se POST
  let body = {};
  if (req.method === 'POST') {
    body = await new Promise((resolve) => {
      let d = '';
      req.on('data', (c) => (d += c));
      req.on('end', () => {
        try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); }
      });
    });
  }
  const business = body.business || 'Minha Empresa Exemplo';
  const reviews = body.reviews || [
    { author: 'Maria S.', stars: 5, text: 'Atendimento maravilhoso!' },
    { author: 'João P.', stars: 5, text: 'Super recomendo.' },
  ];

  const key = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
  if (!key) {
    return sendJson(res, {
      business, rating: 4.9, count: reviews.length,
      summary: null,
      mode: 'sem-chave - crie .env com DEEPSEEK_API_KEY (copie de .env.example) para resumo real',
    });
  }
  try {
    const list = reviews.slice(0, 20).map((r, i) => `${i + 1}. ${r.author} (${r.stars}★): ${r.text}`).join('\n');
    const r = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Você resume avaliações de clientes de forma curta e confiável.' },
          { role: 'user', content: `Resuma em 2-3 frases em pt-BR para "${business}":\n${list}` },
        ],
        thinking: { type: 'disabled' },
        stream: false, temperature: 0.7, max_tokens: 300,
      }),
    });
    if (!r.ok) return sendJson(res, { error: 'DeepSeek erro', detail: (await r.text()).slice(0, 500) }, 502);
    const data = await r.json();
    return sendJson(res, {
      business, count: reviews.length,
      summary: data.choices?.[0]?.message?.content?.trim() || '',
      mode: 'deepseek-' + model,
    });
  } catch (e) {
    return sendJson(res, { error: 'Falha no resumo', detail: String(e?.message || e) }, 500);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/health')) {
    return sendJson(res, {
      ok: true, service: 'KommentarG', time: new Date().toISOString(),
      deepseek: process.env.DEEPSEEK_API_KEY ? 'conectado' : 'sem-chave',
      google: process.env.GOOGLE_MAPS_API_KEY ? 'conectado' : 'mock',
    });
  }
  if (req.url.startsWith('/api/summary')) {
    return handleSummary(req, res);
  }
  if (req.url.startsWith('/api/reviews')) {
    return sendJson(res, {
      business: 'Minha Empresa Exemplo',
      rating: 4.9,
      total: 3,
      mode: 'mock local',
      reviews: [
        { id: '1', author: 'Maria S.', stars: 5, text: 'Atendimento maravilhoso!', date: '2026-09-10' },
        { id: '2', author: 'João P.', stars: 5, text: 'Super recomendo.', date: '2026-09-12' },
        { id: '3', author: 'Ana L.', stars: 4, text: 'Muito bom.', date: '2026-09-15' }
      ]
    });
  }
  let file = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const full = path.join(__dirname, 'public', file);
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); return res.end('nao encontrado'); }
    const ext = path.extname(full);
    const type = ext === '.js' ? 'text/javascript' : ext === '.html' ? 'text/html' : 'text/plain';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(PORT, () => console.log('KommentarG local em http://localhost:' + PORT));
