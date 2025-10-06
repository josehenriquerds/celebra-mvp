/**
 * Gifts Hooks (Backend API)
 * TanStack Query hooks for gift-related operations using backend REST API
 * This replaces the Prisma-based implementation
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { giftsService, type GetGiftsParams, type GetContributionsParams, type SendThankYouDto } from '@/services'
import { queryKeys } from '@/lib/query-client'
import type { Gift, GiftCategory, GiftContribution, CreateGiftDto, ReserveGiftDto, ConfirmGiftDto } from '@/types/api'

// ============================================================================
// GIFTS
// ============================================================================

/**
 * Get all gifts for an event
 */
export function useGiftsApi(eventId: string, params?: GetGiftsParams) {
  return useQuery({
    queryKey: params
      ? queryKeys.gifts.filtered(eventId, params)
      : queryKeys.gifts.all(eventId),
    queryFn: () => giftsService.getGifts(eventId, params),
    enabled: !!eventId,
  })
}

/**
 * Get specific gift by ID
 */
export function useGiftApi(giftId: string) {
  return useQuery({
    queryKey: queryKeys.gifts.detail(giftId),
    queryFn: () => giftsService.getGift(giftId),
    enabled: !!giftId,
  })
}

/**
 * Create new gift
 */
export function useCreateGiftApi(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGiftDto) => giftsService.createGift(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.all(eventId) })
    },
  })
}

/**
 * Update gift
 */
export function useUpdateGiftApi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Gift> }) =>
      giftsService.updateGift(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.gifts.detail(id) })
      const previous = queryClient.getQueryData<Gift>(queryKeys.gifts.detail(id))

      if (previous) {
        queryClient.setQueryData<Gift>(queryKeys.gifts.detail(id), {
          ...previous,
          ...data,
        })
      }

      return { previous }
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.gifts.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.detail(id) })
      // Invalidate all gifts lists that might contain this gift
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
    },
  })
}

/**
 * Delete gift
 */
export function useDeleteGiftApi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => giftsService.deleteGift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
    },
  })
}

/**
 * Reserve gift
 */
export function useReserveGift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ giftId, data }: { giftId: string; data: ReserveGiftDto }) =>
      giftsService.reserveGift(giftId, data),
    onSuccess: (_data, { giftId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.detail(giftId) })
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
    },
  })
}

/**
 * Confirm gift purchase/payment
 */
export function useConfirmGift() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ giftId, data }: { giftId: string; data: ConfirmGiftDto }) =>
      giftsService.confirmGift(giftId, data),
    onSuccess: (_data, { giftId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.detail(giftId) })
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
    },
  })
}

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Get all gift categories for an event
 */
export function useGiftCategories(eventId: string) {
  return useQuery({
    queryKey: queryKeys.gifts.categories(eventId),
    queryFn: () => giftsService.getCategories(eventId),
    enabled: !!eventId,
  })
}

/**
 * Create gift category
 */
export function useCreateGiftCategory(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name: string; description?: string; iconUrl?: string }) =>
      giftsService.createCategory(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.categories(eventId) })
    },
  })
}

/**
 * Update gift category
 */
export function useUpdateGiftCategory(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GiftCategory> }) =>
      giftsService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.categories(eventId) })
    },
  })
}

/**
 * Delete gift category
 */
export function useDeleteGiftCategory(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => giftsService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.categories(eventId) })
    },
  })
}

// ============================================================================
// CONTRIBUTIONS
// ============================================================================

/**
 * Get all contributions for an event
 */
export function useGiftContributions(eventId: string, params?: GetContributionsParams) {
  return useQuery({
    queryKey: queryKeys.gifts.contributions(eventId),
    queryFn: () => giftsService.getContributions(eventId, params),
    enabled: !!eventId,
  })
}

/**
 * Update contribution
 */
export function useUpdateContribution(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GiftContribution> }) =>
      giftsService.updateContribution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.contributions(eventId) })
      queryClient.invalidateQueries({ queryKey: ['gifts'] })
    },
  })
}

// ============================================================================
// THANK YOU NOTES
// ============================================================================

/**
 * Get all thank-you notes for an event
 */
export function useThankYouNotes(eventId: string) {
  return useQuery({
    queryKey: queryKeys.gifts.thankYou(eventId),
    queryFn: () => giftsService.getThankYouNotes(eventId),
    enabled: !!eventId,
  })
}

/**
 * Send thank-you note
 */
export function useSendThankYou(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendThankYouDto) => giftsService.sendThankYou(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.gifts.thankYou(eventId) })
    },
  })
}
