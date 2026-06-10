import { Router } from 'express';
import { login } from '../services/auth.service.js';
import { getStats } from '../services/stats.service.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { loginLimiter } from '../middlewares/rateLimit.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { badRequest } from '../utils/httpError.js';

export const adminRouter = Router();

adminRouter.post(
  '/admin/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      throw badRequest('Username et password requis.');
    }
    const result = await login(username, password);
    res.json(result);
  }),
);

adminRouter.get(
  '/admin/stats',
  requireAdmin,
  asyncHandler(async (_req, res) => {
    res.json(await getStats());
  }),
);
