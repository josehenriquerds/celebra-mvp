import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { GiftScraperError } from '@/server/gifts/scraper'
import { refreshOfferFromSource } from '@/server/gifts/offers'

export async function POST(request: NextRequest, { params }: { params: { offerId: string } }) {
  try {
    const offer = await refreshOfferFromSource(params.offerId)
    return NextResponse.json(offer)
  } catch (error) {
    if (error instanceof GiftScraperError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Error refreshing gift offer', error)
    return NextResponse.json({ error: 'Erro ao atualizar oferta' }, { status: 500 })
  }
}
