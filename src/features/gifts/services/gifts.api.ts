import type { Gift, GiftFormData, GiftStatus } from '@/schemas'

// API response types
export interface GiftsResponse {
  gifts: Gift[]
  total: number
}

// Fetch gifts for an event
export async function fetchGifts(eventId: string): Promise<Gift[]> {
  const res = await fetch(`/api/events/${eventId}/gifts`, {
    next: { tags: [`event-${eventId}-gifts`] },
  })

  if (!res.ok) {
    throw new Error('Failed to fetch gifts')
  }

  return res.json() as Promise<Gift[]>
}

// Create gift
export async function createGift(eventId: string, data: GiftFormData): Promise<Gift> {
  const res = await fetch(`/api/events/${eventId}/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to create gift')
  }

  return res.json() as Promise<Gift>
}

// Update gift
export async function updateGift(giftId: string, data: Partial<GiftFormData>): Promise<Gift> {
  const res = await fetch(`/api/gifts/${giftId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to update gift')
  }

  return res.json() as Promise<Gift>
}

// Delete gift
export async function deleteGift(giftId: string): Promise<void> {
  const res = await fetch(`/api/gifts/${giftId}`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to delete gift')
  }
}

// Update gift status
export async function updateGiftStatus(giftId: string, status: GiftStatus): Promise<Gift> {
  const res = await fetch(`/api/gifts/${giftId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to update gift status')
  }

  return res.json() as Promise<Gift>
}

// Reserve gift
export async function reserveGift(giftId: string, guestId: string): Promise<Gift> {
  const res = await fetch(`/api/gifts/${giftId}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId }),
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to reserve gift')
  }

  return res.json() as Promise<Gift>
}

// Unreserve gift
export async function unreserveGift(giftId: string): Promise<Gift> {
  const res = await fetch(`/api/gifts/${giftId}/reserve`, {
    method: 'DELETE',
  })

  if (!res.ok) {
    const error = (await res.json()) as { message?: string }
    throw new Error(error.message || 'Failed to unreserve gift')
  }

  return res.json() as Promise<Gift>
}
