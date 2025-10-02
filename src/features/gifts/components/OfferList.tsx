import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowUpRight, RefreshCcw, Star, Trash2 } from 'lucide-react'
import { Fragment } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GiftOffer, GiftOfferPriceHistory } from '@/schemas'
import { BestPriceBadge } from './BestPriceBadge'
import { PriceHistoryMiniChart } from './PriceHistoryMiniChart'

interface OfferListProps {
  offers: Array<
    GiftOffer & {
      priceHistory?: { id: string; priceCents: number; checkedAt: Date | string }[]
      clicksLast30Days?: number
    }
  >
  onRefresh: (offerId: string) => void
  onRemove: (offerId: string) => void
  onSetPrimary: (offerId: string) => void
  refreshingOfferId?: string
  removingOfferId?: string
  primaryOfferId?: string | null
}

function formatUpdatedAt(date?: Date | string | null) {
  if (!date) return 'Nunca'
  return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

function formatClicks(clicks?: number) {
  if (typeof clicks !== 'number' || Number.isNaN(clicks)) return '0 cliques'
  if (clicks === 1) return '1 clique'
  return `${clicks} cliques`
}

export function OfferList({
  offers,
  onRefresh,
  onRemove,
  onSetPrimary,
  refreshingOfferId,
  removingOfferId,
  primaryOfferId,
}: OfferListProps) {
  if (offers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#D8E2F0] bg-[#F8FBFE] p-6 text-center text-sm text-[#5B6C92]">
        Nenhuma oferta cadastrada ainda. Adicione links de outras lojas para comparar preços.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => {
        const isPrimary = primaryOfferId === offer.id || offer.isPrimary
        const priceHistory: GiftOfferPriceHistory[] = (offer.priceHistory ?? []).map((entry) => ({
          ...entry,
          checkedAt:
            entry.checkedAt instanceof Date ? entry.checkedAt : new Date(entry.checkedAt as string),
        })) as GiftOfferPriceHistory[]
        return (
          <div
            key={offer.id}
            className={cn(
              'grid gap-4 rounded-2xl border border-[#E5EEF5] bg-white p-4 shadow-sm transition hover:border-[#C6D9F2]',
              'md:grid-cols-[minmax(0,1fr),200px]'
            )}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <BestPriceBadge
                  priceCents={offer.priceCents ?? undefined}
                  currency={offer.currency}
                  store={offer.store}
                  domain={offer.domain}
                />
                {isPrimary ? (
                  <Badge variant="secondary" className="bg-[#FCEFD4] text-[#8F7327]">
                    Melhor oferta
                  </Badge>
                ) : null}
              </div>
              <div className="text-xs text-[#5B6C92]">
                <p>
                  Última atualização: <span className="font-medium">{formatUpdatedAt(offer.lastCheckedAt)}</span>
                </p>
                <p>{formatClicks(offer.clicksLast30Days)}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-[#4E6A85]">
                <a
                  href={offer.canonicalUrl ?? offer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#2F64A4] hover:underline"
                >
                  Visitar loja <ArrowUpRight className="size-4" />
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRefresh(offer.id)}
                  disabled={refreshingOfferId === offer.id || removingOfferId === offer.id}
                >
                  <RefreshCcw className="mr-2 size-4" /> Atualizar preço
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSetPrimary(offer.id)}
                  disabled={isPrimary || refreshingOfferId === offer.id || removingOfferId === offer.id}
                >
                  <Star className="mr-2 size-4" /> Definir como principal
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:bg-red-50"
                  onClick={() => onRemove(offer.id)}
                  disabled={removingOfferId === offer.id || refreshingOfferId === offer.id}
                >
                  <Trash2 className="mr-2 size-4" /> Remover
                </Button>
              </div>
            </div>
            <div className="hidden rounded-2xl bg-[#F8FBFE] p-3 md:block">
              {priceHistory.length > 0 ? (
                <Fragment>
                  <p className="mb-2 text-xs font-medium text-[#4E6A85]">Histórico de preços (30 dias)</p>
                  <PriceHistoryMiniChart history={priceHistory} height={90} />
                </Fragment>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#7A8DA8]">
                  Sem histórico
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
