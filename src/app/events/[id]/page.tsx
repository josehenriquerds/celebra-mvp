'use client'

import { Search, Users, CheckCircle, Calendar as CalendarIcon, Clock } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { DonutProgress } from '@/components/dashboard/donut-progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEventSummary } from '@/hooks'
import { formatCurrency, formatDate, formatTime, getDaysUntil, getSLABadgeColor } from '@/lib/utils'

const SLA_BADGE_CLASSES: Record<'success' | 'warning' | 'danger', string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
}

interface WindowWithCover extends Window {
  __cele_cover_url__?: string
}

export default function EventDashboard() {
  const { id } = useParams()
  const eventId = id as string
  const [coverVisible, setCoverVisible] = useState(true)

  // Use backend API via TanStack Query
  const { data, isLoading: loading, error } = useEventSummary(eventId)

  if (loading) {
    return (
      <div className="grid h-dvh place-items-center bg-[#FAF7F4]">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Carregando evento…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="grid h-dvh place-items-center bg-[#FAF7F4]">
        <div className="text-center">
          <p className="text-muted-foreground">Evento não encontrado</p>
          <Link href="/">
            <Button variant="outline" className="mt-4">
              Voltar ao início
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // datas e métricas
  const daysUntil = getDaysUntil(data.dateTime)
  const rsvpTotal = data.rsvps.sim + data.rsvps.nao + data.rsvps.talvez
  const responseRate =
    data.stats.totalGuests > 0 ? Math.round((rsvpTotal / data.stats.totalGuests) * 100) : 0
  const firstHost = data.hosts?.[0] ?? 'Anfitrião(ã)'

  // calendário (apenas cabeçalho visual)
  const eventDate = new Date(data.dateTime)
  const monthLabel = eventDate.toLocaleString('pt-BR', { month: 'long' })
  const yearLabel = eventDate.getFullYear()

  // imagem de capa (substitua pela sua – aqui tem fallback)
  const coverUrl =
    (typeof window !== 'undefined' && (window as WindowWithCover).__cele_cover_url__) ||
    '/referencias/illustrations/casamento.png'


  return (
    <div className="min-h-dvh w-full bg-[#FAF7F4]">
      {/* GRID 2 COLUNAS: ESQ = CINZA / DIR = BRANCO */}
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        {/* COLUNA ESQUERDA — FUNDO “CINZA” (off-white) */}
        <section className="bg-[#FAF7F4] px-4 pb-8 pt-4 md:px-6 md:pt-6">
          {/* SEARCH BAR no topo (igual ref) */}
          <div className="mx-auto mb-4 max-w-[720px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search…"
                className="w-full rounded-2xl border border-transparent bg-white/90 px-10 py-3 text-sm shadow-elevation-1 outline-none placeholder:text-muted-foreground focus:border-pastel-rose-300 focus:ring-2 focus:ring-pastel-rose-200"
              />
            </div>
          </div>

          {/* CARD DE CAPA COM IMAGEM + SOBREPOSIÇÃO ROSE */}
          <div className="mx-auto grid max-w-[720px] gap-4">
            <div className="relative h-[220px] overflow-hidden rounded-3xl shadow-elevation-2 md:h-[260px]">
              {coverVisible ? (
                <Image
                  src={coverUrl}
                  alt="Capa do evento"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 720px"
                  onError={() => setCoverVisible(false)}
                  unoptimized
                />
              ) : null}
              {/* overlay rose com título, igual à ref */}
              <div className="pointer-events-none absolute inset-x-4 bottom-4">
                <div className="inline-flex max-w-full items-center rounded-2xl bg-pastel-rose-300/90 px-5 py-3">
                  <p className="text-pastel-rose-900 truncate text-sm font-semibold">
                    {data.title} • {formatDate(data.dateTime, 'long')}
                  </p>
                </div>
              </div>
            </div>
            <Card className="rounded-2xl border-none bg-rose-200 shadow-elevation-2">
              {' '}
              <CardContent className="flex items-center justify-between p-6">
                {' '}
                <div>
                  {' '}
                  <p className="text-md text-peach-50">Que bom te ver novamente</p>{' '}
                  <h2 className="text-4xl font-bold text-rose-50">Olá, {firstHost}</h2>{' '}
                  <p className="mt-1 text-sm text-sky-50">
                    {' '}
                    {data.title} — {formatDate(data.dateTime, 'long')} às{' '}
                    {formatTime(data.dateTime)} • {data.venueName}{' '}
                  </p>{' '}
                </div>{' '}
                
              </CardContent>{' '}
            </Card>
            {/* FAIXA DE CARDS MENORES (estilo “Jams & Preserves”) */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { k: 'Convidados', v: `${data.stats.totalGuests}`, tint: 'mint' },
                { k: 'Confirmados', v: `${data.rsvps.sim}`, tint: 'sky' },
                { k: 'Resposta', v: `${responseRate}%`, tint: 'lavender' },
                { k: 'Orçamento', v: formatCurrency(data.budget.spent), tint: 'rose' },
              ].map((c) => (
                <Card
                  key={c.k}
                  className={`rounded-2xl border-none shadow-elevation-1 ${
                    c.tint === 'rose'
                      ? 'bg-pastel-rose-50'
                      : c.tint === 'lavender'
                        ? 'bg-pastel-lavender-50'
                        : c.tint === 'sky'
                          ? 'bg-pastel-sky-50'
                          : 'bg-pastel-mint-50'
                  }`}
                >
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{c.k}</p>
                    <p className="text-xl font-semibold">{c.v}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CALENDÁRIO compact (título + chips de dias) */}
            <Card className="rounded-3xl border-none bg-white shadow-elevation-2">
              <CardHeader className="pb-0">
                <CardTitle className="capitalize">
                  {monthLabel} {yearLabel}
                </CardTitle>
                <CardDescription>
                  {data.venueName} • {data.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>
                {/* Apenas linha de chips para lembrar a estética da ref */}
                <div className="mt-2 grid grid-cols-7 gap-2">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const isEvent = i === 9
                    return (
                      <div
                        key={i}
                        className={[
                          'rounded-xl px-0.5 py-3 text-center text-sm',
                          isEvent
                            ? 'bg-pastel-rose-100 ring-2 ring-pastel-rose-300'
                            : 'bg-[#FAF7F4]',
                        ].join(' ')}
                      >
                        {i + 1}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* COLUNA DIREITA — FUNDO BRANCO (agenda & cards) */}
        <aside className="bg-white px-4 pb-8 pt-4 md:px-6 md:pt-6 lg:rounded-tl-[56px] ">
          {/* Cabeçalho “Today’s Schedule” + avatar/mascote */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Today’s Schedule</h2>
              <p className="text-sm text-muted-foreground">Quais será sua proxima tarefa?</p>
            </div>
            <div className="text-pastel-rose-900 grid size-10 place-items-center rounded-full bg-pastel-rose-200">
              {firstHost.slice(0, 1)}
            </div>
          </div>

          {/* Lista de tarefas no estilo “chips” grandes */}
          <div className="space-y-3">
            {data.nextTasks.slice(0, 3).map((t, idx) => {
              const slaStatus = t.dueAt ? getSLABadgeColor(t.dueAt) : null
              const statusLabel =
                t.status === 'aberta'
                  ? 'Aberta'
                  : t.status === 'em_andamento'
                    ? 'Em andamento'
                    : 'Concluída'

              return (
                <div
                  key={t.id}
                  className={[
                    'rounded-2xl p-4 shadow-elevation-1',
                    idx === 0
                      ? 'bg-pastel-rose-200/60'
                      : idx === 1
                        ? 'bg-pastel-sky-100'
                        : 'bg-pastel-lavender-100',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t.title}</p>
                    {slaStatus && (
                      <Badge variant="outline" className={`ml-2 text-xs ${SLA_BADGE_CLASSES[slaStatus]}`}>
                        {statusLabel}
                      </Badge>
                    )}
                  </div>
                  {t.dueAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <Clock className="mr-1 inline size-3" />
                      {formatDate(t.dueAt)} ��s {formatTime(t.dueAt)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {/* Card “Product / Revenue” (adaptado p/ Progresso do Evento) */}
          <Card className="mt-4 rounded-3xl border-none bg-[#FAF7F4] shadow-elevation-2">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">Progresso do Evento</p>
                <div className="mt-2 flex gap-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">Growth</p>
                    <p className="font-semibold">
                      {Math.max(0, Math.round(data.progress * 100 - 10))}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly</p>
                    <p className="font-semibold">24.6%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Delay</p>
                    <p className="font-semibold">5.41%</p>
                  </div>
                </div>
              </div>
              <DonutProgress
                percentage={Math.min(99, data.progress * 100)}
                size={90}
                strokeWidth={8}
              />
            </CardContent>
          </Card>

          {/* Bloco “Próximos passos” estilo cartões */}
          <div className="mt-4 grid grid-cols-1 gap-3">
            <Card className="rounded-3xl border-none shadow-elevation-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Ações rápidas</CardTitle>
                <CardDescription>Gerencie itens do evento</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3 pt-0">
                <QuickChip
                  href={`/events/${eventId}/guests`}
                  label="Convidados"
                  icon={<Users className="size-4" />}
                />
                <QuickChip
                  href={`/events/${eventId}/tasks`}
                  label="Tarefas"
                  icon={<CheckCircle className="size-4" />}
                />
                <QuickChip
                  href={`/events/${eventId}/timeline`}
                  label="Timeline"
                  icon={<CalendarIcon className="size-4" />}
                />
              </CardContent>
            </Card>

            {/* “Sticky” card em tom rose, como canto inferior na ref */}
            <div className="rounded-3xl bg-pastel-rose-200/80 p-5 shadow-elevation-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pastel-rose-900 text-sm font-semibold">
                    Evento em {daysUntil} dias
                  </p>
                  <p className="text-pastel-rose-900/80 text-xs">
                    {data.title} — {formatDate(data.dateTime)} · {formatTime(data.dateTime)}
                  </p>
                </div>
                <Link href={`/events/${eventId}/tasks`}>
                  <Button
                    size="sm"
                    className="bg-pastel-rose-600 text-white hover:bg-pastel-rose-700"
                  >
                    Ver tarefas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

/* -------------------- auxiliares -------------------- */

function QuickChip({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="group">
      <div className="flex items-center gap-2 rounded-xl bg-[#FAF7F4] px-3 py-2 text-sm transition hover:shadow-elevation-1">
        <span className="grid size-7 place-items-center rounded-lg bg-white">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  )
}
