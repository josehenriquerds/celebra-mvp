'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Gift, GiftFormData } from '@/schemas'

interface GiftFormModalProps {
  gift: Gift | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GiftFormData) => void
  isLoading?: boolean
}

export function GiftFormModal({ gift, isOpen, onClose, onSubmit, isLoading }: GiftFormModalProps) {
  const [formData, setFormData] = useState<GiftFormData>({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    externalUrl: '',
  })

  useEffect(() => {
    if (gift) {
      setFormData({
        title: gift.title,
        description: gift.description || '',
        price: gift.price,
        imageUrl: gift.imageUrl || '',
        externalUrl: gift.externalUrl || '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        externalUrl: '',
      })
    }
  }, [gift])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading">
              {gift ? 'Editar Presente' : 'Novo Presente'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-celebre-ink">
                Título <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Jogo de Panelas"
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-celebre-ink">Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descrição detalhada do presente..."
                rows={3}
                className="focus:ring-celebre-brand mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-celebre-ink">
                Preço (R$) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                }
                placeholder="0.00"
                className="mt-1"
                required
                min="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-celebre-ink">URL da Imagem</label>
              <Input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-celebre-ink">
                Link Externo (Opcional)
              </label>
              <Input
                type="url"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                placeholder="https://loja.com/produto"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Salvando...' : gift ? 'Salvar Alterações' : 'Criar Presente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
