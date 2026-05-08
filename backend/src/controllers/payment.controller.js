import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { logger } from '../config/logger.js';
import { createPaymentIntent, constructWebhookEvent } from '../services/stripe.service.js';
import { sendEmail } from '../services/email.service.js';
import Course from '../models/course.model.js';
import Payment from '../models/payment.model.js';
import Enrollment from '../models/enrollment.model.js';
import User from '../models/user.model.js';

export const createIntent = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');

  const existing = await Enrollment.findOne({
    student: req.userId,
    course: courseId,
    paymentStatus: 'completed',
  });
  if (existing) throw ApiError.conflict('Already enrolled in this course');

  const intent = await createPaymentIntent({
    amount: course.price,
    metadata: {
      courseId: courseId.toString(),
      studentId: req.userId.toString(),
    },
  });

  const payment = await Payment.create({
    student: req.userId,
    course: courseId,
    amount: course.price,
    currency: intent.currency,
    stripePaymentIntentId: intent.id,
    status: 'pending',
  });

  return sendSuccess(res, {
    data: {
      clientSecret: intent.client_secret,
      paymentId: payment._id,
      paymentIntentId: intent.id,
    },
  });
});

export const myPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ student: req.userId })
    .populate('course', 'title price thumbnail')
    .sort('-createdAt');
  return sendSuccess(res, { data: { payments } });
});

// Stripe webhook — must use raw body, mounted before express.json()
export const stripeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = constructWebhookEvent(req.body, signature);
  } catch (err) {
    logger.error(`Stripe webhook signature failed: ${err.message}`);
    throw ApiError.badRequest(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object;
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'succeeded' },
        { new: true }
      );
      if (!payment) {
        logger.warn(`Webhook succeeded but no payment record for ${intent.id}`);
        break;
      }

      const enrollment = await Enrollment.findOneAndUpdate(
        { student: payment.student, course: payment.course },
        {
          student: payment.student,
          course: payment.course,
          payment: payment._id,
          paymentStatus: 'completed',
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await Promise.all([
        User.findByIdAndUpdate(payment.student, { $addToSet: { enrolledCourses: payment.course } }),
        Course.findByIdAndUpdate(payment.course, { $addToSet: { enrolledStudents: payment.student } }),
      ]);

      // Fire confirmation emails (non-blocking)
      const [user, course] = await Promise.all([
        User.findById(payment.student),
        Course.findById(payment.course).populate('instructor'),
      ]);
      if (user && course) {
        sendEmail(user.email, 'purchaseConfirmation', user.name, course.title, payment.amount).catch(
          (e) => logger.error(`Confirmation email failed: ${e.message}`)
        );
        if (course.instructor) {
          sendEmail(
            course.instructor.email,
            'instructorNotification',
            course.instructor.name,
            user.name,
            course.title
          ).catch((e) => logger.error(`Instructor email failed: ${e.message}`));
        }
      }

      logger.info(`Enrollment activated: ${enrollment._id}`);
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'failed', failureReason: intent.last_payment_error?.message }
      );
      break;
    }
    case 'payment_intent.canceled': {
      const intent = event.data.object;
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        { status: 'canceled' }
      );
      break;
    }
    default:
      logger.debug(`Unhandled Stripe event: ${event.type}`);
  }

  res.status(200).json({ received: true });
});
