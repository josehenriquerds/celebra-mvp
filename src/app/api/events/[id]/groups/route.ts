import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET: Fetch all groups for event with guest counts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id

    const groups = await prisma.segmentTag.findMany({
      where: {
        eventId,
        isDynamic: false // Only static groups created by users
      },
      include: {
        _count: {
          select: { guests: true }
        }
      },
      orderBy: { name: 'asc' },
    })

    const formattedGroups = groups.map((group) => ({
      id: group.id,
      name: group.name,
      guestCount: group._count.guests,
    }))

    return NextResponse.json(formattedGroups)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Create a new group
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id
    const body = await request.json()
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      )
    }

    const group = await prisma.segmentTag.create({
      data: {
        eventId,
        name: name.trim(),
        ruleJson: {}, // Empty rule for static groups
        isDynamic: false, // Static group created by user
      },
    })

    return NextResponse.json({
      id: group.id,
      name: group.name,
      guestCount: 0,
    })
  } catch (error) {
    console.error('Error creating group:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
