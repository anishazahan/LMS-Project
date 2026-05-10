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

const loadModule = async (moduleId, user) => {
  const mod = await Module.findById(moduleId);
  if (!mod) throw ApiError.notFound('Module not found');
  const course = await Course.findById(mod.course);
  if (!course) throw ApiError.notFound('Parent course not found');
  ensureOwner(course, user);
  return mod;
};

export const listLessons = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.moduleId).select('lessons');
  if (!mod) throw ApiError.notFound('Module not found');
  const lessons = [...mod.lessons].sort((a, b) => a.order - b.order);
  return sendSuccess(res, { data: { lessons } });
});

export const createLesson = asyncHandler(async (req, res) => {
  const mod = await loadModule(req.params.moduleId, req.user);

  const { order, ...rest } = req.body;
  let nextOrder = order;
  if (nextOrder === undefined) {
    nextOrder = mod.lessons.length
      ? Math.max(...mod.lessons.map((l) => l.order)) + 1
      : 0;
  }

  mod.lessons.push({ ...rest, order: nextOrder });
  await mod.save();

  const lesson = mod.lessons[mod.lessons.length - 1];
  return sendSuccess(res, { statusCode: HTTP.CREATED, message: 'Lesson created', data: { lesson } });
});

export const updateLesson = asyncHandler(async (req, res) => {
  const mod = await loadModule(req.params.moduleId, req.user);
  const lesson = mod.lessons.id(req.params.lessonId);
  if (!lesson) throw ApiError.notFound('Lesson not found');

  Object.assign(lesson, req.body);
  await mod.save();
  return sendSuccess(res, { message: 'Lesson updated', data: { lesson } });
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const mod = await loadModule(req.params.moduleId, req.user);
  const lesson = mod.lessons.id(req.params.lessonId);
  if (!lesson) throw ApiError.notFound('Lesson not found');

  lesson.deleteOne();
  await mod.save();
  return sendSuccess(res, { message: 'Lesson deleted' });
});

export const togglePublishLesson = asyncHandler(async (req, res) => {
  const mod = await loadModule(req.params.moduleId, req.user);
  const lesson = mod.lessons.id(req.params.lessonId);
  if (!lesson) throw ApiError.notFound('Lesson not found');

  lesson.isPublished = req.body.isPublished;
  await mod.save();
  return sendSuccess(res, { message: 'Lesson visibility updated', data: { lesson } });
});
