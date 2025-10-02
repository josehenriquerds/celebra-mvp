import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { addOfferToGift, getGiftOffers } from '@/server/gifts/offers'
import { GiftScraperError, scrapeProduct } from '@/server/gifts/scraper'
import type { NextRequest } from 'next/server'

const createOfferSchema = z.object({
  url: z.string({ required_error: 'Informe a URL da loja' }).url('URL inválida'),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const gift = await prisma.giftRegistryItem.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        primaryOfferId: true,
        status: true,
      },
    })

    if (!gift) {
      return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
    }

    const offers = await getGiftOffers(params.id)

    return NextResponse.json({ gift, offers })
  } catch (error) {
    console.error('Error fetching gift offers', error)
    return NextResponse.json({ error: 'Erro ao buscar ofertas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { url } = createOfferSchema.parse(body)

    // validates gift exists
    const gift = await prisma.giftRegistryItem.findUnique({
      where: { id: params.id },
      select: { id: true },
    })

    if (!gift) {
      return NextResponse.json({ error: 'Presente não encontrado' }, { status: 404 })
    }

    const scraped = await scrapeProduct(url)
    const offer = await addOfferToGift(params.id, scraped)

    return NextResponse.json(offer, { status: 201 })
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

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Esta oferta já foi cadastrada para algum presente' }, { status: 409 })
    }

    console.error('Error creating gift offer', error)
    return NextResponse.json({ error: 'Erro ao cadastrar oferta' }, { status: 500 })
  }
}
