import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { vendorNoteSchema } from '@/lib/validations/vendor';

/**
 * POST /api/vendor-partners/:id/note
 * Adiciona nota interna ao vendor
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validar dados
    const validated = vendorNoteSchema.parse(body);

    // Verificar se vendor existe
    const vendor = await prisma.vendorPartner.findUnique({
      where: { id: params.id },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor não encontrado' }, { status: 404 });
    }

    // Criar nota
    const note = await prisma.vendorNote.create({
      data: {
        vendorId: params.id,
        authorUserId: validated.authorUserId,
        noteText: validated.noteText,
      },
    });

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error('Vendor note error:', error);

    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao adicionar nota' },
      { status: 500 }
    );
  }
}