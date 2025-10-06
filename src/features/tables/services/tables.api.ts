/**
 * Tables API Service
 * Now uses the .NET backend API via apiClient
 */

import { api } from '@/lib/api-client'
import type { Table, TableInput, TablePlannerData, TableUpdate, SeatAssignment } from '@/schemas'

// Fetch table planner data (tables + unassigned guests + elements)
export async function fetchTablePlannerData(eventId: string): Promise<TablePlannerData> {
  return api.get<TablePlannerData>(`/events/${eventId}/tables`)
}

// Create table
export async function createTable(eventId: string, data: TableInput): Promise<Table> {
  return api.post<Table>(`/events/${eventId}/tables`, data)
}

// Update table
export async function updateTable(tableId: string, data: TableUpdate): Promise<Table> {
  return api.patch<Table>(`/tables/${tableId}`, data)
}

// Delete table
export async function deleteTable(tableId: string): Promise<void> {
  return api.delete<void>(`/tables/${tableId}`)
}

// Assign guest to seat
export async function assignGuestToSeat(tableId: string, data: SeatAssignment): Promise<void> {
  return api.post<void>(`/tables/${tableId}/assign`, data)
}

// Unassign guest from seat
export async function unassignGuestFromSeat(seatId: string): Promise<void> {
  return api.post<void>(`/seats/${seatId}/unassign`)
}

// Bulk update table positions
export async function bulkUpdateTablePositions(
  updates: Array<{ id: string; x: number; y: number; rotation?: number }>
): Promise<void> {
  await Promise.all(
    updates.map((update) =>
      api.patch<Table>(`/tables/${update.id}`, {
        x: update.x,
        y: update.y,
        rotation: update.rotation,
      })
    )
  )
}
