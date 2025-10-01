'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Clock,
  MessageSquare,
  CheckCircle,
  Gift,
  ClipboardList,
  Filter,
  Search,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
  metadata: any
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

const TYPE_ICONS: Record<string, any> = {
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

  useEffect(() => {
    fetchTimeline()
  }, [eventId, typeFilter, searchQuery])

  async function fetchTimeline() {
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
  }

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
          <h1 className="text-3xl font-heading font-bold text-celebre-ink">Timeline Global</h1>
          <p className="text-celebre-muted mt-1">
            Visualização cronológica de todas as atividades do evento
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
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
                <Clock className="h-5 w-5 text-blue-600" />
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
                <MessageSquare className="h-5 w-5 text-purple-600" />
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
                <CheckCircle className="h-5 w-5 text-green-600" />
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
                <Gift className="h-5 w-5 text-pink-600" />
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
                <ClipboardList className="h-5 w-5 text-orange-600" />
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-celebre-muted" />
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
                          <Icon className="h-4 w-4" />
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
            {timeline.length} {timeline.length === 1 ? 'atividade encontrada' : 'atividades encontradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-celebre-brand mx-auto mb-4"></div>
              <p className="text-celebre-muted">Carregando timeline...</p>
            </div>
          ) : timeline.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-celebre-muted mx-auto mb-4" />
              <p className="text-celebre-muted">Nenhuma atividade encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, index) => {
                const Icon = TYPE_ICONS[item.type] || Activity
                const colorClass = TYPE_COLORS[item.type] || 'bg-gray-100 text-gray-800'

                return (
                  <div
                    key={item.id}
                    className="relative flex gap-4 pb-4 border-b last:border-b-0"
                  >
                    {/* Timeline line */}
                    {index !== timeline.length - 1 && (
                      <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200"></div>
                    )}

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colorClass} flex items-center justify-center z-10`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-celebre-ink">{item.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm text-celebre-muted mb-2">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-celebre-muted">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {item.contactName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(item.occurredAt, 'short')} às {formatTime(item.occurredAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metadata badges */}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
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