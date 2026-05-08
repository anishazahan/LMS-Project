import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const createModuleSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(1),
  courseId: objectIdSchema,
  videoUrl: z.string().url().optional(),
  videoType: z.enum(['youtube', 'cloudinary', 'external']).optional(),
  duration: z.coerce.number().int().nonnegative().optional(),
  content: z.string().optional(),
  order: z.coerce.number().int().nonnegative(),
});

export const updateModuleSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  description: z.string().min(1).optional(),
  videoUrl: z.string().url().optional(),
  videoType: z.enum(['youtube', 'cloudinary', 'external']).optional(),
  duration: z.coerce.number().int().nonnegative().optional(),
  content: z.string().optional(),
  order: z.coerce.number().int().nonnegative().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export const publishModuleSchema = z.object({ isPublished: z.boolean() });
