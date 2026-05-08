import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { sendError } from '../utils/ApiResponse.js';
import { HTTP } from '../constants/httpStatus.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const formatZod = (err) =>
  err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || HTTP.INTERNAL;
  let message = err.message || 'Internal server error';
  let details = err.details || null;
  let code = err.code;

  if (err instanceof ZodError) {
    statusCode = HTTP.UNPROCESSABLE;
    message = 'Validation failed';
    details = formatZod(err);
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = HTTP.UNPROCESSABLE;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = HTTP.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err?.code === 11000) {
    statusCode = HTTP.CONFLICT;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for '${field}'`;
  } else if (err?.name === 'JsonWebTokenError') {
    statusCode = HTTP.UNAUTHORIZED;
    message = 'Invalid token';
  } else if (err?.name === 'TokenExpiredError') {
    statusCode = HTTP.UNAUTHORIZED;
    message = 'Token expired';
  } else if (!(err instanceof ApiError) && statusCode === HTTP.INTERNAL) {
    if (env.isProd) message = 'Internal server error';
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.message}\n${err.stack}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${statusCode} ${message}`);
  }

  return sendError(res, {
    statusCode,
    message,
    details,
    code,
    ...(env.isProd ? {} : { stack: err.stack }),
  });
};
