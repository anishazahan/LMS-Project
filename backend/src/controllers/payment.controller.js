import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { HTTP } from '../constants/httpStatus.js';
import Course from '../models/course.model.js';
import Enrollment from '../models/enrollment.model.js';
import Payment from '../models/payment.model.js';
import {
  activatePayment,
  markExpired,
  markFailed,
} from '../services/payment.service.js';
import {
  constructWebhookEvent,
  retrieveCheckoutSession,
  createCheckoutSession as stripeCreateCheckoutSession,
} from '../services/stripe.service.js';
import { ApiError } from '../utils/ApiError.js';
import { paginate, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const populatePaymentForView = (id) =>
  Payment.findById(id)
    .populate('course', 'title price thumbnail')
    .populate('instructor', 'name email');

const SESSION_REUSE_WINDOW_MS = 30 * 60 * 1000;

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) throw ApiError.notFound('Course not found');
  if (!course.isPublished) throw ApiError.conflict('Course is not available for purchase');
  if (course.price <= 0) throw ApiError.badRequest('Free courses are not purchasable');

  if (course.instructor.equals(req.userId)) {
    throw new ApiError(HTTP.FORBIDDEN, 'You cannot purchase your own course', {
      code: 'CANNOT_PURCHASE_OWN_COURSE',
    });
  }

  const succeededPayment = await Payment.findOne({
    student: req.userId,
    course: courseId,
    status: 'succeeded',
  });
  if (succeededPayment) {
    throw new ApiError(HTTP.CONFLICT, 'You have already purchased this course', {
      code: 'ALREADY_PURCHASED',
    });
  }

  const enrollment = await Enrollment.findOne({
    student: req.userId,
    course: courseId,
    paymentStatus: 'completed',
  });
  if (enrollment) {
    throw new ApiError(HTTP.CONFLICT, 'You are already enrolled in this course', {
      code: 'ALREADY_ENROLLED',
    });
  }

  // Reuse a recent open pending Payment if its Stripe session is still alive.
  let payment = await Payment.findOne({
    student: req.userId,
    course: courseId,
    status: 'pending',
    createdAt: { $gte: new Date(Date.now() - SESSION_REUSE_WINDOW_MS) },
  }).sort('-createdAt');

  if (payment?.stripeSessionId) {
    try {
      const existing = await retrieveCheckoutSession(payment.stripeSessionId);
      if (existing?.status === 'open' && existing?.url) {
        return sendSuccess(res, {
          data: { url: existing.url, sessionId: existing.id, reused: true },
        });
      }
    } catch (err) {
      logger.warn(`Failed to retrieve existing session ${payment.stripeSessionId}: ${err.message}`);
    }
  }

  payment = await Payment.create({
    student: req.userId,
    course: courseId,
    instructor: course.instructor,
    amount: course.price,
    currency: env.STRIPE_CURRENCY,
    status: 'pending',
  });

  const session = await stripeCreateCheckoutSession({
    course,
    user: req.user,
    successUrl: `${env.FRONTEND_URL}/checkout/success`,
    cancelUrl: `${env.FRONTEND_URL}/checkout/cancel`,
    metadata: { paymentId: payment._id.toString() },
  });

  payment.stripeSessionId = session.id;
  await payment.save();

  return sendSuccess(res, {
    data: { url: session.url, sessionId: session.id, reused: false },
  });
});

export const getPaymentBySession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  let payment = await Payment.findOne({ stripeSessionId: sessionId })
    .populate('course', 'title price thumbnail')
    .populate('instructor', 'name email');
  if (!payment) throw ApiError.notFound('Payment not found');
  if (!payment.student.equals(req.userId)) {
    throw ApiError.forbidden('Not allowed to view this payment');
  }

  // Webhook fallback: if still pending, verify against Stripe and activate if paid.
  // activatePayment is idempotent, so this is safe to race with the webhook.
  if (payment.status === 'pending') {
    try {
      const session = await retrieveCheckoutSession(sessionId);
      if (session?.payment_status === 'paid') {
        await activatePayment({ payment, session });
        payment = await populatePaymentForView(payment._id);
      } else if (session?.status === 'expired') {
        await markExpired(sessionId);
        payment = await populatePaymentForView(payment._id);
      }
    } catch (err) {
      logger.warn(`Verify-on-fetch failed for ${sessionId}: ${err.message}`);
    }
  }

  return sendSuccess(res, { data: { payment } });
});

