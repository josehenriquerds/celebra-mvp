import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all tables with seats and assignments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    const tables = await prisma.table.findMany({
      where: { eventId },
      include: {
        seats: {
          include: {
            assignments: {
              include: {
                guest: {
                  include: {
                    contact: {
                      include: {
                        household: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { index: 'asc' },
        },
      },
      orderBy: { label: 'asc' },
    })

    // Format response
    const formattedTables = tables.map((table) => ({
      id: table.id,
      label: table.label,
      capacity: table.capacity,
      zone: table.zone,
      x: table.x,
      y: table.y,
      rotation: table.rotation,
      shape: table.shape,
      seats: table.seats.map((seat) => ({
        id: seat.id,
        index: seat.index,
        x: seat.x,
        y: seat.y,
        rotation: seat.rotation,
        guest: seat.assignments[0]
          ? {
              id: seat.assignments[0].guest.id,
              name: seat.assignments[0].guest.contact.fullName,
              isVip: seat.assignments[0].guest.contact.isVip,
              household: seat.assignments[0].guest.contact.household?.label,
              locked: seat.assignments[0].locked,
            }
          : null,
      })),
    }))

    // Get unassigned guests (for sidebar)
    const unassignedGuests = await prisma.guest.findMany({
      where: {
        eventId,
        rsvp: 'sim', // Only confirmed guests
        seatAssignments: {
          none: {},
        },
      },
      include: {
        contact: {
          include: {
            household: true,
          },
        },
      },
      orderBy: [
        { contact: { household: { label: 'asc' } } },
        { contact: { fullName: 'asc' } },
      ],
    })

    // Group by household
    const households = unassignedGuests.reduce((acc, guest) => {
      const householdLabel = guest.contact.household?.label || 'Sem Família'
      if (!acc[householdLabel]) {
        acc[householdLabel] = []
      }
      acc[householdLabel].push({
        id: guest.id,
        name: guest.contact.fullName,
        isVip: guest.contact.isVip,
      })
      return acc
    }, {} as Record<string, any[]>)

    return NextResponse.json({
      tables: formattedTables,
      unassignedGuests: Object.entries(households).map(([label, members]) => ({
        household: label,
        members,
      })),
    })
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new table
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const body = await request.json()

    const { label, capacity, zone, x, y, rotation, shape } = body

    // Create table
    const table = await prisma.table.create({
      data: {
        eventId,
        label,
        capacity,
        zone: zone || null,
        x: x || 0,
        y: y || 0,
        rotation: rotation || 0,
        shape: shape || 'round',
      },
    })

    // Generate seats in circular arrangement
    const radius = 80
    const theta = (2 * Math.PI) / capacity

    const seats = Array.from({ length: capacity }, (_, i) => ({
      tableId: table.id,
      index: i,
      x: Math.cos(i * theta) * radius,
      y: Math.sin(i * theta) * radius,
      rotation: (i * theta * 180) / Math.PI,
    }))

    await prisma.seat.createMany({
      data: seats,
    })

    return NextResponse.json({
      success: true,
      table: {
        id: table.id,
        label: table.label,
      },
    })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}