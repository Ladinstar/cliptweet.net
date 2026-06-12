import { createApp } from './src/app.js';
import { connectDb, closeDb } from './src/db.js';
import { config, cookiesStatus } from './src/config.js';
import { logger } from './src/logger.js';
import { updateYtDlp, getYtDlpVersion } from './src/services/ytdlp.service.js';

async function start() {
  await connectDb();

  // Surface auth mode up front: guest extraction can't reach age/login-gated
  // videos; a configured-but-missing cookies file is a silent footgun.
  const cookies = cookiesStatus();
  if (cookies.exists) {
    logger.info({ path: cookies.path }, 'yt-dlp cookies loaded (authenticated extraction)');
  } else if (cookies.configured) {
    logger.warn({ path: cookies.path }, 'YT_DLP_COOKIES set but file not found — falling back to guest mode');
  } else {
    logger.info('yt-dlp running in guest mode (no cookies)');
  }

  // Refresh the extractor on boot (best-effort, non-blocking) so a redeploy
  // self-heals when X/YouTube break yt-dlp between image builds.
  if (config.download.autoUpdate) {
    updateYtDlp().catch(() => {});
  } else {
    getYtDlpVersion().then((version) => logger.info({ version }, 'yt-dlp ready'));
  }

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
