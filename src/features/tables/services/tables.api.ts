import type { Table, TableInput, TablePlannerData, TableUpdate, SeatAssignment } from '@/schemas'

// Fetch table planner data (tables + unassigned guests + elements)
export async function fetchTablePlannerData(eventId: string): Promise<TablePlannerData> {
  const res = await fetch(`/api/events/${eventId}/tables`, {
    next: { tags: [`event-${eventId}-tables`] },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch table planner data')
  }

  return res.json() as Promise<TablePlannerData>
}

// Create table
export async function createTable(eventId: string, data: TableInput): Promise<Table> {
  const res = await fetch(`/api/events/${eventId}/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to create table')
  }

  return res.json() as Promise<Table>
}

// Update table
export async function updateTable(tableId: string, data: TableUpdate): Promise<Table> {
  const res = await fetch(`/api/tables/${tableId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to update table')
  }

  return res.json() as Promise<Table>
}

// Delete table
export async function deleteTable(tableId: string): Promise<void> {
  const res = await fetch(`/api/tables/${tableId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to delete table')
  }
}

// Assign guest to seat
export async function assignGuestToSeat(tableId: string, data: SeatAssignment): Promise<void> {
  const res = await fetch(`/api/tables/${tableId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to assign guest to seat')
  }
}

// Unassign guest from seat
export async function unassignGuestFromSeat(seatId: string): Promise<void> {
  const res = await fetch(`/api/seats/${seatId}/unassign`, {
    method: 'POST',
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to unassign guest from seat')
  }
}

// Bulk update table positions
export async function bulkUpdateTablePositions(
  updates: Array<{ id: string; x: number; y: number; rotation?: number }>
): Promise<void> {
  await Promise.all(
    updates.map((update) =>
      fetch(`/api/tables/${update.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x: update.x, y: update.y, rotation: update.rotation }),
      })
    )
  )
}
