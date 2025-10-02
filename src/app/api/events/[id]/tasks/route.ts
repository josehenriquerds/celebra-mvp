import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id

    const tasks = await prisma.task.findMany({
      where: { eventId },
      include: {
        relatedVendor: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Schema específico para criação de task nesta rota
const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.string().optional(),
  assigneeUserId: z.string().optional(),
  dueAt: z.string().datetime().optional(),
  slaHours: z.number().optional(),
  relatedVendorId: z.string().optional(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id
    const body: unknown = await request.json()

    // Validate with Zod
    const validatedData = createTaskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        eventId,
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status || 'aberta',
        assigneeUserId: validatedData.assigneeUserId,
        dueAt: validatedData.dueAt ? new Date(validatedData.dueAt) : undefined,
        slaHours: validatedData.slaHours,
        relatedVendorId: validatedData.relatedVendorId,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
