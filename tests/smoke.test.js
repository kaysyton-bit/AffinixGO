const path = require('path');
const http = require('http');
const fs = require('fs');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const CONTENT_TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function startStaticServer() {
  const server = http.createServer((req, res) => {
    const filePath = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, { 'Content-Type': CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream' });
      res.end(data);
    });
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function loadPage(port, pagePath) {
  const errors = [];
  const dom = await JSDOM.fromURL(`http://127.0.0.1:${port}/${pagePath}`, {
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
  });
  dom.window.onerror = (msg) => errors.push(msg);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  return { dom, errors };
}

async function run() {
  const server = await startStaticServer();
  const { port } = server.address();
  const assertions = [];

  const home = await loadPage(port, 'index.html');
  const cards = home.dom.window.document.querySelectorAll('.provider-card');
  const badge = home.dom.window.document.querySelector('.nav-badge');
  assertions.push(
    [home.errors.length === 0, `index.html: nenhum erro de runtime (${JSON.stringify(home.errors)})`],
    [cards.length === 5, `index.html: 5 prestadores renderizados (encontrados: ${cards.length})`],
    [badge?.textContent === '3', `index.html: badge de mensagens mostra 3 (encontrado: ${badge?.textContent})`]
  );

  const messagesPage = await loadPage(port, 'pages/mensagens.html');
  const messageItems = messagesPage.dom.window.document.querySelectorAll('#messageList .message-item');
  assertions.push(
    [messagesPage.errors.length === 0, `mensagens.html: nenhum erro de runtime (${JSON.stringify(messagesPage.errors)})`],
    [messageItems.length === 3, `mensagens.html: 3 conversas renderizadas (encontradas: ${messageItems.length})`]
  );

  for (const page of ['pages/login.html', 'pages/historico.html', 'pages/ajuda.html']) {
    const { errors } = await loadPage(port, page);
    assertions.push([errors.length === 0, `${page}: nenhum erro de runtime (${JSON.stringify(errors)})`]);
  }

  let failed = 0;
  for (const [ok, description] of assertions) {
    console.log(`${ok ? 'ok' : 'FAIL'} - ${description}`);
    if (!ok) failed++;
  }

  console.log(`\n${assertions.length - failed}/${assertions.length} verificações passaram`);
  server.close();
  process.exit(failed ? 1 : 0);
}

run();
