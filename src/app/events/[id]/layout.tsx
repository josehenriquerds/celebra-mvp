import { EventLayoutClient } from './event-layout-client'

interface EventLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { id: eventId } = await params

  return <EventLayoutClient eventId={eventId}>{children}</EventLayoutClient>
}
