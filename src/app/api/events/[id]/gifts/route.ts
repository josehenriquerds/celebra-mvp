import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import {
  createGiftWithPrimaryOffer,
  type GiftCreationOverrides,
} from '@/server/gifts/offers'
import {
  GiftScraperError,
  resolveStoreFromUrl,
  scrapeProduct,
  type ScrapedProduct,
} from '@/server/gifts/scraper'
import {
  giftWithRelationsInclude,
  serializeGift,
  type GiftWithRelations,
} from '@/server/gifts/serializer'
import type { NextRequest } from 'next/server'

const STATUS_VALUES = ['disponivel', 'reservado', 'comprado', 'recebido'] as const

const giftCreateSchema = z.object({
  title: z.string({ required_error: 'Titulo eh obrigatorio' }).min(1, 'Titulo eh obrigatorio'),
  description: z.string().optional(),
  link: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().nonnegative().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  currency: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  targetQuantity: z.number().int().positive().optional(),
  allowContributions: z.boolean().optional(),
  contributionGoalCents: z.number().int().nonnegative().optional(),
  autoImportUrl: z.string().url().optional(),
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

type GiftCreateInput = z.infer<typeof giftCreateSchema>

function centsFromInput(input: GiftCreateInput) {
  if (input.priceCents !== undefined) return input.priceCents
  if (input.price !== undefined) {
    return Math.round(input.price * 100)
  }
  return undefined
}

function buildScrapedProductFromPayload(payload: GiftCreateInput): ScrapedProduct {
  if (!payload.primaryOffer) {
    throw new Error('primaryOffer eh obrigatorio para gerar dados do produto')
  }

  const { primaryOffer } = payload
  const storeInfo = resolveStoreFromUrl(primaryOffer.url)

  const priceCents = primaryOffer.priceCents ?? centsFromInput(payload)
  const currency = primaryOffer.currency ?? payload.currency ?? 'BRL'
  const imageUrl = primaryOffer.imageUrl ?? payload.imageUrl
  const imageOptions = imageUrl ? [imageUrl] : []

  return {
    title: payload.title,
    description: payload.description,
    priceCents,
    currency,
    imageUrl,
    imageOptions,
    store: primaryOffer.store ?? storeInfo.store,
    domain: primaryOffer.domain ?? storeInfo.domain,
    canonicalUrl: primaryOffer.canonicalUrl ?? primaryOffer.url,
    url: primaryOffer.url,
  }
}

function buildGiftOverrides(payload: GiftCreateInput): GiftCreationOverrides {
  return {
    title: payload.title,
    description: payload.description,
    imageUrl: payload.imageUrl,
    category: payload.category,
    targetQuantity: payload.targetQuantity,
    allowContributions: payload.allowContributions,
    contributionGoalCents: payload.contributionGoalCents,
  }
}

async function fetchGiftWithRelations(id: string) {
  return prisma.giftRegistryItem.findUnique({
    where: { id },
    include: giftWithRelationsInclude,
  })
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gifts = await prisma.giftRegistryItem.findMany({
      where: { eventId: params.id },
      include: giftWithRelationsInclude,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(gifts.map((gift) => serializeGift(gift as GiftWithRelations)))
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json({ error: 'Failed to fetch gifts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const payload = giftCreateSchema.parse(body)

    if (payload.primaryOffer || payload.autoImportUrl) {
      let scraped: ScrapedProduct

      if (payload.primaryOffer) {
        scraped = buildScrapedProductFromPayload(payload)
      } else if (payload.autoImportUrl) {
        scraped = await scrapeProduct(payload.autoImportUrl)
      } else {
        throw new GiftScraperError('Dados insuficientes para criar o presente', 400)
      }

      const overrides = buildGiftOverrides(payload)
      const { gift, offer } = await createGiftWithPrimaryOffer(params.id, scraped, overrides)
      const enrichedGift = await fetchGiftWithRelations(gift.id)

      return NextResponse.json(
        {
          gift: enrichedGift
            ? serializeGift(enrichedGift as GiftWithRelations)
            : serializeGift(gift as unknown as GiftWithRelations),
          offer,
        },
        { status: 201 }
      )
    }

    const priceCents = centsFromInput(payload)

    const gift = await prisma.giftRegistryItem.create({
      data: {
        eventId: params.id,
        title: payload.title,
        description: payload.description,
        link: payload.link,
        imageUrl: payload.imageUrl,
        price: priceCents !== undefined ? priceCents / 100 : payload.price ?? null,
        currency: payload.currency ?? 'BRL',
        category: payload.category,
        status: payload.status ?? 'disponivel',
        targetQuantity: payload.targetQuantity ?? undefined,
        allowContributions: payload.allowContributions ?? false,
        contributionGoalCents: payload.contributionGoalCents ?? undefined,
      },
    })

    const enrichedGift = await fetchGiftWithRelations(gift.id)

    return NextResponse.json(
      enrichedGift
        ? serializeGift(enrichedGift as GiftWithRelations)
        : serializeGift(gift as unknown as GiftWithRelations),
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados invalidos',
          details: error.flatten(),
        },
        { status: 422 }
      )
    }

    if (error instanceof GiftScraperError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code == 'P2002') {
      return NextResponse.json({ error: 'Ja existe um presente com esses dados' }, { status: 409 })
    }

    console.error('Error creating gift:', error)
    return NextResponse.json({ error: 'Failed to create gift' }, { status: 500 })
  }
}