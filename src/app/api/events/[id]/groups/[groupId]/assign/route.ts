import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST: Assign multiple guests to a group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const { groupId } = params
    const body = await request.json()
    const { guestIds } = body

    if (!Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json({ error: 'guestIds array is required' }, { status: 400 })
    }

    // Create assignments for each guest (skip if already exists)
    const assignments = guestIds.map((guestId) => ({
      guestId,
      tagId: groupId,
    }))

    // Use createMany with skipDuplicates to avoid errors
    await prisma.guestTag.createMany({
      data: assignments,
      skipDuplicates: true,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error assigning guests to group:', error)
    return NextResponse.json({ error: 'Failed to assign guests' }, { status: 500 })
  }
}
