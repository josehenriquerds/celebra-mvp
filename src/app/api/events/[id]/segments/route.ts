import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

type SegmentRule = {
  field: string
  operator: string
  value: string
}

type SegmentRuleGroup = {
  and?: SegmentRule[]
}

function isSegmentRuleGroup(value: unknown): value is SegmentRuleGroup {
  if (!value || typeof value !== 'object') return false

  const group = value as SegmentRuleGroup
  if (!Array.isArray(group.and)) return false

  return group.and.every(
    (rule) =>
      rule !== null &&
      typeof rule === 'object' &&
      typeof rule.field === 'string' &&
      typeof rule.operator === 'string' &&
      typeof rule.value === 'string'
  )
}

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
    const { label, rules } = body as { label?: string; rules?: unknown }

    if (!label || !isSegmentRuleGroup(rules)) {
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
async function applySegmentRules(segmentId: string, eventId: string, rules: SegmentRuleGroup) {
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
function buildWhereClause(rules: SegmentRuleGroup): Prisma.GuestWhereInput {
  if (!rules.and?.length) return {}

  const conditions: Prisma.GuestWhereInput[] = []

  for (const rule of rules.and) {
    const { field, operator, value } = rule

    if (field.includes('.')) {
      const [parent, child] = field.split('.')

      if (parent === 'contact') {
        conditions.push({
          contact: buildFieldCondition(child, operator, value) as Prisma.ContactWhereInput,
        })
      } else if (parent === 'engagementScore') {
        conditions.push({
          engagementScore: buildFieldCondition(child, operator, value) as Prisma.EngagementScoreWhereInput,
        })
      }
    } else {
      conditions.push(buildFieldCondition(field, operator, value))
    }
  }

  return conditions.length > 0 ? { AND: conditions } : {}
}

function buildFieldCondition(
  field: string,
  operator: string,
  value: string
): Prisma.GuestWhereInput | Prisma.ContactWhereInput | Prisma.EngagementScoreWhereInput {
  let typedValue: string | number | boolean = value

  if (value === 'true') typedValue = true
  else if (value === 'false') typedValue = false
  else if (!isNaN(Number(value))) typedValue = Number(value)

  if (field === 'household') {
    return operator === 'eq' && typedValue === true
      ? ({ household: { isNot: null } } satisfies Prisma.GuestWhereInput)
      : ({ household: null } satisfies Prisma.GuestWhereInput)
  }

  switch (operator) {
    case 'eq':
      return { [field]: typedValue } as Prisma.GuestWhereInput
    case 'contains':
      return {
        [field]: { contains: typedValue, mode: 'insensitive' },
      } as Prisma.GuestWhereInput
    case 'gt':
      return { [field]: { gt: typedValue } } as Prisma.GuestWhereInput
    case 'lt':
      return { [field]: { lt: typedValue } } as Prisma.GuestWhereInput
    case 'gte':
      return { [field]: { gte: typedValue } } as Prisma.GuestWhereInput
    case 'lte':
      return { [field]: { lte: typedValue } } as Prisma.GuestWhereInput
    default:
      return { [field]: typedValue } as Prisma.GuestWhereInput
  }
}
