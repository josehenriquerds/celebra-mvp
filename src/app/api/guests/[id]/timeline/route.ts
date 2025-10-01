import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const guestId = params.id

    // Get guest to find contactId and eventId
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { contact: true },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Fetch timeline entries related to this guest/contact
    const timelineEntries = await prisma.timelineEntry.findMany({
      where: {
        eventId: guest.eventId,
        OR: [
          { refId: guest.id },
          { refId: guest.contactId },
        ],
      },
      orderBy: { occurredAt: 'desc' },
      take: 50,
    })

    // Fetch interactions
    const interactions = await prisma.interaction.findMany({
      where: {
        eventId: guest.eventId,
        contactId: guest.contactId,
      },
      orderBy: { occurredAt: 'desc' },
      take: 30,
    })

    // Fetch checkins
    const checkins = await prisma.checkin.findMany({
      where: {
        eventId: guest.eventId,
        guestId: guest.id,
      },
      orderBy: { timestamp: 'desc' },
    })

    // Fetch gifts
    const gifts = await prisma.giftRegistryItem.findMany({
      where: {
        eventId: guest.eventId,
        buyerContactId: guest.contactId,
      },
    })

    // Combine and sort all events
    const timeline = [
      ...timelineEntries.map((t) => ({
        id: t.id,
        type: t.type,
        actorType: t.actorType,
        occurredAt: t.occurredAt,
        meta: t.metaJson,
        source: 'timeline',
      })),
      ...interactions.map((i) => ({
        id: i.id,
        type: 'interaction',
        channel: i.channel,
        kind: i.kind,
        occurredAt: i.occurredAt,
        payload: i.payloadJson,
        source: 'interaction',
      })),
      ...checkins.map((c) => ({
        id: c.id,
        type: 'checkin',
        atGate: c.atGate,
        occurredAt: c.timestamp,
        source: 'checkin',
      })),
      ...gifts.map((g) => ({
        id: g.id,
        type: 'gift',
        title: g.title,
        status: g.status,
        price: g.price,
        occurredAt: g.createdAt,
        source: 'gift',
      })),
    ].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())

    return NextResponse.json({
      guestId: guest.id,
      contactName: guest.contact.fullName,
      timeline,
    })
  } catch (error) {
    console.error('Error fetching guest timeline:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}