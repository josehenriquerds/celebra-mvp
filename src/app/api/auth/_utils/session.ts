import { NextResponse, type NextRequest } from 'next/server'
import { encode, type JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'
import { authOptions } from '@/auth'
import { logger } from '@/lib/logger'

const DEFAULT_MAX_AGE = authOptions.session?.maxAge ?? 30 * 24 * 60 * 60
const sessionCookieSecureName = '__Secure-next-auth.session-token'
const sessionCookieName = 'next-auth.session-token'

export function resolveSessionCookieName(req: NextRequest) {
  if (req.cookies.get(sessionCookieSecureName)) return sessionCookieSecureName
  if (req.cookies.get(sessionCookieName)) return sessionCookieName

  const secureByDefault =
    process.env.NEXTAUTH_URL?.startsWith('https://') || process.env.NODE_ENV === 'production'
  return secureByDefault ? sessionCookieSecureName : sessionCookieName
}

interface IssueSessionParams {
  req: NextRequest
  user: Record<string, unknown> & { id: string }
  trigger: 'signIn' | 'signUp' | 'update'
}

export async function issueSessionResponse({ req, user, trigger }: IssueSessionParams) {
  const now = Math.floor(Date.now() / 1000)
  let token: JWT = {
    name: (user.name as string | null | undefined) ?? undefined,
    email: (user.email as string | null | undefined) ?? undefined,
    sub: user.id,
    iat: now,
    exp: now + DEFAULT_MAX_AGE,
  }

  if (authOptions.callbacks?.jwt) {
    token = (await authOptions.callbacks.jwt({
      token,
      user,
      trigger,
      account: null,
    })) as JWT
  }

  token.iat ??= now
  token.exp ??= token.iat + DEFAULT_MAX_AGE

  const secret =
    authOptions.secret ?? process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET

  if (!secret) {
    logger.error('Auth session - NEXTAUTH_SECRET is missing')
    throw new Error('Configuração de autenticação inválida.')
  }

  const sessionToken = await encode({
    token,
    secret,
  })

  const expires = new Date((token.exp ?? now + DEFAULT_MAX_AGE) * 1000)

  let session: Session = {
    user: {
      name: (user.name as string | null | undefined) ?? null,
      email: (user.email as string | null | undefined) ?? null,
    },
    expires: expires.toISOString(),
  }

  if (authOptions.callbacks?.session) {
    session = (await authOptions.callbacks.session({
      session,
      token,
      user,
      trigger,
    })) as Session
  }

  const cookieName = resolveSessionCookieName(req)

  const response = NextResponse.json({ session })
  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: cookieName.startsWith('__Secure'),
    path: '/',
    expires,
  })
  response.headers.set('Cache-Control', 'no-store')

  return { response, session }
}
