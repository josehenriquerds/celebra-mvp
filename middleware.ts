import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

const EVENT_PAGE_REGEX = /^\/events\/([^/]+)/
const EVENT_API_REGEX = /^\/api\/events\/([^/]+)/

function resolveSecret() {
  return process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Ignore login/auth paths
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  const matchPage = pathname.match(EVENT_PAGE_REGEX)
  const matchApi = pathname.match(EVENT_API_REGEX)

  if (!matchPage && !matchApi) {
    return NextResponse.next()
  }

  const secret = resolveSecret()
  if (!secret) {
    console.error('NEXTAUTH_SECRET missing. Auth middleware cannot run.')
    return NextResponse.next()
  }

  const token = await getToken({ req, secret })

  if (!token?.hostId) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('next', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  const currentEventId = token.currentEventId as string | undefined
  const accessibleEvents = Array.isArray(token.roles)
    ? (token.roles as Array<{ eventId: string }>).map((role) => role.eventId)
    : []

  if (matchPage) {
    const requestedEventId = matchPage[1]

    if (!accessibleEvents.includes(requestedEventId)) {
      const selectUrl = new URL('/login/select-event', req.url)
      selectUrl.searchParams.set('warning', 'Selecione o evento atual.')
      selectUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(selectUrl)
    }

    if (currentEventId && currentEventId !== requestedEventId) {
      const selectUrl = new URL('/login/select-event', req.url)
      selectUrl.searchParams.set('warning', 'Selecione o evento atual.')
      selectUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(selectUrl)
    }

    return NextResponse.next()
  }

  if (matchApi) {
    const requestedEventId = matchApi[1]

    if (!accessibleEvents.includes(requestedEventId)) {
      return NextResponse.json({ error: 'Evento não autorizado' }, { status: 403 })
    }

    if (currentEventId && currentEventId !== requestedEventId) {
      return NextResponse.json(
        { error: 'Selecione o evento atual antes de continuar.' },
        { status: 409 }
      )
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/events/:path*', '/api/events/:path*'],
}
