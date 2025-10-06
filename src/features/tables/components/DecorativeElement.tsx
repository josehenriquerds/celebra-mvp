'use client';

import { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { Trash2, Lock, Unlock, Cake, Music, DoorClosed, DoorOpen, UtensilsCrossed, Music2, WineIcon, Camera } from 'lucide-react';
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
        className="relative w-full h-full"
      >
        {/* Element Box */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center rounded-lg shadow-lg border-2 transition-all ${
            isLocked ? 'cursor-not-allowed' : 'cursor-move'
          }`}
          style={{
            backgroundColor: color + '20',
            borderColor: isSelected ? '#3b82f6' : color,
          }}
        >
          <Icon
            className="w-8 h-8 mb-1"
            color={color}
          />
          <span
            className="text-xs font-semibold text-center px-2"
            style={{ color }}
          >
            {label}
          </span>
        </div>

        {/* Selection Overlay */}
        {(isSelected || isHovered) && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-400 pointer-events-none rounded-lg">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        )}

        {/* Controls */}
        {(isSelected || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-900 text-white px-2 py-1 rounded-lg text-xs pointer-events-auto whitespace-nowrap"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLocked(!isLocked);
              }}
              className="hover:text-blue-300 transition-colors p-1"
              title={isLocked ? 'Desbloquear' : 'Bloquear'}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remover "${label}"?`)) {
                  onDelete();
                }
              }}
              className="hover:text-red-300 transition-colors p-1"
              title="Remover"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-gray-400 ml-1 border-l border-gray-700 pl-1">
              {width}×{height}
            </span>
          </motion.div>
        )}

        {/* Lock Indicator */}
        {isLocked && (
          <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
            <Lock className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.div>
    </Rnd>
  );
}
