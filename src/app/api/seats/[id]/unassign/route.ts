import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST: Unassign guest from seat
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const seatId = params.id

    // Find assignment for this seat
    const assignment = await prisma.seatAssignment.findUnique({
      where: { seatId },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'No assignment found for this seat' }, { status: 404 })
    }

    // Delete assignment
    await prisma.seatAssignment.delete({
      where: { id: assignment.id },
    })

    return NextResponse.json({
      success: true,
      message: 'Guest unassigned successfully',
    })
  } catch (error) {
    console.error('Error unassigning guest:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
