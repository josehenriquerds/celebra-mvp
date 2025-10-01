import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vendorUpdateSchema } from '@/lib/validations/vendor';
import { calculateProfileScore, normalizeInstagramHandle } from '@/lib/vendor-utils';

/**
 * GET /api/vendor-partners/:id
 * Busca vendor partner por ID (CRM)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendorPartner.findUnique({
      where: { id: params.id },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        statusLog: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor não encontrado' }, { status: 404 });
    }

    // Calcular média de avaliações
    const avgRating = vendor.reviews.length > 0
      ? vendor.reviews.reduce((acc, r) => acc + r.rating, 0) / vendor.reviews.length
      : 0;

    return NextResponse.json({
      ...vendor,
      avgRating,
    });
  } catch (error) {
    console.error('Vendor get error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vendor' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/vendor-partners/:id
 * Atualiza vendor (admin ou dono)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validar dados
    const validated = vendorUpdateSchema.parse(body);

    // Buscar vendor existente
    const existing = await prisma.vendorPartner.findUnique({
      where: { id: params.id },
      include: { media: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Vendor não encontrado' }, { status: 404 });
    }

    // Normalizar Instagram se fornecido
    const instagramHandle = validated.instagramHandle !== undefined
      ? normalizeInstagramHandle(validated.instagramHandle)
      : undefined;

    // Atualizar
    const updated = await prisma.vendorPartner.update({
      where: { id: params.id },
      data: {
        ...(validated.companyName && { companyName: validated.companyName }),
        ...(validated.contactName && { contactName: validated.contactName }),
        ...(validated.email && { email: validated.email }),
        ...(validated.phoneE164 && { phoneE164: validated.phoneE164 }),
        ...(instagramHandle !== undefined && { instagramHandle }),
        ...(validated.websiteUrl !== undefined && { websiteUrl: validated.websiteUrl || null }),
        ...(validated.whatsappUrl !== undefined && { whatsappUrl: validated.whatsappUrl || null }),
        ...(validated.city && { city: validated.city }),
        ...(validated.state && { state: validated.state.toUpperCase() }),
        ...(validated.serviceRadiusKm !== undefined && { serviceRadiusKm: validated.serviceRadiusKm }),
        ...(validated.categories && { categories: validated.categories }),
        ...(validated.priceFromCents !== undefined && { priceFromCents: validated.priceFromCents }),
        ...(validated.descriptionShort !== undefined && { descriptionShort: validated.descriptionShort }),
        ...(validated.descriptionLong !== undefined && { descriptionLong: validated.descriptionLong }),
      },
      include: {
        media: true,
      },
    });

    // Recalcular score
    const newScore = calculateProfileScore(updated);
    await prisma.vendorPartner.update({
      where: { id: params.id },
      data: { profileScore: newScore },
    });

    // Log da atualização
    await prisma.vendorStatusLog.create({
      data: {
        vendorId: params.id,
        action: 'updated',
        actorUserId: body.actorUserId || null,
        reason: 'Dados atualizados',
      },
    });

    return NextResponse.json({
      success: true,
      vendor: { ...updated, profileScore: newScore },
    });
  } catch (error) {
    console.error('Vendor update error:', error);

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao atualizar vendor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vendor-partners/:id
 * Remove vendor (LGPD)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vendorPartner.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Vendor removido',
    });
  } catch (error) {
    console.error('Vendor delete error:', error);
    return NextResponse.json(
      { error: 'Erro ao remover vendor' },
      { status: 500 }
    );
  }
}