/**
 * Guests Service
 * Handles all guest-related API calls
 */

import { api } from '@/lib/api-client'
import type {
  Guest,
  CreateGuestDto,
  UpdateGuestDto,
  BulkInviteDto,
  PagedResponse,
  TimelineEntry,
} from '@/types/api'

export interface GetGuestsParams {
  eventId: string
  filter?: 'vip' | 'children' | 'pending' | 'confirmed' | 'no_phone'
  search?: string
  page?: number
  limit?: number
}

export const guestsService = {
  /**
   * Get all guests for an event
   */
  getGuests: ({ eventId, ...params }: GetGuestsParams) =>
    api.get<PagedResponse<Guest>>(`/events/${eventId}/guests`, { params }),

  /**
   * Get specific guest by ID
   */
  getGuest: (guestId: string) => api.get<Guest>(`/guests/${guestId}`),

  /**
   * Create new guest
   */
  createGuest: (eventId: string, data: CreateGuestDto) =>
    api.post<Guest>(`/events/${eventId}/guests`, data),

  /**
   * Update guest
   */
  updateGuest: (guestId: string, data: UpdateGuestDto) =>
    api.patch<Guest>(`/guests/${guestId}`, data),

  /**
   * Delete guest
   */
  deleteGuest: (guestId: string) => api.delete<void>(`/guests/${guestId}`),

  /**
   * Bulk invite guests
   */
  bulkInvite: (eventId: string, data: BulkInviteDto) =>
    api.post<{ sent: number; failed: string[] }>(
      `/events/${eventId}/guests/bulk-invite`,
      data
    ),

  /**
   * Get guest timeline
   */
  getGuestTimeline: (guestId: string) =>
    api.get<TimelineEntry[]>(`/guests/${guestId}/timeline`),
}
