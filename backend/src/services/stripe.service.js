import { getStripe } from '../config/stripe.js';
import { env } from '../config/env.js';

export const createCheckoutSession = ({ course, user, successUrl, cancelUrl, metadata = {} }) =>
  getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: env.STRIPE_CURRENCY,
          product_data: {
            name: course.title,
            description: course.shortDescription?.slice(0, 350),
            ...(course.thumbnail?.url ? { images: [course.thumbnail.url] } : {}),
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      courseId: course._id.toString(),
      userId: user._id.toString(),
      instructorId: course.instructor.toString(),
      ...metadata,
    },
  });

export const retrieveCheckoutSession = (id) =>
  getStripe().checkout.sessions.retrieve(id, { expand: ['payment_intent'] });

// Kept temporarily so the legacy controller import keeps resolving; removed in PR 2.
export const createPaymentIntent = ({ amount, currency = env.STRIPE_CURRENCY, metadata = {} }) =>
  getStripe().paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });

export const retrievePaymentIntent = (id) => getStripe().paymentIntents.retrieve(id);

export const constructWebhookEvent = (rawBody, signature) =>
  getStripe().webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
