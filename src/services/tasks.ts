/**
 * Tasks Service
 * Handles all task-related API calls
 */

import { api } from '@/lib/api-client'
import type { Task, CreateTaskDto, UpdateTaskDto } from '@/types/api'

export interface GetTasksParams {
  status?: 'aberta' | 'em_andamento' | 'concluida'
  dueDate?: string
}

export const tasksService = {
  /**
   * Get all tasks for an event
   */
  getTasks: (eventId: string, params?: GetTasksParams) =>
    api.get<Task[]>(`/events/${eventId}/tasks`, { params }),

  /**
   * Get specific task by ID
   */
  getTask: (taskId: string) => api.get<Task>(`/tasks/${taskId}`),

  /**
   * Create new task
   */
  createTask: (eventId: string, data: CreateTaskDto) =>
    api.post<Task>(`/events/${eventId}/tasks`, data),

  /**
   * Update task (including drag-and-drop date changes)
   */
  updateTask: (taskId: string, data: UpdateTaskDto) =>
    api.patch<Task>(`/tasks/${taskId}`, data),

  /**
   * Delete task
   */
  deleteTask: (taskId: string) => api.delete<void>(`/tasks/${taskId}`),

  /**
   * Notify task owner
   */
  notifyOwner: (taskId: string) =>
    api.post<{ success: boolean }>(`/tasks/${taskId}/notify-owner`),
}
