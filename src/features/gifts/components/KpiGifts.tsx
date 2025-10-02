'use client'

import { DonutChart } from '@/components/ui/donut-chart'
import { Stat } from '@/components/ui/stat'
import { formatCurrency } from '@/lib/utils'
import type { Gift } from '@/schemas'

interface KpiGiftsProps {
  gifts: Gift[]
}

function sumPriceCents(gifts: Gift[], predicate: (gift: Gift) => boolean) {
  return gifts.reduce((acc, gift) => {
    if (!predicate(gift)) return acc
    const price = gift.priceCents ?? (gift.price ? Math.round(gift.price * 100) : 0)
    return acc + price
  }, 0)
}

export function KpiGifts({ gifts }: KpiGiftsProps) {
  const total = gifts.length
  const reserved = gifts.filter((gift) => gift.status === 'reservado').length
  const purchased = gifts.filter((gift) => gift.status === 'comprado' || gift.status === 'recebido').length
  const available = Math.max(total - reserved - purchased, 0)

  const totalValue = sumPriceCents(gifts, () => true)
  const purchasedValue = sumPriceCents(
    gifts,
    (gift) => gift.status === 'comprado' || gift.status === 'recebido'
  )
  const reservedValue = sumPriceCents(gifts, (gift) => gift.status === 'reservado')
  const remainingValue = Math.max(totalValue - purchasedValue, 0)

  const purchasedPercentage = total > 0 ? Math.round((purchased / total) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Presentes cadastrados"
          value={total}
          description={`${available} disponíveis`}
          variant="default"
        />
        <Stat
          label="Reservados"
          value={reserved}
          description={`${formatCurrency(reservedValue / 100)} em reservas`}
          variant="warning"
        />
        <Stat
          label="Comprados"
          value={purchased}
          description={`${formatCurrency(purchasedValue / 100)} já garantidos`}
          variant="success"
        />
        <Stat
          label="Valor remanescente"
          value={formatCurrency(remainingValue / 100)}
          description={`Total previsto ${formatCurrency(totalValue / 100)}`}
          variant="danger"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[240px,1fr]">
        <div className="rounded-3xl border border-[#E5EEF5] bg-white p-4">
          <DonutChart
            height={220}
            centerLabel={{ value: `${purchasedPercentage}%`, label: 'comprado' }}
            data={[
              { name: 'Comprado', value: purchasedPercentage, color: '#3F8F6B' },
              { name: 'Restante', value: 100 - purchasedPercentage, color: '#E5EEF5' },
            ]}
            showLegend={false}
          />
        </div>
        <div className="rounded-3xl border border-[#E5EEF5] bg-white p-4">
          <h4 className="text-sm font-semibold text-[#1F3A5F]">Resumo financeiro</h4>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between rounded-2xl bg-[#F9FBFF] px-4 py-3">
              <span className="text-[#4E6A85]">Valor total</span>
              <span className="font-semibold text-[#1F3A5F]">{formatCurrency(totalValue / 100)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[#F6FBF7] px-4 py-3">
              <span className="text-[#4E7E5E]">Já comprado</span>
              <span className="font-semibold text-[#246240]">{formatCurrency(purchasedValue / 100)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[#FFF5EB] px-4 py-3">
              <span className="text-[#B26A00]">Reservado</span>
              <span className="font-semibold text-[#B26A00]">{formatCurrency(reservedValue / 100)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[#FDF2F5] px-4 py-3">
              <span className="text-[#AD3F5F]">Restante</span>
              <span className="font-semibold text-[#AD3F5F]">{formatCurrency(remainingValue / 100)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
