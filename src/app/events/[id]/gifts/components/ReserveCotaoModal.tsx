'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useReserveGift } from '@/hooks'
import { formatCurrency } from '@/lib/utils'
import type { Gift } from '@/types/api'

interface ReserveCotaoModalProps {
  gift: Gift
  isOpen: boolean
  onClose: () => void
  onSuccess: (reservationId: string, pixQRCode?: string) => void
}

export function ReserveCotaoModal({
  gift,
  isOpen,
  onClose,
  onSuccess,
}: ReserveCotaoModalProps) {
  const reserveMutation = useReserveGift()
  const [quotas, setQuotas] = useState(1)

  if (!isOpen) return null

  const availableQuotas =
    (gift.totalQuotas || 0) - (gift.reservedQuotas || 0) - (gift.paidQuotas || 0)
  const quotaValue = gift.quotaValue || 0
  const totalAmount = quotas * quotaValue

  function handleReserve() {
    if (quotas < 1 || quotas > availableQuotas) return

    reserveMutation.mutate(
      {
        giftId: gift.id,
        data: {
          quotas,
          amount: totalAmount,
        } as any,
      },
      {
        onSuccess: (data) => {
          onSuccess(data.reservationId, data.pixQRCode)
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="size-5" />
        </button>

        <h2 className="mb-4 text-xl font-bold">Reservar Cotão</h2>

        <div className="mb-4 rounded-lg border bg-gray-50 p-4">
          <h3 className="font-semibold">{gift.title}</h3>
          <p className="mt-2 text-sm text-gray-600">
            Valor por cota: {formatCurrency(quotaValue)}
          </p>
          <p className="text-sm text-gray-600">Cotas disponíveis: {availableQuotas}</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="quotas">Quantas cotas deseja reservar?</Label>
            <Input
              id="quotas"
              type="number"
              min={1}
              max={availableQuotas}
              value={quotas}
              onChange={(e) => setQuotas(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>

          <div className="rounded-lg border bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">Valor Total</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(totalAmount)}
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Após a reserva, você terá 24 horas para confirmar o pagamento via Pix.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleReserve}
              disabled={reserveMutation.isPending || quotas < 1 || quotas > availableQuotas}
              className="flex-1"
            >
              {reserveMutation.isPending ? 'Reservando...' : 'Reservar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
