import { HttpError } from '../utils/httpError.js';
import { logger } from '../logger.js';

export function notFound(_req, res) {
  res.status(404).json({ error: 'Ressource introuvable.' });
}

// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature.
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({ error: 'Erreur serveur.' });
}
