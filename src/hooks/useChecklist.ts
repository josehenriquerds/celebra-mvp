/**
 * Checklist Hooks
 * TanStack Query hooks for event checklist operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { checklistService, type UpdateChecklistItemDto } from '@/services'
import { queryKeys } from '@/lib/query-client'
import type { EventChecklist, CreateChecklistItemDto } from '@/types/api'

/**
 * Get all checklist items for an event
 */
export function useChecklist(eventId: string) {
  return useQuery({
    queryKey: queryKeys.checklist.all(eventId),
    queryFn: () => checklistService.getChecklist(eventId),
    enabled: !!eventId,
  })
}

/**
 * Get specific checklist item by ID
 */
export function useChecklistItem(itemId: string) {
  return useQuery({
    queryKey: queryKeys.checklist.detail(itemId),
    queryFn: () => checklistService.getChecklistItem(itemId),
    enabled: !!itemId,
  })
}

/**
 * Create new checklist item
 */
export function useCreateChecklistItem(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateChecklistItemDto) =>
      checklistService.createChecklistItem(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.checklist.all(eventId) })
    },
  })
}

/**
 * Update checklist item
 */
export function useUpdateChecklistItem(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChecklistItemDto }) =>
      checklistService.updateChecklistItem(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.checklist.detail(id) })
      const previous = queryClient.getQueryData<EventChecklist>(
        queryKeys.checklist.detail(id)
      )

      if (previous) {
        queryClient.setQueryData<EventChecklist>(queryKeys.checklist.detail(id), {
          ...previous,
          ...data,
        })
      }

      return { previous }
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.checklist.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.checklist.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.checklist.all(eventId) })
    },
  })
}

/**
 * Delete checklist item
 */
export function useDeleteChecklistItem(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => checklistService.deleteChecklistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.checklist.all(eventId) })
    },
  })
}
