import { z } from 'zod'

export const eventSchema = z.object({
  name: z.string().min(3, 'Nome do evento deve ter pelo menos 3 caracteres'),
  date: z.date(),
  location: z.string().min(3, 'Local é obrigatório'),
  description: z.string().optional(),
  budgetTotalCents: z.number().min(0, 'Orçamento deve ser positivo'),
  maxGuests: z.number().min(1, 'Número máximo de convidados é obrigatório'),
  type: z.enum(['wedding', 'birthday', 'corporate', 'other']).default('other'),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).default('draft'),
})

export type EventFormData = z.infer<typeof eventSchema>

export const eventUpdateSchema = eventSchema.partial()
