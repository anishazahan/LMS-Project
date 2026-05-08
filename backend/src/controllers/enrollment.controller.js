import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import Course from '../models/course.model.js';
import Enrollment from '../models/enrollment.model.js';

export const myEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.userId,
    paymentStatus: 'completed',
  })
    .populate('course')
    .populate('completedModules');
  return sendSuccess(res, { data: { enrollments } });
});

export const getEnrollment = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('course')
    .populate('completedModules');
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.student.toString() !== req.userId) throw ApiError.forbidden('Not authorized');
  return sendSuccess(res, { data: { enrollment } });
});

export const completeModule = asyncHandler(async (req, res) => {
  const enrollment = await Enrollment.findById(req.params.id);
  if (!enrollment) throw ApiError.notFound('Enrollment not found');
  if (enrollment.student.toString() !== req.userId) throw ApiError.forbidden('Not authorized');

  const { moduleId } = req.body;
  if (!enrollment.completedModules.includes(moduleId)) {
    enrollment.completedModules.push(moduleId);
    const course = await Course.findById(enrollment.course);
    const total = course?.modules?.length || 1;
    enrollment.progress = Math.min(100, Math.round((enrollment.completedModules.length / total) * 100));
    if (enrollment.progress >= 100) enrollment.completionDate = new Date();
    await enrollment.save();
  }

  return sendSuccess(res, { message: 'Module marked complete', data: { enrollment } });
});
