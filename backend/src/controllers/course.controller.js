import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess, paginate } from '../utils/ApiResponse.js';
import { HTTP } from '../constants/httpStatus.js';
import { ROLES } from '../constants/roles.js';
import { parsePagination } from '../utils/pagination.js';
import { uploadFromBuffer, destroy } from '../services/cloudinary.service.js';
import Course from '../models/course.model.js';
import Module from '../models/module.model.js';
import User from '../models/user.model.js';
import Enrollment from '../models/enrollment.model.js';

const isOwnerOrAdmin = (course, user) =>
  course.instructor.toString() === user._id.toString() || user.role === ROLES.ADMIN;

const fetchEnrolledSet = async (userId) => {
  if (!userId) return new Set();
  const user = await User.findById(userId).select('enrolledCourses').lean();
  return new Set((user?.enrolledCourses || []).map((id) => id.toString()));
};

const tagEnrollment = (courseOrDoc, enrolledSet) => {
  const obj = typeof courseOrDoc.toObject === 'function' ? courseOrDoc.toObject() : courseOrDoc;
  return { ...obj, isEnrolled: enrolledSet.has(obj._id.toString()) };
};

export const listCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { isPublished: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.level) filter.level = req.query.level;
  if (req.query.instructor) filter.instructor = req.query.instructor;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [items, total, enrolledSet] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'name email profileImage bio')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit),
    Course.countDocuments(filter),
    fetchEnrolledSet(req.userId),
  ]);

  const data = items.map((c) => tagEnrollment(c, enrolledSet));
  return sendSuccess(res, paginate(data, { page, limit, total }));
});

export const listInstructorCourses = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { instructor: req.userId };

  if (req.query.status === 'published') filter.isPublished = true;
  else if (req.query.status === 'unpublished') filter.isPublished = false;

  if (req.query.search) {
    filter.title = { $regex: req.query.search, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Course.find(filter).sort('-createdAt').skip(skip).limit(limit),
    Course.countDocuments(filter),
  ]);

  const counts = items.length
    ? await Enrollment.aggregate([
        { $match: { course: { $in: items.map((c) => c._id) }, paymentStatus: 'completed' } },
        { $group: { _id: '$course', count: { $sum: 1 } } },
      ])
    : [];
  const countByCourse = new Map(counts.map((c) => [c._id.toString(), c.count]));
  const data = items.map((c) => ({
    ...c.toObject(),
    paidEnrollmentCount: countByCourse.get(c._id.toString()) || 0,
  }));

  return sendSuccess(res, paginate(data, { page, limit, total }));
});

export const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email profileImage bio')
    .populate({ path: 'modules', options: { sort: { order: 1 } } });
  if (!course) throw ApiError.notFound('Course not found');
  const [enrolledSet, paidEnrollmentCount] = await Promise.all([
    fetchEnrolledSet(req.userId),
    Enrollment.countDocuments({ course: course._id, paymentStatus: 'completed' }),
  ]);
  const tagged = tagEnrollment(course, enrolledSet);
  return sendSuccess(res, { data: { course: { ...tagged, paidEnrollmentCount } } });
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

  if (req.user.role !== ROLES.ADMIN) {
    if (course.isPublished) {
      throw ApiError.badRequest('Cannot delete a published course. Unpublish it first.');
    }
    const paidEnrollment = await Enrollment.exists({
      course: course._id,
      paymentStatus: 'completed',
    });
    if (paidEnrollment) {
      throw ApiError.badRequest('Cannot delete a course that has paid student enrollments.');
    }
  }

  if (course.thumbnail?.publicId) {
    await destroy(course.thumbnail.publicId, 'image').catch(() => {});
  }
  await Module.deleteMany({ course: course._id });
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
