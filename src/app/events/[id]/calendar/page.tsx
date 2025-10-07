/**
 * Calendar Page - Server Component
 * Fetches activities and tasks on the server and passes to client
 */

import { Suspense } from 'react'
import { apiGet, extractArray } from '@/lib/api'
import { parseArray, ActivitySchema, TaskSchema } from '@/lib/schemas'
import type { Activity, Task } from '@/lib/schemas'
import CalendarClient from './CalendarClient'
import CalendarSkeleton from './CalendarSkeleton'

interface TimelineResponse {
  timeline: Activity[]
}

async function getCalendarData(eventId: string) {
  try {
    const [timelineData, tasksData] = await Promise.all([
      apiGet<TimelineResponse>(
        `/api/events/${eventId}/timeline`,
        {},
        { nextTags: [`event-${eventId}`, 'timeline'], revalidate: 30 }
      ),
      apiGet<Task[] | { data: Task[] }>(
        `/api/events/${eventId}/tasks`,
        {},
        { nextTags: [`event-${eventId}`, 'tasks'], revalidate: 30 }
      ),
    ])

    const activities = parseArray(ActivitySchema.array(), timelineData.timeline)
    const tasks = extractArray<Task>(tasksData)
    const validatedTasks = parseArray(TaskSchema.array(), tasks)

    return { activities, tasks: validatedTasks }
  } catch (error) {
    console.error('[Calendar] Error fetching data:', error)
    return { activities: [], tasks: [] }
  }
}

async function CalendarContent({ eventId }: { eventId: string }) {
  const { activities, tasks } = await getCalendarData(eventId)

  return <CalendarClient eventId={eventId} activities={activities} tasks={tasks} />
}

export default async function CalendarPage({ params }: { params: { id: string } }) {
  const eventId = params.id

  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <CalendarContent eventId={eventId} />
    </Suspense>
  )
}
