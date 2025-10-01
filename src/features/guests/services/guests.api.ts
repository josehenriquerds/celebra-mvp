import type { Guest, GuestFormData, GuestUpdateData, GuestWithTimeline } from '@/schemas'

// Fetch guests for an event
export async function fetchGuests(eventId: string): Promise<Guest[]> {
  const res = await fetch(`/api/events/${eventId}/guests`, {
    next: { tags: [`event-${eventId}-guests`] },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch guests')
  }

  return res.json() as Promise<Guest[]>
}

// Fetch single guest with timeline
export async function fetchGuest(guestId: string): Promise<GuestWithTimeline> {
  const res = await fetch(`/api/guests/${guestId}`)

  if (!res.ok) {
    throw new Error('Failed to fetch guest')
  }

  return res.json() as Promise<GuestWithTimeline>
}

// Create guest
export async function createGuest(eventId: string, data: GuestFormData): Promise<Guest> {
  const res = await fetch(`/api/events/${eventId}/guests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to create guest')
  }

  return res.json() as Promise<Guest>
}

// Update guest
export async function updateGuest(guestId: string, data: GuestUpdateData): Promise<Guest> {
  const res = await fetch(`/api/guests/${guestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to update guest')
  }

  return res.json() as Promise<Guest>
}

// Delete guest
export async function deleteGuest(guestId: string): Promise<void> {
  const res = await fetch(`/api/guests/${guestId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to delete guest')
  }
}

// Fetch guest timeline
export async function fetchGuestTimeline(guestId: string) {
  const res = await fetch(`/api/guests/${guestId}/timeline`)

  if (!res.ok) {
    throw new Error('Failed to fetch guest timeline')
  }

  return res.json()
}
