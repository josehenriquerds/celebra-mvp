import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Helper to generate token from guestId (simple hash)
function generateToken(guestId: string): string {
  return crypto
    .createHash('sha256')
    .update(guestId + process.env.NEXTAUTH_SECRET)
    .digest('hex')
    .substring(0, 32)
}

// Helper to find guest by token
async function findGuestByToken(token: string) {
  // In a real implementation, you'd store tokens in DB
  // For now, we'll search all guests and match token
  const allGuests = await prisma.guest.findMany({
    select: { id: true },
  })

  for (const guest of allGuests) {
    if (generateToken(guest.id) === token) {
      return guest.id
    }
  }

  return null
}

// GET /api/guest-portal/:token - Get guest portal data
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const guestId = await findGuestByToken(params.token)

    if (!guestId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        contact: {
          include: {
            household: true,
          },
        },
        seatAssignments: {
          include: {
            seat: {
              include: {
                table: {
                  select: { label: true },
                },
              },
            },
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
            venueName: true,
            address: true,
          },
        },
      },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Get consent logs
    const consentLogs = await prisma.consentLog.findMany({
      where: { contactId: guest.contactId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Get interactions
    const interactions = await prisma.interaction.findMany({
      where: {
        eventId: guest.eventId,
        contactId: guest.contactId,
      },
      select: {
        id: true,
        kind: true,
        occurredAt: true,
      },
      orderBy: { occurredAt: 'desc' },
    })

    return NextResponse.json({
      guest: {
        id: guest.id,
        rsvp: guest.rsvp,
        seats: guest.seats,
        children: guest.children,
        contact: guest.contact,
        household: guest.contact.household,
        table: guest.seatAssignments[0]?.seat?.table
          ? { label: guest.seatAssignments[0].seat.table.label }
          : null,
        optOut: guest.optOut,
      },
      event: guest.event,
      consentLogs,
      interactions,
    })
  } catch (error) {
    console.error('Error fetching guest portal data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}

// PATCH /api/guest-portal/:token - Update guest RSVP
export async function PATCH(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const guestId = await findGuestByToken(params.token)

    if (!guestId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    const body = await request.json()
    const { rsvp } = body

    if (!rsvp || !['sim', 'nao', 'talvez'].includes(rsvp)) {
      return NextResponse.json({ error: 'Invalid RSVP value' }, { status: 400 })
    }

    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: { rsvp },
    })

    // Create timeline entry
    await prisma.timelineEntry.create({
      data: {
        eventId: guest.eventId,
        type: 'rsvp',
        actorType: 'guest',
        refId: guest.id,
        occurredAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, rsvp })
  } catch (error) {
    console.error('Error updating RSVP:', error)
    return NextResponse.json({ error: 'Failed to update RSVP' }, { status: 500 })
  }
}

// DELETE /api/guest-portal/:token - Delete guest data
export async function DELETE(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const guestId = await findGuestByToken(params.token)

    if (!guestId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { contactId: true, eventId: true },
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Log consent
    await prisma.consentLog.create({
      data: {
        contactId: guest.contactId,
        source: 'form',
        action: 'opt_out',
        text: 'Guest requested data deletion via portal',
      },
    })

    // Delete related data
    await prisma.seatAssignment.deleteMany({
      where: { guest: { id: guestId } },
    })

    await prisma.checkin.deleteMany({
      where: { guestId },
    })

    await prisma.timelineEntry.deleteMany({
      where: { eventId: guest.eventId },
    })

    await prisma.interaction.deleteMany({
      where: { eventId: guest.eventId, contactId: guest.contactId },
    })

    await prisma.engagementScore.deleteMany({
      where: { eventId: guest.eventId, contactId: guest.contactId },
    })

    // Delete guest
    await prisma.guest.delete({
      where: { id: guestId },
    })

    // Optionally delete contact if no other guests reference it
    const otherGuests = await prisma.guest.findFirst({
      where: { contactId: guest.contactId },
    })

    if (!otherGuests) {
      await prisma.contact.delete({
        where: { id: guest.contactId },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting guest data:', error)
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 })
  }
}
