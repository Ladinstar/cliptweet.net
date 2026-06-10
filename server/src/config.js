import 'dotenv/config';

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  isProduction,
  port: Number(process.env.PORT || 4000),
  logLevel: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    dbName: process.env.MONGO_DB || 'twitter_downloader',
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
    // Hostnames allowed as tweet sources (anti-SSRF whitelist).
    allowedHosts: ['twitter.com', 'www.twitter.com', 'x.com', 'www.x.com', 'mobile.twitter.com'],
    // Hostnames allowed for the media streaming proxy.
    allowedMediaHosts: ['video.twimg.com', 'pbs.twimg.com'],
    // Max concurrent yt-dlp processes.
    concurrency: Number(process.env.DOWNLOAD_CONCURRENCY || 2),
    // yt-dlp timeout in milliseconds.
    timeoutMs: Number(process.env.DOWNLOAD_TIMEOUT_MS || 30000),
    // Hard timeout for the (slower) MP3 download+transcode.
    audioTimeoutMs: Number(process.env.AUDIO_TIMEOUT_MS || 90000),
    // In-memory cache TTL for resolved formats (avoids re-running yt-dlp).
    cacheTtlMs: Number(process.env.FORMATS_CACHE_TTL_MS || 10 * 60 * 1000),
    // Reject media proxy responses larger than this (anti-abuse / bandwidth).
    maxMediaBytes: Number(process.env.MAX_MEDIA_BYTES || 300 * 1024 * 1024),
    // Optional Netscape cookies.txt to harden extraction when X blocks guests.
    cookiesFile: process.env.YT_DLP_COOKIES || '',
  },
};
