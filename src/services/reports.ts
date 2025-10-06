/**
 * Reports & Backup Service
 * Handles all report generation and backup API calls
 */

import { api } from '@/lib/api-client'
import type { Report, ReportType, ReportFormat, BackupDto } from '@/types/api'

export interface GenerateReportParams {
  type: ReportType
  format: ReportFormat
}

export const reportsService = {
  /**
   * Generate report for an event
   */
  generateReport: (eventId: string, params: GenerateReportParams) =>
    api.get<Report | Blob>(`/events/${eventId}/reports`, {
      params,
      responseType: params.format === 'pdf' ? 'blob' : 'json',
    }),

  /**
   * Request backup via email
   */
  requestBackup: (eventId: string, data: BackupDto) =>
    api.post<{ success: boolean }>(`/events/${eventId}/backup`, data),
}
