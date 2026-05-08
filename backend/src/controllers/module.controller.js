import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { HTTP } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';
import { uploadFromBuffer, destroy } from '../services/cloudinary.service.js';
import Course from '../models/course.model.js';
import Module from '../models/module.model.js';

const ensureOwner = (course, user) => {
  if (course.instructor.toString() !== user._id.toString() && user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Not authorized for this course');
  }
};

export const listByCourse = asyncHandler(async (req, res) => {
  const modules = await Module.find({ course: req.params.courseId }).sort('order');
  return sendSuccess(res, { data: { modules } });
});

export const createModule = asyncHandler(async (req, res) => {
  const { courseId, videoUrl, videoType, ...rest } = req.body;
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  ensureOwner(course, req.user);

  if (!videoUrl) throw ApiError.badRequest('videoUrl is required when creating a module without a video upload');

  const mod = await Module.create({
    ...rest,
    course: courseId,
    video: { url: videoUrl, type: videoType || 'youtube' },
  });
  course.modules.push(mod._id);
  await course.save();

  return sendSuccess(res, { statusCode: HTTP.CREATED, message: 'Module created', data: { module: mod } });
});

export const updateModule = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id);
  if (!mod) throw ApiError.notFound('Module not found');

  const course = await Course.findById(mod.course);
  ensureOwner(course, req.user);

  const { videoUrl, videoType, ...rest } = req.body;
  Object.assign(mod, rest);
  if (videoUrl) mod.video.url = videoUrl;
  if (videoType) mod.video.type = videoType;

  await mod.save();
  return sendSuccess(res, { message: 'Module updated', data: { module: mod } });
});

export const deleteModule = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id);
  if (!mod) throw ApiError.notFound('Module not found');

  const course = await Course.findById(mod.course);
  ensureOwner(course, req.user);

  if (mod.video?.publicId) {
    await destroy(mod.video.publicId, 'video').catch(() => {});
  }
  for (const r of mod.resources || []) {
    if (r.publicId) await destroy(r.publicId, 'raw').catch(() => {});
  }

  course.modules = course.modules.filter((m) => m.toString() !== req.params.id);
  await course.save();
  await mod.deleteOne();

  return sendSuccess(res, { message: 'Module deleted' });
});

export const togglePublish = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.id);
  if (!mod) throw ApiError.notFound('Module not found');

  const course = await Course.findById(mod.course);
  ensureOwner(course, req.user);

  mod.isPublished = req.body.isPublished;
  await mod.save();
  return sendSuccess(res, { message: 'Module visibility updated', data: { module: mod } });
});

export const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No video uploaded (field name: video)');

  const mod = await Module.findById(req.params.id);
  if (!mod) throw ApiError.notFound('Module not found');

  const course = await Course.findById(mod.course);
  ensureOwner(course, req.user);

  if (mod.video?.publicId) {
    await destroy(mod.video.publicId, 'video').catch(() => {});
  }

  const result = await uploadFromBuffer(req.file.buffer, {
    folder: `courses/${course._id}/modules/${mod._id}/video`,
    resourceType: 'video',
  });

  mod.video = { url: result.url, publicId: result.publicId, type: 'cloudinary' };
  if (result.duration) mod.duration = Math.round(result.duration);
  await mod.save();

  return sendSuccess(res, { message: 'Video uploaded', data: { video: mod.video, duration: mod.duration } });
});

export const uploadResource = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded (field name: file)');

  const mod = await Module.findById(req.params.id);
  if (!mod) throw ApiError.notFound('Module not found');

  const course = await Course.findById(mod.course);
  ensureOwner(course, req.user);

  const result = await uploadFromBuffer(req.file.buffer, {
    folder: `courses/${course._id}/modules/${mod._id}/resources`,
    resourceType: 'raw',
  });

  const resource = {
    title: req.body.title || req.file.originalname,
    url: result.url,
    publicId: result.publicId,
    type: req.file.mimetype,
  };
  mod.resources.push(resource);
  await mod.save();
  return sendSuccess(res, { statusCode: HTTP.CREATED, message: 'Resource added', data: { resource } });
});
