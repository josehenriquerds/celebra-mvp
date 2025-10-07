/**
 * Vendors Hooks
 * TanStack Query hooks for vendor-related operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-client'
import { vendorsService } from '@/services'
import type { Vendor, CreateVendorDto } from '@/types/api'

/**
 * Get all vendors for an event
 */
export function useVendors(eventId: string) {
  return useQuery({
    queryKey: queryKeys.vendors.all(eventId),
    queryFn: () => vendorsService.getVendors(eventId),
    enabled: !!eventId,
  })
}

/**
 * Get specific vendor by ID
 */
export function useVendor(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.vendors.detail(vendorId),
    queryFn: () => vendorsService.getVendor(vendorId),
    enabled: !!vendorId,
  })
}

/**
 * Get vendor timeline
 */
export function useVendorTimeline(vendorId: string) {
  return useQuery({
    queryKey: queryKeys.vendors.timeline(vendorId),
    queryFn: () => vendorsService.getVendorTimeline(vendorId),
    enabled: !!vendorId,
  })
}

/**
 * Create new vendor
 */
export function useCreateVendor(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVendorDto) => vendorsService.createVendor(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.summary(eventId) })
    },
  })
}

/**
 * Update vendor
 */
export function useUpdateVendor(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) =>
      vendorsService.updateVendor(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.vendors.detail(id) })
      const previous = queryClient.getQueryData<Vendor>(queryKeys.vendors.detail(id))

      if (previous) {
        queryClient.setQueryData<Vendor>(queryKeys.vendors.detail(id), {
          ...previous,
          ...data,
        })
      }

      return { previous }
    },
    onError: (_error, { id }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.vendors.detail(id), context.previous)
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.detail(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all(eventId) })
    },
  })
}

/**
 * Delete vendor
 */
export function useDeleteVendor(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => vendorsService.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vendors.all(eventId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.events.summary(eventId) })
    },
  })
}
