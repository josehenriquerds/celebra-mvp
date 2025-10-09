import type { Session } from 'next-auth'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export function redirectAfterLogin(router: AppRouterInstance, session: Session | null | undefined) {
  if (!session) {
    router.replace('/login')
    return
  }

  const roles = session.roles ?? []

  if (session.currentEventId) {
    router.replace(`/events/${session.currentEventId}`)
    return
  }

  if (roles.length === 1 && roles[0]?.eventId) {
    router.replace(`/events/${roles[0].eventId}`)
    return
  }

  router.replace('/login/select-event')
}
