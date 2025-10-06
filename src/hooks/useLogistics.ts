/**
 * Logistics Hooks
 * TanStack Query hooks for logistics and location operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { logisticsService } from '@/services'
import { queryKeys } from '@/lib/query-client'
import type { EventLocation, LogisticsInfo } from '@/types/api'

/**
 * Get all locations for an event
 */
export function useLocations(eventId: string) {
  return useQuery({
    queryKey: queryKeys.logistics.locations(eventId),
    queryFn: () => logisticsService.getLocations(eventId),
    enabled: !!eventId,
  })
}

/**
 * Create new location
 */
export function useCreateLocation(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<EventLocation>) =>
      logisticsService.createLocation(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logistics.locations(eventId) })
    },
  })
}

/**
 * Update location
 */
export function useUpdateLocation(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventLocation> }) =>
      logisticsService.updateLocation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logistics.locations(eventId) })
    },
  })
}

/**
 * Delete location
 */
export function useDeleteLocation(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => logisticsService.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logistics.locations(eventId) })
    },
  })
}

/**
 * Get logistics info for an event
 */
export function useLogistics(eventId: string) {
  return useQuery({
    queryKey: queryKeys.logistics.info(eventId),
    queryFn: () => logisticsService.getLogistics(eventId),
    enabled: !!eventId,
  })
}

/**
 * Update logistics info
 */
export function useUpdateLogistics(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<LogisticsInfo>) =>
      logisticsService.updateLogistics(eventId, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.logistics.info(eventId) })
      const previous = queryClient.getQueryData<LogisticsInfo>(
        queryKeys.logistics.info(eventId)
      )

      if (previous) {
        queryClient.setQueryData<LogisticsInfo>(queryKeys.logistics.info(eventId), {
          ...previous,
          ...data,
        })
      }

      return { previous }
    },
    onError: (_error, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          queryKeys.logistics.info(eventId),
          context.previous
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logistics.info(eventId) })
    },
  })
}
