// Local production preview: serves a static export (client/out by default,
// or STATIC_DIR for a white-label build like client/out-tiktok) and
// reverse-proxies /api to the Express API on :4000 — mirroring what Nginx
// does in production, without rebuilding Docker images.
import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';

const ROOT = process.env.STATIC_DIR ? resolve(process.env.STATIC_DIR) : join(process.cwd(), 'client', 'out');
const API_TARGET = { host: '127.0.0.1', port: 4000 };
const PORT = Number(process.env.PORT || 8090);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

function contentType(file) {
  if (file.endsWith('opengraph-image')) return 'image/png';
  return TYPES[extname(file)] || 'application/octet-stream';
}

// Resolve a URL path to a file in out/, honoring Next's trailingSlash export.
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const candidates = [];
  if (clean.endsWith('/')) {
    candidates.push(join(ROOT, clean, 'index.html'));
  } else {
    candidates.push(join(ROOT, clean)); // exact file (assets, opengraph-image, robots.txt…)
    candidates.push(join(ROOT, clean, 'index.html')); // route dir
    candidates.push(join(ROOT, `${clean}.html`));
  }
  return candidates.find((f) => existsSync(f) && statSync(f).isFile());
}

const server = http.createServer((req, res) => {
  // Reverse-proxy the API.
  if (req.url.startsWith('/api')) {
    const proxyReq = http.request(
      { host: API_TARGET.host, port: API_TARGET.port, path: req.url, method: req.method, headers: req.headers },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
        proxyRes.pipe(res);
      },
    );
    proxyReq.on('error', () => {
      res.writeHead(502, { 'content-type': 'application/json' });
      res.end('{"error":"API unreachable on :4000"}');
    });
    req.pipe(proxyReq);
    return;
  }

  const file = resolveFile(req.url);
  if (file) {
    res.writeHead(200, { 'content-type': contentType(file) });
    createReadStream(file).pipe(res);
    return;
  }

  // SPA-style 404 fallback.
  const notFound = resolveFile('/404.html') || resolveFile('/404/');
  res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
  if (notFound) createReadStream(notFound).pipe(res);
  else res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Prod preview on http://localhost:${PORT}  (static: ${ROOT}, /api -> :4000)`);
});
