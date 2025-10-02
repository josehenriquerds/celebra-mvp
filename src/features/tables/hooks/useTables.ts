'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import type { TableInput, TablePlannerData, TableUpdate, SeatAssignment } from '@/schemas'
import {
  assignGuestToSeat,
  bulkUpdateTablePositions,
  createTable,
  deleteTable,
  fetchTablePlannerData,
  unassignGuestFromSeat,
  updateTable,
} from '../services/tables.api'

// Query keys factory
export const tablesKeys = {
  all: ['tables'] as const,
  lists: () => [...tablesKeys.all, 'list'] as const,
  list: (eventId: string) => [...tablesKeys.lists(), eventId] as const,
  planner: (eventId: string) => [...tablesKeys.all, 'planner', eventId] as const,
}

function normalizeEventId(id: string | string[] | undefined): string | undefined {
  if (!id) return undefined
  return Array.isArray(id) ? id[0] : id
}

function useEventId(): string {
  const params = useParams()
  const eventId = normalizeEventId(params.id)

  if (!eventId) {
    throw new Error('Event id is required to use table planner hooks')
  }

  return eventId
}

function usePlannerMutationHelpers() {
  const queryClient = useQueryClient()
  const eventId = useEventId()
  const plannerKey = tablesKeys.planner(eventId)

  const invalidatePlanner = () =>
    queryClient.invalidateQueries({
      queryKey: plannerKey,
    })

  const cancelPlannerQueries = () =>
    queryClient.cancelQueries({
      queryKey: plannerKey,
    })

  const getPlannerData = () => queryClient.getQueryData<TablePlannerData>(plannerKey)

  const setPlannerData = (data: TablePlannerData) =>
    queryClient.setQueryData<TablePlannerData>(plannerKey, data)

  return {
    eventId,
    plannerKey,
    queryClient,
    invalidatePlanner,
    cancelPlannerQueries,
    getPlannerData,
    setPlannerData,
  }
}

// Hook to fetch table planner data
export function useTablePlannerData(eventId?: string) {
  const params = useParams()
  const resolvedId = eventId ?? normalizeEventId(params.id)
  const plannerKey = resolvedId ? tablesKeys.planner(resolvedId) : [...tablesKeys.all, 'planner', 'pending'] as const

  return useQuery({
    queryKey: plannerKey,
    queryFn: () => fetchTablePlannerData(resolvedId!),
    enabled: !!resolvedId,
  })
}

// Hook to create table
export function useCreateTable() {
  const { eventId, invalidatePlanner } = usePlannerMutationHelpers()

  return useMutation({
    mutationFn: (data: TableInput) => createTable(eventId, data),
    onSuccess: invalidatePlanner,
  })
}

// Hook to update table
export function useUpdateTable() {
  const {
    cancelPlannerQueries,
    getPlannerData,
    setPlannerData,
    invalidatePlanner,
  } = usePlannerMutationHelpers()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TableUpdate }) => updateTable(id, data),
    onMutate: async ({ id, data }) => {
      await cancelPlannerQueries()

      const previousData = getPlannerData()

      if (previousData) {
        setPlannerData({
          ...previousData,
          tables: previousData.tables.map((table) =>
            table.id === id ? { ...table, ...data } : table
          ),
        })
      }

      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        setPlannerData(context.previousData)
      }
    },
    onSettled: invalidatePlanner,
  })
}

// Hook to delete table
export function useDeleteTable() {
  const {
    cancelPlannerQueries,
    getPlannerData,
    setPlannerData,
    invalidatePlanner,
  } = usePlannerMutationHelpers()

  return useMutation({
    mutationFn: (id: string) => deleteTable(id),
    onMutate: async (id) => {
      await cancelPlannerQueries()

      const previousData = getPlannerData()

      if (previousData) {
        setPlannerData({
          ...previousData,
          tables: previousData.tables.filter((table) => table.id !== id),
        })
      }

      return { previousData }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        setPlannerData(context.previousData)
      }
    },
    onSettled: invalidatePlanner,
  })
}

// Hook to assign guest to seat
export function useAssignGuestToSeat() {
  const { invalidatePlanner } = usePlannerMutationHelpers()

  return useMutation({
    mutationFn: ({ tableId, data }: { tableId: string; data: SeatAssignment }) =>
      assignGuestToSeat(tableId, data),
    onSettled: invalidatePlanner,
  })
}

// Hook to unassign guest from seat
export function useUnassignGuestFromSeat() {
  const { invalidatePlanner } = usePlannerMutationHelpers()

  return useMutation({
    mutationFn: (seatId: string) => unassignGuestFromSeat(seatId),
    onSettled: invalidatePlanner,
  })
}

// Hook to bulk update table positions
export function useBulkUpdateTablePositions() {
  const { invalidatePlanner } = usePlannerMutationHelpers()

  return useMutation({
    mutationFn: (updates: Array<{ id: string; x: number; y: number; rotation?: number }>) =>
      bulkUpdateTablePositions(updates),
    onSettled: invalidatePlanner,
  })
}
