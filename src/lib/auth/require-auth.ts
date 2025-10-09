import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requireEventAccess(eventId: string) {
  const session = await requireAuth()

  const allowedEvents = session.roles?.map((role) => role.eventId) ?? []
  if (!allowedEvents.includes(eventId)) {
    redirect('/login/select-event')
  }

  if (session.currentEventId && session.currentEventId !== eventId) {
    redirect(`/login/select-event?next=/events/${eventId}`)
  }

  return session
}
