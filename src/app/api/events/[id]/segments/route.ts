import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/events/:id/segments - List all segments
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const segments = await prisma.segmentTag.findMany({
      where: { eventId: params.id },
      include: {
        _count: {
          select: { guests: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(segments)
  } catch (error) {
    console.error('Error fetching segments:', error)
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
  }
}

// POST /api/events/:id/segments - Create segment
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { label, description, rules } = body

    if (!label || !rules) {
      return NextResponse.json({ error: 'Missing required fields: label, rules' }, { status: 400 })
    }

    const segment = await prisma.segmentTag.create({
      data: {
        eventId: params.id,
        name: label,
        ruleJson: rules,
      },
    })

    // Apply segment to matching guests
    await applySegmentRules(segment.id, params.id, rules)

    return NextResponse.json(segment)
  } catch (error) {
    console.error('Error creating segment:', error)
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 })
  }
}

// Helper function to apply segment rules
async function applySegmentRules(segmentId: string, eventId: string, rules: any) {
  const whereClause = buildWhereClause(rules)

  const matchingGuests = await prisma.guest.findMany({
    where: {
      eventId,
      ...whereClause,
    },
    select: { id: true },
  })

  // Note: Guest-segment associations would be managed through a join table
  // For now, segments are evaluated dynamically on each query
  console.log(`Segment ${segmentId} would match ${matchingGuests.length} guests`)
}

// Helper to build Prisma where clause from DSL
function buildWhereClause(rules: any): any {
  if (!rules.and || rules.and.length === 0) return {}

  const conditions: any[] = []

  for (const rule of rules.and) {
    const { field, operator, value } = rule

    // Handle nested fields (e.g., "contact.isVip")
    if (field.includes('.')) {
      const [parent, child] = field.split('.')

      if (parent === 'contact') {
        conditions.push({
          contact: buildFieldCondition(child, operator, value),
        })
      } else if (parent === 'engagementScore') {
        conditions.push({
          engagementScore: buildFieldCondition(child, operator, value),
        })
      }
    } else {
      // Direct field
      conditions.push(buildFieldCondition(field, operator, value))
    }
  }

  return conditions.length > 0 ? { AND: conditions } : {}
}

function buildFieldCondition(field: string, operator: string, value: string): any {
  // Convert string values to appropriate types
  let typedValue: any = value

  if (value === 'true') typedValue = true
  else if (value === 'false') typedValue = false
  else if (!isNaN(Number(value))) typedValue = Number(value)

  // Handle special field cases
  if (field === 'household') {
    return operator === 'eq' && typedValue === true
      ? { household: { isNot: null } }
      : { household: null }
  }

  // Build condition based on operator
  switch (operator) {
    case 'eq':
      return { [field]: typedValue }
    case 'contains':
      return { [field]: { contains: typedValue, mode: 'insensitive' } }
    case 'gt':
      return { [field]: { gt: typedValue } }
    case 'lt':
      return { [field]: { lt: typedValue } }
    case 'gte':
      return { [field]: { gte: typedValue } }
    case 'lte':
      return { [field]: { lte: typedValue } }
    default:
      return { [field]: typedValue }
  }
}
