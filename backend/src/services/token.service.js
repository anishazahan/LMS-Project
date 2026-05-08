import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const signRefreshToken = (payload) => {
  if (!env.JWT_REFRESH_SECRET) return null;
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
};

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_SECRET);

export const verifyRefreshToken = (token) => {
  if (!env.JWT_REFRESH_SECRET) throw new Error('Refresh tokens not configured');
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};
