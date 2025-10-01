import { z } from 'zod';

export const taskSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  status: z.enum(['backlog', 'doing', 'done']).default('backlog'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().optional(),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export const taskUpdateSchema = taskSchema.partial();

export const taskFilterSchema = z.object({
  status: z.enum(['backlog', 'doing', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
});

export type TaskFilterData = z.infer<typeof taskFilterSchema>;
