import { verifyToken } from '../services/auth.service.js';
import { unauthorized } from '../utils/httpError.js';

export function requireAdmin(req, _res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    return next(unauthorized('Accès administrateur requis.'));
  }

  try {
    const payload = verifyToken(header.slice(7));
    if (payload.role !== 'admin') {
      return next(unauthorized('Accès administrateur requis.'));
    }
    req.admin = payload;
    return next();
  } catch {
    return next(unauthorized('Session expirée ou invalide.'));
  }
}
