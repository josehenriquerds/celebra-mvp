'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: string
  title: string
  count: number
  color?: string
  children: React.ReactNode
}

export function KanbanColumn({
  id,
  title,
  count,
  color = 'bg-primary',
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[500px] flex-col rounded-2xl bg-[#FAF7F4] p-4 transition-colors',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className={cn('h-3 w-3 rounded-full', color)} />
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="ml-auto rounded-full bg-white px-2 py-1 text-sm text-muted-foreground">
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto">{children}</div>
    </div>
  )
}
