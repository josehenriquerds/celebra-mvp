'use client'

import { Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { GiftStatus } from '@/schemas'

interface GiftsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: GiftStatus | 'all'
  onStatusFilterChange: (value: GiftStatus | 'all') => void
}

export function GiftsFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: GiftsFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-celebre-muted" />
            <Input
              type="text"
              placeholder="Buscar presente..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as GiftStatus | 'all')}
            className="focus:ring-celebre-brand rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
          >
            <option value="all">Todos os Status</option>
            <option value="disponivel">Disponível</option>
            <option value="reservado">Reservado</option>
            <option value="recebido">Recebido</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
