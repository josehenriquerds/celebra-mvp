import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vendorListSchema } from '@/lib/validations/vendor'

export const dynamic = 'force-dynamic'

/**
 * GET /api/vendors
 * Listagem de vendors com filtros (CRM)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parse e validar query params
    const query = vendorListSchema.parse({
      status: searchParams.get('status') || undefined,
      q: searchParams.get('q') || undefined,
      city: searchParams.get('city') || undefined,
      state: searchParams.get('state') || undefined,
      category: searchParams.get('category') || undefined,
      priceFromMin: searchParams.get('priceFromMin')
        ? parseInt(searchParams.get('priceFromMin')!)
        : undefined,
      priceFromMax: searchParams.get('priceFromMax')
        ? parseInt(searchParams.get('priceFromMax')!)
        : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    })

    // Construir filtros
    const where: any = {}

    if (query.status) {
      where.status = query.status
    }

    if (query.q) {
      where.OR = [
        { companyName: { contains: query.q, mode: 'insensitive' } },
        { contactName: { contains: query.q, mode: 'insensitive' } },
        { email: { contains: query.q, mode: 'insensitive' } },
      ]
    }

    if (query.city) {
      where.city = { contains: query.city, mode: 'insensitive' }
    }

    if (query.state) {
      where.state = query.state.toUpperCase()
    }

    if (query.category) {
      where.categories = { has: query.category }
    }

    if (query.priceFromMin !== undefined || query.priceFromMax !== undefined) {
      where.priceFromCents = {}
      if (query.priceFromMin !== undefined) {
        where.priceFromCents.gte = query.priceFromMin
      }
      if (query.priceFromMax !== undefined) {
        where.priceFromCents.lte = query.priceFromMax
      }
    }

    // Contar total
    const total = await prisma.vendorPartner.count({ where })

    // Buscar vendors
    const vendors = await prisma.vendorPartner.findMany({
      where,
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        _count: {
          select: {
            reviews: true,
            notes: true,
          },
        },
      },
      orderBy: [{ profileScore: 'desc' }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    })

    return NextResponse.json({
      vendors,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    })
  } catch (error) {
    console.error('Vendors list error:', error)

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json({ error: 'Parâmetros inválidos', details: error }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro ao buscar vendors' }, { status: 500 })
  }
}
