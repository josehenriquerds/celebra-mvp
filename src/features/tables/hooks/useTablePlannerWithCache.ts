'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import type { TablePlannerData } from '@/schemas'
import { tablesKeys } from './useTables'
import { fetchTablePlannerData } from '../services/tables.api'

function normalizeEventId(id: string | string[] | undefined): string | undefined {
  if (!id) return undefined
  return Array.isArray(id) ? id[0] : id
}

/**
 * Hook com persistência híbrida (localStorage + Backend)
 * Carrega primeiro do localStorage (stale-while-revalidate) e depois do backend
 */
export function useTablePlannerWithCache(eventId?: string) {
  const params = useParams()
  const resolvedId = eventId ?? normalizeEventId(params.id)
  const plannerKey = resolvedId
    ? tablesKeys.planner(resolvedId)
    : ([...tablesKeys.all, 'planner', 'pending'] as const)

  return useQuery({
    queryKey: plannerKey,
    queryFn: () => fetchTablePlannerData(resolvedId!),
    enabled: !!resolvedId,
    placeholderData: () => {
      // Carregar do localStorage como placeholder
      if (typeof window === 'undefined' || !resolvedId) return undefined

      try {
        const cached = localStorage.getItem(`planner-${resolvedId}`)
        if (cached) {
          const data = JSON.parse(cached)
          // Verificar se tem a estrutura esperada
          if (
            data &&
            typeof data === 'object' &&
            'tables' in data &&
            'unassigned' in data
          ) {
            return data as TablePlannerData
          }
        }
      } catch (error) {
        console.error('Error loading planner cache:', error)
      }
      return undefined
    },
    staleTime: 30000, // 30s - dados ficam "fresh" por 30 segundos
    gcTime: 5 * 60 * 1000, // 5 min - cache fica no garbage collector por 5 minutos
  })
}

/**
 * Hook para salvar layout completo (tables + elements)
 */
export function useSaveLayout() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = normalizeEventId(params.id)

  return useMutation({
    mutationFn: async (layout: { tables: any[]; elements: any[] }) => {
      if (!eventId) throw new Error('Event ID required')

      // TODO: Implementar endpoint PUT /api/events/[id]/layout
      const response = await fetch(`/api/events/${eventId}/layout`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 2,
          updatedAt: new Date().toISOString(),
          tables: layout.tables,
          elements: layout.elements,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save layout')
      }

      return response.json()
    },
    onMutate: async (layout) => {
      // Salvar no localStorage imediatamente
      if (eventId) {
        try {
          localStorage.setItem(
            `planner-${eventId}`,
            JSON.stringify({
              tables: layout.tables,
              elements: layout.elements,
              updatedAt: new Date().toISOString(),
            })
          )
        } catch (error) {
          console.error('Error saving to localStorage:', error)
        }
      }
    },
    onSuccess: (data) => {
      // Atualizar cache do TanStack Query
      if (eventId) {
        queryClient.setQueryData(tablesKeys.planner(eventId), data)
      }
    },
    onError: (error) => {
      console.error('Error saving layout to backend:', error)
      // Manter estado local em caso de erro
      // O toast de erro será mostrado pelo componente que usa esse hook
    },
  })
}
