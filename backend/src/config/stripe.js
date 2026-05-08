import Stripe from 'stripe';
import { env } from './env.js';
import { logger } from './logger.js';

let stripe;

export const getStripe = () => {
  if (!stripe) {
    if (!env.STRIPE_SECRET_KEY) {
      logger.warn('STRIPE_SECRET_KEY not set — payment endpoints will fail.');
    }
    stripe = new Stripe(env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2024-06-20',
    });
  }
  return stripe;
};
