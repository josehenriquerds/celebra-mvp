import { z } from 'zod'

// Table shape enum
export const tableShapeEnum = z.enum(['round', 'square', 'rect', 'circular'])

// Table type enum
export const tableTypeEnum = z.enum(['regular', 'vip', 'family', 'kids', 'singles'])

// Element type enum (for decorative elements)
export const elementTypeEnum = z.enum([
  'cakeTable',
  'danceFloor',
  'restroom',
  'buffet',
  'dj',
  'entrance',
  'exit',
  'bar',
  'photoArea',
])

// Seat schema
export const seatSchema = z.object({
  id: z.string(),
  index: z.number().int().min(0),
  x: z.number(),
  y: z.number(),
  rotation: z.number().default(0),
  assignment: z
    .object({
      id: z.string(),
      guest: z.object({
        id: z.string(),
        contact: z.object({
          fullName: z.string(),
          isVip: z.boolean(),
          gender: z.enum(['male', 'female', 'other']).optional(),
          ageGroup: z.enum(['adult', 'child', 'baby']).default('adult'),
        }),
        children: z.number().int().min(0),
      }),
    })
    .nullable(),
})

// Table schema (full)
export const tableSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  label: z.string(),
  capacity: z.number().int().positive(),
  shape: tableShapeEnum,
  tableType: tableTypeEnum.default('regular'),
  x: z.number(),
  y: z.number(),
  radius: z.number().positive(),
  color: z.string().optional(),
  seats: z.array(seatSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

// Unassigned guest schema
export const unassignedGuestSchema = z.object({
  id: z.string(),
  contact: z.object({
    id: z.string(),
    fullName: z.string(),
    isVip: z.boolean(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    ageGroup: z.enum(['adult', 'child', 'baby']).default('adult'),
  }),
  household: z
    .object({
      id: z.string(),
      label: z.string(),
    })
    .nullable(),
  children: z.number().int().min(0),
  seats: z.number().int().positive(),
})

// Decorative element schema
export const decorElementSchema = z.object({
  id: z.string(),
  type: elementTypeEnum,
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().default(0),
  locked: z.boolean().default(false),
  zIndex: z.number().int().default(0),
})

// Table planner data (full response)
export const tablePlannerDataSchema = z.object({
  tables: z.array(tableSchema),
  unassigned: z.array(unassignedGuestSchema),
  elements: z.array(decorElementSchema).optional().default([]),
})

// Table input schema (create)
export const tableInputSchema = z.object({
  label: z.string().min(1, 'Label é obrigatório'),
  capacity: z.number().int().positive('Capacidade deve ser positiva'),
  zone: z.string().optional(),
  tableType: tableTypeEnum.default('regular'),
  x: z.number().default(0),
  y: z.number().default(0),
  radius: z.number().positive().default(80),
  rotation: z.number().default(0),
  shape: tableShapeEnum.default('circular'),
  color: z.string().optional(),
})

// Table update schema (partial)
export const tableUpdateSchema = z.object({
  label: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  zone: z.string().optional(),
  tableType: tableTypeEnum.optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  radius: z.number().positive().optional(),
  rotation: z.number().optional(),
  shape: tableShapeEnum.optional(),
  color: z.string().optional(),
})

// Seat assignment schema
export const seatAssignmentSchema = z.object({
  guestId: z.string(),
  seatId: z.string(),
  fromSeatId: z.string().optional(),
})

// Bulk position update
export const tableBulkPositionUpdateSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      x: z.number(),
      y: z.number(),
      rotation: z.number().optional(),
    })
  ),
})

// Element create/update schema
export const elementInputSchema = z.object({
  type: elementTypeEnum,
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().positive().default(100),
  height: z.number().positive().default(100),
  rotation: z.number().default(0),
  locked: z.boolean().default(false),
  zIndex: z.number().int().default(0),
})

export const elementUpdateSchema = elementInputSchema.partial()

// Type exports
export type Seat = z.infer<typeof seatSchema>
export type Table = z.infer<typeof tableSchema>
export type UnassignedGuest = z.infer<typeof unassignedGuestSchema>
export type DecorElement = z.infer<typeof decorElementSchema>
export type TablePlannerData = z.infer<typeof tablePlannerDataSchema>
export type TableInput = z.infer<typeof tableInputSchema>
export type TableUpdate = z.infer<typeof tableUpdateSchema>
export type SeatAssignment = z.infer<typeof seatAssignmentSchema>
export type TableBulkPositionUpdate = z.infer<typeof tableBulkPositionUpdateSchema>
export type ElementInput = z.infer<typeof elementInputSchema>
export type ElementUpdate = z.infer<typeof elementUpdateSchema>
export type ElementType = z.infer<typeof elementTypeEnum>
export type TableShape = z.infer<typeof tableShapeEnum>
export type TableType = z.infer<typeof tableTypeEnum>
