/**
 * Segments Service
 * Handles all segment and segmentation API calls
 */

import { api } from '@/lib/api-client'
import type { SegmentTag, SegmentCriteria, SendToSegmentDto } from '@/types/api'

export interface CreateSegmentDto {
  name: string
  criteria: SegmentCriteria
}

export const segmentsService = {
  /**
   * Get all segments for an event
   */
  getSegments: (eventId: string) =>
    api.get<SegmentTag[]>(`/events/${eventId}/segments`),

  /**
   * Get specific segment by ID
   */
  getSegment: (segmentId: string) =>
    api.get<SegmentTag>(`/segments/${segmentId}`),

  /**
   * Create new segment
   */
  createSegment: (eventId: string, data: CreateSegmentDto) =>
    api.post<SegmentTag>(`/events/${eventId}/segments`, data),

  /**
   * Update segment
   */
  updateSegment: (segmentId: string, data: Partial<SegmentTag>) =>
    api.patch<SegmentTag>(`/segments/${segmentId}`, data),

  /**
   * Delete segment
   */
  deleteSegment: (segmentId: string) =>
    api.delete<void>(`/segments/${segmentId}`),

  /**
   * Preview segment (get matching guests count)
   */
  previewSegment: (eventId: string, criteria: SegmentCriteria) =>
    api.post<{ guestCount: number }>(
      `/events/${eventId}/segments/preview`,
      criteria
    ),

  /**
   * Send message to segment
   */
  sendToSegment: (segmentId: string, data: SendToSegmentDto) =>
    api.post<{ sent: number; failed: string[] }>(
      `/segments/${segmentId}/send`,
      data
    ),
}
