import { z } from 'zod'

const phoneMessage = 'Informe um telefone válido'
const emailMessage = 'Informe um e-mail válido'

export const phoneInputSchema = z.object({
  phone: z.string().min(6, phoneMessage),
})

export const emailSchema = z.string().email(emailMessage)

export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter ao menos 8 caracteres')
  .regex(/[A-Z]/, 'Inclua pelo menos uma letra maiúscula')
  .regex(/\d/, 'Inclua pelo menos um número')

export const setPasswordSchema = phoneInputSchema.extend({
  password: passwordSchema,
})

export const baseLoginSchema = z.object({
  password: z.string().min(1, 'Informe a senha'),
})

export const loginWithPhoneSchema = phoneInputSchema.merge(baseLoginSchema)

export const loginWithEmailSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe a senha'),
})

export const loginSchema = z.union([loginWithPhoneSchema, loginWithEmailSchema])

export const signupSchema = z.object({
  name: z.string().min(2, 'Informe seu nome completo'),
  phone: phoneInputSchema.shape.phone,
  email: emailSchema,
  password: passwordSchema,
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Você precisa aceitar os termos para continuar' }),
  }),
})

export const signupFormSchema = signupSchema
  .extend({
    confirmPassword: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export const selectEventSchema = z.object({
  eventId: z.string().min(1, 'Selecione um evento'),
})
