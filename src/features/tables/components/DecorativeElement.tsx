'use client';

import { motion } from 'framer-motion';
import { Trash2, Lock, Unlock, Cake, Music, DoorClosed, DoorOpen, UtensilsCrossed, Music2, WineIcon, Camera } from 'lucide-react';
import { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import type { ElementType } from '@/schemas';

interface DecorativeElementProps {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: { x?: number; y?: number; width?: number; height?: number }) => void;
  onDelete: () => void;
  gridSize?: number;
}

const ELEMENT_ICONS: Record<ElementType, React.ComponentType<{ className?: string }>> = {
  cakeTable: Cake,
  danceFloor: Music,
  restroom: DoorClosed,
  buffet: UtensilsCrossed,
  dj: Music2,
  entrance: DoorOpen,
  exit: DoorClosed,
  bar: WineIcon,
  photoArea: Camera,
};

const ELEMENT_LABELS: Record<ElementType, string> = {
  cakeTable: 'Mesa do Bolo',
  danceFloor: 'Pista de Dança',
  restroom: 'Banheiro',
  buffet: 'Buffet',
  dj: 'DJ',
  entrance: 'Entrada',
  exit: 'Saída',
  bar: 'Bar',
  photoArea: 'Foto',
};

export function DecorativeElement({
  id,
  type,
  x,
  y,
  width,
  height,
  color,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  gridSize = 0,
}: DecorativeElementProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const snapToGrid = (value: number): number => {
    if (gridSize > 0) {
      return Math.round(value / gridSize) * gridSize;
    }
    return value;
  };

  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      onUpdate({
        x: snapToGrid(d.x),
        y: snapToGrid(d.y),
      });
    },
    [snapToGrid, onUpdate]
  );

  const handleResizeStop = useCallback(
    (
      e: any,
      direction: any,
      ref: HTMLElement,
      delta: any,
      position: { x: number; y: number }
    ) => {
      onUpdate({
        width: parseInt(ref.style.width),
        height: parseInt(ref.style.height),
        x: snapToGrid(position.x),
        y: snapToGrid(position.y),
      });
    },
    [snapToGrid, onUpdate]
  );

  const Icon = ELEMENT_ICONS[type] || Cake;
  const label = ELEMENT_LABELS[type] || type;

  return (
    <Rnd
      position={{ x, y }}
      size={{ width, height }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={isLocked}
      enableResizing={
        isLocked
          ? false
          : {
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }
      }
      minWidth={60}
      minHeight={60}
      maxWidth={400}
      maxHeight={400}
      bounds="parent"
      style={{
        zIndex: isSelected ? 50 : 10,
      }}
      className={`group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="relative size-full"
      >
        {/* Element Box */}
        <div
          className={`flex size-full flex-col items-center justify-center rounded-lg border-2 shadow-lg transition-all ${
            isLocked ? 'cursor-not-allowed' : 'cursor-move'
          }`}
          style={{
            backgroundColor: color + '20',
            borderColor: isSelected ? '#3b82f6' : color,
          }}
        >
          <Icon
            className="mb-1 size-8"
            color={color}
          />
          <span
            className="px-2 text-center text-xs font-semibold"
            style={{ color }}
          >
            {label}
          </span>
        </div>

        {/* Selection Overlay */}
        {(isSelected || isHovered) && (
          <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-blue-400">
            <div className="absolute -left-1 -top-1 size-2 rounded-full bg-blue-500" />
            <div className="absolute -right-1 -top-1 size-2 rounded-full bg-blue-500" />
            <div className="absolute -bottom-1 -left-1 size-2 rounded-full bg-blue-500" />
            <div className="absolute -bottom-1 -right-1 size-2 rounded-full bg-blue-500" />
          </div>
        )}

        {/* Controls */}
        {(isSelected || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-lg bg-gray-900 px-2 py-1 text-xs text-white"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLocked(!isLocked);
              }}
              className="p-1 transition-colors hover:text-blue-300"
              title={isLocked ? 'Desbloquear' : 'Bloquear'}
            >
              {isLocked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remover "${label}"?`)) {
                  onDelete();
                }
              }}
              className="p-1 transition-colors hover:text-red-300"
              title="Remover"
            >
              <Trash2 className="size-3" />
            </button>
            <span className="ml-1 border-l border-gray-700 pl-1 text-[10px] text-gray-400">
              {width}×{height}
            </span>
          </motion.div>
        )}

        {/* Lock Indicator */}
        {isLocked && (
          <div className="absolute right-2 top-2 rounded-full bg-red-500 p-1">
            <Lock className="size-3 text-white" />
          </div>
        )}
      </motion.div>
    </Rnd>
  );
}
