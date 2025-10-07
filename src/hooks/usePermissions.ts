/**
 * Permissions Hooks
 * TanStack Query hooks for permission and user access operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { permissionsService, type UpdateEventUserDto } from '@/services'
import type { InviteUserDto } from '@/types/api'

/**
 * Get all users with access to an event
 */
export function useEventUsers(eventId: string) {
  return useQuery({
    queryKey: queryKeys.permissions.users(eventId),
    queryFn: () => permissionsService.getEventUsers(eventId),
    enabled: !!eventId,
  })
}

/**
 * Get all available roles
 */
export function useRoles() {
  return useQuery({
    queryKey: queryKeys.permissions.roles,
    queryFn: () => permissionsService.getRoles(),
    // Roles are relatively static, cache for longer
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Invite user to event
 */
export function useInviteUser(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InviteUserDto) => permissionsService.inviteUser(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.users(eventId) })
    },
  })
}

/**
 * Update event user permissions
 */
export function useUpdateEventUser(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateEventUserDto }) =>
      permissionsService.updateEventUser(eventId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.users(eventId) })
    },
  })
}

/**
 * Remove user from event
 */
export function useRemoveEventUser(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => permissionsService.removeEventUser(eventId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.users(eventId) })
    },
  })
}
