'use client'

import {
  CheckCircle,
  Clock,
  Edit2,
  ExternalLink,
  Gift as GiftIcon,
  ShoppingCart,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Gift } from '@/schemas'

const STATUS_COLORS = {
  disponivel: 'bg-gray-100 text-gray-800 border-gray-200',
  reservado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  recebido: 'bg-green-100 text-green-800 border-green-200',
}

const STATUS_ICONS = {
  disponivel: ShoppingCart,
  reservado: Clock,
  recebido: CheckCircle,
}

const STATUS_LABELS = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  recebido: 'Recebido',
}

interface GiftCardProps {
  gift: Gift
  onEdit: (gift: Gift) => void
  onDelete: (id: string) => void
  onMarkReceived: (id: string) => void
}

export function GiftCard({ gift, onEdit, onDelete, onMarkReceived }: GiftCardProps) {
  const StatusIcon = STATUS_ICONS[gift.status]

  return (
    <Card className="hover:shadow-celebre-lg overflow-hidden transition-shadow">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {gift.imageUrl ? (
          <img src={gift.imageUrl} alt={gift.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <GiftIcon className="h-16 w-16 text-gray-300" />
          </div>
        )}
        <div className="absolute right-2 top-2 flex gap-1">
          <button
            onClick={() => onEdit(gift)}
            className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-gray-100"
            aria-label="Editar presente"
          >
            <Edit2 className="text-celebre-brand h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(gift.id)}
            className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-red-100"
            aria-label="Excluir presente"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="mb-1 line-clamp-2 font-semibold text-celebre-ink">{gift.title}</h3>
          {gift.description && (
            <p className="line-clamp-2 text-xs text-celebre-muted">{gift.description}</p>
          )}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <span className="text-celebre-brand text-lg font-bold">{formatCurrency(gift.price)}</span>
          <Badge className={`text-xs ${STATUS_COLORS[gift.status]}`}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {STATUS_LABELS[gift.status]}
          </Badge>
        </div>

        {gift.guest && (
          <p className="mb-3 text-xs text-celebre-muted">
            Reservado por: <span className="font-medium">{gift.guest.contact.fullName}</span>
          </p>
        )}

        <div className="flex gap-2">
          {gift.externalUrl && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(gift.externalUrl!, '_blank')}
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              Ver Loja
            </Button>
          )}
          {gift.status === 'reservado' && (
            <Button size="sm" className="flex-1" onClick={() => onMarkReceived(gift.id)}>
              <CheckCircle className="mr-1 h-3 w-3" />
              Marcar Recebido
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
