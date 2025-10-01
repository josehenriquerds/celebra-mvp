import slugify from 'slugify'
import { prisma } from './prisma'

/**
 * Gera slug único para vendor baseado em nome da empresa e cidade
 */
export async function generateUniqueSlug(companyName: string, city: string): Promise<string> {
  const baseSlug = slugify(`${companyName} ${city}`, {
    lower: true,
    strict: true,
    locale: 'pt',
  })

  // Verificar se slug já existe
  let slug = baseSlug
  let counter = 1

  while (await slugExists(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

async function slugExists(slug: string): Promise<boolean> {
  const existing = await prisma.vendorPartner.findUnique({
    where: { slug },
  })
  return !!existing
}

/**
 * Normaliza handle do Instagram (@handle ou https://instagram.com/handle)
 */
export function normalizeInstagramHandle(input: string | undefined): string | undefined {
  if (!input) return undefined

  // Remove @ se existir
  let handle = input.trim().replace(/^@/, '')

  // Se for URL, extrai o handle
  const urlMatch = handle.match(/(?:instagram\.com|instagr\.am)\/([a-zA-Z0-9._]+)/i)
  if (urlMatch) {
    handle = urlMatch[1]
  }

  return handle.length > 0 ? handle : undefined
}

/**
 * Gera URL do WhatsApp a partir do telefone E.164
 */
export function generateWhatsAppUrl(phoneE164: string): string {
  // Remove + do início
  const phone = phoneE164.replace(/^\+/, '')
  return `https://wa.me/${phone}`
}

/**
 * Calcula score do perfil do vendor (0-100)
 */
export function calculateProfileScore(vendor: {
  media?: Array<{ type: string }>
  descriptionShort?: string | null
  descriptionLong?: string | null
  instagramHandle?: string | null
  websiteUrl?: string | null
  phoneE164: string
  email: string
}): number {
  let score = 0

  // Logo: 20 pontos
  if (vendor.media?.some((m) => m.type === 'logo')) {
    score += 20
  }

  // Capa: 20 pontos
  if (vendor.media?.some((m) => m.type === 'cover')) {
    score += 20
  }

  // Galeria (≥5 fotos): 30 pontos
  const galleryCount = vendor.media?.filter((m) => m.type === 'gallery').length || 0
  if (galleryCount >= 5) {
    score += 30
  } else if (galleryCount >= 3) {
    score += 20
  } else if (galleryCount >= 1) {
    score += 10
  }

  // Descrições: 20 pontos
  if (vendor.descriptionShort && vendor.descriptionShort.length >= 50) {
    score += 5
  }
  if (vendor.descriptionLong && vendor.descriptionLong.length >= 100) {
    score += 15
  }

  // Contatos (instagram, website): 10 pontos
  if (vendor.instagramHandle) score += 5
  if (vendor.websiteUrl) score += 5

  return Math.min(score, 100)
}

/**
 * Formata preço em centavos para string amigável
 */
export function formatPrice(cents: number | null | undefined): string {
  if (!cents) return 'Consultar'
  const reais = cents / 100
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais)
}

/**
 * Calcula distância aproximada entre duas cidades (simplificado)
 * No MVP, retorna sempre 0 se mesma cidade, senão usa serviceRadiusKm
 */
export function isWithinServiceRadius(
  vendorCity: string,
  eventCity: string,
  serviceRadiusKm?: number | null
): boolean {
  // Normalizar nomes
  const normalize = (s: string) => s.toLowerCase().trim()

  if (normalize(vendorCity) === normalize(eventCity)) {
    return true
  }

  // Se tem raio de atendimento, considera que pode atender
  // (implementação real usaria API de geolocalização)
  return !!serviceRadiusKm && serviceRadiusKm > 0
}
