'use client'

import { useState } from 'react'
import {
  Heart,
  MessageCircle,
  DollarSign,
  Star,
  MapPin,
  Check,
  Gavel,
  Clock,
  TrendingDown,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatCurrency } from '@/lib/utils'

interface VendorMarketplaceCardProps {
  vendor: {
    id: string
    name: string
    category: string
    city?: string
    state?: string
    imageUrl?: string | null
    rating?: number
    reviewCount?: number
    priceFromCents?: number
    descriptionShort?: string
    isContracted?: boolean
    isFavorited?: boolean
    hasActiveProposal?: boolean
    proposalCount?: number
    lowestBidCents?: number
    auctionEndsAt?: Date
  }
  onFavorite?: (vendorId: string) => void
  onContact?: (vendorId: string) => void
  onRequestProposal?: (vendorId: string) => void
  onViewProposals?: (vendorId: string) => void
  variant?: 'marketplace' | 'contracted'
}

export function VendorMarketplaceCard({
  vendor,
  onFavorite,
  onContact,
  onRequestProposal,
  onViewProposals,
  variant = 'marketplace',
}: VendorMarketplaceCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const isContracted = variant === 'contracted' || vendor.isContracted
  const hasImage = vendor.imageUrl && isImageLoaded
  const priceFrom = vendor.priceFromCents ? vendor.priceFromCents / 100 : null
  const lowestBid = vendor.lowestBidCents ? vendor.lowestBidCents / 100 : null

  // Check if auction is ending soon (within 24 hours)
  const isAuctionEndingSoon = vendor.auctionEndsAt
    ? new Date(vendor.auctionEndsAt).getTime() - Date.now() < 24 * 60 * 60 * 1000
    : false

  const categoryIcons: Record<string, string> = {
    Buffet: '🍽️',
    Decoração: '🎨',
    Fotografia: '📸',
    Música: '🎵',
    Local: '🏛️',
    Convites: '💌',
    Floricultura: '🌸',
    Bolo: '🎂',
    Cerimonialista: '🎭',
    'Vídeo': '🎥',
    'Bebidas': '🍾',
    'Noiva e acessórios': '👰',
    'Beleza e saúde': '💅',
    'Joalheria': '💍',
    'Lua de Mel': '✈️',
    'Animação': '🎪',
    'Carro de casamento': '🚗',
    'Lembranças': '🎁',
    'Flores e Decoração': '🌷',
    'Celebrante': '🎤',
    Outros: '📦',
  }

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-lg',
        isContracted && 'ring-2 ring-green-500'
      )}
    >
      {/* Header Image or Placeholder */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
        {vendor.imageUrl ? (
          <>
            <img
              src={vendor.imageUrl}
              alt={vendor.name}
              className={cn(
                'h-full w-full object-cover transition-all duration-500',
                isImageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
              )}
              onLoad={() => setIsImageLoaded(true)}
            />
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl">{categoryIcons[vendor.category] || '📦'}</div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-6xl">{categoryIcons[vendor.category] || '📦'}</div>
              <p className="text-sm font-medium text-gray-600">{vendor.category}</p>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavorite?.(vendor.id)
          }}
          className={cn(
            'absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition-all hover:scale-110',
            vendor.isFavorited && 'bg-red-50'
          )}
          title={vendor.isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Heart
            className={cn(
              'size-5 transition-colors',
              vendor.isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
            )}
          />
        </button>

        {/* Status Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {isContracted && (
            <Badge className="bg-green-500 text-white">
              <Check className="mr-1 size-3" />
              Contratado
            </Badge>
          )}
          {vendor.hasActiveProposal && !isContracted && (
            <Badge className="bg-blue-500 text-white">
              <Gavel className="mr-1 size-3" />
              {vendor.proposalCount || 1} Proposta{(vendor.proposalCount || 1) > 1 ? 's' : ''}
            </Badge>
          )}
          {isAuctionEndingSoon && (
            <Badge className="animate-pulse bg-orange-500 text-white">
              <Clock className="mr-1 size-3" />
              Termina em breve
            </Badge>
          )}
        </div>

        {/* Overlay on hover */}
        {hasImage && (
          <div className="absolute inset-0 bg-black opacity-0 transition-opacity group-hover:opacity-10" />
        )}
      </div>

      <CardContent className="p-4">
        {/* Vendor Info */}
        <div className="mb-3">
          <h3 className="mb-1 font-heading text-lg font-bold text-celebre-ink line-clamp-1">
            {vendor.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-celebre-muted">
            {vendor.city && vendor.state && (
              <div className="flex items-center gap-1">
                <MapPin className="size-3" />
                <span>
                  {vendor.city}, {vendor.state}
                </span>
              </div>
            )}
            {vendor.rating && (
              <div className="flex items-center gap-1">
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                {vendor.reviewCount && <span>({vendor.reviewCount})</span>}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {vendor.descriptionShort && (
          <p className="mb-3 text-sm text-celebre-muted line-clamp-2">
            {vendor.descriptionShort}
          </p>
        )}

        {/* Pricing Info */}
        <div className="mb-4 space-y-2 border-t pt-3">
          {priceFrom && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-celebre-muted">A partir de:</span>
              <span className="font-semibold text-celebre-ink">{formatCurrency(priceFrom)}</span>
            </div>
          )}

          {lowestBid && lowestBid < (priceFrom || Infinity) && (
            <div className="flex items-center justify-between rounded-lg bg-green-50 px-2 py-1 text-sm">
              <div className="flex items-center gap-1 text-green-700">
                <TrendingDown className="size-4" />
                <span className="font-medium">Melhor oferta:</span>
              </div>
              <span className="font-bold text-green-700">{formatCurrency(lowestBid)}</span>
            </div>
          )}

          {vendor.auctionEndsAt && (
            <div className="flex items-center gap-1 text-xs text-orange-600">
              <Clock className="size-3" />
              <span>
                Termina em{' '}
                {Math.ceil((new Date(vendor.auctionEndsAt).getTime() - Date.now()) / (1000 * 60 * 60))}h
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {isContracted ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onContact?.(vendor.id)}
              >
                <MessageCircle className="mr-1 size-4" />
                Contato
              </Button>
              <Button variant="default" size="sm" className="flex-1">
                Ver Detalhes
              </Button>
            </>
          ) : vendor.hasActiveProposal ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onContact?.(vendor.id)}
              >
                <MessageCircle className="mr-1 size-4" />
                Contato
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => onViewProposals?.(vendor.id)}
              >
                <Gavel className="mr-1 size-4" />
                Ver Propostas
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onContact?.(vendor.id)}
              >
                <MessageCircle className="mr-1 size-4" />
                Contato
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => onRequestProposal?.(vendor.id)}
              >
                <DollarSign className="mr-1 size-4" />
                Solicitar Orçamento
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
