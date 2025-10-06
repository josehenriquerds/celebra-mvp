/**
 * Checkins Service
 * Handles all check-in related API calls
 */

import { api } from '@/lib/api-client'
import type { Checkin, CreateCheckinDto } from '@/types/api'

export interface GetCheckinsResponse {
  checkins: Checkin[]
  stats: {
    total: number
    checked: number
    pending: number
  }
}

export const checkinsService = {
  /**
   * Get all check-ins for an event
   */
  getCheckins: (eventId: string) =>
    api.get<GetCheckinsResponse>(`/events/${eventId}/checkins`),

  /**
   * Create check-in
   */
  createCheckin: (data: CreateCheckinDto) =>
    api.post<Checkin>('/checkins', data),
}
