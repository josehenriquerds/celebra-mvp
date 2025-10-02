import { z } from 'zod'

export const giftStatusSchema = z.enum(['disponivel', 'reservado', 'comprado', 'recebido'])

export const giftOfferPriceHistorySchema = z.object({
  id: z.string(),
  offerId: z.string(),
  priceCents: z.number(),
  checkedAt: z.coerce.date(),
})

export const giftOfferSchema = z.object({
  id: z.string(),
  giftId: z.string(),
  store: z.string(),
  domain: z.string(),
  title: z.string().nullable().optional(),
  url: z.string().url(),
  canonicalUrl: z.string().url().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  priceCents: z.number().nullable().optional(),
  currency: z.string(),
  isPrimary: z.boolean(),
  lastCheckedAt: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  priceHistory: z.array(giftOfferPriceHistorySchema).optional(),
  clicksLast30Days: z.number().optional(),
})

export const giftContributionSchema = z.object({
  id: z.string(),
  giftId: z.string(),
  guestId: z.string().nullable(),
  amountCents: z.number(),
  contributedAt: z.coerce.date(),
  notes: z.string().nullable().optional(),
})

export const giftPurchaseSchema = z.object({
  id: z.string(),
  giftId: z.string(),
  guestId: z.string().nullable(),
  purchasedAt: z.coerce.date(),
  quantity: z.number().int().nonnegative(),
  amountPaidCents: z.number().nullable(),
  receiptUrl: z.string().url().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const giftReservationSchema = z.object({
  id: z.string(),
  giftId: z.string(),
  guestId: z.string(),
  reservedUntil: z.coerce.date().nullable(),
  notes: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
})

export const giftSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  status: giftStatusSchema,
  link: z.string().url().nullable().optional(),
  price: z.number().nullable().optional(),
  priceCents: z.number().nullable().optional(),
  currency: z.string(),
  category: z.string().nullable().optional(),
  targetQuantity: z.number().nullable().optional(),
  purchasedQuantity: z.number().nullable().optional(),
  reservedQuantity: z.number().nullable().optional(),
  allowContributions: z.boolean().optional(),
  contributionGoalCents: z.number().nullable().optional(),
  contributionRaisedCents: z.number().optional(),
  contributionsTotalCents: z.number().optional(),
  contributionsCount: z.number().optional(),
  purchasesCount: z.number().optional(),
  purchasesTotalCents: z.number().optional(),
  reservationsCount: z.number().optional(),
  primaryOfferId: z.string().nullable().optional(),
  bestOffer: giftOfferSchema.nullable().optional(),
  offers: z.array(giftOfferSchema).optional(),
  offersCount: z.number().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const giftFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional(),
  link: z.string().url().optional(),
  currency: z.string().optional(),
  category: z.string().optional(),
  targetQuantity: z.coerce.number().int().min(1).optional(),
  allowContributions: z.boolean().optional(),
  contributionGoalCents: z.number().int().nonnegative().optional(),
  primaryOffer: z
    .object({
      url: z.string().url(),
      canonicalUrl: z.string().url().optional(),
      store: z.string().optional(),
      domain: z.string().optional(),
      imageUrl: z.string().url().optional(),
      priceCents: z.number().int().nonnegative().optional(),
      currency: z.string().optional(),
    })
    .optional(),
})

export const giftStatusUpdateSchema = z.object({
  status: giftStatusSchema,
})

export type Gift = z.infer<typeof giftSchema>
export type GiftFormData = z.infer<typeof giftFormSchema>
export type GiftStatus = z.infer<typeof giftStatusSchema>
export type GiftOffer = z.infer<typeof giftOfferSchema>
export type GiftOfferPriceHistory = z.infer<typeof giftOfferPriceHistorySchema>
export type GiftContribution = z.infer<typeof giftContributionSchema>
export type GiftPurchase = z.infer<typeof giftPurchaseSchema>
export type GiftReservation = z.infer<typeof giftReservationSchema>
