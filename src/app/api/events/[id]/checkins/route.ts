import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id

    // Get all confirmed guests with checkin status
    const guests = await prisma.guest.findMany({
      where: {
        eventId,
        rsvp: 'sim',
      },
      include: {
        contact: {
          select: {
            fullName: true,
            phone: true,
            isVip: true,
          },
        },
        checkins: {
          where: {
            eventId,
          },
          orderBy: {
            timestamp: 'desc',
          },
          take: 1,
        },
        seatAssignments: {
          include: {
            seat: {
              include: {
                table: {
                  select: {
                    label: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        contact: {
          fullName: 'asc',
        },
      },
    })

    // Transform data
    const guestsData = guests.map((guest) => ({
      id: guest.id,
      contact: guest.contact,
      rsvp: guest.rsvp,
      checkin: guest.checkins[0] || null,
      table: guest.seatAssignments[0]?.seat.table || null,
    }))

    // Calculate stats
    const total = guests.length
    const presentes = guests.filter((g) => g.checkins.length > 0).length
    const ausentes = total - presentes
    const percentPresentes = total > 0 ? Math.round((presentes / total) * 100) : 0

    return NextResponse.json({
      guests: guestsData,
      stats: {
        total,
        presentes,
        ausentes,
        percentPresentes,
      },
    })
  } catch (error) {
    console.error('Error fetching checkins:', error)
    return NextResponse.json({ error: 'Failed to fetch checkins' }, { status: 500 })
  }
}
