import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id
    const searchParams = request.nextUrl.searchParams

    // Filters
    const filter = searchParams.get('filter') // vip|children|pending|confirmed|no_phone
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {
      eventId,
    }

    // Apply filters
    if (filter === 'vip') {
      where.contact = { isVip: true }
    } else if (filter === 'children') {
      where.children = { gt: 0 }
    } else if (filter === 'pending') {
      where.rsvp = 'pendente'
    } else if (filter === 'confirmed') {
      where.rsvp = 'sim'
    } else if (filter === 'no_phone') {
      where.contact = { phone: null }
    }

    // Search by name, phone, or email
    if (search) {
      where.contact = {
        ...where.contact,
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    // Fetch guests with pagination
    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        include: {
          contact: {
            include: {
              household: true,
              engagementScores: {
                where: { eventId },
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
          tags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: [
          { contact: { isVip: 'desc' } },
          { rsvp: 'asc' },
          { contact: { fullName: 'asc' } },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.guest.count({ where }),
    ])

    // Format response
    const formattedGuests = guests.map((guest) => ({
      id: guest.id,
      eventId: guest.eventId,
      contact: {
        id: guest.contact.id,
        fullName: guest.contact.fullName,
        phone: guest.contact.phone,
        email: guest.contact.email,
        relation: guest.contact.relation,
        isVip: guest.contact.isVip,
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
          }
        : null,
      table: guest.seatAssignments[0]?.seat.table
        ? {
            id: guest.seatAssignments[0].seat.table.id,
            label: guest.seatAssignments[0].seat.table.label,
          }
        : null,
      tags: guest.tags.map((gt) => ({
        id: gt.tag.id,
        name: gt.tag.name,
      })),
    }))

    return NextResponse.json({
      guests: formattedGuests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching guests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
