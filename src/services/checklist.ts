/**
 * Checklist Service
 * Handles all event checklist API calls
 */

import { api } from '@/lib/api-client'
import type { EventChecklist, CreateChecklistItemDto } from '@/types/api'

export interface UpdateChecklistItemDto {
  status?: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado'
  completedByContactId?: string
  completionNotes?: string
}

export const checklistService = {
  /**
   * Get all checklist items for an event
   */
  getChecklist: (eventId: string) =>
    api.get<EventChecklist[]>(`/events/${eventId}/checklist`),

  /**
   * Get specific checklist item by ID
   */
  getChecklistItem: (itemId: string) =>
    api.get<EventChecklist>(`/checklist/${itemId}`),

  /**
   * Create new checklist item
   */
  createChecklistItem: (eventId: string, data: CreateChecklistItemDto) =>
    api.post<EventChecklist>(`/events/${eventId}/checklist`, data),

  /**
   * Update checklist item
   */
  updateChecklistItem: (itemId: string, data: UpdateChecklistItemDto) =>
    api.patch<EventChecklist>(`/checklist/${itemId}`, data),

  /**
   * Delete checklist item
   */
  deleteChecklistItem: (itemId: string) =>
    api.delete<void>(`/checklist/${itemId}`),
}
