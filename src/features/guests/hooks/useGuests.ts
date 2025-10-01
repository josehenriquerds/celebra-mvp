'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import type { Guest, GuestFormData, GuestUpdateData, GuestWithTimeline } from '@/schemas'
import {
  createGuest,
  deleteGuest,
  fetchGuest,
  fetchGuests,
  updateGuest,
} from '../services/guests.api'

// Query keys factory
export const guestsKeys = {
  all: ['guests'] as const,
  lists: () => [...guestsKeys.all, 'list'] as const,
  list: (eventId: string) => [...guestsKeys.lists(), eventId] as const,
  details: () => [...guestsKeys.all, 'detail'] as const,
  detail: (id: string) => [...guestsKeys.details(), id] as const,
  timelines: () => [...guestsKeys.all, 'timeline'] as const,
  timeline: (id: string) => [...guestsKeys.timelines(), id] as const,
}

// Hook to fetch guests list
export function useGuests(eventId?: string) {
  const params = useParams()
  const id = eventId || (params.id as string)

  return useQuery({
    queryKey: guestsKeys.list(id),
    queryFn: () => fetchGuests(id),
    enabled: !!id,
  })
}

// Hook to fetch single guest with timeline
export function useGuest(guestId?: string) {
  const params = useParams()
  const id = guestId || (params.guestId as string)

  return useQuery<GuestWithTimeline>({
    queryKey: guestsKeys.detail(id),
    queryFn: () => fetchGuest(id),
    enabled: !!id,
  })
}

// Hook to create guest
export function useCreateGuest() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: (data: GuestFormData) => createGuest(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: guestsKeys.list(eventId) })
    },
  })
}

// Hook to update guest
export function useUpdateGuest() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GuestUpdateData }) => updateGuest(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: guestsKeys.list(eventId) })
      await queryClient.cancelQueries({ queryKey: guestsKeys.detail(id) })

      // Snapshot previous values
      const previousGuests = queryClient.getQueryData<Guest[]>(guestsKeys.list(eventId))
      const previousGuest = queryClient.getQueryData<GuestWithTimeline>(guestsKeys.detail(id))

      // Optimistically update list
      if (previousGuests) {
        queryClient.setQueryData<Guest[]>(
          guestsKeys.list(eventId),
          previousGuests.map((guest) => (guest.id === id ? { ...guest, ...data } : guest)),
        )
      }

      // Optimistically update detail
      if (previousGuest) {
        queryClient.setQueryData<GuestWithTimeline>(guestsKeys.detail(id), {
          ...previousGuest,
          ...data,
        })
      }

      return { previousGuests, previousGuest }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousGuests) {
        queryClient.setQueryData(guestsKeys.list(eventId), context.previousGuests)
      }
      if (context?.previousGuest) {
        queryClient.setQueryData(guestsKeys.detail(variables.id), context.previousGuest)
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: guestsKeys.list(eventId) })
      queryClient.invalidateQueries({ queryKey: guestsKeys.detail(variables.id) })
    },
  })
}

// Hook to delete guest
export function useDeleteGuest() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: (id: string) => deleteGuest(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: guestsKeys.list(eventId) })

      const previousGuests = queryClient.getQueryData<Guest[]>(guestsKeys.list(eventId))

      if (previousGuests) {
        queryClient.setQueryData<Guest[]>(
          guestsKeys.list(eventId),
          previousGuests.filter((guest) => guest.id !== id),
        )
      }

      return { previousGuests }
    },
    onError: (err, variables, context) => {
      if (context?.previousGuests) {
        queryClient.setQueryData(guestsKeys.list(eventId), context.previousGuests)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: guestsKeys.list(eventId) })
    },
  })
}
