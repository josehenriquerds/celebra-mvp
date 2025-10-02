'use client'

import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'

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
      role="list"
      aria-label="Convidados não alocados"
      className={cn(
        'rounded-2xl border border-dashed border-border bg-card/70 p-4 transition-colors duration-200 ease-smooth',
        isOver ? 'border-primary/60 bg-celebre-accent/40 ring-2 ring-primary/40' : 'ring-0'
      )}
    >
      {children}
      {isOver && (
        <p className="mt-2 text-center text-xs font-medium text-celebre-muted">
          Solte para desalocar o convidado
        </p>
      )}
    </div>
  )
}
