import crypto from 'crypto'
import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function generateToken(guestId: string): string {
  return crypto
    .createHash('sha256')
    .update(guestId + process.env.NEXTAUTH_SECRET)
    .digest('hex')
    .substring(0, 32)
}

async function findGuestByToken(token: string) {
  const allGuests = await prisma.guest.findMany({ select: { id: true } })
  for (const guest of allGuests) {
    if (generateToken(guest.id) === token) return guest.id
  }
  return null
}

// GET /api/guest-portal/:token/export - Export all guest data
export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const guestId = await findGuestByToken(params.token)

    if (!guestId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }

    // Get all data related to this guest
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        contact: {
          include: {
            household: true,
          },
        },
        event: true,
        seatAssignments: {
          include: {
            seat: {
              include: { table: true },
            },
          },
        },
        checkins: true,
      },
    })

    const interactions = await prisma.interaction.findMany({
      where: {
        eventId: guest?.eventId,
        contactId: guest?.contactId,
      },
    })

    const timeline = await prisma.timelineEntry.findMany({
      where: {
        eventId: guest?.eventId,
      },
    })

    const consentLogs = await prisma.consentLog.findMany({
      where: { contactId: guest?.contactId },
    })

    const exportData = {
      guest,
      interactions,
      timeline,
      consentLogs,
      exportedAt: new Date().toISOString(),
      lgpdCompliant: true,
    }

    // Return as JSON file download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="meus-dados-${guestId}.json"`,
      },
    })
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
