import { z } from 'zod';

const CATEGORIES = ['programming', 'design', 'business', 'personal-development', 'marketing', 'other'];
const LEVELS = ['beginner', 'intermediate', 'advanced'];

export const createCourseSchema = z.object({
  title: z.string().min(3).max(160),
  description: z.string().min(10),
  price: z.coerce.number().min(0),
  category: z.enum(CATEGORIES).optional(),
  level: z.enum(LEVELS).optional(),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  isPublished: z.coerce.boolean().optional(),
});

export const listCourseQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
  category: z.enum(CATEGORIES).optional(),
  level: z.enum(LEVELS).optional(),
  instructor: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
});

export const publishSchema = z.object({
  isPublished: z.boolean(),
});
