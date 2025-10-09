import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { isErrorInstance } from '@/lib/errors'
import { normalizePhone, formatDisplayPhone } from '@/lib/phone'
import { assertWithinRateLimit, RateLimitError } from '@/lib/rate-limit'
import { phoneInputSchema } from '@/schemas/auth'
import { assertCsrf, CsrfError } from '@/lib/auth/csrf'

function getClientIp(req: NextRequest) {
  return (
    req.ip ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '0.0.0.0'
  )
}

export async function POST(req: NextRequest) {
  try {
    assertCsrf(req)

    const body = await req.json()
    const { phone } = phoneInputSchema.parse(body)

    const normalizedPhone = normalizePhone(phone)

    const clientIp = getClientIp(req)
    assertWithinRateLimit(`lookup:ip:${clientIp}`)
    assertWithinRateLimit(`lookup:phone:${normalizedPhone}`)

    const host = await prisma.host.findUnique({
      where: { phoneNormalized: normalizedPhone },
      include: {
        events: {
          include: {
            event: {
              select: {
                id: true,
                title: true,
                dateTime: true,
              },
            },
          },
        },
      },
    })

    if (!host) {
      logger.info('Lookup phone - host not found', { phone: normalizedPhone })
      return NextResponse.json({
        exists: false,
        needsPassword: false,
        events: [],
        normalizedPhone: normalizedPhone,
      })
    }

    const events = host.events.map((membership) => ({
      id: membership.eventId,
      title: membership.event.title,
      date: membership.event.dateTime,
      role: membership.role,
    }))

    logger.info('Lookup phone - host found', {
      hostId: host.id,
      phone: normalizedPhone,
      events: events.length,
    })

    return NextResponse.json({
      exists: true,
      needsPassword: !host.passwordHash,
      phone: formatDisplayPhone(host.phone ?? normalizedPhone),
      events,
      normalizedPhone,
    })
  } catch (error) {
    if (isErrorInstance(error, CsrfError)) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    if (isErrorInstance(error, RateLimitError)) {
      const response = NextResponse.json({ error: error.message }, { status: error.status })
      if (error.retryAfter) {
        response.headers.set('Retry-After', String(error.retryAfter))
      }
      return response
    }

    if (isErrorInstance(error, ZodError)) {
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: error.flatten(),
        },
        { status: 422 }
      )
    }

    if (error instanceof Error && error.message === 'Telefone inválido') {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }

    logger.error('Lookup phone - unexpected error', { error })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
