import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST: Assign guest to seat
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tableId = params.id
    const body = await request.json()

    const { guestId, seatId, fromSeatId, locked = false } = body

    // Validate seatId
    if (!seatId) {
      return NextResponse.json({ error: 'seatId is required' }, { status: 400 })
    }

    // Get seat with table
    const seat = await prisma.seat.findUnique({
      where: { id: seatId },
      include: {
        table: true,
      },
    })

    if (!seat || seat.tableId !== tableId) {
      return NextResponse.json({ error: 'Seat not found or does not belong to this table' }, { status: 404 })
    }

    // Check if seat is already occupied (by a different guest)
    const existingAssignment = await prisma.seatAssignment.findUnique({
      where: { seatId: seat.id },
    })

    if (existingAssignment && existingAssignment.guestId !== guestId) {
      return NextResponse.json({ error: 'Seat already occupied' }, { status: 400 })
    }

    // If fromSeatId is provided, remove the old assignment
    if (fromSeatId) {
      const oldAssignment = await prisma.seatAssignment.findUnique({
        where: { seatId: fromSeatId },
      })

      if (oldAssignment && oldAssignment.guestId === guestId) {
        await prisma.seatAssignment.delete({
          where: { id: oldAssignment.id },
        })
      }
    } else {
      // Check if guest is already assigned to another seat (not fromSeatId scenario)
      const guestExistingAssignment = await prisma.seatAssignment.findFirst({
        where: { guestId },
      })

      if (guestExistingAssignment) {
        // Remove previous assignment
        await prisma.seatAssignment.delete({
          where: { id: guestExistingAssignment.id },
        })
      }
    }

    // If the seat is already assigned to this guest, just update it
    if (existingAssignment && existingAssignment.guestId === guestId) {
      const updated = await prisma.seatAssignment.update({
        where: { id: existingAssignment.id },
        data: { locked },
        include: {
          guest: {
            include: {
              contact: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        assignment: {
          id: updated.id,
          guest: {
            id: updated.guest.id,
            name: updated.guest.contact.fullName,
          },
          seat: {
            id: seat.id,
            index: seat.index,
          },
          table: {
            id: seat.table.id,
            label: seat.table.label,
          },
          locked: updated.locked,
        },
      })
    }

    // Create new assignment
    const assignment = await prisma.seatAssignment.create({
      data: {
        guestId,
        seatId: seat.id,
        locked,
      },
      include: {
        guest: {
          include: {
            contact: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      assignment: {
        id: assignment.id,
        guest: {
          id: assignment.guest.id,
          name: assignment.guest.contact.fullName,
        },
        seat: {
          id: seat.id,
          index: seat.index,
        },
        table: {
          id: seat.table.id,
          label: seat.table.label,
        },
        locked: assignment.locked,
      },
    })
  } catch (error) {
    console.error('Error assigning seat:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE: Remove assignment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tableId = params.id
    const searchParams = request.nextUrl.searchParams
    const seatIndex = parseInt(searchParams.get('seatIndex') || '0')

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        seats: {
          where: { index: seatIndex },
          include: {
            assignments: true,
          },
        },
      },
    })

    if (!table || table.seats.length === 0) {
      return NextResponse.json({ error: 'Table or seat not found' }, { status: 404 })
    }

    const seat = table.seats[0]
    const assignment = seat.assignments[0]

    if (!assignment) {
      return NextResponse.json({ error: 'No assignment found' }, { status: 404 })
    }

    await prisma.seatAssignment.delete({
      where: { id: assignment.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Assignment removed',
    })
  } catch (error) {
    console.error('Error removing assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
