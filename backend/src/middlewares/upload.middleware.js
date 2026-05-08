import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_DOC = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

const buildFilter = (allowed) => (_req, file, cb) => {
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(ApiError.badRequest(`File type '${file.mimetype}' is not allowed`));
};

const storage = multer.memoryStorage();

export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: buildFilter(ALLOWED_IMAGE),
});

export const uploadVideo = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
  fileFilter: buildFilter(ALLOWED_VIDEO),
});

export const uploadDocument = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: buildFilter(ALLOWED_DOC),
});

export const uploadAny = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 },
  fileFilter: buildFilter([...ALLOWED_IMAGE, ...ALLOWED_VIDEO, ...ALLOWED_DOC]),
});

// Wrap multer middleware to convert errors into ApiError
export const handleMulter = (mw) => (req, res, next) =>
  mw(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      return next(ApiError.badRequest(err.message));
    }
    next(err);
  });
