import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { HTTP } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';
import Course from '../models/course.model.js';
import Module from '../models/module.model.js';

const ensureOwner = (course, user) => {
  if (course.instructor.toString() !== user._id.toString() && user.role !== ROLES.ADMIN) {
    throw ApiError.forbidden('Not authorized for this course');
  }
};

const loadModuleAndAuthorize = async (moduleId, user) => {
  const mod = await Module.findById(moduleId);
  if (!mod) throw ApiError.notFound('Module not found');
  const course = await Course.findById(mod.course);
  if (!course) throw ApiError.notFound('Parent course not found');
  ensureOwner(course, user);
  return { mod, course };
};

export const listByCourse = asyncHandler(async (req, res) => {
  const modules = await Module.find({ course: req.params.courseId }).sort('order');
  return sendSuccess(res, { data: { modules } });
});

export const createModule = asyncHandler(async (req, res) => {
  const { courseId, order, ...rest } = req.body;
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  ensureOwner(course, req.user);

  let nextOrder = order;
  if (nextOrder === undefined) {
    const last = await Module.findOne({ course: courseId }).sort('-order').select('order');
    nextOrder = last ? last.order + 1 : 0;
  }

  const mod = await Module.create({ ...rest, course: courseId, order: nextOrder });
  course.modules.push(mod._id);
  await course.save();

  return sendSuccess(res, { statusCode: HTTP.CREATED, message: 'Module created', data: { module: mod } });
});

export const updateModule = asyncHandler(async (req, res) => {
  const { mod } = await loadModuleAndAuthorize(req.params.id, req.user);
  Object.assign(mod, req.body);
  await mod.save();
  return sendSuccess(res, { message: 'Module updated', data: { module: mod } });
});

export const deleteModule = asyncHandler(async (req, res) => {
  const { mod, course } = await loadModuleAndAuthorize(req.params.id, req.user);
  course.modules = course.modules.filter((m) => m.toString() !== req.params.id);
  await course.save();
  await mod.deleteOne();
  return sendSuccess(res, { message: 'Module deleted' });
});

export const togglePublish = asyncHandler(async (req, res) => {
  const { mod } = await loadModuleAndAuthorize(req.params.id, req.user);
  mod.isPublished = req.body.isPublished;
  await mod.save();
  return sendSuccess(res, { message: 'Module visibility updated', data: { module: mod } });
});
