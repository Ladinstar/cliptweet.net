import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getCollections } from '../db.js';
import { unauthorized } from '../utils/httpError.js';

export async function login(username, password) {
  const { adminUsers } = getCollections();
  const user = await adminUsers.findOne({ username });

  // Always run a bcrypt compare to avoid leaking whether the user exists (timing).
  const hash = user?.password || '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv';
  const valid = await bcrypt.compare(password, hash);

  if (!user || !valid) {
    throw unauthorized('Identifiants invalides.');
  }

  const token = jwt.sign({ sub: username, role: 'admin' }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

  return { token, username };
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}
