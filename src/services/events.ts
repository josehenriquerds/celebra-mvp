/**
 * Events Service
 * Handles all event-related API calls
 */

import { api } from '@/lib/api-client'
import type {
  Event,
  EventSummary,
  CreateEventDto,
  PagedResponse,
  TimelineEntry,
} from '@/types/api'

export const eventsService = {
  /**
   * Get all events for current user
   */
  getEvents: () => api.get<PagedResponse<Event>>('/events'),

  /**
   * Get specific event by ID
   */
  getEvent: (eventId: string) => api.get<Event>(`/events/${eventId}`),

  /**
   * Get event summary/dashboard
   */
  getEventSummary: (eventId: string) =>
    api.get<EventSummary>(`/events/${eventId}/summary`),

  /**
   * Create new event
   */
  createEvent: (data: CreateEventDto) => api.post<Event>('/events', data),

  /**
   * Update event
   */
  updateEvent: (eventId: string, data: Partial<Event>) =>
    api.patch<Event>(`/events/${eventId}`, data),

  /**
   * Delete event
   */
  deleteEvent: (eventId: string) => api.delete<void>(`/events/${eventId}`),

  /**
   * Get event timeline
   */
  getEventTimeline: (eventId: string) =>
    api.get<TimelineEntry[]>(`/events/${eventId}/timeline`),
}
