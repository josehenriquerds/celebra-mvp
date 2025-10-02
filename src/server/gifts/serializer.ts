import type { Prisma } from '@prisma/client'

export const giftWithRelationsInclude = {
  offers: {
    orderBy: [
      { isPrimary: 'desc' as const },
      { priceCents: 'asc' as const },
      { createdAt: 'asc' as const },
    ],
  },
  contributions: {
    select: { amountCents: true },
  },
  purchases: {
    select: { amountPaidCents: true, quantity: true },
  },
  reservations: {
    select: { id: true },
  },
} satisfies Prisma.GiftRegistryItemInclude

export type GiftWithRelations = Prisma.GiftRegistryItemGetPayload<{
  include: typeof giftWithRelationsInclude
}>

export function serializeGift(gift: GiftWithRelations) {
  const offers = gift.offers
  const primaryOffer = offers.find((offer) => offer.isPrimary)
  const bestOffer =
    primaryOffer ??
    offers
      .filter((offer) => offer.priceCents !== null)
      .sort((a, b) => {
        if (a.priceCents === null) return 1
        if (b.priceCents === null) return -1
        return a.priceCents - b.priceCents
      })[0]

  const contributionsTotalCents = gift.contributions.reduce((sum, item) => sum + item.amountCents, 0)
  const purchasesTotalCents = gift.purchases.reduce((sum, purchase) => {
    if (purchase.amountPaidCents !== null) return sum + purchase.amountPaidCents
    if (bestOffer?.priceCents) {
      return sum + bestOffer.priceCents * purchase.quantity
    }
    return sum
  }, 0)

  return {
    id: gift.id,
    eventId: gift.eventId,
    title: gift.title,
    description: gift.description,
    imageUrl: gift.imageUrl,
    status: gift.status,
    link: gift.link,
    price: gift.price,
    priceCents: bestOffer?.priceCents ?? (gift.price ? Math.round(gift.price * 100) : null),
    currency: gift.currency,
    category: gift.category,
    targetQuantity: gift.targetQuantity,
    purchasedQuantity: gift.purchasedQuantity,
    reservedQuantity: gift.reservedQuantity,
    allowContributions: gift.allowContributions,
    contributionGoalCents: gift.contributionGoalCents,
    contributionRaisedCents: gift.contributionRaisedCents,
    contributionsTotalCents,
    contributionsCount: gift.contributions.length,
    purchasesCount: gift.purchases.length,
    purchasesTotalCents,
    reservationsCount: gift.reservations.length,
    primaryOfferId: gift.primaryOfferId,
    bestOffer,
    offers,
    offersCount: offers.length,
    createdAt: gift.createdAt,
    updatedAt: gift.updatedAt,
  }
}
