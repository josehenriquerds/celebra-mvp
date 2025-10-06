/**
 * Audit Service
 * Handles all audit log API calls
 */

import { api } from '@/lib/api-client'
import type { AuditLog } from '@/types/api'

export interface GetAuditLogsParams {
  entityType?: 'convidado' | 'presente' | 'fornecedor' | 'tarefa'
  action?: 'criar' | 'atualizar' | 'excluir'
  startDate?: string
  endDate?: string
}

export const auditService = {
  /**
   * Get audit logs for an event
   */
  getAuditLogs: (eventId: string, params?: GetAuditLogsParams) =>
    api.get<AuditLog[]>(`/events/${eventId}/audit`, { params }),
}
