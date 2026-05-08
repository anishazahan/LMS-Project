import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const createIntentSchema = z.object({
  courseId: objectIdSchema,
});

export const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1),
});
