import { getCloudinary } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });

export const uploadFromBuffer = async (buffer, { folder, resourceType = 'image', publicId } = {}) => {
  if (!buffer) throw ApiError.badRequest('No file buffer provided');
  const opts = {
    folder: folder ? `${env.CLOUDINARY_FOLDER}/${folder}` : env.CLOUDINARY_FOLDER,
    resource_type: resourceType,
  };
  if (publicId) opts.public_id = publicId;
  const result = await uploadBuffer(buffer, opts);
  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    bytes: result.bytes,
    format: result.format,
    duration: result.duration,
  };
};

export const destroy = async (publicId, resourceType = 'image') => {
  if (!publicId) return null;
  return getCloudinary().uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
};
