import pino from 'pino';
import { config } from './config.js';

// The pino-pretty transport runs in a worker thread (keeps the event loop alive),
// which is fine for a long-lived server but blocks `node --test` from exiting —
// so use plain stdout under test and in production.
const usePretty = !config.isProduction && process.env.NODE_ENV !== 'test';

export const logger = pino({
  level: config.logLevel,
  transport: usePretty
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
    : undefined,
});
