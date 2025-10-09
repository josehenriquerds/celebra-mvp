import { NextResponse, type NextRequest } from 'next/server'
import { ZodError } from 'zod'
import { getToken, encode, type JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'
import { auth, authOptions } from '@/auth'
import { selectEventSchema } from '@/schemas/auth'
import { assertCsrf, CsrfError } from '@/lib/auth/csrf'
import { logger } from '@/lib/logger'
import { isErrorInstance } from '@/lib/errors'

const DEFAULT_MAX_AGE = authOptions.session?.maxAge ?? 30 * 24 * 60 * 60
const sessionCookieSecureName = '__Secure-next-auth.session-token'
const sessionCookieName = 'next-auth.session-token'

function resolveSessionCookieName(req: NextRequest) {
  if (req.cookies.get(sessionCookieSecureName)) return sessionCookieSecureName
  if (req.cookies.get(sessionCookieName)) return sessionCookieName

  const secureByDefault =
    process.env.NEXTAUTH_URL?.startsWith('https://') || process.env.NODE_ENV === 'production'
  return secureByDefault ? sessionCookieSecureName : sessionCookieName
}

export async function POST(req: NextRequest) {
  try {
    assertCsrf(req)

    const body = await req.json()
    const { eventId } = selectEventSchema.parse(body)

    const session = await auth()

    if (!session?.hostId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const hasAccess = session.roles?.some((role) => role.eventId === eventId)
    if (!hasAccess) {
      return NextResponse.json({ error: 'Sem permissão para este evento' }, { status: 403 })
    }

    const secret =
      authOptions.secret ??
      process.env.NEXTAUTH_SECRET ??
      process.env.AUTH_SECRET

    if (!secret) {
      logger.error('Select event - NEXTAUTH_SECRET missing')
      return NextResponse.json({ error: 'Configuração inválida' }, { status: 500 })
    }

    const token = (await getToken({
      req,
      secret,
    })) as JWT | null

    if (!token) {
      return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 })
    }

    token.currentEventId = eventId

    const now = Math.floor(Date.now() / 1000)
    token.iat ??= now
    token.exp ??= token.iat + DEFAULT_MAX_AGE

    const encoded = await encode({ token, secret })
    const expires = new Date((token.exp ?? now + DEFAULT_MAX_AGE) * 1000)

    let nextSession: Session = {
      user: {
        name: token.name ?? null,
        email: token.email ?? null,
      },
      expires: expires.toISOString(),
    }

    if (authOptions.callbacks?.session) {
      nextSession = (await authOptions.callbacks.session({
        session: nextSession,
        token,
        trigger: 'update',
      })) as Session
    }

    const cookieName = resolveSessionCookieName(req)
    const response = NextResponse.json({
      success: true,
      currentEventId: eventId,
      session: nextSession,
    })
    response.cookies.set(cookieName, encoded, {
      httpOnly: true,
      sameSite: 'lax',
      secure: cookieName.startsWith('__Secure'),
      path: '/',
      expires,
    })
    response.headers.set('Cache-Control', 'no-store')

    logger.info('Select event - current event updated', {
      hostId: session.hostId,
      currentEventId: eventId,
    })

    return response
  } catch (error) {
    if (isErrorInstance(error, CsrfError)) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (isErrorInstance(error, ZodError)) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.flatten() },
        { status: 422 }
      )
    }

    logger.error('Select event - unexpected error', { error })
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
