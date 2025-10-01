import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/checkins - Create checkin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { guestId, eventId, method = 'manual' } = body

    if (!guestId || !eventId) {
      return NextResponse.json(
        { error: 'Missing guestId or eventId' },
        { status: 400 }
      )
    }

    // Check if guest exists
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { contact: true },
    })

    if (!guest || guest.eventId !== eventId) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Check if already checked in
    const existing = await prisma.checkin.findFirst({
      where: { eventId, guestId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Guest already checked in', checkin: existing },
        { status: 400 }
      )
    }

    // Create checkin
    const checkin = await prisma.checkin.create({
      data: {
        eventId,
        guestId,
      },
    })

    // Create timeline entry
    await prisma.timelineEntry.create({
      data: {
        eventId: guest.eventId,
        actorType: 'guest',
        type: 'checkin',
        refId: guestId,
        metaJson: {
          method: method || 'manual',
          contactId: guest.contactId,
        },
      },
    })

    // Update engagement score (+10 points for checkin)
    await prisma.engagementScore.upsert({
      where: {
        contactId_eventId: {
          contactId: guest.contactId,
          eventId: guest.eventId,
        },
      },
      create: {
        eventId: guest.eventId,
        contactId: guest.contactId,
        value: 10,
        tier: 'bronze',
      },
      update: {
        value: {
          increment: 10,
        },
      },
    })

    // Update tier based on new score
    const score = await prisma.engagementScore.findUnique({
      where: {
        contactId_eventId: {
          contactId: guest.contactId,
          eventId: guest.eventId,
        },
      },
    })

    if (score) {
      let newTier: 'bronze' | 'prata' | 'ouro' = 'bronze'
      if (score.value >= 50) newTier = 'ouro'
      else if (score.value >= 25) newTier = 'prata'

      if (newTier !== score.tier) {
        await prisma.engagementScore.update({
          where: {
            contactId_eventId: {
              contactId: guest.contactId,
              eventId: guest.eventId,
            },
          },
          data: { tier: newTier },
        })
      }
    }

    return NextResponse.json({
      success: true,
      checkin,
      message: `Check-in realizado para ${guest.contact.fullName}`,
    })
  } catch (error) {
    console.error('Error creating checkin:', error)
    return NextResponse.json({ error: 'Failed to create checkin' }, { status: 500 })
  }
}