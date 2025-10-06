/**
 * Gifts Service
 * Handles all gift-related API calls including categories, contributions, and thank-you notes
 */

import { api } from '@/lib/api-client'
import type {
  Gift,
  GiftCategory,
  GiftContribution,
  ThankYouNote,
  CreateGiftDto,
  ReserveGiftDto,
  ConfirmGiftDto,
} from '@/types/api'

export interface GetGiftsParams {
  status?: 'disponivel' | 'reservado' | 'comprado'
  categoryId?: string
}

export interface GetContributionsParams {
  status?: 'pendente' | 'confirmado'
}

export interface SendThankYouDto {
  contributionId: string
  message: string
  channel: 'whatsapp' | 'email'
  imageUrl?: string
}

export const giftsService = {
  /**
   * Get all gifts for an event
   */
  getGifts: (eventId: string, params?: GetGiftsParams) =>
    api.get<Gift[]>(`/events/${eventId}/gifts`, { params }),

  /**
   * Get specific gift by ID
   */
  getGift: (giftId: string) => api.get<Gift>(`/gifts/${giftId}`),

  /**
   * Create new gift
   */
  createGift: (eventId: string, data: CreateGiftDto) =>
    api.post<Gift>(`/events/${eventId}/gifts`, data),

  /**
   * Update gift
   */
  updateGift: (giftId: string, data: Partial<Gift>) =>
    api.patch<Gift>(`/gifts/${giftId}`, data),

  /**
   * Delete gift
   */
  deleteGift: (giftId: string) => api.delete<void>(`/gifts/${giftId}`),

  /**
   * Reserve gift
   */
  reserveGift: (giftId: string, data: ReserveGiftDto) =>
    api.post<{ reservationId: string; expiresAt: string }>(
      `/gifts/${giftId}/reserve`,
      data
    ),

  /**
   * Confirm gift purchase/payment
   */
  confirmGift: (giftId: string, data: ConfirmGiftDto) =>
    api.post<GiftContribution>(`/gifts/${giftId}/confirm`, data),

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  /**
   * Get all gift categories for an event
   */
  getCategories: (eventId: string) =>
    api.get<GiftCategory[]>(`/events/${eventId}/gifts/categories`),

  /**
   * Create new gift category
   */
  createCategory: (
    eventId: string,
    data: { name: string; description?: string; iconUrl?: string }
  ) => api.post<GiftCategory>(`/events/${eventId}/gifts/categories`, data),

  /**
   * Update gift category
   */
  updateCategory: (categoryId: string, data: Partial<GiftCategory>) =>
    api.patch<GiftCategory>(`/gifts/categories/${categoryId}`, data),

  /**
   * Delete gift category
   */
  deleteCategory: (categoryId: string) =>
    api.delete<void>(`/gifts/categories/${categoryId}`),

  // ============================================================================
  // CONTRIBUTIONS
  // ============================================================================

  /**
   * Get all contributions for an event
   */
  getContributions: (eventId: string, params?: GetContributionsParams) =>
    api.get<GiftContribution[]>(`/events/${eventId}/gifts/contributions`, {
      params,
    }),

  /**
   * Update contribution status
   */
  updateContribution: (contributionId: string, data: Partial<GiftContribution>) =>
    api.patch<GiftContribution>(`/gifts/contributions/${contributionId}`, data),

  // ============================================================================
  // THANK YOU NOTES
  // ============================================================================

  /**
   * Get all thank-you notes for an event
   */
  getThankYouNotes: (eventId: string) =>
    api.get<ThankYouNote[]>(`/events/${eventId}/gifts/thank-you`),

  /**
   * Send thank-you note
   */
  sendThankYou: (data: SendThankYouDto) =>
    api.post<ThankYouNote>('/gifts/thank-you', data),

  /**
   * Update thank-you note
   */
  updateThankYou: (noteId: string, data: Partial<ThankYouNote>) =>
    api.patch<ThankYouNote>(`/gifts/thank-you/${noteId}`, data),
}
