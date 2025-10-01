import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch guest profile (360° view)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const guestId = params.id

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        contact: {
          include: {
            household: true,
            engagementScores: true,
            consentLogs: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
            interactions: {
              orderBy: { occurredAt: 'desc' },
              take: 20,
            },
          },
        },
        seatAssignments: {
          include: {
            seat: {
              include: {
                table: true,
              },
            },
          },
        },
        checkins: {
          orderBy: { timestamp: 'desc' },
        },
        event: true,
      },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Get gifts purchased by this contact
    const gifts = await prisma.giftRegistryItem.findMany({
      where: {
        eventId: guest.eventId,
        buyerContactId: guest.contactId,
      },
    })

    return NextResponse.json({
      id: guest.id,
      eventId: guest.eventId,
      eventTitle: guest.event.title,
      contact: {
        id: guest.contact.id,
        fullName: guest.contact.fullName,
        phone: guest.contact.phone,
        email: guest.contact.email,
        relation: guest.contact.relation,
        isVip: guest.contact.isVip,
        notes: guest.contact.notes,
        restrictions: guest.contact.restrictionsJson,
      },
      household: guest.contact.household
        ? {
            id: guest.contact.household.id,
            label: guest.contact.household.label,
            size: guest.contact.household.sizeCached,
          }
        : null,
      inviteStatus: guest.inviteStatus,
      rsvp: guest.rsvp,
      seats: guest.seats,
      children: guest.children,
      transportNeeded: guest.transportNeeded,
      optOut: guest.optOut,
      engagementScore: guest.contact.engagementScores[0]
        ? {
            value: guest.contact.engagementScores[0].value,
            tier: guest.contact.engagementScores[0].tier,
            updatedAt: guest.contact.engagementScores[0].updatedAt,
          }
        : null,
      seatAssignment: guest.seatAssignments[0]
        ? {
            table: {
              id: guest.seatAssignments[0].seat.table.id,
              label: guest.seatAssignments[0].seat.table.label,
              zone: guest.seatAssignments[0].seat.table.zone,
            },
            seat: {
              id: guest.seatAssignments[0].seat.id,
              index: guest.seatAssignments[0].seat.index,
            },
            locked: guest.seatAssignments[0].locked,
          }
        : null,
      interactions: guest.contact.interactions.map((i) => ({
        id: i.id,
        channel: i.channel,
        kind: i.kind,
        occurredAt: i.occurredAt,
        payload: i.payloadJson,
      })),
      checkins: guest.checkins.map((c) => ({
        id: c.id,
        atGate: c.atGate,
        timestamp: c.timestamp,
      })),
      gifts: gifts.map((g) => ({
        id: g.id,
        title: g.title,
        price: g.price,
        status: g.status,
      })),
      consentLogs: guest.contact.consentLogs.map((c) => ({
        id: c.id,
        source: c.source,
        action: c.action,
        text: c.text,
        createdAt: c.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching guest:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH: Update guest details
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const guestId = params.id
    const body = await request.json()

    const { rsvp, seats, children, transportNeeded, optOut, restrictions, notes } = body

    // Update guest
    const updateData: any = {}
    if (rsvp !== undefined) updateData.rsvp = rsvp
    if (seats !== undefined) updateData.seats = seats
    if (children !== undefined) updateData.children = children
    if (transportNeeded !== undefined) updateData.transportNeeded = transportNeeded
    if (optOut !== undefined) updateData.optOut = optOut

    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: updateData,
      include: {
        contact: true,
        event: true,
      },
    })

    // Update contact restrictions/notes if provided
    if (restrictions !== undefined || notes !== undefined) {
      await prisma.contact.update({
        where: { id: guest.contactId },
        data: {
          ...(restrictions !== undefined && { restrictionsJson: restrictions }),
          ...(notes !== undefined && { notes }),
        },
      })
    }

    // Create timeline entry for RSVP change
    if (rsvp !== undefined) {
      await prisma.timelineEntry.create({
        data: {
          eventId: guest.eventId,
          actorType: 'host',
          type: 'rsvp',
          refId: guest.id,
          metaJson: {
            guestId: guest.id,
            contactName: guest.contact.fullName,
            newRsvp: rsvp,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        rsvp: guest.rsvp,
        seats: guest.seats,
        children: guest.children,
        transportNeeded: guest.transportNeeded,
        optOut: guest.optOut,
      },
    })
  } catch (error) {
    console.error('Error updating guest:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
