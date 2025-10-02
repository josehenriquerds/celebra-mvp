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

interface ReserveGiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guests: GuestOption[]
  loading?: boolean
  onSubmit: (data: { guestId: string; expiresAt?: string; notes?: string }) => Promise<void>
}

export function ReserveGiftModal({ open, onOpenChange, guests, loading, onSubmit }: ReserveGiftModalProps) {
  const [guestId, setGuestId] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!guestId) return
    await onSubmit({ guestId, expiresAt: expiresAt || undefined, notes: notes || undefined })
    setGuestId('')
    setExpiresAt('')
    setNotes('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Reservar presente</DialogTitle>
            <DialogDescription>
              Escolha o convidado responsável pela reserva e defina a validade.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label>Convidado</Label>
            <Select value={guestId} onValueChange={setGuestId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um convidado" />
              </SelectTrigger>
              <SelectContent>
                {guests.map((guest) => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">Validade da reserva</Label>
            <Input
              id="expires"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Informações extras para o convidado"
              rows={3}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!guestId || loading}>
              Reservar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
