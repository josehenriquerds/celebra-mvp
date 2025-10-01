import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/:id/gifts - List all gifts for event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get all gifts for this event
    const gifts = await prisma.giftRegistryItem.findMany({
      where: {
        eventId: params.id,
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
        buyerContact: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { title: 'asc' },
    })

    return NextResponse.json(gifts)
  } catch (error) {
    console.error('Error fetching gifts:', error)
    return NextResponse.json({ error: 'Failed to fetch gifts' }, { status: 500 })
  }
}

// POST /api/events/:id/gifts - Create new gift (without guest assignment)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, description, price, imageUrl, externalUrl } = body

    if (!title || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: title, price' },
        { status: 400 }
      )
    }

    // Create a placeholder guest to hold unassigned gifts
    // Or we could modify schema to make guestId nullable
    // For now, we'll find the first guest of this event as placeholder
    const firstGuest = await prisma.guest.findFirst({
      where: { eventId: params.id },
    })

    if (!firstGuest) {
      return NextResponse.json(
        { error: 'No guests found for this event. Add guests first.' },
        { status: 400 }
      )
    }

    const gift = await prisma.giftRegistryItem.create({
      data: {
        eventId: params.id,
        title,
        link: externalUrl || null,
        price,
        status: 'disponivel',
      },
    })

    return NextResponse.json(gift)
  } catch (error) {
    console.error('Error creating gift:', error)
    return NextResponse.json({ error: 'Failed to create gift' }, { status: 500 })
  }
}