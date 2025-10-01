'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Home, Calendar as CalendarIcon, Users, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { DonutProgress } from '@/components/dashboard/donut-progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Sidebar from '@/app/components/Sidebar'
import { formatCurrency, formatDate, formatTime, getDaysUntil, getSLABadgeColor } from '@/lib/utils'

type Task = {
  id: string
  title: string
  dueAt: string | null
  status: string
  slaHours: number | null
}

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
  nextTasks: Task[]
  stats: {
    totalGuests: number
    confirmedGuests: number
    vipGuests: number
    children: number
    vendors: number
  }
}

export default function EventDashboard() {
  const { id } = useParams()
  const eventId = id as string
  const [data, setData] = useState<EventSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(0) // Day tabs (apenas visual, no estilo das refs)

  useEffect(() => {
    async function fetchEventSummary() {
      try {
        const res = await fetch(`/api/events/${eventId}/summary`)
        const json = await res.json().catch(() => null)
        if (!res.ok || !json || json.error) {
          setData(null)
        } else setData(json)
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    if (eventId) fetchEventSummary()
  }, [eventId])

  if (loading) {
    return (
      <div className="grid h-dvh place-items-center bg-[#FAF7F4]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Carregando evento…</p>
        </div>
      </div>
    )
  }

  if (!data) {
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

  // calendário do mês do evento
  const eventDate = new Date(data.dateTime)
  const monthLabel = eventDate.toLocaleString('pt-BR', { month: 'long' })
  const yearLabel = eventDate.getFullYear()
  const mStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), 1)
  const mEnd = new Date(eventDate.getFullYear(), eventDate.getMonth() + 1, 0)
  const gridStart = new Date(mStart)
  gridStart.setDate(mStart.getDate() - mStart.getDay())
  const gridEnd = new Date(mEnd)
  gridEnd.setDate(mEnd.getDate() + (6 - mEnd.getDay()))
  const days: Array<{ d: Date; inMonth: boolean; isEventDay: boolean }> = []
  for (let dt = new Date(gridStart); dt <= gridEnd; dt.setDate(dt.getDate() + 1)) {
    const cur = new Date(dt)
    days.push({
      d: cur,
      inMonth: cur.getMonth() === eventDate.getMonth(),
      isEventDay: cur.toDateString() === eventDate.toDateString(),
    })
  }

  const daysUntil = getDaysUntil(data.dateTime)
  const rsvpTotal = data.rsvps.sim + data.rsvps.nao + data.rsvps.talvez
  const responseRate =
    data.stats.totalGuests > 0 ? Math.round((rsvpTotal / data.stats.totalGuests) * 100) : 0
  const firstHost = data.hosts?.[0] ?? 'Anfitrião(ã)'

  return (
    <div className="relative bg-[#FAF7F4]">
      <div className="grid h-dvh grid-cols-1 lg:grid-cols-[264px_minmax(0,1fr)_360px]">
        {/* Rail pastel (Sidebar) */}
        <div className="relative hidden md:block"></div>

        {/* COLUNA CENTRAL (sem scroll externo) */}
        <section className="relative overflow-hidden p-4 md:p-6">
          {/* Tabs dia (estilo léxico das refs com pílula animada) */}
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-white/60 p-1 shadow-elevation-1">
            {['Dia 1', 'Dia 2', 'Dia 3', 'Dia 4'].map((label, i) => (
              <button
                key={label}
                onClick={() => setActiveTab(i)}
                className="relative rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground"
              >
                {activeTab === i && (
                  <motion.span
                    layoutId="day-pill"
                    className="absolute inset-0 rounded-xl bg-pastel-sky-100"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>

          {/* GRID INTERNA: hero + KPIs + calendário */}
          <div className="grid h-[calc(100%-3.25rem)] grid-rows-[auto_auto_1fr] gap-4 overflow-hidden">
            {/* HERO (Welcome + progresso) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px]"
            >
              <Card className="rounded-3xl border-none bg-sky-50 shadow-elevation-2">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-sky-700/80">Olá, {firstHost}!</p>
                    <h2 className="text-2xl font-semibold text-sky-900">Welcome back 👋</h2>
                    <p className="mt-1 text-sm text-sky-700/70">
                      {data.title} — {formatDate(data.dateTime, 'long')} às{' '}
                      {formatTime(data.dateTime)} • {data.venueName}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <DonutProgress
                      percentage={data.progress * 100}
                      size={120}
                      strokeWidth={10}
                      label="Progresso"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none bg-indigo-50 shadow-elevation-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-indigo-900">Últimos resultados</CardTitle>
                  <CardDescription className="text-indigo-700/80">
                    Resumo rápido do evento
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3 pt-0 text-sm">
                  <Kpi label="Confirmados" value={data.rsvps.sim} tone="indigo" />
                  <Kpi label="Taxa de resposta" value={`${responseRate}%`} tone="indigo" />
                  <Kpi
                    label="Orçamento gasto"
                    value={formatCurrency(data.budget.spent)}
                    tone="indigo"
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* AÇÕES RÁPIDAS */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <QuickAction
                href={`/events/${eventId}/guests`}
                icon={<Users className="h-5 w-5 text-emerald-600" />}
                label="Convidados"
                sub={`${data.stats.totalGuests} no total`}
                bg="bg-emerald-50"
              />
              <QuickAction
                href={`/events/${eventId}/tasks`}
                icon={<CheckCircle className="h-5 w-5 text-amber-600" />}
                label="Tarefas"
                sub={`${data.nextTasks.filter((t) => t.status !== 'concluida').length} pendentes`}
                bg="bg-amber-50"
              />
              <QuickAction
                href={`/events/${eventId}/timeline`}
                icon={<CalendarIcon className="h-5 w-5 text-cyan-600" />}
                label="Timeline"
                sub={daysUntil > 0 ? `${daysUntil} dias restantes` : 'É hoje! 🎉'}
                bg="bg-cyan-50"
              />
            </motion.div>

            {/* CALENDÁRIO (preenche o restante) */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="h-full overflow-hidden rounded-3xl border-none bg-white shadow-elevation-2">
                <CardHeader className="flex flex-row items-center justify-between pb-0">
                  <div>
                    <CardTitle className="font-heading capitalize">
                      {monthLabel} {yearLabel}
                    </CardTitle>
                    <CardDescription>
                      {data.title} • {data.venueName}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="h-full pt-4">
                  <div className="grid h-full grid-rows-[auto_1fr]">
                    <div className="mb-2 grid grid-cols-7 text-center text-xs text-muted-foreground">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
                        <div key={d} className="py-1">
                          {d}
                        </div>
                      ))}
                    </div>
                    <div className="grid h-[calc(100%-1.5rem)] grid-cols-7 grid-rows-6 gap-2">
                      {days.map(({ d, inMonth, isEventDay }) => (
                        <div
                          key={d.toISOString()}
                          className={[
                            'flex items-start justify-between rounded-xl border px-2 py-2 text-sm transition',
                            inMonth
                              ? 'border-transparent bg-[#FAF7F4]/60'
                              : 'border-dashed bg-white/60 text-muted-foreground/60',
                            isEventDay
                              ? 'bg-primary/10 ring-2 ring-primary/70'
                              : 'hover:shadow-elevation-1',
                          ].join(' ')}
                        >
                          <span className="font-medium">{d.getDate()}</span>
                          {isEventDay && (
                            <span className="rounded-full bg-primary/15 px-2 text-[10px] font-semibold text-primary">
                              Evento
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* PAINEL DIREITO (scroll interno) */}
        <aside className="hidden grid-rows-[auto_auto_1fr] gap-4 overflow-hidden p-4 md:p-6 lg:grid">
          {/* Perfil / saudação */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="rounded-3xl border-none bg-white shadow-elevation-2">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-pastel-rose-100 text-lg font-semibold text-pastel-rose-700">
                  {firstHost?.slice(0, 1) ?? 'A'}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{firstHost}</p>
                  <p className="truncate text-xs text-muted-foreground">{data.address}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cartão “nível” no estilo Beginner das refs */}
          <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="rounded-3xl border-none bg-pastel-lavender-50 shadow-elevation-2">
              <CardHeader className="pb-1">
                <CardTitle className="text-base">Seu nível</CardTitle>
                <CardDescription>Engajamento do evento</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-pastel-lavender-700">BEGINNER</p>
                    <p className="text-xs text-muted-foreground">1021 pts</p>
                  </div>
                  <div className="hidden sm:block">
                    <DonutProgress
                      percentage={Math.min(99, data.progress * 100)}
                      size={80}
                      strokeWidth={8}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lembretes / Tarefas */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-h-0"
          >
            <Card className="h-full overflow-hidden rounded-3xl border-none bg-white shadow-elevation-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Lembretes</CardTitle>
                <CardDescription>Próximas tarefas</CardDescription>
              </CardHeader>
              <CardContent className="h-full space-y-3 overflow-auto pt-0">
                {data.nextTasks.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <CheckCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p>Tudo em dia! ✨</p>
                  </div>
                ) : (
                  <>
                    {data.nextTasks.slice(0, 8).map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl border bg-[#FAF7F4]/60 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">{task.title}</p>
                          <Badge variant={getSLABadgeColor(task.dueAt) as any}>
                            {task.status === 'aberta'
                              ? 'Aberta'
                              : task.status === 'em_andamento'
                                ? 'Em andamento'
                                : 'Atrasada'}
                          </Badge>
                        </div>
                        {task.dueAt && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            <Clock className="mr-1 inline h-3 w-3" />
                            {formatDate(task.dueAt)} às {formatTime(task.dueAt)}
                          </p>
                        )}
                      </motion.div>
                    ))}
                    <Link href={`/events/${eventId}/tasks`}>
                      <Button variant="outline" className="mt-1 w-full">
                        Ver todas
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </aside>
      </div>
    </div>
  )
}

/* -------------------- auxiliares -------------------- */

function Kpi({
  label,
  value,
  tone,
}: {
  label: string
  value: React.ReactNode
  tone: 'indigo' | 'emerald' | 'sky'
}) {
  return (
    <div className="rounded-xl bg-white/70 p-3 transition hover:shadow-elevation-1">
      <p className="text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  label,
  sub,
  bg,
}: {
  href: string
  icon: React.ReactNode
  label: string
  sub: string
  bg: string
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Card className={`rounded-3xl border-none shadow-elevation-2 ${bg}`}>
          <CardContent className="flex items-center gap-3 p-5">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white">{icon}</div>
            <div>
              <p className="font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
