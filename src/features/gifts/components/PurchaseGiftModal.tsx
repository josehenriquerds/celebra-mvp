'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface GuestOption {
  id: string
  name: string
}

interface PurchaseGiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guests: GuestOption[]
  loading?: boolean
  onSubmit: (data: {
    guestId?: string
    purchasedAt: string
    quantity: number
    amountPaidCents?: number
    receiptUrl?: string
    notes?: string
  }) => Promise<void>
}

export function PurchaseGiftModal({ open, onOpenChange, guests, loading, onSubmit }: PurchaseGiftModalProps) {
  const [guestId, setGuestId] = useState('')
  const [purchasedAt, setPurchasedAt] = useState(() => new Date().toISOString().slice(0, 10))
  const [quantity, setQuantity] = useState('1')
  const [amountPaid, setAmountPaid] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const parsedQuantity = Number.parseInt(quantity, 10) || 1
    const paid = amountPaid ? Number.parseFloat(amountPaid.replace(',', '.')) : undefined
    const amountPaidCents = paid !== undefined && !Number.isNaN(paid) ? Math.round(paid * 100) : undefined

    await onSubmit({
      guestId: guestId || undefined,
      purchasedAt,
      quantity: parsedQuantity,
      amountPaidCents,
      receiptUrl: receiptUrl || undefined,
      notes: notes || undefined,
    })

    setGuestId('')
    setQuantity('1')
    setAmountPaid('')
    setReceiptUrl('')
    setNotes('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Registrar compra</DialogTitle>
            <DialogDescription>
              Registre quem comprou o presente e valores pagos para manter os controles atualizados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Comprador</Label>
            <Select value={guestId} onValueChange={setGuestId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Não informar</SelectItem>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="purchase-date">Data da compra</Label>
              <Input
                id="purchase-date"
                type="date"
                value={purchasedAt}
                onChange={(event) => setPurchasedAt(event.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor pago (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(event) => setAmountPaid(event.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt">Comprovante (URL)</Label>
              <Input
                id="receipt"
                type="url"
                placeholder="https://drive.google.com/..."
                value={receiptUrl}
                onChange={(event) => setReceiptUrl(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase-notes">Notas</Label>
            <Textarea
              id="purchase-notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Observações sobre a compra"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Registrar compra
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
