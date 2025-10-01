import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/segments/:id - Update segment
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { label, description, rules } = body

    const updateData: any = {}
    if (label !== undefined) updateData.label = label
    if (description !== undefined) updateData.description = description || null
    if (rules !== undefined) updateData.rulesDsl = rules

    const segment = await prisma.segmentTag.update({
      where: { id: params.id },
      data: updateData,
    })

    // Reapply rules if changed
    if (rules) {
      await applySegmentRules(segment.id, segment.eventId, rules)
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

async function applySegmentRules(segmentId: string, eventId: string, rules: any) {
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

function buildWhereClause(rules: any): any {
  if (!rules.and || rules.and.length === 0) return {}

  const conditions: any[] = []

  for (const rule of rules.and) {
    const { field, operator, value } = rule

    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      if (parent === 'contact') {
        conditions.push({ contact: buildFieldCondition(child, operator, value) })
      } else if (parent === 'engagementScore') {
        conditions.push({ engagementScore: buildFieldCondition(child, operator, value) })
      }
    } else {
      conditions.push(buildFieldCondition(field, operator, value))
    }
  }

  return conditions.length > 0 ? { AND: conditions } : {}
}

function buildFieldCondition(field: string, operator: string, value: string): any {
  let typedValue: any = value
  if (value === 'true') typedValue = true
  else if (value === 'false') typedValue = false
  else if (!isNaN(Number(value))) typedValue = Number(value)

  if (field === 'household') {
    return operator === 'eq' && typedValue === true
      ? { household: { isNot: null } }
      : { household: null }
  }

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
