'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import type { Gift, GiftFormData, GiftStatus } from '@/schemas'
import {
  createGift,
  deleteGift,
  fetchGifts,
  updateGift,
  updateGiftStatus,
} from '../services/gifts.api'

// Query keys factory
export const giftsKeys = {
  all: ['gifts'] as const,
  lists: () => [...giftsKeys.all, 'list'] as const,
  list: (eventId: string) => [...giftsKeys.lists(), eventId] as const,
  details: () => [...giftsKeys.all, 'detail'] as const,
  detail: (id: string) => [...giftsKeys.details(), id] as const,
}

// Hook to fetch gifts
export function useGifts(eventId?: string) {
  const params = useParams()
  const id = eventId || (params.id as string)

  return useQuery({
    queryKey: giftsKeys.list(id),
    queryFn: () => fetchGifts(id),
    enabled: !!id,
  })
}

// Hook to create gift
export function useCreateGift() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: (data: GiftFormData) => createGift(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
    },
  })
}

// Hook to update gift
export function useUpdateGift() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GiftFormData> }) => updateGift(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: giftsKeys.list(eventId) })

      // Snapshot previous value
      const previousGifts = queryClient.getQueryData<Gift[]>(giftsKeys.list(eventId))

      // Optimistically update
      if (previousGifts) {
        queryClient.setQueryData<Gift[]>(
          giftsKeys.list(eventId),
          previousGifts.map((gift) => (gift.id === id ? { ...gift, ...data } : gift))
        )
      }

      return { previousGifts }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousGifts) {
        queryClient.setQueryData(giftsKeys.list(eventId), context.previousGifts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
    },
  })
}

// Hook to delete gift
export function useDeleteGift() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: (id: string) => deleteGift(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: giftsKeys.list(eventId) })

      const previousGifts = queryClient.getQueryData<Gift[]>(giftsKeys.list(eventId))

      if (previousGifts) {
        queryClient.setQueryData<Gift[]>(
          giftsKeys.list(eventId),
          previousGifts.filter((gift) => gift.id !== id)
        )
      }

      return { previousGifts }
    },
    onError: (err, variables, context) => {
      if (context?.previousGifts) {
        queryClient.setQueryData(giftsKeys.list(eventId), context.previousGifts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
    },
  })
}

// Hook to update gift status (mark as received, etc.)
export function useUpdateGiftStatus() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GiftStatus }) =>
      updateGiftStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: giftsKeys.list(eventId) })

      const previousGifts = queryClient.getQueryData<Gift[]>(giftsKeys.list(eventId))

      if (previousGifts) {
        queryClient.setQueryData<Gift[]>(
          giftsKeys.list(eventId),
          previousGifts.map((gift) => (gift.id === id ? { ...gift, status } : gift))
        )
      }

      return { previousGifts }
    },
    onError: (err, variables, context) => {
      if (context?.previousGifts) {
        queryClient.setQueryData(giftsKeys.list(eventId), context.previousGifts)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
    },
  })
}
