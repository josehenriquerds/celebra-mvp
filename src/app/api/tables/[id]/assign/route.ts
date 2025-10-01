import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST: Assign guest to seat
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tableId = params.id
    const body = await request.json()

    const { guestId, seatIndex, locked = false } = body

    // Get table with seats
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      include: {
        seats: {
          where: { index: seatIndex },
        },
      },
    })

    if (!table || table.seats.length === 0) {
      return NextResponse.json(
        { error: 'Table or seat not found' },
        { status: 404 }
      )
    }

    const seat = table.seats[0]

    // Check if seat is already occupied
    const existingAssignment = await prisma.seatAssignment.findUnique({
      where: { seatId: seat.id },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'Seat already occupied' },
        { status: 400 }
      )
    }

    // Check if guest is already assigned to another seat
    const guestExistingAssignment = await prisma.seatAssignment.findFirst({
      where: { guestId },
    })

    if (guestExistingAssignment) {
      // Remove previous assignment
      await prisma.seatAssignment.delete({
        where: { id: guestExistingAssignment.id },
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
          id: table.id,
          label: table.label,
        },
        locked: assignment.locked,
      },
    })
  } catch (error) {
    console.error('Error assigning seat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json(
        { error: 'Table or seat not found' },
        { status: 404 }
      )
    }

    const seat = table.seats[0]
    const assignment = seat.assignments[0]

    if (!assignment) {
      return NextResponse.json(
        { error: 'No assignment found' },
        { status: 404 }
      )
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}