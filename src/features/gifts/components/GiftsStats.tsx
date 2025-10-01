'use client'

import { CheckCircle, Clock, Gift, ShoppingCart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Gift as GiftType } from '@/schemas'

interface GiftsStatsProps {
  gifts: GiftType[]
}

export function GiftsStats({ gifts }: GiftsStatsProps) {
  const receivedCount = gifts.filter((g) => g.status === 'recebido').length
  const reservedCount = gifts.filter((g) => g.status === 'reservado').length
  const availableCount = gifts.filter((g) => g.status === 'disponivel').length

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
      <Card>
        <CardContent className="p-6 text-center">
          <Gift className="text-celebre-brand mx-auto mb-2 h-8 w-8" />
          <div className="text-celebre-brand text-3xl font-bold">{gifts.length}</div>
          <p className="mt-1 text-sm text-celebre-muted">Total de Itens</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-500" />
          <div className="text-3xl font-bold text-green-600">{receivedCount}</div>
          <p className="mt-1 text-sm text-celebre-muted">Recebidos</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
          <div className="text-3xl font-bold text-yellow-600">{reservedCount}</div>
          <p className="mt-1 text-sm text-celebre-muted">Reservados</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-gray-500" />
          <div className="text-3xl font-bold text-gray-600">{availableCount}</div>
          <p className="mt-1 text-sm text-celebre-muted">Disponíveis</p>
        </CardContent>
      </Card>
    </div>
  )
}
