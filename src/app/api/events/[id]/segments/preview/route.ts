import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/events/:id/segments/preview - Preview segment count
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { rules } = body

    if (!rules) {
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

function buildWhereClause(rules: any): any {
  if (!rules.and || rules.and.length === 0) return {}

  const conditions: any[] = []

  for (const rule of rules.and) {
    const { field, operator, value } = rule

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
