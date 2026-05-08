import { z } from 'zod';
import { ALL_ROLES } from '../constants/roles.js';

export const registerSchema = z
  .object({
    name: z.string().min(2).max(80),
    email: z.string().email().toLowerCase(),
    password: z.string().min(6).max(128),
    confirmPassword: z.string().min(6).max(128),
    role: z.enum(ALL_ROLES).optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});
