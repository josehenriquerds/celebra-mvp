import { RsvpStatus, ContactRelation } from '@prisma/client'

export interface SegmentRule {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'gt' | 'lt' | 'in' | 'not_in'
  value: string | number | boolean | string[]
}

export interface SegmentDefinition {
  id: string
  name: string
  rules: SegmentRule[]
  combineWith: 'AND' | 'OR'
}

export interface Guest {
  id: string
  rsvp: RsvpStatus
  seats: number
  children: number
  transportNeeded: boolean
  optOut: boolean
  contact: {
    fullName: string
    phone: string
    email?: string
    relation: ContactRelation
    isVip: boolean
  }
}

export function evaluateRule(guest: Guest, rule: SegmentRule): boolean {
  const value = getFieldValue(guest, rule.field)

  switch (rule.operator) {
    case 'equals':
      return value === rule.value
    case 'not_equals':
      return value !== rule.value
    case 'contains':
      if (typeof value === 'string' && typeof rule.value === 'string') {
        return value.toLowerCase().includes(rule.value.toLowerCase())
      }
      return false
    case 'gt':
      if (typeof value === 'number' && typeof rule.value === 'number') {
        return value > rule.value
      }
      return false
    case 'lt':
      if (typeof value === 'number' && typeof rule.value === 'number') {
        return value < rule.value
      }
      return false
    case 'in':
      if (Array.isArray(rule.value)) {
        return rule.value.includes(value as string)
      }
      return false
    case 'not_in':
      if (Array.isArray(rule.value)) {
        return !rule.value.includes(value as string)
      }
      return false
    default:
      return false
  }
}

function getFieldValue(guest: Guest, field: string): string | number | boolean | undefined {
  const fieldMap: Record<string, () => string | number | boolean | undefined> = {
    rsvp: () => guest.rsvp,
    'contact.fullName': () => guest.contact.fullName,
    'contact.phone': () => guest.contact.phone,
    'contact.email': () => guest.contact.email,
    'contact.relation': () => guest.contact.relation,
    'contact.isVip': () => guest.contact.isVip,
    seats: () => guest.seats,
    children: () => guest.children,
    transportNeeded: () => guest.transportNeeded,
    optOut: () => guest.optOut,
  }

  return fieldMap[field]?.()
}

export function matchesSegment(guest: Guest, segment: SegmentDefinition): boolean {
  if (segment.rules.length === 0) return true

  const results = segment.rules.map((rule) => evaluateRule(guest, rule))

  if (segment.combineWith === 'AND') {
    return results.every((r) => r)
  } else {
    return results.some((r) => r)
  }
}

export function filterGuestsBySegment(guests: Guest[], segment: SegmentDefinition): Guest[] {
  return guests.filter((guest) => matchesSegment(guest, segment))
}

export function countSegmentMatches(guests: Guest[], segment: SegmentDefinition): number {
  return filterGuestsBySegment(guests, segment).length
}
