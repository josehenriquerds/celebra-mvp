'use client';

import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  color?: string;
  children: React.ReactNode;
}

export function KanbanColumn({
  id,
  title,
  count,
  color = 'bg-primary',
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col bg-[#FAF7F4] rounded-2xl p-4 min-h-[500px] transition-colors',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className={cn('w-3 h-3 rounded-full', color)} />
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-sm text-muted-foreground bg-white rounded-full px-2 py-1">
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
