import { ApiError } from '../utils/ApiError.js';

const replaceProperty = (req, key, value) => {
  Object.defineProperty(req, key, {
    value,
    writable: true,
    configurable: true,
    enumerable: true,
  });
};

// schemas: { body?, params?, query? } — Zod schemas
export const validate = (schemas) => (req, _res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.params) replaceProperty(req, 'params', schemas.params.parse(req.params));
    // Express 5 makes req.query a read-only getter — defineProperty bypasses it.
    if (schemas.query) replaceProperty(req, 'query', schemas.query.parse(req.query));
    next();
  } catch (err) {
    if (err.issues) {
      const details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      return next(ApiError.unprocessable('Validation failed', details));
    }
    next(err);
  }
};
