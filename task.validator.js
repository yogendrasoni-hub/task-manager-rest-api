import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string({
    required_error: 'Title is required',
    invalid_type_error: 'Title must be a string'
  })
    .trim()
    .min(1, 'Title cannot be empty'),

  description: z.string({
    invalid_type_error: 'Description must be a string'
  })
    .nullable()
    .optional(),

  completed: z.boolean({
    invalid_type_error: 'Completed must be a boolean'
  })
    .optional()
    .default(false)
}).strict();

export const updateTaskSchema = z.object({
  title: z.string({
    invalid_type_error: 'Title must be a string'
  })
    .trim()
    .min(1, 'Title cannot be empty')
    .optional(),

  description: z.string({
    invalid_type_error: 'Description must be a string'
  })
    .nullable()
    .optional(),

  completed: z.boolean({
    invalid_type_error: 'Completed must be a boolean'
  })
    .optional()
}).strict().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field (title, description, completed) must be provided for update'
});

export const taskIdParamSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/, 'Task ID must be a positive integer')
});
