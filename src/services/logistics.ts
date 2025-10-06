/**
 * Logistics Service
 * Handles all logistics and location API calls
 */

import { api } from '@/lib/api-client'
import type { EventLocation, LogisticsInfo } from '@/types/api'

export const logisticsService = {
  /**
   * Get all locations for an event
   */
  getLocations: (eventId: string) =>
    api.get<EventLocation[]>(`/events/${eventId}/locations`),

  /**
   * Create new location
   */
  createLocation: (eventId: string, data: Partial<EventLocation>) =>
    api.post<EventLocation>(`/events/${eventId}/locations`, data),

  /**
   * Update location
   */
  updateLocation: (locationId: string, data: Partial<EventLocation>) =>
    api.patch<EventLocation>(`/locations/${locationId}`, data),

  /**
   * Delete location
   */
  deleteLocation: (locationId: string) =>
    api.delete<void>(`/locations/${locationId}`),

  /**
   * Get logistics info for an event
   */
  getLogistics: (eventId: string) =>
    api.get<LogisticsInfo>(`/events/${eventId}/logistics`),

  /**
   * Update logistics info
   */
  updateLogistics: (eventId: string, data: Partial<LogisticsInfo>) =>
    api.put<LogisticsInfo>(`/events/${eventId}/logistics`, data),
}
