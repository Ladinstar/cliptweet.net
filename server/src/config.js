import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// aria2c gives yt-dlp parallel connections per file — the strongest answer to
// YouTube's per-connection throttling. Resolution order: ARIA2C_PATH env,
// bundled server/bin/aria2c (local dev), then the system PATH (Docker image).
function detectAria2c() {
  if (process.env.ARIA2C_PATH) return process.env.ARIA2C_PATH;
  const bundled = join(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'aria2c');
  if (existsSync(bundled)) return bundled;
  return spawnSync('which', ['aria2c']).status === 0 ? 'aria2c' : '';
}

// Resolve YT_DLP_COOKIES to an absolute path (relative paths are taken from the
// server dir, not the random CWD). Returns '' when unset — existence is checked
// at boot by cookiesStatus() so a stale path degrades to guest mode, not a crash.
function resolveCookiesFile() {
  const raw = process.env.YT_DLP_COOKIES;
  if (!raw) return '';
  const serverDir = join(dirname(fileURLToPath(import.meta.url)), '..');
  return raw.startsWith('/') ? raw : join(serverDir, raw);
}

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Whether the configured cookies file actually exists right now. Re-checked at
 * each call (cheap) so dropping in / removing the file takes effect on the next
 * extraction without a restart. Returns { configured, exists, path }.
 */
export function cookiesStatus() {
  const path = config.download.cookiesFile;
  return { configured: Boolean(path), exists: Boolean(path) && existsSync(path), path };
}

export const config = {
  isProduction,
  port: Number(process.env.PORT || 4000),
  logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGO_DB || 'twitter_downloader',
    serverSelectionTimeoutMs: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 5000),
  },

  // Optional: enables shared cache + rate-limit across instances. Empty = in-memory.
  redisUrl: process.env.REDIS_URL || '',

  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: required('ADMIN_PASSWORD', isProduction ? undefined : 'admin123'),
  },

  jwt: {
    secret: required('JWT_SECRET', isProduction ? undefined : 'dev-only-insecure-secret'),
    expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  },

  cors: {
    // Comma-separated list of allowed origins. Empty => reflect request origin (dev only).
    origins: (process.env.CORS_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },

  download: {
    // Supported source platforms (anti-SSRF whitelist). Twitter/X + Reddit work as
    // guest; Instagram/TikTok/Facebook usually need YT_DLP_COOKIES to be set.
    platforms: [
      { id: 'twitter', hosts: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com', 'mobile.twitter.com'] },
      { id: 'reddit', hosts: ['reddit.com', 'www.reddit.com', 'old.reddit.com', 'v.redd.it'] },
      { id: 'instagram', hosts: ['instagram.com', 'www.instagram.com'] },
      { id: 'tiktok', hosts: ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com', 'm.tiktok.com'] },
      { id: 'facebook', hosts: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch'] },
      { id: 'youtube', hosts: ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com'] },
    ],
    // Media CDN host suffixes allowed by the streaming proxy (anti-SSRF, suffix match).
    allowedMediaHostSuffixes: [
      'twimg.com',
      'redd.it',
      'redditmedia.com',
      'cdninstagram.com',
      'fbcdn.net',
      'tiktokcdn.com',
      'tiktokcdn-us.com',
      'tiktokcdn-eu.com',
      // TikTok also serves media from regional webapp hosts under tiktok.com
      // itself (e.g. v16-webapp-prime.us.tiktok.com).
      'tiktok.com',
      'muscdn.com',
      'googlevideo.com',
    ],
    // CDNs that bind media URLs to cookies set during extraction (the /media
    // proxy can't replay them) — formats on these hosts are forced through the
    // server-side yt-dlp path instead.
    cookieBoundMediaHostSuffixes: ['tiktok.com'],
    // Max concurrent yt-dlp processes.
    concurrency: Number(process.env.DOWNLOAD_CONCURRENCY || 2),
    // yt-dlp timeout in milliseconds. YouTube extraction of long videos can
    // take 25s+ when the platform slow-walks unauthenticated clients.
    timeoutMs: Number(process.env.DOWNLOAD_TIMEOUT_MS || 60000),
    // Hard timeout for the (slower) MP3 download+transcode.
    audioTimeoutMs: Number(process.env.AUDIO_TIMEOUT_MS || 90000),
    // Hard timeout for server-side video+audio merge (HD/4K can be big).
    mergeTimeoutMs: Number(process.env.MERGE_TIMEOUT_MS || 180000),
    // Parallel fragment downloads for segmented (HLS/DASH) formats.
    concurrentFragments: Number(process.env.YT_DLP_CONCURRENT_FRAGMENTS || 4),
    // YouTube throttles each HTTP request after a few MB; re-requesting in
    // chunks resets the throttle (measured ~2x faster on single-file formats).
    // Fallback when aria2c is unavailable.
    httpChunkSize: process.env.YT_DLP_HTTP_CHUNK_SIZE || '10M',
    // Empty string = not found, yt-dlp native downloader is used instead.
    aria2cPath: detectAria2c(),
    // In-memory cache TTL for resolved formats (avoids re-running yt-dlp).
    cacheTtlMs: Number(process.env.FORMATS_CACHE_TTL_MS || 10 * 60 * 1000),
    // Reject media proxy responses larger than this (anti-abuse / bandwidth).
    maxMediaBytes: Number(process.env.MAX_MEDIA_BYTES || 300 * 1024 * 1024),
    // Abort the upstream CDN fetch if it stalls (a slow CDN must not pin a socket).
    mediaFetchTimeoutMs: Number(process.env.MEDIA_FETCH_TIMEOUT_MS || 20_000),
    // Optional Netscape cookies.txt to authenticate yt-dlp — lets it fetch
    // age-restricted / login-gated videos (mainly YouTube). Resolved to an
    // absolute path; validated at boot (see resolveCookiesFile).
    cookiesFile: resolveCookiesFile(),
    // Refresh the yt-dlp binary on boot (X/YouTube break the extractor often).
    autoUpdate: process.env.YT_DLP_AUTO_UPDATE !== 'false',
  },

  // Operational alerting when the extraction failure rate spikes (yt-dlp broke).
  alerts: {
    slackWebhook: process.env.ALERT_SLACK_WEBHOOK || '',
    windowSize: Number(process.env.ALERT_WINDOW_SIZE || 50),
    minSamples: Number(process.env.ALERT_MIN_SAMPLES || 10),
    errorRateThreshold: Number(process.env.ALERT_ERROR_RATE || 0.5),
    cooldownMs: Number(process.env.ALERT_COOLDOWN_MS || 30 * 60 * 1000),
  },
};
