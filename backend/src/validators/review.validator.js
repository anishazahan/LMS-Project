import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const addReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(2000),
});

export const updateReviewSchema = z
  .object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(1).max(2000).optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: 'At least one of rating or comment must be provided',
  });

export const courseIdParamSchema = z.object({
  courseId: objectIdSchema,
});

export const reviewIdParamSchema = z.object({
  id: objectIdSchema,
});

export const reviewListQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const testimonialsQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});
