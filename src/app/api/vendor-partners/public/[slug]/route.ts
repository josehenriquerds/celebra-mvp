import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/vendor-utils'

/**
 * GET /api/vendor-partners/public/:slug
 * Busca dados públicos do vendor por slug (para página pública)
 */
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const vendor = await prisma.vendorPartner.findUnique({
      where: { slug: params.slug },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          where: {
            // Só incluir reviews aprovadas (se houver campo)
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    })

    if (!vendor) {
      return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 404 })
    }

    // Bloquear se não aprovado
    if (vendor.status !== 'approved') {
      return NextResponse.json({ error: 'Perfil em análise ou não disponível' }, { status: 403 })
    }

    // Calcular média de avaliações
    const avgRating =
      vendor.reviews.length > 0
        ? vendor.reviews.reduce((acc, r) => acc + r.rating, 0) / vendor.reviews.length
        : 0

    // Formatar dados públicos
    const publicData = {
      slug: vendor.slug,
      companyName: vendor.companyName,
      city: `${vendor.city}, ${vendor.state}`,
      categories: vendor.categories,
      priceFrom: formatPrice(vendor.priceFromCents),
      cover: vendor.media.find((m) => m.type === 'cover')?.url || null,
      logo: vendor.media.find((m) => m.type === 'logo')?.url || null,
      gallery: vendor.media
        .filter((m) => m.type === 'gallery')
        .map((m) => ({
          url: m.url,
          alt: m.alt,
          width: m.width,
          height: m.height,
        })),
      about: vendor.descriptionLong || vendor.descriptionShort,
      shortDescription: vendor.descriptionShort,
      whatsappUrl: vendor.whatsappUrl,
      instagram: vendor.instagramHandle ? `https://instagram.com/${vendor.instagramHandle}` : null,
      website: vendor.websiteUrl,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: vendor._count.reviews,
      profileScore: vendor.profileScore,
    }

    return NextResponse.json(publicData)
  } catch (error) {
    console.error('Vendor public get error:', error)
    return NextResponse.json({ error: 'Erro ao buscar parceiro' }, { status: 500 })
  }
}
