'use client'

import { Download, LayoutGrid, Redo, Undo, ZoomIn, ZoomOut, Shapes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlannerStore } from '../stores/usePlannerStore'

interface ToolbarProps {
  onExport: () => void
  onAutoArrange: () => void
  onAutoAllocate: () => void
  exporting?: boolean
}

export function Toolbar({ onExport, onAutoArrange, onAutoAllocate, exporting }: ToolbarProps) {
  const {
    zoom,
    zoomIn,
    zoomOut,
    undo,
    redo,
    canUndo,
    canRedo,
    toggleElementsPalette,
    showElementsPalette,
  } = usePlannerStore()

  return (
    <div className="flex items-center gap-2">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1 rounded-lg border bg-white px-2 py-1">
        <Button variant="ghost" size="sm" onClick={zoomOut} disabled={zoom <= 0.5}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="min-w-[3rem] text-center text-xs font-medium">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="sm" onClick={zoomIn} disabled={zoom >= 2}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 rounded-lg border bg-white px-1 py-1">
        <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo()} title="Desfazer">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo()} title="Refazer">
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleElementsPalette}
        title="Elementos do espaço"
      >
        <Shapes className="mr-2 h-4 w-4" />
        {showElementsPalette ? 'Ocultar' : 'Elementos'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onAutoArrange}
        title="Organizar mesas automaticamente"
      >
        <LayoutGrid className="mr-2 h-4 w-4" />
        Auto-Organizar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onAutoAllocate}
        title="Alocar convidados automaticamente"
      >
        Auto-Alocar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        disabled={exporting}
        title="Exportar como imagem"
      >
        <Download className="mr-2 h-4 w-4" />
        {exporting ? 'Exportando...' : 'Exportar'}
      </Button>
    </div>
  )
}
