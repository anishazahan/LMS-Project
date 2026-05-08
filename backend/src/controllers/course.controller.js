import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess, paginate } from '../utils/ApiResponse.js';
import { HTTP } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';
import { parsePagination } from '../utils/pagination.js';
import { uploadFromBuffer, destroy } from '../services/cloudinary.service.js';
import Course from '../models/course.model.js';

const isOwnerOrAdmin = (course, user) =>
  course.instructor.toString() === user._id.toString() || user.role === ROLES.ADMIN;

export const listCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.level) filter.level = req.query.level;
  if (req.query.instructor) filter.instructor = req.query.instructor;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [items, total] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'name email profileImage bio')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  return sendSuccess(res, paginate(items, { page, limit, total }));
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email profileImage bio')
    .populate('modules');
  if (!course) throw ApiError.notFound('Course not found');
  return sendSuccess(res, { data: { course } });
});

export const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create({
    ...req.body,
    instructor: req.userId,
  });
  return sendSuccess(res, {
    statusCode: HTTP.CREATED,
    message: 'Course created',
    data: { course },
  });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (!isOwnerOrAdmin(course, req.user)) throw ApiError.forbidden('Not authorized to update this course');

  Object.assign(course, req.body);
  await course.save();
  return sendSuccess(res, { message: 'Course updated', data: { course } });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (!isOwnerOrAdmin(course, req.user)) throw ApiError.forbidden('Not authorized');

  if (course.thumbnail?.publicId) {
    await destroy(course.thumbnail.publicId, 'image').catch(() => {});
  }
  await course.deleteOne();
  return sendSuccess(res, { message: 'Course deleted' });
});

export const togglePublish = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (!isOwnerOrAdmin(course, req.user)) throw ApiError.forbidden('Not authorized');

  course.isPublished = req.body.isPublished;
  await course.save();
  return sendSuccess(res, { message: 'Course visibility updated', data: { course } });
});

export const uploadThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest('No image uploaded (field name: image)');

  const course = await Course.findById(req.params.id);
  if (!course) throw ApiError.notFound('Course not found');
  if (!isOwnerOrAdmin(course, req.user)) throw ApiError.forbidden('Not authorized');

  if (course.thumbnail?.publicId) {
    await destroy(course.thumbnail.publicId, 'image').catch(() => {});
  }

  const result = await uploadFromBuffer(req.file.buffer, {
    folder: `courses/${course._id}/thumbnail`,
    resourceType: 'image',
  });

  course.thumbnail = { url: result.url, publicId: result.publicId };
  await course.save();
  return sendSuccess(res, { message: 'Thumbnail updated', data: { thumbnail: course.thumbnail } });
});
