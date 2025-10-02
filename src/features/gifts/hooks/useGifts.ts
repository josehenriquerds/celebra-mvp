'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import type { Gift, GiftStatus } from '@/schemas'
import {
  createGift,
  createGiftOffer,
  deleteGift,
  deleteGiftOffer,
  fetchGiftOffers,
  fetchGifts,
  importGiftLinks,
  refreshGiftOffer,
  scrapeGiftLink,
  updateGift,
  updateGiftStatus,
} from '../services/gifts.api'
import type {
  CreateGiftPayload,
  GiftOffersResponse,
  ImportGiftLinksResult,
  ScrapedGiftProduct,
  UpdateGiftPayload,
} from '../services/gifts.api'

export const giftsKeys = {
  all: ['gifts'] as const,
  lists: () => [...giftsKeys.all, 'list'] as const,
  list: (eventId: string) => [...giftsKeys.lists(), eventId] as const,
  details: () => [...giftsKeys.all, 'detail'] as const,
  detail: (id: string) => [...giftsKeys.details(), id] as const,
}

export const giftOffersKeys = {
  all: ['gift-offers'] as const,
  list: (giftId: string) => [...giftOffersKeys.all, giftId] as const,
}

export function useGifts(eventId?: string) {
  const params = useParams()
  const id = eventId || (params.id as string)

  return useQuery({
    queryKey: giftsKeys.list(id),
    queryFn: () => fetchGifts(id),
    enabled: !!id,
  })
}

export function useGiftOffers(giftId: string) {
  return useQuery<GiftOffersResponse>({
    queryKey: giftOffersKeys.list(giftId),
    queryFn: () => fetchGiftOffers(giftId),
    enabled: !!giftId,
  })
}

export function useScrapeGiftLink() {
  return useMutation({
    mutationFn: (url: string) => scrapeGiftLink(url),
  })
}

export function useImportGiftLinks(eventId?: string) {
  const params = useParams()
  const id = eventId || (params.id as string)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (urls: string[]) => importGiftLinks(id, urls),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(id) })
    },
  })
}

export function useCreateGift(eventId?: string) {
  const queryClient = useQueryClient()
  const params = useParams()
  const id = eventId || (params.id as string)

  return useMutation({
    mutationFn: (data: CreateGiftPayload) => createGift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(id) })
    },
  })
}

export function useUpdateGift() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGiftPayload }) => updateGift(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
      queryClient.invalidateQueries({ queryKey: giftOffersKeys.list(variables.id) })
    },
  })
}

export function useDeleteGift() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: (id: string) => deleteGift(id),
    onSuccess: (_, giftId) => {
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
      queryClient.removeQueries({ queryKey: giftOffersKeys.list(giftId) })
    },
  })
}

export function useUpdateGiftStatus() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GiftStatus }) => updateGiftStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
      queryClient.invalidateQueries({ queryKey: giftOffersKeys.list(variables.id) })
    },
  })
}

export function useCreateGiftOffer() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ giftId, url }: { giftId: string; url: string }) => createGiftOffer(giftId, url),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: giftOffersKeys.list(variables.giftId) })
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
    },
  })
}

export function useRefreshGiftOffer() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ giftId, offerId }: { giftId: string; offerId: string }) => refreshGiftOffer(offerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: giftOffersKeys.list(variables.giftId) })
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
    },
  })
}

export function useDeleteGiftOffer() {
  const queryClient = useQueryClient()
  const params = useParams()
  const eventId = params.id as string

  return useMutation({
    mutationFn: ({ giftId, offerId }: { giftId: string; offerId: string }) => deleteGiftOffer(offerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: giftOffersKeys.list(variables.giftId) })
      queryClient.invalidateQueries({ queryKey: giftsKeys.list(eventId) })
    },
  })
}
