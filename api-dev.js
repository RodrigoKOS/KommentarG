// Servidor local simples para testar sem a Vercel (só para ver na sua máquina)
// Rode: node api-dev.js -> abra http://localhost:3000
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

function sendJson(res, obj, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/health')) {
    return sendJson(res, { ok: true, service: 'KommentarG', time: new Date().toISOString() });
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
