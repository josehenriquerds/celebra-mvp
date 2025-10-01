'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Home, Calendar as CalendarIcon, Users, CheckCircle, Clock, MapPin, Mail,
  Bookmark, LogOut, Star, TrendingUp, FolderKanban
} from 'lucide-react'
import { DonutProgress } from '@/components/dashboard/donut-progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatTime, getDaysUntil, getSLABadgeColor } from '@/lib/utils'

interface EventSummary {
  id: string
  title: string
  dateTime: string
  venueName: string
  address: string
  hosts: string[]
  rsvps: { sim: number; nao: number; talvez: number; pendente: number }
  budget: { total: number; spent: number; remaining: number; percentSpent: number }
  progress: number
  nextTasks: Array<{ id: string; title: string; dueAt: string | null; status: string; slaHours: number | null }>
  stats: { totalGuests: number; confirmedGuests: number; vipGuests: number; children: number; vendors: number }
}

export default function EventDashboard() {
  const params = useParams()
  const eventId = params.id as string
  const [data, setData] = useState<EventSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEventSummary() {
      try {
        const res = await fetch(`/api/events/${eventId}/summary`)
        const json = await res.json().catch(() => null)
        if (!res.ok || !json || json.error) {
          console.error('Failed to fetch event summary:', json?.error ?? res.statusText)
          setData(null)
          return
        }
        setData(json)
      } catch (error) {
        console.error('Error fetching event summary:', error)
      } finally {
        setLoading(false)
      }
    }
    if (eventId) fetchEventSummary()
  }, [eventId])

  if (loading) {
    return (
      <div className="h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebre-brand mx-auto mb-4"></div>
          <p className="text-celebre-muted">Carregando evento...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-celebre-muted">Evento não encontrado</p>
          <Link href="/"><Button variant="outline" className="mt-4">Voltar ao início</Button></Link>
        </div>
      </div>
    )
  }

  // ====== Helpers para o calendário (mês do evento) ======
  const eventDate = new Date(data.dateTime)
  const monthLabel = eventDate.toLocaleString('pt-BR', { month: 'long' })
  const yearLabel = eventDate.getFullYear()

  function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
  function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0) }

  const monthStart = startOfMonth(eventDate)
  const monthEnd = endOfMonth(eventDate)
  // domingo = 0 … sábado = 6
  const gridStart = new Date(monthStart); gridStart.setDate(monthStart.getDate() - monthStart.getDay())
  const gridEnd = new Date(monthEnd); gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()))

  const days: Array<{ d: Date; inMonth: boolean; isEventDay: boolean }> = []
  for (let dt = new Date(gridStart); dt <= gridEnd; dt.setDate(dt.getDate() + 1)) {
    const cur = new Date(dt)
    days.push({
      d: cur,
      inMonth: cur.getMonth() === eventDate.getMonth(),
      isEventDay:
        cur.getFullYear() === eventDate.getFullYear() &&
        cur.getMonth() === eventDate.getMonth() &&
        cur.getDate() === eventDate.getDate(),
    })
  }

  const daysUntil = getDaysUntil(data.dateTime)
  const rsvpTotal = data.rsvps.sim + data.rsvps.nao + data.rsvps.talvez
  const responseRate = data.stats.totalGuests > 0 ? Math.round((rsvpTotal / data.stats.totalGuests) * 100) : 0
  const firstHost = (data.hosts && data.hosts.length > 0) ? data.hosts[0] : 'Anfitrião(ã)'

  return (
    <div className="h-screen w-full bg-celebre-bg/60 p-4 overflow-hidden">

        {/* ===== CONTEÚDO CENTRAL (sem scroll) ===== */}
        <main className="grid grid-rows-[auto_auto_1fr] gap-4 overflow-hidden">
          {/* Saudações + busca */}
          <div className="grid grid-cols-[1fr_320px] gap-4">
            <Card className="rounded-3xl border-none shadow-sm bg-sky-50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-sky-700/80">Olá, {firstHost}!</p>
                  <h2 className="text-2xl font-semibold text-sky-900">Welcome back 👋</h2>
                  <p className="text-sm text-sky-700/70 mt-1">
                    {data.title} — {formatDate(data.dateTime, 'long')} às {formatTime(data.dateTime)} • {data.venueName}
                  </p>
                </div>
                <div className="hidden md:block">
                  <DonutProgress percentage={data.progress * 100} size={120} strokeWidth={10} label="Progresso" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-indigo-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-indigo-900">Últimos resultados</CardTitle>
                <CardDescription className="text-indigo-700/80">
                  Resumo rápido do evento
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="p-3 rounded-xl bg-white/70">
                    <p className="text-indigo-700/70">Confirmados</p>
                    <p className="text-xl font-semibold text-indigo-900">{data.rsvps.sim}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/70">
                    <p className="text-indigo-700/70">Taxa de resposta</p>
                    <p className="text-xl font-semibold text-indigo-900">{responseRate}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/70">
                    <p className="text-indigo-700/70">Orçamento gasto</p>
                    <p className="text-xl font-semibold text-indigo-900">{formatCurrency(data.budget.spent)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações rápidas pastel */}
          <div className="grid grid-cols-3 gap-4">
            <Link href={`/events/${eventId}/guests`}>
              <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition bg-emerald-50">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white grid place-items-center">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-900">Convidados</p>
                    <p className="text-xs text-emerald-700/70">{data.stats.totalGuests} no total</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/events/${eventId}/tasks`}>
              <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition bg-amber-50">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white grid place-items-center">
                    <CheckCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900">Tarefas</p>
                    <p className="text-xs text-amber-700/70">
                      {data.nextTasks.filter(t => t.status !== 'concluida').length} pendentes
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={`/events/${eventId}/schedule`}>
              <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition bg-cyan-50">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white grid place-items-center">
                    <CalendarIcon className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-medium text-cyan-900">Agenda</p>
                    <p className="text-xs text-cyan-700/70">
                      {daysUntil > 0 ? `${daysUntil} dias restantes` : 'É hoje! 🎉'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Calendário (preenche a área restante) */}
          <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <div>
                <CardTitle className="font-heading">{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)} {yearLabel}</CardTitle>
                <CardDescription>
                  {data.title} • {data.venueName}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4 h-full">
              <div className="grid grid-rows-[auto_1fr] h-full">
                {/* Cabeçalhos dos dias */}
                <div className="grid grid-cols-7 text-center text-xs text-celebre-muted mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="py-1">{d}</div>
                  ))}
                </div>
                {/* Grade dos dias */}
                <div className="grid grid-cols-7 grid-rows-6 gap-2 h-[calc(100%-1.5rem)]">
                  {days.map(({ d, inMonth, isEventDay }) => (
                    <div
                      key={d.toISOString()}
                      className={[
                        'rounded-xl border text-sm px-2 py-2 flex items-start justify-between',
                        inMonth ? 'bg-celebre-bg/40 border-transparent' : 'bg-white/60 border-dashed text-celebre-muted',
                        isEventDay ? 'ring-2 ring-celebre-brand bg-celebre-brand/10' : ''
                      ].join(' ')}
                    >
                      <span className="font-medium">{d.getDate()}</span>
                      {isEventDay && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-celebre-brand/20 text-celebre-brand font-semibold">
                          Evento
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* ===== PAINEL DIREITO (perfil + lembretes) ===== */}
        <aside className="grid grid-rows-[auto_auto_1fr] gap-4 overflow-hidden">
          {/* Perfil */}
          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-celebre-brand/15 grid place-items-center text-celebre-brand font-semibold">
                {firstHost?.slice(0,1) ?? 'A'}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-celebre-ink truncate">{firstHost}</p>
                <p className="text-xs text-celebre-muted truncate">{data.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Resumo rápido */}
          <Card className="rounded-3xl border-none shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Resumo</CardTitle>
              <CardDescription>Indicadores principais</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-celebre-muted">Confirmados</span>
                <span className="font-semibold">{data.rsvps.sim}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-celebre-muted">VIPs</span>
                <span className="font-semibold">{data.stats.vipGuests}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-celebre-muted">Orçamento</span>
                <span className="font-semibold">{formatCurrency(data.budget.total)}</span>
              </div>
              <div className="w-full h-2 bg-celebre-bg rounded-full overflow-hidden">
                <div className="h-full bg-celebre-brand" style={{ width: `${data.budget.percentSpent}%` }} />
              </div>
              <p className="text-xs text-center text-celebre-muted">Gasto: {data.budget.percentSpent}%</p>
            </CardContent>
          </Card>

          {/* Lembretes / Próximas tarefas (com scroll interno se precisar) */}
          <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Lembretes</CardTitle>
              <CardDescription>Próximas tarefas</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 h-full overflow-auto">
              {data.nextTasks.length === 0 ? (
                <div className="text-center py-8 text-celebre-muted">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Tudo em dia! ✨</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.nextTasks.slice(0, 6).map(task => (
                    <div key={task.id} className="p-3 rounded-xl border bg-celebre-bg/40">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{task.title}</p>
                        <Badge variant={getSLABadgeColor(task.dueAt) as any}>
                          {task.status === 'aberta' ? 'Aberta' :
                           task.status === 'em_andamento' ? 'Em andamento' : 'Atrasada'}
                        </Badge>
                      </div>
                      {task.dueAt && (
                        <p className="text-xs text-celebre-muted mt-1">
                          <Clock className="inline w-3 h-3 mr-1" />
                          {formatDate(task.dueAt)} às {formatTime(task.dueAt)}
                        </p>
                      )}
                    </div>
                  ))}
                  <Link href={`/events/${eventId}/tasks`}>
                    <Button variant="outline" className="w-full mt-2">Ver todas</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
  )
}
