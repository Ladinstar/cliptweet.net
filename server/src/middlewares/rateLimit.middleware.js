import rateLimit from 'express-rate-limit';
import { redisClient } from '../cache.js';

// Shared store so limits hold across multiple instances when Redis is available.
let RedisStore;
if (redisClient) {
  ({ RedisStore } = await import('rate-limit-redis'));
}

function makeStore(prefix) {
  if (!redisClient) return undefined;
  return new RedisStore({ prefix, sendCommand: (...args) => redisClient.call(...args) });
}

const common = { standardHeaders: true, legacyHeaders: false };

export const downloadLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  max: 10,
  store: makeStore('rl:dl:'),
  message: { error: 'Trop de requêtes, réessayez dans une minute.' },
});

// MP3/M4A extraction is expensive (download + transcode) — keep it tight.
export const audioLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  max: 4,
  store: makeStore('rl:audio:'),
  message: { error: 'Trop de conversions audio, réessayez dans une minute.' },
});

// Server-side video merge (download + ffmpeg) is the heaviest op — limit hard.
export const videoLimiter = rateLimit({
  ...common,
  windowMs: 60 * 1000,
  max: 3,
  store: makeStore('rl:video:'),
  message: { error: 'Trop de fusions vidéo, réessayez dans une minute.' },
});

export const loginLimiter = rateLimit({
  ...common,
  windowMs: 15 * 60 * 1000,
  max: 10,
  store: makeStore('rl:login:'),
  message: { error: 'Trop de tentatives de connexion, réessayez plus tard.' },
});
