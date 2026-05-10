import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

const youtubeHostRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]{6,}/;

const youtubeUrl = z
  .string()
  .url('Must be a valid URL')
  .regex(youtubeHostRegex, 'Must be a YouTube URL');

export const createLessonSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional().default(''),
  videoUrl: youtubeUrl,
  duration: z.coerce.number().int().nonnegative().optional(),
  isFreePreview: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
  order: z.coerce.number().int().nonnegative().optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  videoUrl: youtubeUrl.optional(),
  duration: z.coerce.number().int().nonnegative().optional(),
  isFreePreview: z.coerce.boolean().optional(),
  isPublished: z.coerce.boolean().optional(),
  order: z.coerce.number().int().nonnegative().optional(),
});

export const publishLessonSchema = z.object({ isPublished: z.boolean() });

export const moduleAndLessonParams = z.object({
  moduleId: objectIdSchema,
  lessonId: objectIdSchema,
});

export const moduleIdParam = z.object({ moduleId: objectIdSchema });
