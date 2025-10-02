import { z } from 'zod'

// RSVP status enum
export const rsvpStatusSchema = z.enum(['sim', 'nao', 'talvez', 'pendente'])

// Engagement tier enum
export const engagementTierSchema = z.enum(['bronze', 'prata', 'ouro'])

// Invite status enum
export const inviteStatusSchema = z.enum(['pending', 'sent', 'viewed', 'confirmed'])

// Guest base schema (aligned with Prisma model)
export const guestSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  contactId: z.string(),
  householdId: z.string().nullable(),
  inviteStatus: inviteStatusSchema,
  rsvp: rsvpStatusSchema,
  seats: z.number().int().min(0),
  children: z.number().int().min(0),
  transportNeeded: z.boolean(),
  optOut: z.boolean(),
  contact: z.object({
    id: z.string(),
    fullName: z.string(),
    phone: z.string(),
    email: z.string().nullable(),
    relation: z.string(),
    isVip: z.boolean(),
    restrictions: z.any().nullable(),
  }),
  household: z
    .object({
      id: z.string(),
      label: z.string(),
      size: z.number().int(),
    })
    .nullable(),
  seatAssignment: z
    .object({
      id: z.string(),
      seat: z.object({
        id: z.string(),
        index: z.number(),
        table: z.object({
          id: z.string(),
          label: z.string(),
        }),
      }),
    })
    .nullable(),
  engagementScore: z
    .object({
      id: z.string(),
      value: z.number(),
      tier: engagementTierSchema,
      lastDecayAt: z.coerce.date(),
    })
    .nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

// Guest form schema for create/update
export const guestFormSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  relation: z.string().min(1, 'Relação é obrigatória'),
  isVip: z.boolean().default(false),
  seats: z.coerce.number().int().min(0).default(1),
  children: z.coerce.number().int().min(0).default(0),
  transportNeeded: z.boolean().default(false),
  restrictions: z.string().optional(),
  householdId: z.string().optional(),
})

// Guest update schema (partial)
export const guestUpdateSchema = z.object({
  seats: z.coerce.number().int().min(0).optional(),
  children: z.coerce.number().int().min(0).optional(),
  transportNeeded: z.boolean().optional(),
  restrictions: z.string().optional(),
  rsvp: rsvpStatusSchema.optional(),
})

// Guest filter schema
export const guestFilterSchema = z.object({
  search: z.string().optional(),
  rsvp: rsvpStatusSchema.optional(),
  isVip: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  hasTransport: z.boolean().optional(),
  hasSeating: z.boolean().optional(),
  tier: engagementTierSchema.optional(),
  householdId: z.string().optional(),
})

// Guest with timeline
export const guestWithTimelineSchema = guestSchema.extend({
  timeline: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      occurredAt: z.coerce.date(),
    })
  ),
  interactions: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      direction: z.string(),
      channel: z.string(),
      messageSnippet: z.string().nullable(),
      occurredAt: z.coerce.date(),
    })
  ),
  checkins: z.array(
    z.object({
      id: z.string(),
      status: z.string(),
      method: z.string(),
      occurredAt: z.coerce.date(),
    })
  ),
  gifts: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      price: z.number(),
      status: z.string(),
    })
  ),
  consentLogs: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      context: z.string(),
      occurredAt: z.coerce.date(),
    })
  ),
})

// Type exports
export type Guest = z.infer<typeof guestSchema>
export type GuestFormData = z.infer<typeof guestFormSchema>
export type GuestUpdateData = z.infer<typeof guestUpdateSchema>
export type GuestFilterData = z.infer<typeof guestFilterSchema>
export type GuestWithTimeline = z.infer<typeof guestWithTimelineSchema>
export type RsvpStatus = z.infer<typeof rsvpStatusSchema>
export type EngagementTier = z.infer<typeof engagementTierSchema>
export type InviteStatus = z.infer<typeof inviteStatusSchema>
