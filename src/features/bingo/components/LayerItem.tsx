'use client';

import { motion } from 'framer-motion';
import { Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Rnd } from 'react-rnd';
import type { FreeLayer } from '../types';

interface LayerItemProps {
  layer: FreeLayer;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FreeLayer>) => void;
  gridSize?: number;
}

export function LayerItem({
  layer,
  isSelected,
  onSelect,
  onUpdate,
  gridSize = 0,
}: LayerItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const snapToGrid = (value: number): number => {
    if (gridSize > 0) {
      return Math.round(value / gridSize) * gridSize;
    }
    return value;
  };

  const handleDragStop = (e: any, d: { x: number; y: number }) => {
    onUpdate({
      position: {
        x: snapToGrid(d.x),
        y: snapToGrid(d.y),
      },
    });
  };

  const handleResizeStop = (
    e: any,
    direction: any,
    ref: HTMLElement,
    delta: any,
    position: { x: number; y: number }
  ) => {
    onUpdate({
      size: {
        width: parseInt(ref.style.width),
        height: parseInt(ref.style.height),
      },
      position: {
        x: snapToGrid(position.x),
        y: snapToGrid(position.y),
      },
    });
  };

  if (!layer.visible) return null;

  return (
    <Rnd
      position={layer.position}
      size={layer.size}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      disableDragging={layer.locked}
      enableResizing={!layer.locked}
      bounds="parent"
      style={{
        zIndex: layer.zIndex,
      }}
      className={`group ${isSelected ? 'ring-2 ring-purple-500' : ''}`}
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
        style={{
          transform: `rotate(${layer.rotation}deg)`,
        }}
      >
        {/* Layer Content */}
        {layer.type === 'image' && layer.url && (
          <img
            src={layer.url}
            alt="Layer"
            className="pointer-events-none size-full select-none object-contain"
            draggable={false}
          />
        )}

        {layer.type === 'text' && layer.content && (
          <div
            className="flex size-full items-center justify-center break-words p-2 text-center font-bold"
            style={{
              fontSize: layer.fontSize || 16,
              color: layer.color || '#000000',
              fontFamily: layer.fontFamily || 'system-ui',
            }}
          >
            {layer.content}
          </div>
        )}

        {layer.type === 'shape' && (
          <div
            className="size-full"
            style={{
              backgroundColor: layer.color || '#9333ea',
              borderRadius: layer.shape === 'circle' ? '50%' : '8px',
              opacity: layer.opacity || 1,
            }}
          />
        )}

        {/* Selection Overlay */}
        {(isSelected || isHovered) && (
          <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-purple-400">
            {/* Corner Handles Visual Hint */}
            <div className="absolute -left-1 -top-1 size-2 rounded-full bg-purple-500" />
            <div className="absolute -right-1 -top-1 size-2 rounded-full bg-purple-500" />
            <div className="absolute -bottom-1 -left-1 size-2 rounded-full bg-purple-500" />
            <div className="absolute -bottom-1 -right-1 size-2 rounded-full bg-purple-500" />
          </div>
        )}

        {/* Layer Controls (on hover/select) */}
        {(isSelected || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-auto absolute -top-8 left-0 flex items-center gap-1 rounded bg-gray-900 px-2 py-1 text-xs text-white"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ locked: !layer.locked });
              }}
              className="transition-colors hover:text-purple-300"
              title={layer.locked ? 'Desbloquear' : 'Bloquear'}
            >
              {layer.locked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ visible: !layer.visible });
              }}
              className="transition-colors hover:text-purple-300"
              title="Ocultar"
            >
              <Eye className="size-3" />
            </button>
            <span className="ml-1 text-[10px] text-gray-400">
              {layer.size.width}×{layer.size.height}
            </span>
          </motion.div>
        )}

        {/* Rotation Handle */}
        {isSelected && !layer.locked && (
          <div
            className="absolute -top-6 left-1/2 size-4 -translate-x-1/2 cursor-pointer rounded-full bg-purple-500 transition-colors hover:bg-purple-600"
            onMouseDown={(e) => {
              e.stopPropagation();
              // Rotation logic would go here (simplified for now)
              const startAngle = layer.rotation;
              const handleRotate = (moveEvent: MouseEvent) => {
                // Calculate angle from center
                const rect = (e.target as HTMLElement).parentElement?.getBoundingClientRect();
                if (!rect) return;

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const angle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
                const degrees = angle * (180 / Math.PI);

                onUpdate({ rotation: Math.round(degrees) });
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleRotate);
                document.removeEventListener('mouseup', handleMouseUp);
              };

              document.addEventListener('mousemove', handleRotate);
              document.addEventListener('mouseup', handleMouseUp);
            }}
            title="Rotacionar"
          >
            <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white">
              ↻
            </div>
          </div>
        )}
      </motion.div>
    </Rnd>
  );
}
