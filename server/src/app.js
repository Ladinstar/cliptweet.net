import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { config } from './config.js';
import { logger } from './logger.js';
import { downloadRouter } from './routes/download.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(pinoHttp({ logger }));

  // The API must never be indexed by search engines.
  app.use((_req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });

  const corsOptions = config.cors.origins.length ? { origin: config.cors.origins } : {}; // dev: reflect request origin
  app.use(cors(corsOptions));

  app.use(express.json({ limit: '16kb' }));

  app.use('/api', healthRouter);
  app.use('/api', downloadRouter);
  app.use('/api', adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
