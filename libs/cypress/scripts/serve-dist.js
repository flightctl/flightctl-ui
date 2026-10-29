// Minimal static file server used by the integration-tests CI job.
//
// It serves the already-built standalone app (apps/standalone/dist) so the
// Cypress e2e suite has something to hit on http://localhost:9000. We
// deliberately do NOT use `webpack serve` here: that is a dev server which
// recompiles the whole production bundle on startup (~90s) before answering any
// request, which blows past the action's wait-on timeout, and it binds to a
// single IP stack. A plain static server starts instantly and, by omitting the
// host from listen(), binds dual-stack (IPv4 + IPv6) so wait-on reaches it
// regardless of how `localhost` resolves.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 9000;
const DIST_DIR = path.resolve(__dirname, '../../../apps/standalone/dist');
const INDEX_FILE = path.join(DIST_DIR, 'index.html');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json; charset=utf-8',
};

const sendFile = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
  // Resolve inside DIST_DIR and reject anything that escapes it (path traversal).
  const resolved = path.join(DIST_DIR, urlPath);
  if (!resolved.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(resolved, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, resolved);
    } else {
      // SPA fallback: unknown paths are client-side routes, serve index.html.
      sendFile(res, INDEX_FILE);
    }
  });
});

if (!fs.existsSync(INDEX_FILE)) {
  // eslint-disable-next-line no-console
  console.error(`Build output not found at ${DIST_DIR}. Run "npm run build" first.`);
  process.exit(1);
}

// Host omitted on purpose: Node binds the unspecified IPv6 address (::) with
// dual-stack enabled, covering both 127.0.0.1 and ::1.
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Serving ${DIST_DIR} on http://localhost:${PORT}`);
});
