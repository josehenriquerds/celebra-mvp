import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/:id/vendors - List all vendors for event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendors = await prisma.vendor.findMany({
      where: { eventId: params.id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

// POST /api/events/:id/vendors - Create new vendor
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      category,
      contact,
      email,
      phone,
      contractValue,
      amountPaid,
      paymentStatus,
      notes,
    } = body

    if (!name || !category || !contact) {
      return NextResponse.json(
        { error: 'Missing required fields: name, category, contact' },
        { status: 400 }
      )
    }

    const vendor = await prisma.vendor.create({
      data: {
        eventId: params.id,
        name,
        phone: phone || contact || '',
        category,
        contractValue,
        notes: notes || null,
      },
    })

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }
}