import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;

    const tasks = await prisma.task.findMany({
      where: { eventId },
      include: {
        relatedVendor: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await request.json();

    const task = await prisma.task.create({
      data: {
        eventId,
        title: body.title,
        description: body.description,
        status: body.status || 'aberta',
        assigneeUserId: body.assigneeUserId,
        dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
        slaHours: body.slaHours,
        relatedVendorId: body.relatedVendorId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
