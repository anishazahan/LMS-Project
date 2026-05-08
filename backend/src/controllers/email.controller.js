import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { sendEmail } from '../services/email.service.js';
import Course from '../models/course.model.js';
import Enrollment from '../models/enrollment.model.js';

export const moduleReleaseNotification = asyncHandler(async (req, res) => {
  const { courseId, moduleName } = req.body;
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  if (course.instructor.toString() !== req.userId && req.user.role !== 'admin') {
    throw ApiError.forbidden('Not authorized');
  }

  const enrollments = await Enrollment.find({
    course: courseId,
    paymentStatus: 'completed',
  }).populate('student', 'name email');

  const results = await Promise.allSettled(
    enrollments.map((e) =>
      sendEmail(e.student.email, 'moduleReleaseNotification', e.student.name, course.title, moduleName)
    )
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.length - sent;
  return sendSuccess(res, { message: `Notifications sent to ${sent} students (${failed} failed)` });
});
