import { NextRequest, NextResponse } from 'next/server'
import { suggestVendors } from '@/lib/vendor-suggestions'
import { z } from 'zod'

const suggestSchema = z.object({
  eventId: z.string().optional(),
  category: z.string().min(1, 'Categoria obrigatória'),
  eventCity: z.string().optional(),
  eventState: z.string().optional(),
  budgetTotalCents: z.number().int().positive().optional(),
  maxResults: z.number().int().positive().max(20).default(6),
})

/**
 * POST /api/vendor-partners/suggest
 * Sugestão da Céle: retorna vendors recomendados para um evento/categoria
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar
    const validated = suggestSchema.parse(body)

    // Buscar sugestões
    const suggestions = await suggestVendors(validated)

    return NextResponse.json({
      suggestions,
      count: suggestions.length,
    })
  } catch (error) {
    console.error('Vendor suggest error:', error)

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Dados inválidos', details: error }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro ao buscar sugestões' }, { status: 500 })
  }
}

/**
 * GET /api/vendor-partners/suggest?category=Buffet&eventCity=Vitoria&eventState=ES&budgetTotalCents=5000000
 * Versão GET para facilitar uso
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const params = suggestSchema.parse({
      eventId: searchParams.get('eventId') || undefined,
      category: searchParams.get('category') || '',
      eventCity: searchParams.get('eventCity') || undefined,
      eventState: searchParams.get('eventState') || undefined,
      budgetTotalCents: searchParams.get('budgetTotalCents')
        ? parseInt(searchParams.get('budgetTotalCents')!)
        : undefined,
      maxResults: searchParams.get('maxResults') ? parseInt(searchParams.get('maxResults')!) : 6,
    })

    const suggestions = await suggestVendors(params)

    return NextResponse.json({
      suggestions,
      count: suggestions.length,
    })
  } catch (error) {
    console.error('Vendor suggest error:', error)

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Parâmetros inválidos', details: error }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro ao buscar sugestões' }, { status: 500 })
  }
}
