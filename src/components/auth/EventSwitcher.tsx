'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getCsrfToken, useSession } from 'next-auth/react'
import { Loader2, ChevronsUpDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface EventSwitcherProps {
  className?: string
}

export function EventSwitcher({ className }: EventSwitcherProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()
  const [csrfToken, setCsrfToken] = useState<string>()
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token ?? undefined))
  }, [])

  const events = useMemo(() => session?.roles ?? [], [session?.roles])
  const currentEventId = session?.currentEventId
  const currentEvent = events.find((event) => event.eventId === currentEventId) ?? events[0]

  const handleSelect = async (eventId: string) => {
    if (eventId === currentEventId || !csrfToken) return

    setLoadingEventId(eventId)
    setError(null)

    try {
      const response = await fetch('/api/auth/select-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({ eventId }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.error ?? 'Não foi possível alterar o evento.')
      }

      const targetPath =
        pathname?.startsWith('/events/') ? pathname.replace(/\/events\/[^/]+/, `/events/${eventId}`) : `/events/${eventId}`

      router.replace(targetPath)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setLoadingEventId(null)
    }
  }

  if (!currentEvent) {
    return null
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="flex w-full items-center justify-between rounded-xl border-muted bg-white/80 px-4 py-2 text-left shadow-sm transition hover:bg-white"
          >
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{currentEvent.eventTitle}</span>
              <span className="text-xs text-muted-foreground">
                {currentEvent.eventDate ? formatDate(currentEvent.eventDate, 'long') : 'Data a definir'}
              </span>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 rounded-2xl bg-white/95 p-2 shadow-elevation-3">
          {events.map((event) => (
            <DropdownMenuItem
              key={event.eventId}
              onClick={() => handleSelect(event.eventId)}
              className="flex cursor-pointer items-center justify-between rounded-xl text-sm"
            >
              <span>
                <span className="block font-medium text-foreground">{event.eventTitle}</span>
                <span className="block text-xs text-muted-foreground">
                  {event.eventDate ? formatDate(event.eventDate, 'long') : 'Data a definir'} · {event.role}
                </span>
              </span>
              {loadingEventId === event.eventId ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : currentEventId === event.eventId ? (
                <Check className="h-4 w-4 text-primary" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
