'use client'

import { useDraggable, useDroppable } from '@dnd-kit/core'
import type { Seat } from '@/schemas'

interface DroppableSeatProps {
  seat: Seat
  tableId: string
  tableColor?: string
  zoom: number
}

export function DroppableSeat({ seat, tableId, tableColor, zoom }: DroppableSeatProps) {
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `seat-${tableId}-${seat.id}`,
    data: { type: 'seat', seatId: seat.id, tableId },
  })

  const {
    setNodeRef: setDragRef,
    attributes,
    listeners,
    isDragging,
  } = useDraggable({
    id: `assignment-${tableId}-${seat.id}`,
    disabled: !seat.assignment,
    data: seat.assignment
      ? {
          type: 'assignment',
          fromSeatId: seat.id,
          fromTableId: tableId,
          guestId: seat.assignment.guest.id,
        }
      : undefined,
  })

  const setRefs = (node: HTMLDivElement | null) => {
    setDropRef(node)
    setDragRef(node)
  }

  const assigned = !!seat.assignment
  const vip = seat.assignment?.guest.contact.isVip
  const renderLeft = seat.x * zoom
  const renderTop = seat.y * zoom

  return (
    <div
      ref={setRefs}
      {...(assigned ? { ...attributes, ...listeners } : {})}
      className={`absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 touch-none select-none items-center justify-center rounded-full pointer-events-auto ${isOver ? 'ring-celebre-brand/60 bg-celebre-accent/20 ring-2' : ''} ${isDragging ? 'opacity-70' : ''}`}
      style={{ left: renderLeft, top: renderTop }}
      title={seat.assignment?.guest.contact.fullName || 'Vazio'}
      onPointerDown={(e) => !assigned && e.stopPropagation()}
      onMouseDown={(e) => !assigned && e.stopPropagation()}
      onTouchStart={(e) => !assigned && e.stopPropagation()}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-[11px] font-medium ${assigned ? 'text-white' : 'bg-white'} ${isOver ? 'border-celebre-brand' : 'border-gray-300'}`}
        style={{
          backgroundColor: assigned ? `${tableColor || '#8b5cf6'}30` : undefined,
          borderColor: assigned ? tableColor || 'var(--celebre-brand)' : undefined,
        }}
      >
        {assigned ? (vip ? '⭐' : seat.index + 1) : seat.index + 1}
      </div>
    </div>
  )
}
