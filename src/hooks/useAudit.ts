/**
 * Audit Hooks
 * TanStack Query hooks for audit log operations
 */

import { useQuery } from '@tanstack/react-query'
import { auditService, type GetAuditLogsParams } from '@/services'
import { queryKeys } from '@/lib/query-client'

/**
 * Get audit logs for an event
 */
export function useAuditLogs(eventId: string, params?: GetAuditLogsParams) {
  return useQuery({
    queryKey: queryKeys.audit.logs(eventId, params || {}),
    queryFn: () => auditService.getAuditLogs(eventId, params),
    enabled: !!eventId,
    // Audit logs are historical, can be cached longer
    staleTime: 60 * 1000,
  })
}
