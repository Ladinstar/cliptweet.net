import { createApp } from './src/app.js';
import { connectDb, closeDb } from './src/db.js';
import { config } from './src/config.js';
import { logger } from './src/logger.js';

async function start() {
  await connectDb();
  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port}`);
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, 'Shutting down');
    server.close();
    await closeDb();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
