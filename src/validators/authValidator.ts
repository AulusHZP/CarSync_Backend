import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string({
      required_error: 'Name is required',
      invalid_type_error: 'Name must be a string',
    })
    .trim()
    .min(3, 'Name must have at least 3 characters')
    .max(120, 'Name must be less than 120 characters'),
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .trim()
    .email('Invalid email format')
    .transform((value) => value.toLowerCase()),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(6, 'Password must have at least 6 characters')
    .max(72, 'Password must be at most 72 characters'),
});

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .trim()
    .email('Invalid email format')
    .transform((value) => value.toLowerCase()),
  password: z
    .string({
      required_error: 'Password is required',
      invalid_type_error: 'Password must be a string',
    })
    .min(1, 'Password is required')
    .max(72, 'Password must be at most 72 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
