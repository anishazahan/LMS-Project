import { HTTP } from '../constants/httpStatus.js';

export const sendSuccess = (res, { statusCode = HTTP.OK, message = 'OK', data = null, meta } = {}) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const sendError = (res, { statusCode = HTTP.INTERNAL, message = 'Error', details = null, code } = {}) => {
  const body = { success: false, message };
  if (details) body.details = details;
  if (code) body.code = code;
  return res.status(statusCode).json(body);
};

export const paginate = (data, { page, limit, total }) => ({
  data,
  meta: {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  },
});
