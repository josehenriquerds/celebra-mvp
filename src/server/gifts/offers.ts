import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { GiftScraperError, scrapeProduct, type ScrapedProduct } from './scraper'

const DEFAULT_CURRENCY = 'BRL'

export interface GiftCreationOverrides {
  title?: string
  description?: string
  imageUrl?: string
  category?: string
  targetQuantity?: number
  allowContributions?: boolean
  contributionGoalCents?: number
}

function centsToFloat(cents?: number | null) {
  if (cents === undefined || cents === null) return null
  return Math.round(cents) / 100
}

async function createPriceHistoryEntry(
  tx: Prisma.TransactionClient,
  offerId: string,
  priceCents?: number | null
) {
  if (priceCents === undefined || priceCents === null) return
  await tx.giftOfferPriceHistory.create({
    data: {
      offerId,
      priceCents,
    },
  })
}

async function updateGiftBestOffer(tx: Prisma.TransactionClient, giftId: string) {
  const offers = await tx.giftOffer.findMany({
    where: { giftId },
    orderBy: [
      { priceCents: 'asc' },
      { createdAt: 'asc' },
    ],
  })

  if (offers.length === 0) {
    await tx.giftRegistryItem.update({
      where: { id: giftId },
      data: {
        primaryOfferId: null,
        price: null,
      },
    })
    return
  }

  const best = offers.find((offer) => offer.priceCents !== null) ?? offers[0]

  await tx.giftOffer.updateMany({
    where: { giftId },
    data: { isPrimary: false },
  })

  await tx.giftOffer.update({
    where: { id: best.id },
    data: { isPrimary: true },
  })

  await tx.giftRegistryItem.update({
    where: { id: giftId },
    data: {
      primaryOfferId: best.id,
      price: centsToFloat(best.priceCents),
      currency: best.currency ?? DEFAULT_CURRENCY,
    },
  })
}

function prepareGiftData(
  eventId: string,
  scraped: ScrapedProduct,
  overrides?: GiftCreationOverrides
) {
  return {
    eventId,
    title: overrides?.title ?? scraped.title,
    description: overrides?.description ?? scraped.description,
    link: scraped.canonicalUrl,
    imageUrl: overrides?.imageUrl ?? scraped.imageUrl,
    price: centsToFloat(scraped.priceCents),
    currency: scraped.currency ?? DEFAULT_CURRENCY,
    category: overrides?.category,
    targetQuantity: overrides?.targetQuantity,
    allowContributions: overrides?.allowContributions,
    contributionGoalCents: overrides?.contributionGoalCents,
  }
}

function prepareOfferData(giftId: string, scraped: ScrapedProduct, isPrimary = false) {
  return {
    giftId,
    store: scraped.store,
    domain: scraped.domain,
    title: scraped.title,
    url: scraped.canonicalUrl || scraped.url,
    canonicalUrl: scraped.canonicalUrl,
    imageUrl: scraped.imageUrl,
    priceCents: scraped.priceCents ?? null,
    currency: scraped.currency ?? DEFAULT_CURRENCY,
    isPrimary,
    lastCheckedAt: new Date(),
  }
}

export async function createGiftWithPrimaryOffer(
  eventId: string,
  scraped: ScrapedProduct,
  overrides?: GiftCreationOverrides
) {
  return prisma.$transaction(async (tx) => {
    const gift = await tx.giftRegistryItem.create({
      data: prepareGiftData(eventId, scraped, overrides),
    })

    const offer = await tx.giftOffer.create({
      data: prepareOfferData(gift.id, scraped, true),
    })

    await createPriceHistoryEntry(tx, offer.id, scraped.priceCents ?? null)

    await tx.giftRegistryItem.update({
      where: { id: gift.id },
      data: {
        primaryOfferId: offer.id,
        price: centsToFloat(scraped.priceCents),
        currency: scraped.currency ?? DEFAULT_CURRENCY,
      },
    })

    return { gift, offer }
  })
}

