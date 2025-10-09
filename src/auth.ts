import { randomUUID } from 'crypto'
import NextAuth, { getServerSession, type AuthOptions } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { verifyPassword } from '@/lib/auth/password'
import { CredentialsAuthError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { normalizePhone } from '@/lib/phone'
import { prisma } from '@/lib/prisma'
import { clearAuthFailures } from '@/lib/rate-limit'

export interface HostSessionInfo {
  eventId: string
  role: string
  eventTitle: string
  eventDate: string
}

export const authOptions: AuthOptions = {
  cookies: {},
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Telefone ou e-mail', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      authorize: async (credentials) => {
        const identifierRaw = credentials?.identifier?.trim()
        const password = credentials?.password

        if (!identifierRaw || !password) {
          throw new CredentialsAuthError('Informe telefone/e-mail e senha')
        }

        const isEmail = identifierRaw.includes('@')
        const normalizedEmail = isEmail ? identifierRaw.toLowerCase() : null
        const normalizedPhone = isEmail ? null : normalizePhone(identifierRaw)
        const rateLimitKey = normalizedPhone ?? normalizedEmail ?? identifierRaw

        const host = await (isEmail
          ? prisma.host.findFirst({
              where: { email: normalizedEmail ?? undefined },
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
          : prisma.host.findUnique({
              where: { phoneNormalized: normalizedPhone ?? undefined },
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
            }))

        if (!host || !host.passwordHash) {
          throw new CredentialsAuthError('Credenciais inválidas')
        }

        const passwordValid = await verifyPassword(password, host.passwordHash)
        if (!passwordValid) {
          throw new CredentialsAuthError('Credenciais inválidas')
        }

        await prisma.host.update({
          where: { id: host.id },
          data: {
            lastLoginAt: new Date(),
          },
        })

        clearAuthFailures(`auth:${rateLimitKey}`)

        const roles: HostSessionInfo[] = host.events.map((membership) => ({
          eventId: membership.eventId,
          role: membership.role,
          eventTitle: membership.event.title,
          eventDate: membership.event.dateTime.toISOString(),
        }))

        logger.info('Host authenticated', {
          hostId: host.id,
          identifier: isEmail ? normalizedEmail : normalizedPhone,
          roles: roles.length,
        })

        return {
          id: host.id,
          name: host.name,
          email: host.email,
          phone: host.phone,
          phoneNormalized: host.phoneNormalized ?? normalizedPhone ?? null,
          roles,
          currentEventId: roles[0]?.eventId ?? null,
          phoneVerifiedAt: host.phoneVerifiedAt?.toISOString() ?? null,
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.hostId = user.id
        token.name = user.name
        token.email = user.email
        token.phone = (user as any).phone
        token.phoneNormalized = (user as any).phoneNormalized
        token.roles = (user as any).roles ?? []
        token.currentEventId = (user as any).currentEventId ?? token.currentEventId
        token.phoneVerifiedAt = (user as any).phoneVerifiedAt ?? null
        token.accessToken = randomUUID()
      }

      if (!token.currentEventId && Array.isArray(token.roles) && token.roles.length > 0) {
        token.currentEventId = token.roles[0].eventId
      }

      return token
    },
    session: async ({ session, token }) => {
      if (!session.user) {
        session.user = {}
      }

      session.user.id = token.hostId as string
      session.user.name = token.name as string | undefined
      session.user.email = token.email as string | undefined
      session.user.phone = token.phone as string | undefined
      session.user.phoneNormalized = token.phoneNormalized as string | undefined

      session.hostId = token.hostId as string
      session.currentEventId = token.currentEventId as string | undefined
      session.roles = (token.roles as HostSessionInfo[]) ?? []
      session.phoneVerifiedAt = token.phoneVerifiedAt as string | null | undefined
      session.accessToken = token.accessToken as string | undefined

      return session
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    signOut({ session }) {
      logger.info('Host signed out', { hostId: session?.hostId })
    },
  },
}

const authHandler = NextAuth(authOptions)

export const authHandlers = {
  GET: authHandler,
  POST: authHandler,
}

export function auth() {
  return getServerSession(authOptions)
}

export { signIn, signOut } from 'next-auth/react'
