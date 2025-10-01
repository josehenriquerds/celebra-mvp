import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE: Delete a group and all its assignments
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const { groupId } = params

    // Delete all guest assignments first
    await prisma.guestTag.deleteMany({
      where: { tagId: groupId },
    })

    // Delete the group
    await prisma.segmentTag.delete({
      where: { id: groupId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting group:', error)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
