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

// POST /api/events/:id/segments/preview - Preview segment count
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { rules } = body as { rules?: unknown }

    if (!isSegmentRuleGroup(rules)) {
      return NextResponse.json({ error: 'Missing rules' }, { status: 400 })
    }

    const whereClause = buildWhereClause(rules)

    const count = await prisma.guest.count({
      where: {
        eventId: params.id,
        ...whereClause,
      },
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error previewing segment:', error)
    return NextResponse.json({ error: 'Failed to preview segment' }, { status: 500 })
  }
}

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
