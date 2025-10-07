/**
 * Zod Schemas for API Data Validation
 * Central location for all data validation schemas
 */

import { z } from 'zod'

// ============================================================================
// Task Schemas
// ============================================================================

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  status: z.enum(['aberta', 'em_andamento', 'concluida']),
  dueAt: z.string().datetime().nullable().optional(),
  slaHours: z.number().nullable().optional(),
  assignedTo: z.string().nullable().optional(),
  vendor: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  cost: z.number().nullable().optional(),
})

export type Task = z.infer<typeof TaskSchema>

export const TasksResponseSchema = z.union([
  z.array(TaskSchema),
  z.object({ data: z.array(TaskSchema) }),
])

// ============================================================================
// Activity/Timeline Schemas
// ============================================================================

export const ActivitySchema = z.object({
  id: z.string(),
  type: z.enum(['timeline', 'interaction', 'checkin', 'gift', 'task']),
  subtype: z.string().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().nullable().optional(),
  occurredAt: z.string().datetime(),
  dueAt: z.string().datetime().nullable().optional(),
  status: z.string().optional(),
  metadata: z.record(z.unknown()).optional().default({}),
})

export type Activity = z.infer<typeof ActivitySchema>

export const TimelineResponseSchema = z.object({
  timeline: z.array(ActivitySchema),
})

// ============================================================================
// Guest Schemas
// ============================================================================

export const GuestSchema = z.object({
  id: z.string(),
  contact: z.object({
    id: z.string(),
    fullName: z.string(),
    phone: z.string(),
    email: z.string().nullable().optional(),
    relation: z.string(),
    isVip: z.boolean().default(false),
    restrictions: z.string().nullable().optional(),
  }),
  household: z
    .object({
      id: z.string(),
      label: z.string(),
      size: z.number(),
    })
    .nullable()
    .optional(),
  inviteStatus: z.string(),
  rsvp: z.string(),
  seats: z.number(),
  children: z.number(),
  transportNeeded: z.boolean().default(false),
  optOut: z.boolean().default(false),
  engagementScore: z
    .object({
      value: z.number(),
      tier: z.string(),
    })
    .nullable()
    .optional(),
  table: z
    .object({
      id: z.string(),
      label: z.string(),
    })
    .nullable()
    .optional(),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .optional()
    .default([]),
})

export type Guest = z.infer<typeof GuestSchema>

export const GuestGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  guestCount: z.number().default(0),
})

export type GuestGroup = z.infer<typeof GuestGroupSchema>

export const GuestsResponseSchema = z.object({
  items: z.array(GuestSchema),
  total: z.number(),
  totalPages: z.number().optional(),
  groups: z.array(GuestGroupSchema).optional().default([]),
})

// ============================================================================
// Calendar Entry (unified Activity + Task)
// ============================================================================

export const CalendarEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.date(),
  end: z.date().optional(),
  kind: z.enum(['activity', 'task']),
  type: z.string().optional(),
  description: z.string().nullable().optional(),
  contactName: z.string().optional(),
  status: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export type CalendarEntry = z.infer<typeof CalendarEntrySchema>

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Safe parse with fallback
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown, fallback: T): T {
  const result = schema.safeParse(data)
  return result.success ? result.data : fallback
}

/**
 * Parse array with fallback to empty array
 */
export function parseArray<T>(schema: z.ZodSchema<T[]>, data: unknown): T[] {
  return safeParse(schema, data, [])
}
