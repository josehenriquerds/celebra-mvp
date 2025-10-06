'use client';

import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { useBingoStore } from '../state/useBingoStore';

interface DndProviderProps {
  children: React.ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  const updateCell = useBingoStore((s) => s.updateCell);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Parse cell ID (formato: "cell-row-col")
    const cellMatch = over.id.toString().match(/cell-(\d+)-(\d+)/);
    if (!cellMatch) return;

    const row = parseInt(cellMatch[1]);
    const col = parseInt(cellMatch[2]);

    // Parse drag data
    const dragData = active.data.current;

    if (dragData?.type === 'image') {
      updateCell(row, col, { imageUrl: dragData.url });
    } else if (dragData?.type === 'text') {
      updateCell(row, col, { text: dragData.content });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  );
}
