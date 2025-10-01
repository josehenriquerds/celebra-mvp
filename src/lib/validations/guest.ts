import { z } from 'zod'

export const guestSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone inválido')
    .optional()
    .or(z.literal('')),
  rsvp: z.enum(['yes', 'no', 'pending']).default('pending'),
  isVip: z.boolean().default(false),
  hasChildren: z.boolean().default(false),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
  relation: z.string().optional(),
  householdId: z.string().optional(),
  tags: z.array(z.string()).default([]),
})

export type GuestFormData = z.infer<typeof guestSchema>

export const bulkGuestImportSchema = z.object({
  guests: z.array(guestSchema),
})

export const guestFilterSchema = z.object({
  rsvp: z.enum(['yes', 'no', 'pending']).optional(),
  isVip: z.boolean().optional(),
  hasChildren: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().optional(),
})

export type GuestFilterData = z.infer<typeof guestFilterSchema>
