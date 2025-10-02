import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vendorApplySchema } from '@/lib/validations/vendor'
import {
  generateUniqueSlug,
  normalizeInstagramHandle,
  generateWhatsAppUrl,
} from '@/lib/vendor-utils'

/**
 * POST /api/vendors/apply
 * Cadastro público de parceiro
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar dados
    const validated = vendorApplySchema.parse(body)

    // Verificar duplicatas
    const existing = await prisma.vendorPartner.findFirst({
      where: {
        OR: [{ email: validated.email }, { phoneE164: validated.phoneE164 }],
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'E-mail ou telefone já cadastrado' }, { status: 400 })
    }

    // Gerar slug único
    const slug = await generateUniqueSlug(validated.companyName, validated.city)

    // Normalizar Instagram
    const instagramHandle = normalizeInstagramHandle(validated.instagramHandle)

    // Gerar WhatsApp URL se não fornecida
    const whatsappUrl = validated.whatsappUrl || generateWhatsAppUrl(validated.phoneE164)

    // Criar vendor
    const vendor = await prisma.vendorPartner.create({
      data: {
        slug,
        companyName: validated.companyName,
        contactName: validated.contactName,
        email: validated.email,
        phoneE164: validated.phoneE164,
        instagramHandle,
        websiteUrl: validated.websiteUrl || null,
        whatsappUrl,
        city: validated.city,
        state: validated.state.toUpperCase(),
        country: validated.country,
        serviceRadiusKm: validated.serviceRadiusKm,
        categories: validated.categories,
        priceFromCents: validated.priceFromCents,
        descriptionShort: validated.descriptionShort,
        descriptionLong: validated.descriptionLong,
        status: 'pending_review',
        consentText: validated.consentText,
        consentAt: new Date(),
        profileScore: 0, // Will be calculated after media upload
      },
    })

    // Log de status inicial
    await prisma.vendorStatusLog.create({
      data: {
        vendorId: vendor.id,
        action: 'submitted',
        actorUserId: null,
        reason: 'Cadastro inicial via formulário público',
      },
    })

    // TODO: Disparar webhook n8n para notificar admin
    // triggerN8nWebhook('vendor_submitted', { vendorId: vendor.id });

    return NextResponse.json({
      success: true,
      vendorId: vendor.id,
      slug: vendor.slug,
      status: vendor.status,
      message: 'Cadastro recebido! Revisaremos seu perfil em até 48h.',
    })
  } catch (error) {
    console.error('Vendor apply error:', error)

    if (error instanceof Error && 'issues' in error) {
      // Zod validation error
      return NextResponse.json({ error: 'Dados inválidos', details: error }, { status: 400 })
    }

    return NextResponse.json({ error: 'Erro ao processar cadastro' }, { status: 500 })
  }
}
