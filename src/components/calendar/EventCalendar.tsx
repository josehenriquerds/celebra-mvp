'use client'

import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'
import { X, Calendar as CalendarIcon, Clock, User, Phone, Tag } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar-custom.css'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: ptBR }),
  getDay,
  locales,
})

export interface EventActivity {
  id: string
  type: 'timeline' | 'interaction' | 'checkin' | 'gift' | 'task'
  subtype?: string
  title: string
  description?: string | null
  contactName?: string
  contactPhone?: string | null
  occurredAt?: string
  dueAt?: string | null
  status?: string
  metadata?: any
  start: Date
  end: Date
}

interface EventCalendarProps {
  activities: EventActivity[]
  onSelectEvent?: (event: EventActivity) => void
  onSelectSlot?: (slotInfo: any) => void
}

const TYPE_COLORS = {
  timeline: { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0' },
  interaction: { bg: '#F3E5F5', border: '#9C27B0', text: '#6A1B9A' },
  checkin: { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32' },
  gift: { bg: '#FCE4EC', border: '#E91E63', text: '#C2185B' },
  task: { bg: '#FFF3E0', border: '#FF9800', text: '#E65100' },
}

export function EventCalendar({ activities, onSelectEvent, onSelectSlot }: EventCalendarProps) {
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<EventActivity | null>(null)

  const eventStyleGetter = (event: EventActivity) => {
    const colors = TYPE_COLORS[event.type] || TYPE_COLORS.timeline
    return {
      style: {
        backgroundColor: colors.bg,
        borderLeft: `4px solid ${colors.border}`,
        color: colors.text,
        borderRadius: '8px',
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: '500',
      },
    }
  }

  const handleSelectEvent = (event: EventActivity) => {
    setSelectedEvent(event)
    onSelectEvent?.(event)
  }

  const handleSelectSlot = (slotInfo: any) => {
    onSelectSlot?.(slotInfo)
  }

  const messages = {
    allDay: 'Dia inteiro',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período.',
    showMore: (total: number) => `+ ${total} mais`,
  }

  return (
    <>
      <div className="calendar-wrapper rounded-3xl bg-white/60 p-6 shadow-sm backdrop-blur-sm">
        <Calendar
          localizer={localizer}
          events={activities}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          messages={messages}
          culture="pt-BR"
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="relative mx-4 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div
                  className="flex size-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: TYPE_COLORS[selectedEvent.type]?.bg }}
                >
                  <CalendarIcon
                    className="size-6"
                    style={{ color: TYPE_COLORS[selectedEvent.type]?.text }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-celebre-ink">{selectedEvent.title}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: TYPE_COLORS[selectedEvent.type]?.bg,
                        color: TYPE_COLORS[selectedEvent.type]?.text,
                      }}
                    >
                      {selectedEvent.type}
                    </span>
                    {selectedEvent.subtype && (
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                        {selectedEvent.subtype}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-sm text-gray-700">{selectedEvent.description}</p>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                {/* Date/Time */}
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="size-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {format(selectedEvent.start, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {selectedEvent.dueAt && (
                      <p className="text-xs text-gray-500">
                        Prazo: {format(new Date(selectedEvent.dueAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Contact */}
                {selectedEvent.contactName && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="size-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedEvent.contactName}</p>
                      {selectedEvent.contactPhone && (
                        <p className="text-xs text-gray-500">{selectedEvent.contactPhone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Status */}
                {selectedEvent.status && (
                  <div className="flex items-center gap-3 text-sm">
                    <Tag className="size-5 text-gray-400" />
                    <p className="font-medium text-gray-900">
                      Status:{' '}
                      <span className="capitalize text-gray-600">{selectedEvent.status.replace('_', ' ')}</span>
                    </p>
                  </div>
                )}

                {/* Metadata */}
                {selectedEvent.metadata && Object.keys(selectedEvent.metadata).length > 0 && (
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase text-gray-500">Detalhes Adicionais</h4>
                    <div className="space-y-1 text-sm">
                      {Object.entries(selectedEvent.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-600">{key}:</span>
                          <span className="font-medium text-gray-900">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
