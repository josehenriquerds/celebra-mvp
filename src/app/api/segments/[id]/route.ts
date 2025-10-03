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

// PATCH /api/segments/:id - Update segment
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const {
      label,
      description,
      rules,
    } = body as {
      label?: string
      description?: string | null
      rules?: unknown
    }

    const updateData: Record<string, unknown> = {}
    if (label !== undefined) updateData.label = label
    if (description !== undefined) updateData.description = description || null

    let parsedRules: SegmentRuleGroup | undefined
    if (rules !== undefined) {
      if (!isSegmentRuleGroup(rules)) {
        return NextResponse.json({ error: 'Invalid rules payload' }, { status: 400 })
      }
      updateData.rulesDsl = rules
      parsedRules = rules
    }

    const segment = await prisma.segmentTag.update({
      where: { id: params.id },
      data: updateData as Prisma.SegmentTagUpdateInput,
    })

    // Reapply rules if changed
    if (parsedRules) {
      await applySegmentRules(segment.id, segment.eventId, parsedRules)
    }

    return NextResponse.json(segment)
  } catch (error) {
    console.error('Error updating segment:', error)
    return NextResponse.json({ error: 'Failed to update segment' }, { status: 500 })
  }
}

// DELETE /api/segments/:id - Delete segment
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.segmentTag.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting segment:', error)
    return NextResponse.json({ error: 'Failed to delete segment' }, { status: 500 })
  }
}

async function applySegmentRules(segmentId: string, eventId: string, rules: SegmentRuleGroup) {
  const whereClause = buildWhereClause(rules)

  const matchingGuests = await prisma.guest.findMany({
    where: {
      eventId,
      ...whereClause,
    },
    select: { id: true },
  })

  // Clear existing tags
  await prisma.guestTag.deleteMany({
    where: { tagId: segmentId },
  })

  // Create new tags
  if (matchingGuests.length > 0) {
    await prisma.guestTag.createMany({
      data: matchingGuests.map((g) => ({
        guestId: g.id,
        tagId: segmentId,
      })),
      skipDuplicates: true,
    })
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
        conditions.push({ contact: buildFieldCondition(child, operator, value) as Prisma.ContactWhereInput })
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
