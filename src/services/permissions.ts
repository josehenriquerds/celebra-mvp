/**
 * Permissions Service
 * Handles all permission and user access API calls
 */

import { api } from '@/lib/api-client'
import type { EventUser, Role, InviteUserDto, RoleType } from '@/types/api'

export interface UpdateEventUserDto {
  isActive?: boolean
  roleType?: RoleType
}

export const permissionsService = {
  /**
   * Get all users with access to an event
   */
  getEventUsers: (eventId: string) =>
    api.get<EventUser[]>(`/events/${eventId}/users`),

  /**
   * Invite user to event
   */
  inviteUser: (eventId: string, data: InviteUserDto) =>
    api.post<EventUser>(`/events/${eventId}/users/invite`, data),

  /**
   * Update event user permissions
   */
  updateEventUser: (eventId: string, userId: string, data: UpdateEventUserDto) =>
    api.patch<EventUser>(`/events/${eventId}/users/${userId}`, data),

  /**
   * Remove user from event
   */
  removeEventUser: (eventId: string, userId: string) =>
    api.delete<void>(`/events/${eventId}/users/${userId}`),

  /**
   * Get all available roles
   */
  getRoles: () => api.get<Role[]>('/roles'),
}
