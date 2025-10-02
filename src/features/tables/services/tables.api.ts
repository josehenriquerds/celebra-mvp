import type { Table, TableInput, TablePlannerData, TableUpdate, SeatAssignment } from '@/schemas'

type ApiFetchInit = RequestInit & {
  next?: {
    revalidate?: number | false
    tags?: string[]
  }
  json?: unknown
}

async function apiFetch<T>(url: string, init: ApiFetchInit = {}): Promise<T> {
  const { json, ...fetchInit } = init
  const headers = new Headers(fetchInit.headers)

  if (json !== undefined) {
    fetchInit.body = JSON.stringify(json)
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  } else if (fetchInit.body && !(fetchInit.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, { ...fetchInit, headers })

  if (!response.ok) {
    let message = response.statusText

    if (response.headers.get('content-type')?.includes('application/json')) {
      try {
        const body = (await response.json()) as Record<string, unknown>
        const messageFromBody = body['message']
        const errorFromBody = body['error']

        if (typeof messageFromBody === 'string') {
          message = messageFromBody
        } else if (typeof errorFromBody === 'string') {
          message = errorFromBody
        }
      } catch {
        // ignore JSON parse errors for error responses
      }
    }

    throw new Error(message || 'Request failed')
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    return (await response.json()) as T
  }

  return undefined as T
}

// Fetch table planner data (tables + unassigned guests + elements)
export async function fetchTablePlannerData(eventId: string): Promise<TablePlannerData> {
  return apiFetch<TablePlannerData>(`/api/events/${eventId}/tables`, {
    next: { tags: [`event-${eventId}-tables`] },
  })
}

// Create table
export async function createTable(eventId: string, data: TableInput): Promise<Table> {
  return apiFetch<Table>(`/api/events/${eventId}/tables`, {
    method: 'POST',
    json: data,
  })
}

// Update table
export async function updateTable(tableId: string, data: TableUpdate): Promise<Table> {
  return apiFetch<Table>(`/api/tables/${tableId}`, {
    method: 'PATCH',
    json: data,
  })
}

// Delete table
export async function deleteTable(tableId: string): Promise<void> {
  await apiFetch(`/api/tables/${tableId}`, {
    method: 'DELETE',
  })
}

// Assign guest to seat
export async function assignGuestToSeat(tableId: string, data: SeatAssignment): Promise<void> {
  await apiFetch(`/api/tables/${tableId}/assign`, {
    method: 'POST',
    json: data,
  })
}

// Unassign guest from seat
export async function unassignGuestFromSeat(seatId: string): Promise<void> {
  await apiFetch(`/api/seats/${seatId}/unassign`, {
    method: 'POST',
  })
}

// Bulk update table positions
export async function bulkUpdateTablePositions(
  updates: Array<{ id: string; x: number; y: number; rotation?: number }>
): Promise<void> {
  await Promise.all(
    updates.map((update) =>
      apiFetch(`/api/tables/${update.id}`, {
        method: 'PATCH',
        json: { x: update.x, y: update.y, rotation: update.rotation },
      })
    )
  )
}
