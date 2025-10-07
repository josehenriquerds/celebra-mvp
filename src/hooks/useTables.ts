/**
 * Tables Hooks
 * TanStack Query hooks for table and seating arrangement operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { tablesService, type BrideGroomTemplateDto } from '@/services'
import type { Table, TableLayout, CreateTableDto, AssignSeatDto } from '@/types/api'

/**
 * Get all tables and layout for an event
 */
export function useTables(eventId: string) {
  return useQuery({
    queryKey: queryKeys.tables.all(eventId),
    queryFn: () => tablesService.getTables(eventId),
    enabled: !!eventId,
  })
}

/**
 * Get specific table by ID
 */
export function useTable(tableId: string) {
  return useQuery({
    queryKey: queryKeys.tables.detail(tableId),
    queryFn: () => tablesService.getTable(tableId),
    enabled: !!tableId,
  })
}

/**
 * Create new table
 */
export function useCreateTable(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTableDto) => tablesService.createTable(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all(eventId) })
    },
  })
}

/**
 * Update table
 */
export function useUpdateTable(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Table> }) =>
      tablesService.updateTable(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tables.detail(id) })
      const previous = queryClient.getQueryData<Table>(queryKeys.tables.detail(id))

      if (previous) {
        queryClient.setQueryData<Table>(queryKeys.tables.detail(id), {
          ...previous,
          ...data,
        })
      }

      return { previous }
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tables.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all(eventId) })
    },
  })
}

/**
 * Delete table
 */
export function useDeleteTable(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tablesService.deleteTable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all(eventId) })
    },
  })
}

/**
 * Save complete table layout (zoom, positions, elements)
 * CRITICAL for fixing Planner bugs: zoom and element persistence
 */
export function useSaveTableLayout(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (layout: TableLayout) => tablesService.saveLayout(eventId, layout),
    onMutate: async (layout) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tables.all(eventId) })
      const previous = queryClient.getQueryData(queryKeys.tables.all(eventId))

      // Optimistically update layout
      queryClient.setQueryData(queryKeys.tables.all(eventId), (old: any) => {
        if (!old) return old
        return {
          ...old,
          layout,
        }
      })

      return { previous }
    },
    onError: (_error, _layout, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tables.all(eventId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all(eventId) })
    },
  })
}

/**
 * Assign guest to table/seat
 */
export function useAssignSeat(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tableId, data }: { tableId: string; data: AssignSeatDto }) =>
      tablesService.assignSeat(tableId, data),
    onSuccess: (_data, { data }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all(eventId) })
      // Also invalidate guest detail to show updated table assignment
      queryClient.invalidateQueries({ queryKey: queryKeys.guests.detail(data.guestId) })
    },
  })
}

/**
 * Unassign guest from seat
 */
export function useUnassignSeat(eventId: string, guestId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (seatId: string) => tablesService.unassignSeat(seatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all(eventId) })
      if (guestId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.guests.detail(guestId) })
      }
    },
  })
}

/**
 * Create bride & groom table from template
 */
export function useCreateBrideGroomTable(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BrideGroomTemplateDto) =>
      tablesService.createBrideGroomTable(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables.all(eventId) })
    },
  })
}
