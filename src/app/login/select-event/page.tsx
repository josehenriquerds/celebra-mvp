'use client'

import { Loader2, Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getCsrfToken, useSession } from 'next-auth/react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import { LoginShell } from '../_components/LoginShell'

interface SelectableEvent {
  id: string
  title: string
  date: string | null
  role: string
}

function SelectEventPageFallback() {
  return (
    <LoginShell
      title="Carregando eventos"
      description="Estamos preparando sua lista de eventos."
    >
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    </LoginShell>
  )
}

export default function SelectEventPage() {
  return (
    <Suspense fallback={<SelectEventPageFallback />}>
      <SelectEventPageContent />
    </Suspense>
  )
}

function SelectEventPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [csrfToken, setCsrfToken] = useState<string>()
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    getCsrfToken().then((token) => setCsrfToken(token ?? undefined))
  }, [])

  const events = useMemo<SelectableEvent[]>(() => {
    return (session?.roles ?? []).map((role) => ({
      id: role.eventId,
      title: role.eventTitle,
      date: role.eventDate ?? null,
      role: role.role,
    }))
  }, [session?.roles])

  const filteredEvents = useMemo(() => {
    if (!search) return events
    const term = search.toLowerCase()
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(term) ||
        (event.date && formatDate(event.date).toLowerCase().includes(term))
    )
  }, [events, search])

  const handleSelectEvent = async (eventId: string) => {
    if (!csrfToken) return
    setServerError(null)
    setLoadingEventId(eventId)

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
        throw new Error(data?.error ?? 'Não foi possível selecionar o evento.')
      }

      const nextPath = searchParams.get('next')
      const target =
        nextPath && nextPath.startsWith('/events/')
          ? nextPath.replace(/\/events\/[^/]+/, `/events/${eventId}`)
          : `/events/${eventId}`

      router.replace(target)
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Erro inesperado. Tente novamente.')
      setLoadingEventId(null)
    }
  }

  if (status === 'loading') {
    return (
      <LoginShell
        title="Carregando eventos"
        description="Estamos preparando sua lista de eventos."
      >
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </LoginShell>
    )
  }

  if (events.length === 0) {
    return (
      <LoginShell
        title="Nenhum evento disponível"
        description="Solicite ao time da Celebre para associar você aos eventos."
      >
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={() => router.replace('/login')}
        >
          Voltar para login
        </Button>
      </LoginShell>
    )
  }

  return (
    <LoginShell
      title="Selecione o evento"
      description="Escolha qual evento deseja gerenciar agora. Você poderá trocar posteriormente."
    >
      <div className="space-y-6">
        <div className="relative">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou data"
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>

        {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
        {searchParams.get('warning') ? (
          <p className="text-sm text-amber-600">{searchParams.get('warning')}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer rounded-2xl border border-transparent bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-elevation-2"
            >
              <CardHeader>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <CardDescription>
                  {event.date ? formatDate(event.date, 'long') : 'Data a definir'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Papel: {event.role}
                </span>
                <Button
                  size="sm"
                  className="rounded-xl"
                  onClick={() => handleSelectEvent(event.id)}
                  disabled={!!loadingEventId && loadingEventId !== event.id}
                >
                  {loadingEventId === event.id ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : null}
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum evento encontrado para a busca realizada.
          </p>
        ) : null}
      </div>
    </LoginShell>
  )
}
