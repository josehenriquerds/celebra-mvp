import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { isErrorInstance } from '@/lib/errors'
import { normalizePhone } from '@/lib/phone'
import { assertWithinRateLimit, RateLimitError } from '@/lib/rate-limit'
import { hashPassword, passwordMeetsRequirements } from '@/lib/auth/password'
import { setPasswordSchema } from '@/schemas/auth'
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
    const { phone, password } = setPasswordSchema.parse(body)

    if (!passwordMeetsRequirements(password)) {
      return NextResponse.json(
        { error: 'A senha não atende aos requisitos mínimos.' },
        { status: 422 }
      )
    }

    const normalizedPhone = normalizePhone(phone)
    const clientIp = getClientIp(req)

    assertWithinRateLimit(`set-password:ip:${clientIp}`)
    assertWithinRateLimit(`set-password:phone:${normalizedPhone}`)

    const host = await prisma.host.findUnique({
      where: { phoneNormalized: normalizedPhone },
    })

    if (!host) {
      logger.warn('Set password - host not found', { phone: normalizedPhone })
      return NextResponse.json({ error: 'Anfitrião não encontrado' }, { status: 404 })
    }

    if (host.passwordHash) {
      logger.warn('Set password - host already has password', { hostId: host.id })
      return NextResponse.json(
        { error: 'Senha já definida. Utilize o fluxo de login.' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    await prisma.host.update({
      where: { id: host.id },
      data: {
        passwordHash,
        phoneVerifiedAt: new Date(),
      },
    })

    logger.info('Set password - password created', { hostId: host.id })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (isErrorInstance(error, CsrfError)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
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
        { error: 'Dados inválidos', details: error.flatten() },
        { status: 422 }
      )
    }

    if (error instanceof Error && error.message === 'Telefone inválido') {
      return NextResponse.json({ error: error.message }, { status: 422 })
    }

    logger.error('Set password - unexpected error', { error })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
