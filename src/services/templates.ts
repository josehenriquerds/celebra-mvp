/**
 * Templates Service
 * Handles all message template API calls
 */

import { api } from '@/lib/api-client'
import type { MessageTemplate, CreateTemplateDto } from '@/types/api'

export const templatesService = {
  /**
   * Get all templates for an event
   */
  getTemplates: (eventId: string) =>
    api.get<MessageTemplate[]>(`/events/${eventId}/templates`),

  /**
   * Get specific template by ID
   */
  getTemplate: (templateId: string) =>
    api.get<MessageTemplate>(`/templates/${templateId}`),

  /**
   * Create new template
   */
  createTemplate: (eventId: string, data: CreateTemplateDto) =>
    api.post<MessageTemplate>(`/events/${eventId}/templates`, data),

  /**
   * Update template
   */
  updateTemplate: (templateId: string, data: Partial<MessageTemplate>) =>
    api.patch<MessageTemplate>(`/templates/${templateId}`, data),

  /**
   * Delete template
   */
  deleteTemplate: (templateId: string) =>
    api.delete<void>(`/templates/${templateId}`),

  /**
   * Duplicate template
   */
  duplicateTemplate: (templateId: string) =>
    api.post<MessageTemplate>(`/templates/${templateId}/duplicate`),
}
