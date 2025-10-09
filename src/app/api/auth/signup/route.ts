import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { assertCsrf, CsrfError } from '@/lib/auth/csrf'
import { normalizePhone } from '@/lib/phone'
import { hashPassword } from '@/lib/auth/password'
import {
  assertWithinRateLimit,
  RateLimitError,
} from '@/lib/rate-limit'
import { signupSchema } from '@/schemas/auth'
import { issueSessionResponse } from '@/app/api/auth/_utils/session'
import { authOptions } from '@/auth'
import { logger } from '@/lib/logger'
import { CredentialsAuthError, isErrorInstance } from '@/lib/errors'
import { ZodError } from 'zod'

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
    const payload = signupSchema.parse(body)

    const clientIp = getClientIp(req)
    const normalizedPhone = normalizePhone(payload.phone)
    const normalizedEmail = payload.email.toLowerCase()

    assertWithinRateLimit(`signup:ip:${clientIp}`)
    assertWithinRateLimit(`signup:phone:${normalizedPhone}`)
    assertWithinRateLimit(`signup:email:${normalizedEmail}`)

    const [existingPhone, existingEmail] = await Promise.all([
      prisma.host.findUnique({ where: { phoneNormalized: normalizedPhone } }),
      prisma.host.findFirst({ where: { email: normalizedEmail } }),
    ])

    if (existingPhone) {
      return NextResponse.json(
        { code: 'phone_exists', error: 'Telefone já cadastrado.' },
        { status: 409 }
      )
    }

    if (existingEmail) {
      return NextResponse.json(
        { code: 'email_exists', error: 'E-mail já cadastrado.' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(payload.password)

    const host = await prisma.host.create({
      data: {
        name: payload.name,
        phone: payload.phone,
        phoneNormalized: normalizedPhone,
        email: normalizedEmail,
        passwordHash,
      },
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

    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === 'credentials'
    )

    if (!credentialsProvider || credentialsProvider.type !== 'credentials') {
      logger.error('Signup - credentials provider missing')
      return NextResponse.json(
        { error: 'Configuração de autenticação inválida.' },
        { status: 500 }
      )
    }

    const user = await credentialsProvider.authorize?.({
      identifier: normalizedPhone,
      password: payload.password,
    })

    if (!user) {
      throw new CredentialsAuthError('Não foi possível iniciar a sessão após o cadastro.')
    }

    const { response, session } = await issueSessionResponse({
      req,
      user: user as Record<string, unknown> & { id: string },
      trigger: 'signUp',
    })

    logger.info('Signup successful', {
      hostId: session.hostId,
      email: normalizedEmail,
    })

    return response
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

    if (isErrorInstance(error, CredentialsAuthError)) {
      return NextResponse.json({ error: error.message }, { status: error.status ?? 400 })
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

    logger.error('Signup - unexpected error', { error })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
