'use client'

import { addHours } from 'date-fns'
import { motion } from 'framer-motion'
import { Download, Calendar as CalendarIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { EventCalendar, type EventActivity } from '@/components/calendar/EventCalendar'
import { Button } from '@/components/ui/button'

interface TimelineItem {
  id: string
  type: 'timeline' | 'interaction' | 'checkin' | 'gift' | 'task'
  subtype: string
  title: string
  description: string | null
  contactName: string
  contactPhone: string | null
  occurredAt: string
  dueAt?: string | null
  status?: string
  metadata: any
}

interface Task {
  id: string
  title: string
  description: string | null
  status: 'aberta' | 'em_andamento' | 'concluida'
  dueAt: string | null
  slaHours: number | null
  assignedTo: string | null
  vendor: {
    id: string
    name: string
  } | null
  cost: number | null
}

const TYPE_INFO = [
  { value: 'all', label: 'Todas', icon: '', bgColor: 'bg-gray-50/80', textColor: 'text-gray-600', activeColor: 'bg-gray-100' },
  { value: 'timeline', label: 'Timeline', icon: '', bgColor: 'bg-blue-50/80', textColor: 'text-blue-600', activeColor: 'bg-blue-100' },
  { value: 'interaction', label: 'Interações', icon: '', bgColor: 'bg-purple-50/80', textColor: 'text-purple-600', activeColor: 'bg-purple-100' },
  { value: 'checkin', label: 'Check-ins', icon: '', bgColor: 'bg-green-50/80', textColor: 'text-green-600', activeColor: 'bg-green-100' },
  { value: 'gift', label: 'Presentes', icon: '', bgColor: 'bg-pink-50/80', textColor: 'text-pink-600', activeColor: 'bg-pink-100' },
  { value: 'task', label: 'Tarefas', icon: '', bgColor: 'bg-orange-50/80', textColor: 'text-orange-600', activeColor: 'bg-orange-100' },
]

export default function EventCalendarPage() {
  const params = useParams()
  const eventId = params.id as string

  const [activities, setActivities] = useState<EventActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    timeline: 0,
    interactions: 0,
    checkins: 0,
    gifts: 0,
    tasks: 0,
  })

  useEffect(() => {
    fetchActivities()
  }, [eventId, typeFilter])

  async function fetchActivities() {
    try {
      setLoading(true)

      // Fetch timeline events
      const timelineParams = new URLSearchParams()
      if (typeFilter !== 'all' && typeFilter !== 'task') {
        timelineParams.set('type', typeFilter)
      }

      const timelineRes = await fetch(`/api/events/${eventId}/timeline?${timelineParams}`)
      const timelineData = await timelineRes.json()
      const timelineItems: TimelineItem[] = timelineData.timeline || []

      // Fetch tasks
      const tasksRes = await fetch(`/api/events/${eventId}/tasks`)
      const tasks: Task[] = await tasksRes.json()

      // Combine and transform to calendar events
      const allActivities: EventActivity[] = []

      // Add timeline items
      if (typeFilter === 'all' || typeFilter !== 'task') {
        timelineItems.forEach((item) => {
          const startDate = new Date(item.occurredAt)
          allActivities.push({
            id: item.id,
            type: item.type,
            subtype: item.subtype,
            title: item.title,
            description: item.description,
            contactName: item.contactName,
            contactPhone: item.contactPhone,
            occurredAt: item.occurredAt,
            metadata: item.metadata,
            start: startDate,
            end: addHours(startDate, 1), // Default 1 hour duration
          })
        })
      }

      // Add tasks
      if (typeFilter === 'all' || typeFilter === 'task') {
        tasks.forEach((task) => {
          if (task.dueAt) {
            const dueDate = new Date(task.dueAt)
            allActivities.push({
              id: task.id,
              type: 'task',
              title: task.title,
              description: task.description,
              status: task.status,
              dueAt: task.dueAt,
              contactName: task.assignedTo || 'Sem responsável',
              metadata: {
                cost: task.cost,
                vendor: task.vendor?.name,
                slaHours: task.slaHours,
              },
              start: dueDate,
              end: addHours(dueDate, task.slaHours || 1),
            })
          }
        })
      }

      // Update stats
      setStats({
        total: allActivities.length,
        timeline: timelineItems.filter((i) => i.type === 'timeline').length,
        interactions: timelineItems.filter((i) => i.type === 'interaction').length,
        checkins: timelineItems.filter((i) => i.type === 'checkin').length,
        gifts: timelineItems.filter((i) => i.type === 'gift').length,
        tasks: tasks.length,
      })

      setActivities(allActivities)
    } catch (error) {
      console.error('Error fetching activities:', error)
      setActivities([])
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
      a.download = `calendar-${eventId}-${Date.now()}.csv`
      a.click()
    } catch (error) {
      console.error('Error exporting calendar:', error)
      alert('Erro ao exportar calendário')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F4]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-4 border-pastel-rose-300 border-t-transparent"></div>
          <p className="text-sm text-celebre-muted">Carregando calendário...</p>
        </motion.div>
      </div>
    )
  }

  const getStatValue = (type: string) => {
    switch(type) {
      case 'all': return stats.total
      case 'timeline': return stats.timeline
      case 'interaction': return stats.interactions
      case 'checkin': return stats.checkins
      case 'gift': return stats.gifts
      case 'task': return stats.tasks
      default: return 0
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F4] py-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        {/* Minimalist Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-2xl bg-white/60 px-6 py-4 shadow-sm backdrop-blur-sm"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-pastel-lavender-100">
              <CalendarIcon className="size-5 text-pastel-lavender-600" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-celebre-ink">
                Calendário do Evento
              </h1>
              <p className="text-xs text-celebre-muted">
                Visualize e gerencie todas as atividades em um único lugar
              </p>
            </div>
          </div>
          <Button
            onClick={handleExport}
            size="sm"
            variant="outline"
            className="border-pastel-lavender-200 bg-white text-pastel-lavender-700 hover:bg-pastel-lavender-50"
          >
            <Download className="mr-2 size-3.5" />
            Exportar
          </Button>
        </motion.div>

        {/* Compact Filter Pills - Single Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/60 p-3 shadow-sm backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            {TYPE_INFO.map((type) => {
              const isActive = typeFilter === type.value
              const statValue = getStatValue(type.value)

              return (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(type.value)}
                  className={`
                    group relative flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all
                    ${isActive
                      ? `${type.activeColor} ${type.textColor} shadow-sm`
                      : `${type.bgColor} ${type.textColor} hover:shadow-sm`
                    }
                  `}
                >
                  <span className="text-sm">{type.icon}</span>
                  <span>{statValue}</span>
                  <span className="hidden sm:inline">{type.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 -z-10 rounded-xl bg-white/50"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EventCalendar
            activities={activities}
            onSelectEvent={(event) => {
              console.log('Selected event:', event)
            }}
            onSelectSlot={(slotInfo) => {
              console.log('Selected slot:', slotInfo)
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
