/**
 * Segments Hooks
 * TanStack Query hooks for segmentation operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { segmentsService, type CreateSegmentDto } from '@/services'
import type { SegmentTag, SegmentCriteria, SendToSegmentDto } from '@/types/api'

/**
 * Get all segments for an event
 */
export function useSegments(eventId: string) {
  return useQuery({
    queryKey: queryKeys.segments.all(eventId),
    queryFn: () => segmentsService.getSegments(eventId),
    enabled: !!eventId,
  })
}

/**
 * Get specific segment by ID
 */
export function useSegment(segmentId: string) {
  return useQuery({
    queryKey: queryKeys.segments.detail(segmentId),
    queryFn: () => segmentsService.getSegment(segmentId),
    enabled: !!segmentId,
  })
}

/**
 * Create new segment
 */
export function useCreateSegment(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSegmentDto) => segmentsService.createSegment(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.segments.all(eventId) })
    },
  })
}

/**
 * Update segment
 */
export function useUpdateSegment(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SegmentTag> }) =>
      segmentsService.updateSegment(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.segments.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.segments.all(eventId) })
    },
  })
}

/**
 * Delete segment
 */
export function useDeleteSegment(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => segmentsService.deleteSegment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.segments.all(eventId) })
    },
  })
}

/**
 * Preview segment (get matching guests count)
 */
export function usePreviewSegment(eventId: string) {
  return useMutation({
    mutationFn: (criteria: SegmentCriteria) =>
      segmentsService.previewSegment(eventId, criteria),
  })
}

/**
 * Send message to segment
 */
export function useSendToSegment() {
  return useMutation({
    mutationFn: ({ segmentId, data }: { segmentId: string; data: SendToSegmentDto }) =>
      segmentsService.sendToSegment(segmentId, data),
  })
}
