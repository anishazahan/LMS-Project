import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .url('Must be a valid URL')
  .or(z.literal(''))
  .optional();

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  bio: z.string().max(1000).optional(),
  socialLinks: z
    .object({
      linkedin: optionalUrl,
      github: optionalUrl,
      website: optionalUrl,
    })
    .partial()
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(128),
    confirmPassword: z.string().min(6).max(128),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const instructorListQuery = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().optional(),
});
