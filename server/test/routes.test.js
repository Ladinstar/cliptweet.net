import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { closeDb } from '../src/db.js';

// Boot the real Express stack on an ephemeral port and hit it over HTTP.
// These paths (validation, anti-SSRF, auth) reject *before* touching MongoDB or
// the network, so no external services are needed. We use node:http with
// `agent: false` (no keep-alive pool) so the test process exits cleanly.
let server;
let port;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  port = server.address().port;
});

after(async () => {
  server?.closeAllConnections?.();
  server?.close();
  // Release the MongoDB topology monitor so the test process can exit.
  await closeDb().catch(() => {});
});

function request(path, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const payload = body !== undefined ? JSON.stringify(body) : null;
    const req = http.request(
      { host: '127.0.0.1', port, path, method, agent: false, headers: { connection: 'close', ...headers } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          resolve({
            status: res.statusCode,
            json: () => JSON.parse(data),
          }),
        );
      },
    );
    req.on('error', reject);
    if (payload) {
      req.setHeader('content-type', 'application/json');
      req.write(payload);
    }
    req.end();
  });
}

const get = (path, init = {}) => request(path, init);
const postJson = (path, body) => request(path, { method: 'POST', body });

test('unknown route returns a 404 JSON envelope', async () => {
  const res = await get('/api/nope');
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'Ressource introuvable.' });
});

test('health reports yt-dlp status and a version, mapping db state to the HTTP code', async () => {
  const res = await get('/api/health');
  const body = await res.json();
  assert.equal(body.ytDlp, 'up');
  assert.ok(body.ytDlpVersion, 'expected a yt-dlp version string');
  assert.ok(['up', 'down'].includes(body.db));
  // 200 only when everything is up; otherwise the probe must signal degraded.
  assert.equal(res.status, body.db === 'up' ? 200 : 503);
  assert.equal(body.status, body.db === 'up' ? 'ok' : 'degraded');
});

test('POST /download rejects a non-whitelisted host (anti-SSRF) with 400', async () => {
  const res = await postJson('/api/download', { tweetUrl: 'https://evil.com/status/1' });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /non support/i);
});

test('POST /formats rejects garbage input with 400', async () => {
  const res = await postJson('/api/formats', { tweetUrl: 'not-a-url' });
  assert.equal(res.status, 400);
});

test('POST /download honors the new sourceUrl field (still anti-SSRF guarded)', async () => {
  const res = await postJson('/api/download', { sourceUrl: 'https://evil.com/status/1' });
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /non support/i);
});

test('GET /media rejects a non-whitelisted CDN host with 400', async () => {
  const res = await get(`/api/media?src=${encodeURIComponent('https://evil.com/x.mp4')}`);
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /non autorisé/i);
});

test('GET /media rejects a plain-http media URL with 400', async () => {
  const res = await get(`/api/media?src=${encodeURIComponent('http://video.twimg.com/x.mp4')}`);
  assert.equal(res.status, 400);
});

test('POST /admin/login requires credentials', async () => {
  const res = await postJson('/api/admin/login', {});
  assert.equal(res.status, 400);
});

test('GET /admin/stats without a token is 401', async () => {
  const res = await get('/api/admin/stats');
  assert.equal(res.status, 401);
});

test('GET /admin/stats with a bogus bearer token is 401', async () => {
  const res = await get('/api/admin/stats', { headers: { authorization: 'Bearer not.a.jwt' } });
  assert.equal(res.status, 401);
});
