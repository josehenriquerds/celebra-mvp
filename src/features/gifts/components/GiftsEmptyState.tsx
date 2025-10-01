'use client'

import { Gift, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface GiftsEmptyStateProps {
  onCreateClick: () => void
}

export function GiftsEmptyState({ onCreateClick }: GiftsEmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Gift className="mx-auto mb-4 h-12 w-12 text-celebre-muted opacity-50" />
        <p className="text-celebre-muted">Nenhum presente encontrado</p>
        <Button variant="outline" className="mt-4" onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Primeiro Presente
        </Button>
      </CardContent>
    </Card>
  )
}
