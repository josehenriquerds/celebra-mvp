'use client'

import { TrendingDown, TrendingUp } from 'lucide-react'
import { TimelineItem } from '@/components/ui/timeline-item'
import { formatCurrency } from '@/lib/utils'
import type { GiftOfferPriceHistory } from '@/schemas'

interface GiftTimelineProps {
  history: GiftOfferPriceHistory[]
}

export function GiftTimeline({ history }: GiftTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E5EEF5] bg-[#F8FBFE] p-6 text-center text-sm text-[#5B6C92]">
        Sem histórico de preço registrado até o momento.
      </div>
    )
  }

  const sorted = [...history].sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime())

  return (
    <div className="rounded-3xl border border-[#E5EEF5] bg-white p-4">
      <h4 className="mb-4 text-sm font-semibold text-[#1F3A5F]">Histórico de preço</h4>
      <div>
        {sorted.map((entry, index) => {
          const prev = sorted[index + 1]
          const currentValue = entry.priceCents / 100
          const previousValue = prev ? prev.priceCents / 100 : undefined
          const diff = previousValue !== undefined ? currentValue - previousValue : 0
          const icon = diff <= 0 ? TrendingDown : TrendingUp
          const iconColor = diff <= 0 ? 'bg-[#E3F6ED]' : 'bg-[#FCE8EF]'
          const description = previousValue !== undefined
            ? `${diff <= 0 ? 'Redução' : 'Aumento'} de ${formatCurrency(Math.abs(diff))}`
            : 'Primeiro registro'

          return (
            <TimelineItem
              key={entry.id}
              icon={icon}
              iconColor={iconColor}
              title={formatCurrency(currentValue)}
              description={description}
              timestamp={new Date(entry.checkedAt)}
              isLast={index === sorted.length - 1}
            />
          )
        })}
      </div>
    </div>
  )
}
