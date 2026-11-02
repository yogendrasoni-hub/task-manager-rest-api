import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be a string'
  })
    .trim()
    .min(1, 'Name cannot be empty'),

  email: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string'
  })
    .trim()
    .toLowerCase()
    .email('Invalid email format'),

  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string'
  })
    .min(8, 'Password must be at least 8 characters long')
}).strict();

export const loginSchema = z.object({
  email: z.string({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string'
  })
    .trim()
    .toLowerCase()
    .email('Invalid email format'),

  password: z.string({
    required_error: 'Password is required',
    invalid_type_error: 'Password must be a string'
  })
    .min(1, 'Password is required')
}).strict();
