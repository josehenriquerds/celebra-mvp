'use client'

import {
  Clock,
  MessageSquare,
  CheckCircle,
  Gift,
  ClipboardList,
  Search,
  Download,
  Calendar,
  Users,
  Activity,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate, formatTime } from '@/lib/utils'

interface TimelineItem {
  id: string
  type: 'timeline' | 'interaction' | 'checkin' | 'gift' | 'task'
  subtype: string
  title: string
  description: string | null
  contactName: string
  contactPhone: string | null
  occurredAt: string
  metadata: Record<string, unknown>
}

interface TimelineStats {
  total: number
  timeline: number
  interactions: number
  checkins: number
  gifts: number
  tasks: number
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos', icon: Activity },
  { value: 'timeline', label: 'Timeline', icon: Clock },
  { value: 'interaction', label: 'Interações', icon: MessageSquare },
  { value: 'checkin', label: 'Check-ins', icon: CheckCircle },
  { value: 'gift', label: 'Presentes', icon: Gift },
  { value: 'task', label: 'Tarefas', icon: ClipboardList },
]

const TYPE_COLORS: Record<string, string> = {
  timeline: 'bg-blue-100 text-blue-800',
  interaction: 'bg-purple-100 text-purple-800',
  checkin: 'bg-green-100 text-green-800',
  gift: 'bg-pink-100 text-pink-800',
  task: 'bg-orange-100 text-orange-800',
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  timeline: Clock,
  interaction: MessageSquare,
  checkin: CheckCircle,
  gift: Gift,
  task: ClipboardList,
}

export default function EventTimelinePage() {
  const params = useParams()
  const eventId = params.id as string

  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [stats, setStats] = useState<TimelineStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTimeline = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`/api/events/${eventId}/timeline?${params}`)
      const data = await res.json()

      setTimeline(data.timeline || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching timeline:', error)
    } finally {
      setLoading(false)
    }
  }, [eventId, searchQuery, typeFilter])

  useEffect(() => {
    void fetchTimeline()
  }, [fetchTimeline])

  async function handleExport() {
    try {
      const res = await fetch(`/api/events/${eventId}/timeline?format=csv`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `timeline-${eventId}-${Date.now()}.csv`
      a.click()
    } catch (error) {
      console.error('Error exporting timeline:', error)
      alert('Erro ao exportar timeline')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-celebre-ink">Timeline Global</h1>
          <p className="mt-1 text-celebre-muted">
            Visualização cronológica de todas as atividades do evento
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 size-4" />
          Exportar
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="size-5 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-celebre-ink">{stats.total}</p>
                  <p className="text-xs text-celebre-muted">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-celebre-ink">{stats.timeline}</p>
                  <p className="text-xs text-celebre-muted">Timeline</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-5 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-celebre-ink">{stats.interactions}</p>
                  <p className="text-xs text-celebre-muted">Interações</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-celebre-ink">{stats.checkins}</p>
                  <p className="text-xs text-celebre-muted">Check-ins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gift className="size-5 text-pink-600" />
                <div>
                  <p className="text-2xl font-bold text-celebre-ink">{stats.gifts}</p>
                  <p className="text-xs text-celebre-muted">Presentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="size-5 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-celebre-ink">{stats.tasks}</p>
                  <p className="text-xs text-celebre-muted">Tarefas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-celebre-muted" />
                <Input
                  placeholder="Buscar por convidado, título ou descrição..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => {
                    const Icon = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="size-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Atividades Recentes</CardTitle>
          <CardDescription>
            {timeline.length}{' '}
            {timeline.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center">
              <div className="border-celebre-brand mx-auto mb-4 size-8 animate-spin rounded-full border-b-2"></div>
              <p className="text-celebre-muted">Carregando timeline...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="py-12 text-center">
              <Activity className="mx-auto mb-4 size-12 text-celebre-muted" />
              <p className="text-celebre-muted">Nenhuma atividade encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, index) => {
                const Icon = TYPE_ICONS[item.type] || Activity
                const colorClass = TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-800'

                return (
                  <div key={item.id} className="relative flex gap-4 border-b pb-4 last:border-b-0">
                    {/* Timeline line */}
                    {index !== timeline.length - 1 && (
                      <div className="absolute left-5 top-12 h-full w-0.5 bg-gray-200"></div>
                    )}

                    {/* Icon */}
                    <div
                      className={`size-10 shrink-0 rounded-full ${colorClass} z-10 flex items-center justify-center`}
                    >
                      <Icon className="size-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h4 className="font-semibold text-celebre-ink">{item.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="mb-2 text-sm text-celebre-muted">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-celebre-muted">
                            <span className="flex items-center gap-1">
                              <Users className="size-3" />
                              {item.contactName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3" />
                              {formatDate(item.occurredAt, 'short')} às{' '}
                              {formatTime(item.occurredAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metadata badges */}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.metadata.direction && (
                            <Badge variant="secondary" className="text-xs">
                              {item.metadata.direction === 'inbound' ? 'Recebida' : 'Enviada'}
                            </Badge>
                          )}
                          {item.metadata.channel && (
                            <Badge variant="secondary" className="text-xs">
                              {item.metadata.channel}
                            </Badge>
                          )}
                          {item.metadata.sentiment && (
                            <Badge variant="secondary" className="text-xs">
                              Sentimento: {item.metadata.sentiment}
                            </Badge>
                          )}
                          {item.metadata.status && (
                            <Badge variant="secondary" className="text-xs">
                              {item.metadata.status}
                            </Badge>
                          )}
                          {item.metadata.priority && (
                            <Badge variant="secondary" className="text-xs">
                              Prioridade: {item.metadata.priority}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
