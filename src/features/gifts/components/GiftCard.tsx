import { MoreHorizontal, Pencil, ShoppingBag, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import type { Gift, GiftOfferPriceHistory } from '@/schemas'
import { BestPriceBadge } from './BestPriceBadge'
import { PriceHistoryMiniChart } from './PriceHistoryMiniChart'

const statusLabels: Record<Gift['status'], { label: string; className: string }> = {
  disponivel: {
    label: 'Disponível',
    className: 'bg-[#E8F5E9] text-[#2E7D32]',
  },
  reservado: {
    label: 'Reservado',
    className: 'bg-[#FFF4E5] text-[#B26A00]',
  },
  comprado: {
    label: 'Comprado',
    className: 'bg-[#E8EAF6] text-[#303F9F]',
  },
  recebido: {
    label: 'Recebido',
    className: 'bg-[#E0F2F1] text-[#00695C]',
  },
}

interface GiftCardProps {
  gift: Gift
  onOpenDetails?: (gift: Gift) => void
  onEdit?: (gift: Gift) => void
  onReserve?: (gift: Gift) => void
  onPurchase?: (gift: Gift) => void
  onContribution?: (gift: Gift) => void
  onDelete?: (gift: Gift) => void
  onViewOffers?: (gift: Gift) => void
  isSelected?: boolean
  onToggleSelect?: (gift: Gift) => void
}

function computeContributionProgress(gift: Gift) {
  if (!gift.allowContributions || !gift.contributionGoalCents) return null
  const goal = gift.contributionGoalCents
  const raised = gift.contributionRaisedCents ?? gift.contributionsTotalCents ?? 0
  const percentage = Math.min(100, Math.round((raised / goal) * 100))
  return {
    percentage,
    raised,
    goal,
  }
}

export function GiftCard({
  gift,
  onOpenDetails,
  onEdit,
  onReserve,
  onPurchase,
  onContribution,
  onDelete,
  onViewOffers,
  isSelected,
  onToggleSelect,
}: GiftCardProps) {
  const statusConfig = statusLabels[gift.status]
  const offersCount = gift.offersCount ?? gift.offers?.length ?? 0
  const extraOffersCount = Math.max(0, offersCount - 1)
  const contribution = computeContributionProgress(gift)
  const history: GiftOfferPriceHistory[] = (gift.bestOffer?.priceHistory ?? []).map((entry) => ({
    ...entry,
    checkedAt: entry.checkedAt instanceof Date ? entry.checkedAt : new Date(entry.checkedAt),
  }))

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#E5EEF5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F6F8FC]">
        {gift.imageUrl ? (
          <img
            src={gift.imageUrl}
            alt={gift.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#8AA0B8]">
            Sem imagem
          </div>
        )}
        {statusConfig ? (
          <Badge className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium ${statusConfig.className}`}>
            {statusConfig.label}
          </Badge>
        ) : null}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          {extraOffersCount > 0 ? (
            <button
              type="button"
              onClick={() => onViewOffers?.(gift)}
              className="rounded-full border border-[#D8E2F0] bg-white/90 px-3 py-1 text-xs font-medium text-[#2F64A4] backdrop-blur hover:bg-white"
            >
              +{extraOffersCount} ofertas
            </button>
          ) : null}
          {onToggleSelect ? (
            <button
              type="button"
              onClick={() => onToggleSelect(gift)}
              aria-pressed={isSelected}
              className={`h-8 w-8 rounded-full border-2 ${isSelected ? 'border-[#3F8F6B] bg-[#E9F6F0]' : 'border-white bg-white/80'} backdrop-blur transition hover:border-[#3F8F6B]`}
            />
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5">
        <div className="space-y-3">
          <h3 className="line-clamp-2 text-lg font-semibold text-[#1F3A5F]">{gift.title}</h3>
          <div className="space-y-2">
            <BestPriceBadge
              priceCents={gift.priceCents ?? (gift.price ? Math.round(gift.price * 100) : undefined)}
              currency={gift.currency}
              store={gift.bestOffer?.store}
              domain={gift.bestOffer?.domain}
            />
            {gift.category ? (
              <Badge variant="outline" className="rounded-full border-[#E0E7F0] bg-[#F8FBFE] text-xs text-[#4E6A85]">
                {gift.category}
              </Badge>
            ) : null}
          </div>
          {contribution ? (
            <div className="space-y-2 rounded-2xl bg-[#F6FBF7] p-3">
              <div className="flex items-center justify-between text-xs text-[#4E7E5E]">
                <span>Cotas</span>
                <span>
                  {formatCurrency(contribution.raised / 100)} de {formatCurrency(contribution.goal / 100)}
                </span>
              </div>
              <Progress value={contribution.percentage} className="h-2" />
            </div>
          ) : null}
          {history.length > 0 ? (
            <div className="hidden rounded-2xl bg-[#F8FBFE] p-3 md:block">
              <p className="mb-2 text-xs font-medium text-[#4E6A85]">Histórico da oferta principal</p>
              <PriceHistoryMiniChart history={history} height={90} />
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6C92]">
            <div className="inline-flex items-center gap-1 rounded-full bg-[#EEF3FB] px-3 py-1">
              <Users className="h-4 w-4" /> {gift.reservationsCount ?? 0} reservas
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-[#F9F2EA] px-3 py-1">
              <ShoppingBag className="h-4 w-4" /> {gift.purchasesCount ?? 0} compras
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit ? (
              <Button variant="outline" size="sm" onClick={() => onEdit(gift)}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </Button>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-[#EDF3FF]">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onOpenDetails ? <DropdownMenuItem onClick={() => onOpenDetails(gift)}>Ver detalhes</DropdownMenuItem> : null}
                {onViewOffers ? <DropdownMenuItem onClick={() => onViewOffers(gift)}>Gerenciar ofertas</DropdownMenuItem> : null}
                {onReserve ? <DropdownMenuItem onClick={() => onReserve(gift)}>Reservar presente</DropdownMenuItem> : null}
                {onPurchase ? <DropdownMenuItem onClick={() => onPurchase(gift)}>Registrar compra</DropdownMenuItem> : null}
                {onContribution ? <DropdownMenuItem onClick={() => onContribution(gift)}>Registrar contribuição</DropdownMenuItem> : null}
                {onDelete ? (
                  <DropdownMenuItem onClick={() => onDelete(gift)} className="text-red-500 focus:bg-red-50">
                    Excluir presente
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Card>
  )
}
