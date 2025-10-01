import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vendorStatusChangeSchema } from '@/lib/validations/vendor';
import type { VendorPartnerStatus } from '@prisma/client';

/**
 * POST /api/vendor-partners/:id/status
 * Altera status do vendor (aprovar/reprovar/suspender)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validar dados
    const validated = vendorStatusChangeSchema.parse(body);

    // Buscar vendor
    const vendor = await prisma.vendorPartner.findUnique({
      where: { id: params.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor não encontrado' }, { status: 404 });
    }

    // Mapear ação para status
    let newStatus: VendorPartnerStatus;
    let actionLog: string;

    switch (validated.action) {
      case 'approve':
        newStatus = 'approved';
        actionLog = 'approved';
        break;
      case 'reject':
        newStatus = 'rejected';
        actionLog = 'rejected';
        break;
      case 'suspend':
        newStatus = 'suspended';
        actionLog = 'suspended';
        break;
      case 'reactivate':
        newStatus = 'approved';
        actionLog = 'reactivated';
        break;
      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
    }

    // Atualizar status
    const updated = await prisma.vendorPartner.update({
      where: { id: params.id },
      data: { status: newStatus },
    });

    // Log da mudança de status
    await prisma.vendorStatusLog.create({
      data: {
        vendorId: params.id,
        action: actionLog as any,
        actorUserId: validated.actorUserId || null,
        reason: validated.reason || null,
      },
    });

    // TODO: Disparar webhook n8n de acordo com a ação
    if (validated.action === 'approve') {
      // triggerN8nWebhook('vendor_approved', { vendorId: params.id, slug: updated.slug });
    }

    return NextResponse.json({
      success: true,
      vendor: updated,
      message: `Vendor ${validated.action === 'approve' ? 'aprovado' : validated.action === 'reject' ? 'reprovado' : validated.action === 'suspend' ? 'suspenso' : 'reativado'} com sucesso`,
    });
  } catch (error) {
    console.error('Vendor status change error:', error);

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao alterar status' },
      { status: 500 }
    );
  }
}