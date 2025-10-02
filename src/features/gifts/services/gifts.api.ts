import type {
  Gift,
  GiftFormData,
  GiftOffer,
  GiftOfferPriceHistory,
  GiftStatus,
} from '@/schemas'

export interface ScrapedGiftProduct {
  title: string
  description?: string
  priceCents?: number
  currency?: string
  imageUrl?: string
  imageOptions: string[]
  store: string
  domain: string
  canonicalUrl: string
  url: string
  attributes?: Record<string, string>
}

export interface ImportGiftLinksResult {
  url: string
  success: boolean
  giftId?: string
  offerId?: string
  title?: string
  error?: string
}

export interface GiftOffersResponse {
  gift: Gift
  offers: Array<GiftOffer & { priceHistory?: GiftOfferPriceHistory[]; clicksLast30Days?: number }>
}

function assertOk(response: Response, fallbackMessage: string): Response {
  if (!response.ok) {
    throw new Error(fallbackMessage)
  }
  return response
}

async function parseJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    try {
      const errorBody = (await response.json()) as { error?: string }
      throw new Error(errorBody.error || fallbackMessage)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(fallbackMessage)
    }
  }

  return response.json() as Promise<T>
}

export async function fetchGifts(eventId: string): Promise<Gift[]> {
  const res = await fetch(`/api/events/${eventId}/gifts`, {
    next: { tags: [`event-${eventId}-gifts`] },
  })

  return parseJson<Gift[]>(res, 'Não foi possível carregar os presentes')
}

export async function scrapeGiftLink(url: string): Promise<ScrapedGiftProduct> {
  const res = await fetch('/api/gifts/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  return parseJson<ScrapedGiftProduct>(res, 'Não foi possível buscar dados do produto')
}

export interface CreateGiftPayload extends GiftFormData {
  autoImportUrl?: string
}

export async function createGift(eventId: string, data: CreateGiftPayload): Promise<Gift> {
  const res = await fetch(`/api/events/${eventId}/gifts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  const json = await parseJson<Gift | { gift: Gift }>(res, 'Não foi possível criar o presente')
  if ('gift' in json) {
    return json.gift
  }
  return json
}

export interface UpdateGiftPayload extends Partial<GiftFormData> {
  status?: GiftStatus
  buyerContactId?: string | null
  primaryOfferId?: string | null
}

export async function updateGift(giftId: string, data: UpdateGiftPayload): Promise<Gift> {
  const res = await fetch(`/api/gifts/${giftId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  return parseJson<Gift>(res, 'Não foi possível atualizar o presente')
}

export async function deleteGift(giftId: string): Promise<void> {
  const res = await fetch(`/api/gifts/${giftId}`, {
    method: 'DELETE',
  })

  assertOk(res, 'Não foi possível excluir o presente')
}

export async function updateGiftStatus(giftId: string, status: GiftStatus): Promise<Gift> {
  return updateGift(giftId, { status })
}

export async function importGiftLinks(
  eventId: string,
  urls: string[]
): Promise<{ imported: number; failed: number; results: ImportGiftLinksResult[] }> {
  const res = await fetch(`/api/events/${eventId}/gifts/import-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls }),
  })

  return parseJson(res, 'Não foi possível importar os presentes')
}

export async function fetchGiftOffers(giftId: string): Promise<GiftOffersResponse> {
  const res = await fetch(`/api/gifts/${giftId}/offers`)
  return parseJson<GiftOffersResponse>(res, 'Não foi possível carregar as ofertas')
}

export async function createGiftOffer(giftId: string, url: string): Promise<GiftOffer> {
  const res = await fetch(`/api/gifts/${giftId}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  return parseJson<GiftOffer>(res, 'Não foi possível adicionar a oferta')
}

export async function refreshGiftOffer(offerId: string): Promise<GiftOffer> {
  const res = await fetch(`/api/gift-offers/${offerId}/refresh`, {
    method: 'POST',
  })

  return parseJson<GiftOffer>(res, 'Não foi possível atualizar a oferta')
}

export async function deleteGiftOffer(offerId: string): Promise<void> {
  const res = await fetch(`/api/gift-offers/${offerId}`, {
    method: 'DELETE',
  })

  assertOk(res, 'Não foi possível remover a oferta')
}

// Placeholder functions for reservations/contributions (to be implemented quando as rotas estiverem prontas)
export async function reserveGift(giftId: string, guestId: string): Promise<Gift> {
  const res = await fetch(`/api/gifts/${giftId}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ guestId }),
  })

  return parseJson<Gift>(res, 'Não foi possível reservar o presente')
}

export async function unreserveGift(giftId: string): Promise<Gift> {
  const res = await fetch(`/api/gifts/${giftId}/reserve`, {
    method: 'DELETE',
  })

  return parseJson<Gift>(res, 'Não foi possível remover a reserva')
}
