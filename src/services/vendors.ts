/**
 * Vendors Service
 * Handles all vendor-related API calls
 */

import { api } from '@/lib/api-client'
import type { Vendor, CreateVendorDto, TimelineEntry } from '@/types/api'

export const vendorsService = {
  /**
   * Get all vendors for an event
   */
  getVendors: (eventId: string) =>
    api.get<Vendor[]>(`/events/${eventId}/vendors`),

  /**
   * Get specific vendor by ID
   */
  getVendor: (vendorId: string) => api.get<Vendor>(`/vendors/${vendorId}`),

  /**
   * Create new vendor
   */
  createVendor: (eventId: string, data: CreateVendorDto) =>
    api.post<Vendor>(`/events/${eventId}/vendors`, data),

  /**
   * Update vendor
   */
  updateVendor: (vendorId: string, data: Partial<Vendor>) =>
    api.patch<Vendor>(`/vendors/${vendorId}`, data),

  /**
   * Delete vendor
   */
  deleteVendor: (vendorId: string) => api.delete<void>(`/vendors/${vendorId}`),

  /**
   * Get vendor timeline
   */
  getVendorTimeline: (vendorId: string) =>
    api.get<TimelineEntry[]>(`/vendors/${vendorId}/timeline`),
}
