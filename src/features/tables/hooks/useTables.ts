'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import type { Table, TableInput, TablePlannerData, TableUpdate, SeatAssignment } from '@/schemas'
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

// Hook to fetch table planner data
export function useTablePlannerData(eventId?: string) {
  const params = useParams()
  const id = eventId || (params.id as string)

  return useQuery({
    queryKey: tablesKeys.planner(id),
    queryFn: () => fetchTablePlannerData(id),
    enabled: !!id,
  })
}

// Hook to create table
export function useCreateTable() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: (data: TableInput) => createTable(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.planner(eventId) })
    },
  })
}

// Hook to update table
export function useUpdateTable() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TableUpdate }) => updateTable(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: tablesKeys.planner(eventId) })

      // Snapshot previous value
      const previousData = queryClient.getQueryData<TablePlannerData>(tablesKeys.planner(eventId))

      // Optimistically update
      if (previousData) {
        queryClient.setQueryData<TablePlannerData>(tablesKeys.planner(eventId), {
          ...previousData,
          tables: previousData.tables.map((table) =>
            table.id === id ? { ...table, ...data } : table
          ),
        })
      }

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(tablesKeys.planner(eventId), context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.planner(eventId) })
    },
  })
}

// Hook to delete table
export function useDeleteTable() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: (id: string) => deleteTable(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tablesKeys.planner(eventId) })

      const previousData = queryClient.getQueryData<TablePlannerData>(tablesKeys.planner(eventId))

      if (previousData) {
        queryClient.setQueryData<TablePlannerData>(tablesKeys.planner(eventId), {
          ...previousData,
          tables: previousData.tables.filter((table) => table.id !== id),
        })
      }

      return { previousData }
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(tablesKeys.planner(eventId), context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.planner(eventId) })
    },
  })
}

// Hook to assign guest to seat
export function useAssignGuestToSeat() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ tableId, data }: { tableId: string; data: SeatAssignment }) =>
      assignGuestToSeat(tableId, data),
    onMutate: async ({ tableId, data }) => {
      await queryClient.cancelQueries({ queryKey: tablesKeys.planner(eventId) })

      const previousData = queryClient.getQueryData<TablePlannerData>(tablesKeys.planner(eventId))

      // Optimistic update will be handled by the component for better UX
      return { previousData }
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(tablesKeys.planner(eventId), context.previousData)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.planner(eventId) })
    },
  })
}

// Hook to unassign guest from seat
export function useUnassignGuestFromSeat() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: (seatId: string) => unassignGuestFromSeat(seatId),
    onError: () => {
      // Rollback handled by component
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.planner(eventId) })
    },
  })
}

// Hook to bulk update table positions
export function useBulkUpdateTablePositions() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: (updates: Array<{ id: string; x: number; y: number; rotation?: number }>) =>
      bulkUpdateTablePositions(updates),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tablesKeys.planner(eventId) })
    },
  })
}
