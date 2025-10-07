/**
 * Templates Hooks
 * TanStack Query hooks for message template operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { templatesService } from '@/services'
import type { MessageTemplate, CreateTemplateDto } from '@/types/api'

/**
 * Get all templates for an event
 */
export function useTemplates(eventId: string) {
  return useQuery({
    queryKey: queryKeys.templates.all(eventId),
    queryFn: () => templatesService.getTemplates(eventId),
    enabled: !!eventId,
  })
}

/**
 * Get specific template by ID
 */
export function useTemplate(templateId: string) {
  return useQuery({
    queryKey: queryKeys.templates.detail(templateId),
    queryFn: () => templatesService.getTemplate(templateId),
    enabled: !!templateId,
  })
}

/**
 * Create new template
 */
export function useCreateTemplate(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTemplateDto) => templatesService.createTemplate(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(eventId) })
    },
  })
}

/**
 * Update template
 */
export function useUpdateTemplate(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MessageTemplate> }) =>
      templatesService.updateTemplate(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(eventId) })
    },
  })
}

/**
 * Delete template
 */
export function useDeleteTemplate(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templatesService.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(eventId) })
    },
  })
}

/**
 * Duplicate template
 */
export function useDuplicateTemplate(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => templatesService.duplicateTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all(eventId) })
    },
  })
}
