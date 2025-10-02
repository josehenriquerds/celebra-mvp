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

interface ContributionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guests: GuestOption[]
  loading?: boolean
  onSubmit: (data: { guestId?: string; amountCents: number; contributedAt: string; notes?: string }) => Promise<void>
}

export function ContributionModal({ open, onOpenChange, guests, loading, onSubmit }: ContributionModalProps) {
  const [guestId, setGuestId] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const parsedAmount = amount ? Number.parseFloat(amount.replace(',', '.')) : NaN
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return

    await onSubmit({
      guestId: guestId || undefined,
      amountCents: Math.round(parsedAmount * 100),
      contributedAt: date,
      notes: notes || undefined,
    })

    setGuestId('')
    setAmount('')
    setNotes('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Registrar contribuição</DialogTitle>
            <DialogDescription>
              Controle as cotas recebidas para acompanhar o progresso do presente colaborativo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Convidado</Label>
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
              <Label htmlFor="contribution-amount">Valor contribuído (R$)</Label>
              <Input
                id="contribution-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={loading}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contribution-date">Data</Label>
              <Input
                id="contribution-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution-notes">Observações</Label>
            <Textarea
              id="contribution-notes"
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Informações adicionais"
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !amount}>
              Registrar contribuição
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
