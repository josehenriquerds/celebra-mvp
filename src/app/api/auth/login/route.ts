import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { authOptions } from '@/auth'
import { normalizePhone } from '@/lib/phone'
import {
  assertWithinRateLimit,
  RateLimitError,
  registerAuthFailure,
  getLockoutState,
  LockoutError,
} from '@/lib/rate-limit'
import { loginSchema } from '@/schemas/auth'
import { assertCsrf, CsrfError } from '@/lib/auth/csrf'
import { logger } from '@/lib/logger'
import { CredentialsAuthError, isErrorInstance } from '@/lib/errors'
import { issueSessionResponse } from '@/app/api/auth/_utils/session'

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
    const payload = loginSchema.parse(body)

    const clientIp = getClientIp(req)
    assertWithinRateLimit(`login:ip:${clientIp}`)

    const isPhoneLogin = 'phone' in payload
    const normalizedPhone = isPhoneLogin ? normalizePhone(payload.phone) : null
    const normalizedEmail = !isPhoneLogin ? payload.email.toLowerCase() : null
    const identifier = normalizedPhone ?? normalizedEmail ?? ''

    assertWithinRateLimit(
      isPhoneLogin ? `login:phone:${normalizedPhone}` : `login:email:${normalizedEmail}`
    )

    const lockout = getLockoutState(`auth:${identifier}`)
    if (lockout.blocked) {
      throw new LockoutError(
        'Muitas tentativas inválidas. Tente novamente mais tarde.',
        lockout.retryAfter
      )
    }

    const credentialsProvider = authOptions.providers.find(
      (provider) => provider.id === 'credentials'
    )

    if (!credentialsProvider || credentialsProvider.type !== 'credentials') {
      logger.error('Login - credentials provider missing')
      return NextResponse.json(
        { error: 'Configuração de autenticação inválida.' },
        { status: 500 }
      )
    }

    let user
    try {
      user = await credentialsProvider.authorize?.({
        identifier,
        password: payload.password,
      })
    } catch (error) {
      if (isErrorInstance(error, CredentialsAuthError)) {
        registerAuthFailure(`auth:${identifier}`)
      }
      throw error
    }

    if (!user) {
      registerAuthFailure(`auth:${identifier}`)
      throw new CredentialsAuthError('Credenciais inválidas')
    }

    let issued
    try {
      issued = await issueSessionResponse({
        req,
        user: user as Record<string, unknown> & { id: string },
        trigger: 'signIn',
      })
    } catch (error) {
      logger.error('Login - session issuance failed', { error })
      return NextResponse.json(
        { error: 'Configuração de autenticação inválida.' },
        { status: 500 }
      )
    }

    logger.info('Login successful', {
      hostId: (issued.session as any)?.hostId,
      currentEventId: (issued.session as any)?.currentEventId,
    })

    return issued.response
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

    if (isErrorInstance(error, LockoutError)) {
      const response = NextResponse.json({ error: error.message }, { status: error.status })
      if (error.retryAfter) {
        response.headers.set('Retry-After', String(error.retryAfter))
      }
      return response
    }

    if (isErrorInstance(error, CredentialsAuthError)) {
      logger.warn('Login failed - invalid credentials', { reason: error.message })
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
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

    logger.error('Login - unexpected error', { error })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
