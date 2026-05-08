import { HTTP } from '../constants/httpStatus.js';

export class ApiError extends Error {
  constructor(statusCode, message, { details = null, isOperational = true, code } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details) {
    return new ApiError(HTTP.BAD_REQUEST, message, { details });
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(HTTP.UNAUTHORIZED, message);
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError(HTTP.FORBIDDEN, message);
  }
  static notFound(message = 'Not found') {
    return new ApiError(HTTP.NOT_FOUND, message);
  }
  static conflict(message = 'Conflict') {
    return new ApiError(HTTP.CONFLICT, message);
  }
  static unprocessable(message = 'Unprocessable entity', details) {
    return new ApiError(HTTP.UNPROCESSABLE, message, { details });
  }
  static internal(message = 'Internal server error') {
    return new ApiError(HTTP.INTERNAL, message, { isOperational: false });
  }
}
