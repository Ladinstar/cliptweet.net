import { config } from './config.js';
import { logger } from './logger.js';

let redisClient = null;

if (config.redisUrl) {
  try {
    const { default: Redis } = await import('ioredis');
    redisClient = new Redis(config.redisUrl, { maxRetriesPerRequest: 2 });
    redisClient.on('error', (err) => logger.warn({ err: err.message }, 'Redis error'));
    logger.info('Redis connected for cache + rate limiting');
  } catch (err) {
    logger.warn({ err: err.message }, 'Redis unavailable, falling back to in-memory');
  }
}

export { redisClient };

const memory = new Map();

export async function cacheGet(key) {
  if (redisClient) {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }
  const entry = memory.get(key);
  if (entry && Date.now() - entry.at < config.download.cacheTtlMs) return entry.data;
  memory.delete(key);
  return null;
}

export async function cacheSet(key, data) {
  if (redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(data), 'PX', config.download.cacheTtlMs);
    } catch {
      /* ignore cache write failures */
    }
    return;
  }
  memory.set(key, { at: Date.now(), data });
}