export async function addOfferToGift(giftId: string, scraped: ScrapedProduct) {
  return prisma.$transaction(async (tx) => {
    const offer = await tx.giftOffer.create({
      data: prepareOfferData(giftId, scraped, false),
    })

    await createPriceHistoryEntry(tx, offer.id, scraped.priceCents ?? null)

    await updateGiftBestOffer(tx, giftId)

    return offer
  })
}

export async function refreshOfferFromSource(offerId: string) {
  const offer = await prisma.giftOffer.findUnique({ where: { id: offerId } })
  if (!offer) {
    throw new GiftScraperError('Oferta não encontrada', 404)
  }

  const scraped = await scrapeProduct(offer.url)

  return prisma.$transaction(async (tx) => {
    const updatedOffer = await tx.giftOffer.update({
      where: { id: offerId },
      data: {
        title: scraped.title,
        imageUrl: scraped.imageUrl,
        priceCents: scraped.priceCents ?? null,
        currency: scraped.currency ?? DEFAULT_CURRENCY,
        canonicalUrl: scraped.canonicalUrl,
        store: scraped.store,
        domain: scraped.domain,
        lastCheckedAt: new Date(),
      },
    })

    await createPriceHistoryEntry(tx, offerId, scraped.priceCents ?? null)

    await updateGiftBestOffer(tx, offer.giftId)

    return updatedOffer
  })
}

export async function removeOffer(offerId: string) {
  return prisma.$transaction(async (tx) => {
    const offer = await tx.giftOffer.delete({
      where: { id: offerId },
    })

    await updateGiftBestOffer(tx, offer.giftId)

    return offer
  })
}

export async function getGiftOffers(giftId: string) {
  const [offers, clicks] = await Promise.all([
    prisma.giftOffer.findMany({
      where: { giftId },
      orderBy: [
        { isPrimary: 'desc' },
        { priceCents: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        priceHistory: {
          orderBy: { checkedAt: 'desc' },
          take: 30,
        },
      },
    }),
    prisma.giftOfferClick.groupBy({
      by: ['offerId'],
      where: {
        giftId,
        clickedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
      _count: { _all: true },
    }),
  ])

  const clickMap = new Map<string, number>()
  for (const entry of clicks) {
    clickMap.set(entry.offerId, entry._count._all)
  }

  return offers.map((offer) => ({
    ...offer,
    clicksLast30Days: clickMap.get(offer.id) ?? 0,
  }))
}

export async function recordOfferClick(params: {
  giftId: string
  offerId: string
  ip?: string | null
  userAgent?: string | null
}) {
  const { giftId, offerId, ip, userAgent } = params

  const offer = await prisma.giftOffer.findUnique({
    where: { id: offerId },
    select: { giftId: true, canonicalUrl: true, url: true },
  })

  if (!offer || offer.giftId !== giftId) {
    throw new GiftScraperError('Oferta inválida para este presente', 404)
  }

  await prisma.giftOfferClick.create({
    data: {
      giftId,
      offerId,
      ip: ip ?? undefined,
      userAgent: userAgent ?? undefined,
    },
  })

  return offer.canonicalUrl || offer.url
}

export interface ImportGiftResult {
  url: string
  success: boolean
  giftId?: string
  offerId?: string
  title?: string
  error?: string
}

export async function importGiftLinks(
  eventId: string,
  urls: string[],
  overrides?: GiftCreationOverrides
) {
  const results: ImportGiftResult[] = []

  for (const url of urls) {
    try {
      const scraped = await scrapeProduct(url)
      const { gift, offer } = await createGiftWithPrimaryOffer(eventId, scraped, overrides)
      results.push({
        url,
        success: true,
        giftId: gift.id,
        offerId: offer.id,
        title: gift.title,
      })
    } catch (error) {
      if (error instanceof GiftScraperError) {
        results.push({ url, success: false, error: error.message })
      } else {
        results.push({ url, success: false, error: 'Erro desconhecido ao importar link' })
      }
    }
  }

  return results
}
