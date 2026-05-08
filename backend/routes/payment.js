import express from 'express';
import stripe from 'stripe';
import { protect } from '../middlewares/auth.js';
import Course from '../models/Course.js';
import Payment from '../models/Payment.js';

const router = express.Router();
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Create payment intent
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Create payment intent
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(course.price * 100), // Stripe expects amount in cents
      currency: 'usd',
      metadata: {
        courseId: courseId.toString(),
        studentId: req.user.id.toString()
      }
    });

    // Create payment record
    const payment = await Payment.create({
      student: req.user.id,
      course: courseId,
      amount: course.price,
      currency: 'usd',
      stripePaymentId: paymentIntent.id,
      status: 'pending'
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Confirm payment
router.post('/confirm-payment', protect, async (req, res) => {
  try {
    const { stripePaymentId, paymentId } = req.body;

    const paymentIntent = await stripeInstance.paymentIntents.retrieve(stripePaymentId);

    if (paymentIntent.status === 'succeeded') {
      await Payment.findByIdAndUpdate(paymentId, {
        status: 'succeeded',
        transactionId: paymentIntent.id
      });

      res.json({
        success: true,
        message: 'Payment successful'
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's payment history
router.get('/history', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ student: req.user.id })
      .populate('course', 'title price')
      .sort('-createdAt');

    res.json({
      success: true,
      payments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
