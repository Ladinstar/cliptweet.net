import { Router } from 'express';
import { pingDb } from '../db.js';
import { getYtDlpVersion } from '../services/ytdlp.service.js';
import { getOutcomeStats } from '../services/monitoring.service.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  const [db, ytDlpVersion] = await Promise.all([
    pingDb()
      .then(() => 'up')
      .catch(() => 'down'),
    getYtDlpVersion(),
  ]);

  const ytDlp = ytDlpVersion ? 'up' : 'down';
  const healthy = db === 'up' && ytDlp === 'up';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    db,
    ytDlp,
    ytDlpVersion,
    extraction: getOutcomeStats(),
  });
});
