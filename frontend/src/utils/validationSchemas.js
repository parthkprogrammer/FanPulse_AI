import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(50, 'Full name must not exceed 50 characters')
      .regex(/^[a-zA-Z\s.'-]+$/, 'Full name contains invalid characters'),
    email: z
      .string()
      .min(1, 'Email address is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one numeric digit'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must not exceed 50 characters'),
  favoriteTeam: z
    .string()
    .max(50, 'Team name cannot exceed 50 characters')
    .optional(),
  bio: z
    .string()
    .max(160, 'Bio must not exceed 160 characters')
    .optional(),
});
