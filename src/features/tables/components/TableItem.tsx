'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Edit2, Trash2 } from 'lucide-react'
import { memo, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Table } from '@/schemas'
import { DroppableSeat } from './DroppableSeat'

interface TableItemProps {
  table: Table
  zoom: number
  onEdit: (table: Table) => void
  onDelete: (id: string) => void
}

const actionButtonClasses =
  'rounded-full p-1 text-white transition duration-200 ease-smooth hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97]'

export const TableItem = memo(function TableItem({
  table,
  zoom,
  onEdit,
  onDelete,
}: TableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `table-${table.id}`,
    data: { type: 'table', table },
  })

  // Memoizar cálculos de renderização
  const renderMetrics = useMemo(
    () => ({
      left: table.x * zoom,
      top: table.y * zoom,
      diameter: table.radius * 2 * zoom,
      radius: table.radius * zoom,
    }),
    [table.x, table.y, table.radius, zoom]
  )

  // Memoizar contagem de assentos ocupados
  const occupiedSeats = useMemo(
    () => table.seats.filter((s) => s.assignment).length,
    [table.seats]
  )

  // Determine shape class
  const shapeClass =
    table.shape === 'square' || table.shape === 'rect' ? 'rounded-2xl' : 'rounded-full'

  return (
    <div
      ref={setNodeRef}
      style={{
        left: renderMetrics.left - renderMetrics.radius,
        top: renderMetrics.top - renderMetrics.radius,
        width: renderMetrics.diameter,
        height: renderMetrics.diameter,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        borderColor: table.color || 'var(--celebre-brand)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className={cn(
        'group absolute flex items-center justify-center border-4 bg-white shadow-lg transition-shadow duration-200 ease-smooth',
        shapeClass
      )}
      {...listeners}
      {...attributes}
    >
      <div className="pointer-events-none text-center">
        <div
          className="text-lg font-bold"
          style={{ color: table.color || 'var(--celebre-brand)' }}
        >
          {table.label}
        </div>
        <div className="text-xs text-celebre-muted">
          {occupiedSeats}/{table.capacity}
        </div>
      </div>

      <div
        className="pointer-events-auto absolute -top-8 right-0 flex gap-1 opacity-0 transition-opacity duration-200 ease-smooth group-hover:opacity-100"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(table)
          }}
          className={cn(actionButtonClasses, 'bg-blue-500 hover:bg-blue-600')}
          title="Editar"
        >
          <Edit2 className="size-3" aria-hidden="true" />
          <span className="sr-only">Editar mesa</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(table.id)
          }}
          className={cn(actionButtonClasses, 'bg-red-500 hover:bg-red-600')}
          title="Excluir"
        >
          <Trash2 className="size-3" aria-hidden="true" />
          <span className="sr-only">Excluir mesa</span>
        </button>
      </div>

      {table.seats.map((seat) => (
        <DroppableSeat
          key={seat.id}
          seat={seat}
          tableId={table.id}
          tableColor={table.color}
          tableRadius={renderMetrics.radius}
          zoom={zoom}
        />
      ))}
    </div>
  )
})
