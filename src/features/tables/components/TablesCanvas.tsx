'use client'

import { useDroppable } from '@dnd-kit/core'

import { cn } from '@/lib/utils'
import type { Table } from '@/schemas'
import { TableItem } from './TableItem'

interface TablesCanvasProps {
  tables: Table[]
  zoom: number
  canvasWidth: number
  canvasHeight: number
  onEditTable: (table: Table) => void
  onDeleteTable: (id: string) => void
}

export function TablesCanvas({
  tables,
  zoom,
  canvasWidth,
  canvasHeight,
  onEditTable,
  onDeleteTable,
}: TablesCanvasProps) {
  const renderWidth = canvasWidth * zoom
  const renderHeight = canvasHeight * zoom

  const { setNodeRef, isOver } = useDroppable({
    id: 'tables-canvas-droppable',
    data: { type: 'canvas' },
  })

  return (
    <div
      ref={setNodeRef}
      id="tables-canvas"
      className={cn(
        'relative overflow-hidden rounded-3xl border-2 border-dashed border-muted/40 bg-white transition-colors duration-200 ease-smooth',
        isOver && 'border-celebre-brand/70'
      )}
      style={{
        width: renderWidth,
        height: renderHeight,
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: `${16 * zoom}px ${16 * zoom}px`,
        touchAction: 'none',
      }}
    >
      {tables.map((table) => (
        <TableItem
          key={table.id}
          table={table}
          zoom={zoom}
          onEdit={onEditTable}
          onDelete={onDeleteTable}
        />
      ))}
    </div>
  )
}
