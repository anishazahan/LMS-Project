import { logger } from '../config/logger.js';
import Course from '../models/course.model.js';
import Enrollment from '../models/enrollment.model.js';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import { sendEmail } from './email.service.js';

/**
 * Idempotently activates a successful payment.
 * Safe to call from both the Stripe webhook handler and the success-page verify endpoint —
 * concurrent callers either no-op or converge on the same final state.
 *
 * `session` is the Stripe Checkout Session object (with `payment_intent` expanded when available).
 */
export const activatePayment = async ({ payment, session }) => {
  if (payment.status === 'succeeded') {
    return { payment, alreadyActive: true };
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id;

  payment.status = 'succeeded';
  payment.paidAt = new Date();
  payment.stripePaymentIntentId = paymentIntentId || payment.stripePaymentIntentId;
  payment.transactionId = paymentIntentId || session.id;
  await payment.save();

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

  if (!payment.confirmationEmailSent) {
    const [buyer, course] = await Promise.all([
      User.findById(payment.student),
      Course.findById(payment.course).populate('instructor'),
    ]);

    if (buyer && course) {
      sendEmail(
        buyer.email,
        'purchaseConfirmation',
        buyer.name,
        course.title,
        payment.amount,
        payment.transactionId,
        payment._id.toString()
      ).catch((e) => logger.error(`Buyer confirmation email failed: ${e.message}`));

      if (course.instructor && course.instructor._id.toString() !== buyer._id.toString()) {
        sendEmail(
          course.instructor.email,
          'instructorNotification',
          course.instructor.name,
          buyer.name,
          course.title
        ).catch((e) => logger.error(`Instructor email failed: ${e.message}`));
      }

      payment.confirmationEmailSent = true;
      await payment.save();
    }
  }

  logger.info(`Payment activated: ${payment._id} → enrollment ${enrollment._id}`);
  return { payment, enrollment, alreadyActive: false };
};
