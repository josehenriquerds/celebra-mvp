'use client'

import { memo, useMemo } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { GiftOfferPriceHistory } from '@/schemas'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'

interface PriceHistoryMiniChartProps {
  history: GiftOfferPriceHistory[]
  stroke?: string
  height?: number
}

interface ChartPoint {
  date: string
  value: number
  rawDate: Date
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || payload.length === 0) return null
  const data = payload[0].payload as ChartPoint
  return (
    <div className="rounded-lg bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-[#4E7E5E]">
        {format(data.rawDate, "dd 'de' MMMM", { locale: ptBR })}
      </p>
      <p className="text-sm font-semibold text-[#1F4B3A]">{formatCurrency(data.value)}</p>
    </div>
  )
}

function buildChartData(history: GiftOfferPriceHistory[]): ChartPoint[] {
  const sorted = [...history].sort(
    (a, b) => new Date(a.checkedAt).getTime() - new Date(b.checkedAt).getTime()
  )

  return sorted.map((entry) => {
    const rawDate = new Date(entry.checkedAt)
    return {
      date: format(rawDate, 'dd/MM'),
      value: entry.priceCents / 100,
      rawDate,
    }
  })
}

export const PriceHistoryMiniChart = memo(function PriceHistoryMiniChart({
  history,
  stroke = '#3F8F6B',
  height = 80,
}: PriceHistoryMiniChartProps) {
  const data = useMemo(() => buildChartData(history), [history])

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#F5F9F7] to-white text-xs text-[#5B7A69]">
        Sem histórico
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <defs>
          <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.2} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" hide />
        <YAxis domain={['dataMin', 'dataMax']} hide />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#DCEBE1', strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={stroke}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          fill="url(#historyGradient)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
})
