import { NextResponse } from 'next/server'
import { z } from 'zod'
import { GiftScraperError, scrapeProduct } from '@/server/gifts/scraper'
import type { NextRequest } from 'next/server'

const requestSchema = z.object({
  url: z.string({ required_error: 'Informe a URL da loja' }).url('URL inválida'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = requestSchema.parse(body)

    const data = await scrapeProduct(url)

    return NextResponse.json(data)
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

    console.error('Error scraping gift link', error)
    return NextResponse.json({ error: 'Erro ao buscar dados do produto' }, { status: 500 })
  }
}
