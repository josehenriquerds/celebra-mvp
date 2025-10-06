/**
 * Guests Hooks
 * TanStack Query hooks for guest-related operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { guestsService, type GetGuestsParams } from '@/services'
import { queryKeys } from '@/lib/query-client'
import type { Guest, CreateGuestDto, UpdateGuestDto, BulkInviteDto } from '@/types/api'

/**
 * Get all guests for an event
 */
export function useGuests(params: GetGuestsParams) {
  const { eventId, ...filters } = params
  const hasFilters = Object.keys(filters).length > 0

  return useQuery({
    queryKey: hasFilters
      ? queryKeys.guests.filtered(eventId, filters)
      : queryKeys.guests.all(eventId),
    queryFn: () => guestsService.getGuests(params),
    enabled: !!eventId,
  })
}

/**
 * Get specific guest by ID
 */
export function useGuest(guestId: string) {
  return useQuery({
    queryKey: queryKeys.guests.detail(guestId),
    queryFn: () => guestsService.getGuest(guestId),
    enabled: !!guestId,
  })
}

/**
 * Get guest timeline
 */
export function useGuestTimeline(guestId: string) {
  return useQuery({
    queryKey: queryKeys.guests.timeline(guestId),
    queryFn: () => guestsService.getGuestTimeline(guestId),
    enabled: !!guestId,
  })
}

/**
 * Create new guest
 */
export function useCreateGuest(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGuestDto) => guestsService.createGuest(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.all(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.summary(eventId) })
    },
  })
}

/**
 * Update guest
 */
export function useUpdateGuest(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGuestDto }) =>
      guestsService.updateGuest(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.guests.detail(id) })
      const previous = queryClient.getQueryData<Guest>(queryKeys.guests.detail(id))

      if (previous) {
        queryClient.setQueryData<Guest>(queryKeys.guests.detail(id), {
          ...previous,
          ...data,
        })
      }

      return { previous }
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.guests.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.all(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.summary(eventId) })
    },
  })
}

/**
 * Delete guest
 */
export function useDeleteGuest(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => guestsService.deleteGuest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.all(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.summary(eventId) })
    },
  })
}

/**
 * Bulk invite guests
 */
export function useBulkInvite(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BulkInviteDto) => guestsService.bulkInvite(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.all(eventId) })
    },
  })
}
