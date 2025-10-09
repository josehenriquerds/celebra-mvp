import { describe, expect, it, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as lookupPhone } from '@/app/api/auth/lookup-phone/route'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    host: {
      findUnique: vi.fn(),
    },
  },
}))

const { prisma } = await import('@/lib/prisma')

function createRequest(body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(new URL('http://localhost/api/auth/lookup-phone'), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      cookie: `next-auth.csrf-token=${headers['x-csrf-token']}|hash`,
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/auth/lookup-phone', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns not found when host does not exist', async () => {
    vi.mocked(prisma.host.findUnique).mockResolvedValue(null)
    const req = createRequest(
      { phone: '+55 27 88888-0000' },
      { 'x-csrf-token': 'csrf-test-token' }
    )
    const res = await lookupPhone(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.exists).toBe(false)
  })

  it('returns host metadata when found', async () => {
    vi.mocked(prisma.host.findUnique).mockResolvedValue({
      id: 'host_1',
      passwordHash: 'hash',
      phone: '+5527999990000',
      events: [
        {
          eventId: 'event_1',
          role: 'OWNER',
          event: {
            id: 'event_1',
            title: 'Casamento Teste',
            dateTime: new Date('2025-08-15T17:00:00Z'),
          },
        },
      ],
    } as any)

    const req = createRequest(
      { phone: '+55 27 99999-0000' },
      { 'x-csrf-token': 'csrf-token' }
    )
    const res = await lookupPhone(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.exists).toBe(true)
    expect(json.events).toHaveLength(1)
    expect(json.events[0].id).toBe('event_1')
  })
})
