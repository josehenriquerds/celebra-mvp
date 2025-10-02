'use client'

import { Gift, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GiftsEmptyStateProps {
  onCreateClick: () => void
}

export function GiftsEmptyState({ onCreateClick }: GiftsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8E2F0] bg-[#F8FBFE] p-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-inner">
        <Gift className="h-10 w-10 text-[#A5B8D6]" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-[#1F3A5F]">Comece adicionando seu primeiro presente</h3>
      <p className="mt-2 max-w-sm text-sm text-[#5B6C92]">
        Use o link inteligente para cadastrar itens em segundos e deixe os convidados escolherem com mais facilidade.
      </p>
      <Button className="mt-6" onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" /> Adicionar presente
      </Button>
    </div>
  )
}
