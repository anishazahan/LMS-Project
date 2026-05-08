import { getStripe } from '../config/stripe.js';
import { env } from '../config/env.js';

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
