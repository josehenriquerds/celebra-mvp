/**
 * Tasks Hooks
 * TanStack Query hooks for task-related operations
 * Includes support for drag-and-drop calendar rescheduling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { tasksService, type GetTasksParams } from '@/services'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types/api'

/**
 * Get all tasks for an event
 */
export function useTasks(eventId: string, params?: GetTasksParams) {
  return useQuery({
    queryKey: params
      ? queryKeys.tasks.filtered(eventId, params)
      : queryKeys.tasks.all(eventId),
    queryFn: () => tasksService.getTasks(eventId, params),
    enabled: !!eventId,
  })
}

/**
 * Get specific task by ID
 */
export function useTask(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: () => tasksService.getTask(taskId),
    enabled: !!taskId,
  })
}

/**
 * Create new task
 */
export function useCreateTask(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskDto) => tasksService.createTask(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.summary(eventId) })
    },
  })
}

/**
 * Update task
 * Supports drag-and-drop date changes for calendar view
 */
export function useUpdateTask(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      tasksService.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.detail(id) })
      const previous = queryClient.getQueryData<Task>(queryKeys.tasks.detail(id))

      if (previous) {
        queryClient.setQueryData<Task>(queryKeys.tasks.detail(id), {
          ...previous,
          ...data,
        })
      }

      return { previous }
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tasks.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.summary(eventId) })
    },
  })
}

/**
 * Delete task
 */
export function useDeleteTask(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.summary(eventId) })
    },
  })
}

/**
 * Notify task owner
 */
export function useNotifyTaskOwner() {
  return useMutation({
    mutationFn: (taskId: string) => tasksService.notifyOwner(taskId),
  })
}
