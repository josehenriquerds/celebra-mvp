/**
 * Calendar Client Component
 * Handles all interactivity and filtering for calendar view
 */

'use client'

import { addHours } from 'date-fns'
import { motion } from 'framer-motion'
import { Download, Calendar as CalendarIcon } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { EventCalendar, type EventActivity } from '@/components/calendar/EventCalendar'
import { Button } from '@/components/ui/button'
import type { Activity, Task } from '@/lib/schemas'

interface CalendarClientProps {
  eventId: string
  activities: Activity[]
  tasks: Task[]
}

const TYPE_INFO = [
  { value: 'all', label: 'Todas', icon: '', bgColor: 'bg-gray-50/80', textColor: 'text-gray-600', activeColor: 'bg-gray-100' },
  { value: 'timeline', label: 'Timeline', icon: '', bgColor: 'bg-blue-50/80', textColor: 'text-blue-600', activeColor: 'bg-blue-100' },
  { value: 'interaction', label: 'Interações', icon: '', bgColor: 'bg-purple-50/80', textColor: 'text-purple-600', activeColor: 'bg-purple-100' },
  { value: 'checkin', label: 'Check-ins', icon: '', bgColor: 'bg-green-50/80', textColor: 'text-green-600', activeColor: 'bg-green-100' },
  { value: 'gift', label: 'Presentes', icon: '', bgColor: 'bg-pink-50/80', textColor: 'text-pink-600', activeColor: 'bg-pink-100' },
  { value: 'task', label: 'Tarefas', icon: '', bgColor: 'bg-orange-50/80', textColor: 'text-orange-600', activeColor: 'bg-orange-100' },
]

export default function CalendarClient({ eventId, activities, tasks }: CalendarClientProps) {
  const [typeFilter, setTypeFilter] = useState('all')

  // Convert activities and tasks to unified calendar format
  const calendarActivities = useMemo<EventActivity[]>(() => {
    const result: EventActivity[] = []

    // Add timeline/activity items
    if (typeFilter === 'all' || typeFilter !== 'task') {
      activities.forEach((item) => {
        if (typeFilter !== 'all' && typeFilter !== item.type) return

        const startDate = new Date(item.occurredAt)
        result.push({
          id: item.id,
          type: item.type,
          subtype: item.subtype,
          title: item.title,
          description: item.description,
          contactName: item.contactName || '',
          contactPhone: item.contactPhone,
          occurredAt: item.occurredAt,
          metadata: item.metadata || {},
          start: startDate,
          end: addHours(startDate, 1),
        })
      })
    }

    // Add tasks with dueAt dates
    if (typeFilter === 'all' || typeFilter === 'task') {
      tasks.forEach((task) => {
        if (!task.dueAt) return

        const dueDate = new Date(task.dueAt)
        result.push({
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
      })
    }

    return result
  }, [activities, tasks, typeFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const activityCounts = activities.reduce(
      (acc, a) => {
        acc[a.type] = (acc[a.type] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return {
      total: calendarActivities.length,
      timeline: activityCounts.timeline || 0,
      interactions: activityCounts.interaction || 0,
      checkins: activityCounts.checkin || 0,
      gifts: activityCounts.gift || 0,
      tasks: tasks.filter((t) => t.dueAt).length,
    }
  }, [activities, tasks, calendarActivities.length])

  const getStatValue = useCallback(
    (type: string) => {
      switch (type) {
        case 'all':
          return stats.total
        case 'timeline':
          return stats.timeline
        case 'interaction':
          return stats.interactions
        case 'checkin':
          return stats.checkins
        case 'gift':
          return stats.gifts
        case 'task':
          return stats.tasks
        default:
          return 0
      }
    },
    [stats]
  )

  const handleExport = useCallback(async () => {
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
  }, [eventId])

  const handleSelectEvent = useCallback((event: EventActivity) => {
    console.log('Selected event:', event)
    // TODO: Open modal/detail view
  }, [])

  const handleSelectSlot = useCallback((slotInfo: unknown) => {
    console.log('Selected slot:', slotInfo)
    // TODO: Create new event/task
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF7F4] py-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        {/* Header */}
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

        {/* Filter Pills */}
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
                    ${
                      isActive
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
            activities={calendarActivities}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        </motion.div>
      </div>
    </div>
  )
}
