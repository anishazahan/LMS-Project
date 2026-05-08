import { ApiError } from '../utils/ApiError.js';

export const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized('Authentication required'));
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Role '${req.user.role}' is not authorized for this resource`));
  }
  next();
};
