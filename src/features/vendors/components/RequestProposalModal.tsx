'use client'

import { useState } from 'react'
import { X, Calendar, DollarSign, Users, FileText, Sparkles, Gavel } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface RequestProposalModalProps {
  vendor: {
    id: string
    name: string
    category: string
    priceFromCents?: number
  }
  eventDate?: Date
  guestCount?: number
  onClose: () => void
  onSubmit: (data: ProposalRequest) => void
}

export interface ProposalRequest {
  vendorId: string
  eventDate: Date
  guestCount: number
  budgetMaxCents: number
  description: string
  requestType: 'direct' | 'auction'
  auctionDurationHours?: number
  urgent: boolean
}

export function RequestProposalModal({
  vendor,
  eventDate,
  guestCount: initialGuestCount,
  onClose,
  onSubmit,
}: RequestProposalModalProps) {
  const [requestType, setRequestType] = useState<'direct' | 'auction'>('direct')
  const [formData, setFormData] = useState({
    eventDate: eventDate || new Date(),
    guestCount: initialGuestCount || 100,
    budgetMaxCents: vendor.priceFromCents || 0,
    description: '',
    auctionDurationHours: 48,
    urgent: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      await onSubmit({
        vendorId: vendor.id,
        ...formData,
        requestType,
      })
      onClose()
    } catch (error) {
      console.error('Error submitting proposal request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const priceFrom = vendor.priceFromCents ? vendor.priceFromCents / 100 : 0
  const budgetMax = formData.budgetMaxCents / 100

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <Card
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="font-heading text-2xl">Solicitar Orçamento</CardTitle>
              <p className="mt-1 text-sm text-celebre-muted">
                <span className="font-semibold">{vendor.name}</span> • {vendor.category}
              </p>
              {vendor.priceFromCents && (
                <p className="mt-1 text-xs text-celebre-muted">
                  Preço a partir de: R$ {priceFrom.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Request Type Selection */}
          <div>
            <Label className="mb-3 block text-base font-semibold">Tipo de Solicitação</Label>
            <div className="grid grid-cols-2 gap-4">
              {/* Direct Quote */}
              <button
                type="button"
                onClick={() => setRequestType('direct')}
                className={cn(
                  'flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:bg-gray-50',
                  requestType === 'direct'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'rounded-full p-2',
                      requestType === 'direct' ? 'bg-purple-500' : 'bg-gray-200'
                    )}
                  >
                    <FileText
                      className={cn(
                        'size-5',
                        requestType === 'direct' ? 'text-white' : 'text-gray-600'
                      )}
                    />
                  </div>
                  <span className="font-semibold text-celebre-ink">Orçamento Direto</span>
                </div>
                <p className="text-xs text-celebre-muted">
                  Solicite um orçamento personalizado diretamente ao fornecedor
                </p>
                <Badge variant="outline" className="text-xs">
                  Resposta em até 24h
                </Badge>
              </button>

              {/* Auction */}
              <button
                type="button"
                onClick={() => setRequestType('auction')}
                className={cn(
                  'flex flex-col items-start gap-3 rounded-xl border-2 p-4 text-left transition-all hover:bg-gray-50',
                  requestType === 'auction'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'rounded-full p-2',
                      requestType === 'auction' ? 'bg-blue-500' : 'bg-gray-200'
                    )}
                  >
                    <Gavel
                      className={cn(
                        'size-5',
                        requestType === 'auction' ? 'text-white' : 'text-gray-600'
                      )}
                    />
                  </div>
                  <span className="font-semibold text-celebre-ink">Leilão Reverso</span>
                </div>
                <p className="text-xs text-celebre-muted">
                  Deixe múltiplos fornecedores competirem com suas melhores ofertas
                </p>
                <Badge variant="outline" className="bg-blue-50 text-xs text-blue-700">
                  <Sparkles className="mr-1 size-3" />
                  Melhor custo-benefício
                </Badge>
              </button>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4 rounded-xl border bg-gray-50 p-4">
            <h3 className="flex items-center gap-2 font-semibold text-celebre-ink">
              <Calendar className="size-4" />
              Detalhes do Evento
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate">Data do Evento</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={formData.eventDate.toISOString().split('T')[0]}
                  onChange={(e) =>
                    setFormData({ ...formData, eventDate: new Date(e.target.value) })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="guestCount">Número de Convidados</Label>
                <div className="relative mt-1">
                  <Users className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="guestCount"
                    type="number"
                    min="1"
                    value={formData.guestCount}
                    onChange={(e) =>
                      setFormData({ ...formData, guestCount: parseInt(e.target.value) || 0 })
                    }
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label htmlFor="budgetMax" className="flex items-center gap-2">
              <DollarSign className="size-4" />
              Orçamento Máximo (R$)
            </Label>
            <Input
              id="budgetMax"
              type="number"
              min="0"
              step="100"
              value={budgetMax}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  budgetMaxCents: Math.round((parseFloat(e.target.value) || 0) * 100),
                })
              }
              className="mt-1"
              placeholder="Digite seu orçamento máximo"
            />
            <p className="mt-1 text-xs text-celebre-muted">
              {requestType === 'auction'
                ? 'Os fornecedores verão seu orçamento máximo e poderão fazer ofertas abaixo deste valor'
                : 'Opcional - ajuda o fornecedor a preparar uma proposta adequada'}
            </p>
          </div>

          {/* Auction Duration */}
          {requestType === 'auction' && (
            <div>
              <Label htmlFor="auctionDuration">Duração do Leilão</Label>
              <select
                id="auctionDuration"
                value={formData.auctionDurationHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    auctionDurationHours: parseInt(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
              >
                <option value={24}>24 horas</option>
                <option value={48}>48 horas (Recomendado)</option>
                <option value={72}>72 horas</option>
                <option value={96}>4 dias</option>
                <option value={168}>1 semana</option>
              </select>
              <p className="mt-1 text-xs text-celebre-muted">
                Quanto mais tempo, mais chances de receber ofertas competitivas
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrição e Requisitos</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="mt-1"
              placeholder="Descreva suas necessidades, preferências, restrições alimentares, estilo do evento, etc..."
            />
            <p className="mt-1 text-xs text-celebre-muted">
              Quanto mais detalhes, melhor será a proposta
            </p>
          </div>

          {/* Urgent Flag */}
          <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3">
            <input
              type="checkbox"
              id="urgent"
              checked={formData.urgent}
              onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
              className="size-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <Label htmlFor="urgent" className="cursor-pointer text-sm font-medium">
              Marcar como urgente (preciso de resposta rápida)
            </Label>
          </div>

          {/* Summary */}
          {requestType === 'auction' && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
                <Sparkles className="size-4" />
                Como funciona o Leilão Reverso
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Múltiplos fornecedores receberão sua solicitação</li>
                <li>• Eles competem oferecendo seus melhores preços</li>
                <li>• Você vê todas as ofertas e escolhe a melhor</li>
                <li>• Pode negociar diretamente com o vencedor</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className={cn(
                'flex-1',
                requestType === 'auction' ? 'bg-blue-600 hover:bg-blue-700' : ''
              )}
              disabled={isSubmitting || !formData.description}
            >
              {isSubmitting ? (
                'Enviando...'
              ) : requestType === 'auction' ? (
                <>
                  <Gavel className="mr-2 size-4" />
                  Iniciar Leilão
                </>
              ) : (
                <>
                  <FileText className="mr-2 size-4" />
                  Solicitar Orçamento
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
