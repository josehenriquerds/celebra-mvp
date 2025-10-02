import { NextResponse } from 'next/server'
import { recordOfferClick } from '@/server/gifts/offers'
import { GiftScraperError } from '@/server/gifts/scraper'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { giftId: string; offerId: string } }) {
  try {
    const ipHeader = request.headers.get('x-forwarded-for') ?? undefined
    const ip = ipHeader ? ipHeader.split(',')[0]?.trim() : undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    const redirectUrl = await recordOfferClick({
      giftId: params.giftId,
      offerId: params.offerId,
      ip,
      userAgent,
    })

    if (!redirectUrl) {
      return NextResponse.json({ error: 'URL do produto não disponível' }, { status: 404 })
    }

    return NextResponse.redirect(redirectUrl, 302)
  } catch (error) {
    if (error instanceof GiftScraperError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Error handling gift offer redirect', error)
    return NextResponse.json({ error: 'Não foi possível redirecionar para a oferta' }, { status: 500 })
  }
}
