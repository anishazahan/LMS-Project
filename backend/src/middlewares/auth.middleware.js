import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/user.model.js';

const extractToken = (req) => {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  if (req.cookies?.token) return req.cookies.token;
  return null;
};

export const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication required');

  const decoded = jwt.verify(token, env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw ApiError.unauthorized('User no longer exists');

  req.user = user;
  req.userId = user._id.toString();
  next();
});

// Optional auth — populates req.user if token present, but does not error.
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
      req.userId = user._id.toString();
    }
  } catch {
    // ignore — endpoint is public
  }
  next();
});
