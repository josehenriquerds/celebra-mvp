'use client'

import { Download, LayoutGrid, Redo, Undo, ZoomIn, ZoomOut, Shapes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  createPlannerSelector,
  getPlannerStore,
  type PlannerStoreHook,
} from '../stores/usePlannerStore'

interface ToolbarProps {
  onExport: () => void
  onAutoArrange: () => void
  onAutoAllocate: () => void
  exporting?: boolean
  eventId?: string
  plannerStore?: PlannerStoreHook
}

const controlButtonClasses =
  'transition-transform duration-200 ease-smooth hover:bg-muted/60 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]'

export function Toolbar({
  onExport,
  onAutoArrange,
  onAutoAllocate,
  exporting,
  eventId,
  plannerStore,
}: ToolbarProps) {
  const store = plannerStore ?? getPlannerStore(eventId)

  const zoom = createPlannerSelector(store, (state) => state.zoom)
  const zoomIn = createPlannerSelector(store, (state) => state.zoomIn)
  const zoomOut = createPlannerSelector(store, (state) => state.zoomOut)
  const undo = createPlannerSelector(store, (state) => state.undo)
  const redo = createPlannerSelector(store, (state) => state.redo)
  const canUndo = createPlannerSelector(store, (state) => state.canUndo)
  const canRedo = createPlannerSelector(store, (state) => state.canRedo)
  const toggleElementsPalette = createPlannerSelector(store, (state) => state.toggleElementsPalette)
  const showElementsPalette = createPlannerSelector(store, (state) => state.showElementsPalette)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 shadow-sm transition-colors duration-200 ease-smooth">
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomOut}
          disabled={zoom <= 0.5}
          aria-label="Diminuir zoom"
          className={controlButtonClasses}
        >
          <ZoomOut className="size-4" aria-hidden="true" />
        </Button>
        <span className="min-w-12 text-center text-xs font-medium">{Math.round(zoom * 100)}%</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={zoomIn}
          disabled={zoom >= 2}
          aria-label="Aumentar zoom"
          className={controlButtonClasses}
        >
          <ZoomIn className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm transition-colors duration-200 ease-smooth">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo()}
          aria-label="Desfazer"
          className={controlButtonClasses}
        >
          <Undo className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo()}
          aria-label="Refazer"
          className={controlButtonClasses}
        >
          <Redo className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleElementsPalette}
        aria-pressed={showElementsPalette}
        data-state={showElementsPalette ? 'open' : 'closed'}
        className={cn(
          'rounded-full border border-border px-3 py-2 text-sm font-medium',
          controlButtonClasses,
          'data-[state=open]:bg-muted/60'
        )}
      >
        <Shapes
          className={cn(
            'mr-2 h-4 w-4 transition-transform duration-200 ease-smooth',
            showElementsPalette && 'scale-110'
          )}
          aria-hidden="true"
        />
        {showElementsPalette ? 'Ocultar elementos' : 'Elementos'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onAutoArrange}
        className={cn('rounded-full border border-border px-3 py-2 text-sm font-medium', controlButtonClasses)}
      >
        <LayoutGrid className="mr-2 size-4" aria-hidden="true" />
        Auto-Organizar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onAutoAllocate}
        className={cn('rounded-full border border-border px-3 py-2 text-sm font-medium', controlButtonClasses)}
      >
        Auto-Alocar
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onExport}
        disabled={exporting}
        className={cn('rounded-full border border-border px-3 py-2 text-sm font-medium', controlButtonClasses)}
      >
        <Download className="mr-2 size-4" aria-hidden="true" />
        {exporting ? 'Exportando...' : 'Exportar'}
      </Button>
    </div>
  )
}
