import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const createModuleSchema = z.object({
  courseId: objectIdSchema,
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional().default(''),
  order: z.coerce.number().int().nonnegative().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export const updateModuleSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  order: z.coerce.number().int().nonnegative().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export const publishModuleSchema = z.object({ isPublished: z.boolean() });
