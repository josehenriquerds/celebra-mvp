/**
 * Events Hooks
 * TanStack Query hooks for event-related operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { eventsService } from '@/services'
import type { Event, CreateEventDto } from '@/types/api'

/**
 * Get all events for current user
 */
export function useEvents() {
  return useQuery({
    queryKey: queryKeys.events.all,
    queryFn: eventsService.getEvents,
  })
}

/**
 * Get specific event by ID
 */
export function useEvent(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.detail(eventId),
    queryFn: () => eventsService.getEvent(eventId),
    enabled: !!eventId,
  })
}

/**
 * Get event summary/dashboard
 */
export function useEventSummary(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.summary(eventId),
    queryFn: () => eventsService.getEventSummary(eventId),
    enabled: !!eventId,
    // Dashboard data is critical, keep it fresh
    staleTime: 10 * 1000,
  })
}

/**
 * Get event timeline
 */
export function useEventTimeline(eventId: string) {
  return useQuery({
    queryKey: queryKeys.events.timeline(eventId),
    queryFn: () => eventsService.getEventTimeline(eventId),
    enabled: !!eventId,
  })
}

/**
 * Create new event
 */
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEventDto) => eventsService.createEvent(data),
    onSuccess: () => {
      // Invalidate events list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
    },
  })
}

/**
 * Update event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      eventsService.updateEvent(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.events.detail(id) })

      // Snapshot previous value
      const previous = queryClient.getQueryData<Event>(queryKeys.events.detail(id))

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<Event>(queryKeys.events.detail(id), {
          ...previous,
          ...data,
        })
      }

      return { previous }
    },
    onError: (_error, { id }, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.events.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
    },
  })
}

/**
 * Delete event
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => eventsService.deleteEvent(id),
    onSuccess: () => {
      // Invalidate events list
      queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
    },
  })
}
