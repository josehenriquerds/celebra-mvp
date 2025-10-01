import { prisma } from './prisma';
import { isWithinServiceRadius, formatPrice } from './vendor-utils';

export interface VendorSuggestionParams {
  eventId?: string;
  category: string;
  eventCity?: string;
  eventState?: string;
  budgetTotalCents?: number;
  maxResults?: number;
}

export interface VendorSuggestion {
  id: string;
  slug: string;
  companyName: string;
  city: string;
  state: string;
  priceFrom: string;
  priceFromCents: number | null;
  categories: string[];
  score: number;
  coverUrl: string | null;
  logoUrl: string | null;
  whatsappUrl: string | null;
  avgRating: number;
  profileScore: number;
}

/**
 * Algoritmo de sugestão da Céle
 * Score = (matchCategoria * 40) + (matchCidadeRaio * 20) + (matchPreco * 20) + (profileScore/100 * 10) + (notaMedia * 10)
 */
export async function suggestVendors(
  params: VendorSuggestionParams
): Promise<VendorSuggestion[]> {
  const {
    category,
    eventCity,
    eventState,
    budgetTotalCents,
    maxResults = 6,
  } = params;

  // Buscar todos os vendors aprovados da categoria
  const vendors = await prisma.vendorPartner.findMany({
    where: {
      status: 'approved',
      categories: {
        has: category,
      },
    },
    include: {
      media: {
        where: {
          type: {
            in: ['cover', 'logo'],
          },
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

  // Calcular score para cada vendor
  const scoredVendors = vendors.map(vendor => {
    let score = 0;

    // Match categoria: 40 pontos (já garantido pelo filtro, mas verificar múltiplas categorias)
    const categoryMatch = vendor.categories.includes(category) ? 1 : 0;
    score += categoryMatch * 40;

    // Match cidade/raio: 20 pontos
    let locationMatch = 0;
    if (eventCity && eventState) {
      if (isWithinServiceRadius(vendor.city, eventCity, vendor.serviceRadiusKm)) {
        locationMatch = 1;
      } else if (vendor.state === eventState) {
        // Mesmo estado, mas cidade diferente: 50% dos pontos
        locationMatch = 0.5;
      }
    }
    score += locationMatch * 20;

    // Match preço: 20 pontos
    let priceMatch = 0;
    if (budgetTotalCents && vendor.priceFromCents) {
      // Heurística simples: se preço inicial <= orçamento total, é um match
      // (em produção, seria orçamento/número_de_itens_da_categoria)
      if (vendor.priceFromCents <= budgetTotalCents) {
        priceMatch = 1;
      } else if (vendor.priceFromCents <= budgetTotalCents * 1.2) {
        // Até 20% acima: 50% dos pontos
        priceMatch = 0.5;
      }
    } else {
      // Se não tem preço ou orçamento, considera neutro (50%)
      priceMatch = 0.5;
    }
    score += priceMatch * 20;

    // Profile score: 10 pontos
    score += (vendor.profileScore / 100) * 10;

    // Nota média: 10 pontos
    const avgRating = vendor.reviews.length > 0
      ? vendor.reviews.reduce((acc, r) => acc + r.rating, 0) / vendor.reviews.length
      : 0;
    score += (avgRating / 5) * 10;

    // Extrair URLs de mídia
    const coverUrl = vendor.media.find(m => m.type === 'cover')?.url || null;
    const logoUrl = vendor.media.find(m => m.type === 'logo')?.url || null;

    return {
      id: vendor.id,
      slug: vendor.slug,
      companyName: vendor.companyName,
      city: vendor.city,
      state: vendor.state,
      priceFrom: formatPrice(vendor.priceFromCents),
      priceFromCents: vendor.priceFromCents,
      categories: vendor.categories,
      score: Math.round(score * 100) / 100,
      coverUrl,
      logoUrl,
      whatsappUrl: vendor.whatsappUrl,
      avgRating: Math.round(avgRating * 10) / 10,
      profileScore: vendor.profileScore,
    };
  });

  // Ordenar por score e retornar top N
  return scoredVendors
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}