export const myPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ student: req.userId })
    .populate('course', 'title price thumbnail')
    .populate('instructor', 'name email')
    .sort('-createdAt');
  return sendSuccess(res, { data: { payments } });
});

export const getReceiptData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await Payment.findById(id)
    .populate('course', 'title')
    .populate('instructor', 'name')
    .populate('student', 'name email');
  if (!payment) throw ApiError.notFound('Payment not found');
  if (!payment.student._id.equals(req.userId)) {
    throw ApiError.forbidden('Not allowed to view this receipt');
  }
  if (payment.status !== 'succeeded') {
    throw new ApiError(425, 'Payment not yet completed', { code: 'PAYMENT_NOT_READY' });
  }

  return sendSuccess(res, {
    data: {
      receipt: {
        platform: { name: 'E-Study' },
        user: { name: payment.student.name, email: payment.student.email },
        course: { title: payment.course.title },
        instructor: { name: payment.instructor?.name || '—' },
        transactionId: payment.transactionId || payment.stripePaymentIntentId || payment.stripeSessionId,
        amount: payment.amount,
        currency: payment.currency,
        paidAt: payment.paidAt || payment.createdAt,
        status: payment.status,
      },
    },
  });
});

export const getStudentPurchases = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({
    student: req.userId,
    paymentStatus: 'completed',
  })
    .populate({
      path: 'course',
      select: 'title shortDescription thumbnail price instructor modules',
      populate: { path: 'instructor', select: 'name' },
    })
    .populate('payment', 'amount currency paidAt transactionId')
    .sort('-createdAt');

  return sendSuccess(res, { data: { enrollments } });
});

export const getInstructorStats = asyncHandler(async (req, res) => {
  const instructorId = new mongoose.Types.ObjectId(req.userId);

  const [totals, uniqueStudents, monthly] = await Promise.all([
    Payment.aggregate([
      { $match: { instructor: instructorId, status: 'succeeded' } },
      { $group: { _id: null, totalSales: { $sum: 1 }, totalRevenue: { $sum: '$amount' } } },
    ]),
    Payment.distinct('student', { instructor: instructorId, status: 'succeeded' }),
    Payment.aggregate([
      {
        $match: {
          instructor: instructorId,
          status: 'succeeded',
          paidAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
          revenue: { $sum: '$amount' },
          sales: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const t = totals[0] || { totalSales: 0, totalRevenue: 0 };

  return sendSuccess(res, {
    data: {
      stats: {
        totalStudents: uniqueStudents.length,
        totalSales: t.totalSales,
        totalRevenue: t.totalRevenue,
        currency: env.STRIPE_CURRENCY,
        monthlyBreakdown: monthly.map((m) => ({
          year: m._id.year,
          month: m._id.month,
          revenue: m.revenue,
          sales: m.sales,
        })),
      },
    },
  });
});

export const getInstructorSales = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 20), 100);
  const skip = (page - 1) * limit;
  const filter = { instructor: req.userId, status: 'succeeded' };

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate('course', 'title thumbnail')
      .populate('student', 'name email')
      .sort('-paidAt')
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(filter),
  ]);

  return sendSuccess(res, paginate(items, { page, limit, total }));
});

// Stripe webhook — raw body, mounted before express.json() in app.js
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
    case 'checkout.session.completed': {
      const session = event.data.object;
      const payment = await Payment.findOne({ stripeSessionId: session.id });
      if (!payment) {
        logger.warn(`Webhook completed but no payment record for session ${session.id}`);
        break;
      }
      const fullSession = await retrieveCheckoutSession(session.id);
      await activatePayment({ payment, session: fullSession });
      break;
    }
    case 'checkout.session.expired': {
      const session = event.data.object;
      await markExpired(session.id);
      break;
    }
    case 'checkout.session.async_payment_failed': {
      const session = event.data.object;
      await markFailed(session.id, 'Async payment failed');
      break;
    }
    default:
      logger.debug(`Unhandled Stripe event: ${event.type}`);
  }

  res.status(HTTP.OK).json({ received: true });
});
