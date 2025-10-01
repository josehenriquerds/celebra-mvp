'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Edit2, Trash2 } from 'lucide-react'
import type { Table } from '@/schemas'
import { DroppableSeat } from './DroppableSeat'

interface TableItemProps {
  table: Table
  zoom: number
  onEdit: (table: Table) => void
  onDelete: (id: string) => void
}

export function TableItem({ table, zoom, onEdit, onDelete }: TableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `table-${table.id}`,
    data: { type: 'table', table },
  })

  const renderLeft = table.x * zoom
  const renderTop = table.y * zoom
  const renderDiameter = table.radius * 2 * zoom

  return (
    <div
      ref={setNodeRef}
      style={{
        left: renderLeft,
        top: renderTop,
        width: renderDiameter,
        height: renderDiameter,
        transform: `${CSS.Translate.toString(transform)} translate(-50%, -50%)`,
        opacity: isDragging ? 0.5 : 1,
        borderColor: table.color || 'var(--celebre-brand)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className="group absolute flex items-center justify-center rounded-full border-4 bg-white shadow-lg"
      {...listeners}
      {...attributes}
    >
      {/* Título e contagem */}
      <div className="pointer-events-none text-center">
        <div className="text-lg font-bold" style={{ color: table.color || 'var(--celebre-brand)' }}>
          {table.label}
        </div>
        <div className="text-xs text-celebre-muted">
          {table.seats.filter((s) => s.assignment).length}/{table.capacity}
        </div>
      </div>

      {/* Ações */}
      <div
        className="absolute -top-8 right-0 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-auto"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit(table)
          }}
          className="rounded-full bg-blue-500 p-1 text-white transition-colors hover:bg-blue-600 cursor-pointer"
          title="Editar"
        >
          <Edit2 className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(table.id)
          }}
          className="rounded-full bg-red-500 p-1 text-white transition-colors hover:bg-red-600 cursor-pointer"
          title="Excluir"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Assentos */}
      {table.seats.map((seat) => (
        <DroppableSeat key={seat.id} seat={seat} tableId={table.id} tableColor={table.color} zoom={zoom} />
      ))}
    </div>
  )
}
