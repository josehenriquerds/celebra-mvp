/**
 * Tables Service
 * Handles all table and seating arrangement API calls
 */

import { api } from '@/lib/api-client'
import type {
  Table,
  TableLayout,
  CreateTableDto,
  AssignSeatDto,
  SeatAssignment,
} from '@/types/api'

export interface GetTablesResponse {
  tables: Table[]
  layout?: TableLayout
}

export interface BrideGroomTemplateDto {
  includeParents: boolean
  additionalGuests?: string[]
}

export const tablesService = {
  /**
   * Get all tables and layout for an event
   */
  getTables: (eventId: string) =>
    api.get<GetTablesResponse>(`/events/${eventId}/tables`),

  /**
   * Get specific table by ID
   */
  getTable: (tableId: string) => api.get<Table>(`/tables/${tableId}`),

  /**
   * Create new table
   */
  createTable: (eventId: string, data: CreateTableDto) =>
    api.post<Table>(`/events/${eventId}/tables`, data),

  /**
   * Update table
   */
  updateTable: (tableId: string, data: Partial<Table>) =>
    api.patch<Table>(`/tables/${tableId}`, data),

  /**
   * Delete table
   */
  deleteTable: (tableId: string) => api.delete<void>(`/tables/${tableId}`),

  /**
   * Save complete table layout (positions, zoom, elements)
   */
  saveLayout: (eventId: string, layout: TableLayout) =>
    api.put<{ success: boolean }>(`/events/${eventId}/tables/layout`, layout),

  /**
   * Assign guest to table/seat
   */
  assignSeat: (tableId: string, data: AssignSeatDto) =>
    api.post<SeatAssignment>(`/tables/${tableId}/assign`, data),

  /**
   * Unassign guest from seat
   */
  unassignSeat: (seatId: string) =>
    api.delete<{ success: boolean }>(`/seats/${seatId}/unassign`),

  /**
   * Create bride & groom table from template
   */
  createBrideGroomTable: (eventId: string, data: BrideGroomTemplateDto) =>
    api.post<Table>(`/events/${eventId}/tables/bride-groom-template`, data),
}
