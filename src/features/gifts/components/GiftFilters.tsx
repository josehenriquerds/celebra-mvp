'use client'

import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChipFilter, ChipFilterGroup } from '@/components/ui/chip-filter'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { GiftStatus } from '@/schemas'

export type GiftSortOption = 'best-price' | 'price-asc' | 'price-desc' | 'recent'

interface GiftFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: GiftStatus | 'all'
  onStatusChange: (status: GiftStatus | 'all') => void
  sort: GiftSortOption
  onSortChange: (value: GiftSortOption) => void
  counters: {
    total: number
    available: number
    reserved: number
    purchased: number
  }
}

const sortLabels: Record<GiftSortOption, string> = {
  'best-price': 'Melhor preço',
  'price-asc': 'Preço · menor',
  'price-desc': 'Preço · maior',
  recent: 'Mais recentes',
}

export function GiftFilters({ search, onSearchChange, status, onStatusChange, sort, onSortChange, }: GiftFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8AA0B8]" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar presentes"
            className="pl-9"
          />
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Label className="text-sm text-[#5B6C92]">Ordenar por</Label>
          <Select value={sort} onValueChange={(value) => onSortChange(value as GiftSortOption)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sortLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="md:hidden">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" className="w-full">
                Filtros
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[70vh]">
              <DrawerHeader>
                <DrawerTitle>Filtrar presentes</DrawerTitle>
              </DrawerHeader>
              <div className="space-y-4 p-4">
                <div>
                  <Label className="text-sm text-[#5B6C92]">Ordenar por</Label>
                  <Select value={sort} onValueChange={(value) => onSortChange(value as GiftSortOption)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(sortLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm text-[#5B6C92]">Status</Label>
                  <ChipFilterGroup className="mt-2">
                    <ChipFilter
                      label={Todos ()}
                      active={status === 'all'}
                      onClick={() => onStatusChange('all')}
                    />
                    <ChipFilter
                      label={Disponíveis ()}
                      active={status === 'disponivel'}
                      onClick={() => onStatusChange('disponivel')}
                    />
                    <ChipFilter
                      label={Reservados ()}
                      active={status === 'reservado'}
                      onClick={() => onStatusChange('reservado')}
                    />
                    <ChipFilter
                      label={Comprados ()}
                      active={status === 'comprado'}
                      onClick={() => onStatusChange('comprado')}
                    />
                  </ChipFilterGroup>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <div className="hidden md:block">
        <ChipFilterGroup>
          <ChipFilter
            label={Todos ()}
            active={status === 'all'}
            onClick={() => onStatusChange('all')}
          />
          <ChipFilter
            label={Disponíveis ()}
            active={status === 'disponivel'}
            onClick={() => onStatusChange('disponivel')}
          />
          <ChipFilter
            label={Reservados ()}
            active={status === 'reservado'}
            onClick={() => onStatusChange('reservado')}
          />
          <ChipFilter
            label={Comprados ()}
            active={status === 'comprado'}
            onClick={() => onStatusChange('comprado')}
          />
        </ChipFilterGroup>
      </div>
    </div>
  )
}
