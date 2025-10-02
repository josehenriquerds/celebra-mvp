import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { GiftScraperError } from '@/server/gifts/scraper'
import type { NextRequest } from 'next/server'

const STATUS_VALUES = ['disponivel', 'reservado', 'comprado', 'recebido'] as const

const giftUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nonnegative().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  link: z.string().url().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  currency: z.string().optional(),
  status: z.enum(STATUS_VALUES).optional(),
  buyerContactId: z.string().nullable().optional(),
  category: z.string().optional(),
  targetQuantity: z.number().int().positive().optional(),
  allowContributions: z.boolean().optional(),
  contributionGoalCents: z.number().int().nonnegative().nullable().optional(),
  primaryOfferId: z.string().nullable().optional(),
})

type GiftUpdateInput = z.infer<typeof giftUpdateSchema>

function resolvePriceCents(data: GiftUpdateInput) {
  if (data.priceCents !== undefined) return data.priceCents
  if (data.price !== undefined) return Math.round(data.price * 100)
  return undefined
}

async function updatePrimaryOffer(
  tx: Prisma.TransactionClient,
  giftId: string,
  primaryOfferId: string | null
) {
  if (primaryOfferId === null) {
    await tx.giftOffer.updateMany({ where: { giftId }, data: { isPrimary: false } })
    await tx.giftRegistryItem.update({
      where: { id: giftId },
      data: {
        primaryOfferId: null,
        price: null,
      },
    })
    return
  }

  const offer = await tx.giftOffer.findUnique({
    where: { id: primaryOfferId },
    select: { id: true, giftId: true, priceCents: true, currency: true },
  })

  if (!offer || offer.giftId !== giftId) {
    throw new GiftScraperError('Oferta não pertence a este presente', 400)
  }

  await tx.giftOffer.updateMany({ where: { giftId }, data: { isPrimary: false } })
  await tx.giftOffer.update({ where: { id: primaryOfferId }, data: { isPrimary: true } })

  await tx.giftRegistryItem.update({
    where: { id: giftId },
    data: {
      primaryOfferId,
      price: offer.priceCents !== null ? offer.priceCents / 100 : null,
      currency: offer.currency ?? 'BRL',
    },
  })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const payload = giftUpdateSchema.parse(body)

    const priceCents = resolvePriceCents(payload)

    const updateData: Prisma.GiftRegistryItemUpdateInput = {}

    if (payload.title !== undefined) updateData.title = payload.title
    if (payload.description !== undefined) updateData.description = payload.description
    if (payload.link !== undefined) updateData.link = payload.link
    if (payload.imageUrl !== undefined) updateData.imageUrl = payload.imageUrl
    if (payload.currency !== undefined) updateData.currency = payload.currency
    if (payload.status !== undefined) updateData.status = payload.status
    if (payload.buyerContactId !== undefined) updateData.buyerContactId = payload.buyerContactId
    if (payload.category !== undefined) updateData.category = payload.category
    if (payload.targetQuantity !== undefined) updateData.targetQuantity = payload.targetQuantity
    if (payload.allowContributions !== undefined) updateData.allowContributions = payload.allowContributions
    if (payload.contributionGoalCents !== undefined)
      updateData.contributionGoalCents = payload.contributionGoalCents

    if (priceCents !== undefined) {
      updateData.price = priceCents / 100
    } else if (payload.price === null) {
      updateData.price = null
    }

    const updatedGift = await prisma.$transaction(async (tx) => {
      const gift = await tx.giftRegistryItem.update({
        where: { id: params.id },
        data: updateData,
      })

      if (payload.primaryOfferId !== undefined) {
        await updatePrimaryOffer(tx, gift.id, payload.primaryOfferId)
        return tx.giftRegistryItem.findUnique({
          where: { id: gift.id },
        })
      }

      return gift
    })

    // If marking as purchased, trigger thank you workflow
    if (payload.status === 'comprado' && updatedGift?.buyerContactId) {
      const n8nUrl = process.env.N8N_URL
      if (n8nUrl) {
        try {
          await fetch(`${n8nUrl}/webhook/gift-received`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ giftId: updatedGift.id }),
          })
        } catch (n8nError) {
          console.error('Error calling n8n webhook:', n8nError)
        }
      }
    }

    return NextResponse.json(updatedGift)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.flatten(),
        },
        { status: 422 }
      )
    }

    if (error instanceof GiftScraperError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
    }

    console.error('Error updating gift:', error)
    return NextResponse.json({ error: 'Failed to update gift' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.giftRegistryItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
    }

    console.error('Error deleting gift:', error)
    return NextResponse.json({ error: 'Failed to delete gift' }, { status: 500 })
  }
}
