import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const checkoutSessionSchema = z.object({
  courseId: objectIdSchema,
});

export const sessionIdParamSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
});

export const paymentIdParamSchema = z.object({
  id: objectIdSchema,
});

export const instructorSalesQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
