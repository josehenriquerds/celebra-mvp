'use client';

import { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Lock, Unlock, Users } from 'lucide-react';
import type { Table } from '@/schemas';

interface TableStageItemProps {
  table: Table;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Table>) => void;
  onEdit: () => void;
  onDelete: () => void;
  gridSize?: number;
  zoom?: number;
}

export function TableStageItem({
  table,
  isSelected,
  onSelect,
  onUpdate,
  onEdit,
  onDelete,
  gridSize = 0,
  zoom = 1,
}: TableStageItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const snapToGrid = (value: number): number => {
    if (gridSize > 0) {
      return Math.round(value / gridSize) * gridSize;
    }
    return value;
  };

  // Calcula o tamanho baseado no radius (diâmetro)
  const size = table.radius * 2;
  // Posição é center-based, precisamos converter para top-left
  const position = {
    x: table.x - table.radius,
    y: table.y - table.radius,
  };

  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      const centerX = snapToGrid(d.x + table.radius);
      const centerY = snapToGrid(d.y + table.radius);
      onUpdate({ x: centerX, y: centerY });
    },
    [table.radius, snapToGrid, onUpdate]
  );

  const handleResizeStop = useCallback(
    (
      e: any,
      direction: any,
      ref: HTMLElement,
      delta: any,
      position: { x: number; y: number }
    ) => {
      const newSize = parseInt(ref.style.width);
      const newRadius = newSize / 2;
      const centerX = snapToGrid(position.x + newRadius);
      const centerY = snapToGrid(position.y + newRadius);

      onUpdate({
        radius: newRadius,
        x: centerX,
        y: centerY,
      });
    },
    [snapToGrid, onUpdate]
  );

  const toggleLock = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLocked(!isLocked);
  };

  // Cor de fundo
  const backgroundColor = table.color || '#C7B7F3';
  const isRound = table.shape === 'round';

  // Conta assentos ocupados
  const occupiedSeats = table.seats?.filter((s) => s.assignment).length || 0;

  return (
    <Rnd
      position={position}
      size={{ width: size, height: size }}
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
      lockAspectRatio
      minWidth={80}
      minHeight={80}
      maxWidth={400}
      maxHeight={400}
      bounds="parent"
      style={{
        zIndex: isSelected ? 100 : table.id ? parseInt(table.id) % 50 : 1,
      }}
      className={`group ${isSelected ? 'ring-4 ring-purple-500' : ''}`}
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
        {/* Table Shape */}
        <div
          className={`w-full h-full flex flex-col items-center justify-center shadow-lg transition-all ${
            isRound ? 'rounded-full' : 'rounded-2xl'
          } ${isLocked ? 'cursor-not-allowed' : 'cursor-move'}`}
          style={{
            backgroundColor,
            border: `3px solid ${isSelected ? '#9333ea' : 'rgba(0,0,0,0.1)'}`,
          }}
        >
          {/* Table Label */}
          <div className="text-center pointer-events-none select-none">
            <div
              className="font-bold text-white drop-shadow-md"
              style={{
                fontSize: `${Math.max(12, size / 8)}px`,
              }}
            >
              {table.label}
            </div>
            <div
              className="text-white/90 mt-1 flex items-center justify-center gap-1"
              style={{
                fontSize: `${Math.max(10, size / 12)}px`,
              }}
            >
              <Users className="w-3 h-3" />
              {occupiedSeats}/{table.capacity}
            </div>
          </div>

          {/* Seats Indicators (small circles around) */}
          {table.capacity > 0 && size > 100 && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: table.capacity }).map((_, i) => {
                const angle = (i / table.capacity) * 2 * Math.PI - Math.PI / 2;
                const seatRadius = size / 2 - 8;
                const x = Math.cos(angle) * seatRadius;
                const y = Math.sin(angle) * seatRadius;
                const isOccupied = i < occupiedSeats;

                return (
                  <div
                    key={i}
                    className={`absolute w-3 h-3 rounded-full border-2 border-white ${
                      isOccupied ? 'bg-green-500' : 'bg-white/50'
                    }`}
                    style={{
                      left: `calc(50% + ${x}px - 6px)`,
                      top: `calc(50% + ${y}px - 6px)`,
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Selection Overlay */}
        {(isSelected || isHovered) && (
          <div
            className={`absolute inset-0 border-2 border-dashed ${
              isSelected ? 'border-purple-400' : 'border-gray-400'
            } pointer-events-none ${isRound ? 'rounded-full' : 'rounded-2xl'}`}
          >
            {/* Corner Handles Visual */}
            {!isRound && (
              <>
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-purple-500 rounded-full" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-500 rounded-full" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-500 rounded-full" />
              </>
            )}
          </div>
        )}

        {/* Controls (on hover/select) */}
        {(isSelected || isHovered) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-900 text-white px-2 py-1 rounded-lg text-xs pointer-events-auto whitespace-nowrap"
          >
            <button
              onClick={toggleLock}
              className="hover:text-purple-300 transition-colors p-1"
              title={isLocked ? 'Desbloquear' : 'Bloquear'}
            >
              {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="hover:text-blue-300 transition-colors p-1"
              title="Editar"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Deletar mesa "${table.label}"?`)) {
                  onDelete();
                }
              }}
              className="hover:text-red-300 transition-colors p-1"
              title="Deletar"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-gray-400 ml-1 border-l border-gray-700 pl-1">
              {Math.round(size)}px
            </span>
          </motion.div>
        )}


        {/* Lock indicator */}
        {isLocked && (
          <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1">
            <Lock className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.div>
    </Rnd>
  );
}
