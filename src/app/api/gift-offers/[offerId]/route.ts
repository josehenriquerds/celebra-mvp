import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { GiftScraperError } from '@/server/gifts/scraper'
import { removeOffer } from '@/server/gifts/offers'

export async function DELETE(request: NextRequest, { params }: { params: { offerId: string } }) {
  try {
    await removeOffer(params.offerId)
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof GiftScraperError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    console.error('Error deleting gift offer', error)
    return NextResponse.json({ error: 'Erro ao remover oferta' }, { status: 500 })
  }
}
