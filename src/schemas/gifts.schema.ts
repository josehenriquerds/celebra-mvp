import { z } from 'zod'

// Gift status enum
export const giftStatusSchema = z.enum(['disponivel', 'reservado', 'recebido'])

// Gift base schema
export const giftSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().nullable(),
  price: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  imageUrl: z.string().url('URL inválida').nullable(),
  externalUrl: z.string().url('URL inválida').nullable(),
  status: giftStatusSchema,
  guestId: z.string().nullable(),
  guest: z
    .object({
      id: z.string(),
      contact: z.object({
        fullName: z.string(),
      }),
    })
    .nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

// Form schema for create/update
export const giftFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Preço deve ser maior ou igual a zero'),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  externalUrl: z.string().url('URL inválida').optional().or(z.literal('')),
})

// Status update schema
export const giftStatusUpdateSchema = z.object({
  status: giftStatusSchema,
})

// Reserve/unreserve schema
export const giftReserveSchema = z.object({
  guestId: z.string().optional(),
})

// Type exports
export type Gift = z.infer<typeof giftSchema>
export type GiftFormData = z.infer<typeof giftFormSchema>
export type GiftStatus = z.infer<typeof giftStatusSchema>
export type GiftStatusUpdate = z.infer<typeof giftStatusUpdateSchema>
export type GiftReserve = z.infer<typeof giftReserveSchema>
