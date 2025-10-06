/**
 * TanStack Query Client Configuration
 * Configured for optimal performance with retry and stale time settings
 */

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 30 seconds
      staleTime: 30 * 1000,
      // Cached data kept for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus for important data
      refetchOnWindowFocus: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      // Don't refetch on reconnect if data is fresh
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Exponential backoff for mutation retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
})

/**
 * Query Key Factory
 * Standardized query keys for consistent cache management
 */
export const queryKeys = {
  // Events
  events: {
    all: ['events'] as const,
    detail: (id: string) => ['events', id] as const,
    summary: (id: string) => ['events', id, 'summary'] as const,
    timeline: (id: string) => ['events', id, 'timeline'] as const,
  },

  // Guests
  guests: {
    all: (eventId: string) => ['guests', eventId] as const,
    filtered: (eventId: string, filters: Record<string, unknown>) =>
      ['guests', eventId, filters] as const,
    detail: (id: string) => ['guests', 'detail', id] as const,
    timeline: (id: string) => ['guests', 'detail', id, 'timeline'] as const,
  },

  // Gifts
  gifts: {
    all: (eventId: string) => ['gifts', eventId] as const,
    filtered: (eventId: string, filters: Record<string, unknown>) =>
      ['gifts', eventId, filters] as const,
    detail: (id: string) => ['gifts', 'detail', id] as const,
    categories: (eventId: string) => ['gifts', eventId, 'categories'] as const,
    contributions: (eventId: string) => ['gifts', eventId, 'contributions'] as const,
    thankYou: (eventId: string) => ['gifts', eventId, 'thank-you'] as const,
  },

  // Tables
  tables: {
    all: (eventId: string) => ['tables', eventId] as const,
    detail: (id: string) => ['tables', 'detail', id] as const,
  },

  // Tasks
  tasks: {
    all: (eventId: string) => ['tasks', eventId] as const,
    filtered: (eventId: string, filters: Record<string, unknown>) =>
      ['tasks', eventId, filters] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },

  // Vendors
  vendors: {
    all: (eventId: string) => ['vendors', eventId] as const,
    detail: (id: string) => ['vendors', 'detail', id] as const,
    timeline: (id: string) => ['vendors', 'detail', id, 'timeline'] as const,
  },

  // Checkins
  checkins: {
    all: (eventId: string) => ['checkins', eventId] as const,
  },

  // Segments
  segments: {
    all: (eventId: string) => ['segments', eventId] as const,
    detail: (id: string) => ['segments', 'detail', id] as const,
  },

  // Templates
  templates: {
    all: (eventId: string) => ['templates', eventId] as const,
    detail: (id: string) => ['templates', 'detail', id] as const,
  },

  // Checklist
  checklist: {
    all: (eventId: string) => ['checklist', eventId] as const,
    detail: (id: string) => ['checklist', 'detail', id] as const,
  },

  // Logistics
  logistics: {
    locations: (eventId: string) => ['logistics', eventId, 'locations'] as const,
    info: (eventId: string) => ['logistics', eventId, 'info'] as const,
  },

  // Audit
  audit: {
    logs: (eventId: string, filters: Record<string, unknown>) =>
      ['audit', eventId, filters] as const,
  },

  // Permissions
  permissions: {
    users: (eventId: string) => ['permissions', eventId, 'users'] as const,
    roles: ['permissions', 'roles'] as const,
  },

  // Notifications
  notifications: {
    all: (filters?: Record<string, unknown>) =>
      filters ? (['notifications', filters] as const) : (['notifications'] as const),
  },
}
