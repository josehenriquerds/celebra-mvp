/**
 * Checkins Hooks
 * TanStack Query hooks for check-in operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checkinsService } from '@/services'
import { queryKeys } from '@/lib/query-client'
import type { CreateCheckinDto } from '@/types/api'

/**
 * Get all check-ins for an event
 */
export function useCheckins(eventId: string) {
  return useQuery({
    queryKey: queryKeys.checkins.all(eventId),
    queryFn: () => checkinsService.getCheckins(eventId),
    enabled: !!eventId,
    // Check-in data needs to be fresh for real-time updates
    staleTime: 5 * 1000,
  })
}

/**
 * Create check-in
 */
export function useCreateCheckin(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCheckinDto) => checkinsService.createCheckin(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.checkins.all(eventId) })
    },
  })
}
