'use client'

import { X, QrCode } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useConfirmGift } from '@/hooks'
import type { Gift } from '@/types/api'

interface ConfirmPaymentModalProps {
  gift: Gift
  reservationId: string
  pixQRCode?: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ConfirmPaymentModal({
  gift,
  reservationId,
  pixQRCode,
  isOpen,
  onClose,
  onSuccess,
}: ConfirmPaymentModalProps) {
  const confirmMutation = useConfirmGift()
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofUrl, setProofUrl] = useState('')
  const [transactionId, setTransactionId] = useState('')

  if (!isOpen) return null

  async function handleConfirm() {
    if (!proofUrl && !proofFile) return

    // In a real implementation, upload the file first
    const uploadedUrl = proofUrl || '/uploads/comprovante.jpg'

    confirmMutation.mutate(
      {
        giftId: gift.id,
        data: {
          paymentProofUrl: uploadedUrl,
          paymentMethod: 'pix',
          transactionId: transactionId || undefined,
        } as any,
      },
      {
        onSuccess: () => {
          onSuccess()
        },
      }
    )
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
      // Create preview URL
      const url = URL.createObjectURL(file)
      setProofUrl(url)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="size-5" />
        </button>

        <h2 className="mb-4 text-xl font-bold">Confirmar Pagamento</h2>

        <div className="mb-4 rounded-lg border bg-gray-50 p-4">
          <h3 className="font-semibold">{gift.title}</h3>
          <p className="text-sm text-gray-600">Reserva: {reservationId}</p>
        </div>

        {pixQRCode && (
          <div className="mb-6 rounded-lg border bg-blue-50 p-4 text-center">
            <QrCode className="mx-auto mb-2 size-32 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Pix Copia e Cola</p>
            <code className="mt-2 block break-all rounded bg-white p-2 text-xs">
              {pixQRCode}
            </code>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => navigator.clipboard.writeText(pixQRCode)}
            >
              Copiar Código
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="proof">Comprovante de Pagamento *</Label>
            <div className="mt-1">
              <Input
                id="proof"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            {proofUrl && (
              <div className="mt-2 rounded border p-2">
                <img
                  src={proofUrl}
                  alt="Comprovante"
                  className="h-40 w-full object-contain"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="transactionId">ID da Transação (opcional)</Label>
            <Input
              id="transactionId"
              type="text"
              placeholder="Ex: E12345678"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="mt-1"
            />
          </div>

          <p className="text-xs text-gray-500">
            Após o envio, o comprovante será analisado pelos noivos. Você receberá uma
            confirmação em breve.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={confirmMutation.isPending || (!proofUrl && !proofFile)}
              className="flex-1"
            >
              {confirmMutation.isPending ? 'Enviando...' : 'Confirmar Pagamento'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
