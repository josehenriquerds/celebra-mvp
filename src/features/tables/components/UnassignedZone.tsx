'use client'

import { useDroppable } from '@dnd-kit/core'

interface UnassignedZoneProps {
  children: React.ReactNode
}

export function UnassignedZone({ children }: UnassignedZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned-dropzone',
    data: { type: 'unassigned' },
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-40 space-y-2 p-4 ring-offset-2 transition ${
        isOver ? 'ring-celebre-brand/60 bg-celebre-accent/20 ring-2' : ''
      }`}
    >
      {children}
      {isOver && <p className="mt-2 text-[11px] text-celebre-muted">Solte para desalocar</p>}
    </div>
  )
}
