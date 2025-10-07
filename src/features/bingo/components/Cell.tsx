'use client';

import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CardCell } from '../types';

interface CellProps {
  cell: CardCell;
  onMark?: () => void;
  onUpdate?: (updates: Partial<CardCell>) => void;
  isEditable?: boolean;
  palette?: string;
  colorClass?: string; // NOVO: cor customizada
}

const paletteColors = {
  lavender: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
  rose: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
  mint: 'bg-green-50 border-green-200 hover:bg-green-100',
  peach: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
  sky: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
  coral: 'bg-red-50 border-red-200 hover:bg-red-100',
};

export function Cell({ cell, onMark, onUpdate, isEditable, palette = 'lavender', colorClass: customColorClass }: CellProps) {
  const dropId = `cell-${cell.row}-${cell.col}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId });

  const isFree = cell.value === undefined && !cell.imageUrl && !cell.text;
  const colorClass = customColorClass || paletteColors[palette as keyof typeof paletteColors] || paletteColors.lavender;

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: cell.row * 0.05 + cell.col * 0.05 }}
      onClick={isEditable ? undefined : onMark}
      className={cn(
        'relative aspect-square flex items-center justify-center border-2 rounded-lg transition-all',
        colorClass,
        cell.marked && 'ring-4 ring-purple-400 bg-purple-200',
        isOver && 'ring-2 ring-blue-400',
        !isEditable && 'cursor-pointer active:scale-95',
        isEditable && 'cursor-default'
      )}
    >
      {/* Número */}
      {cell.value !== undefined && (
        <span className={cn(
          'text-2xl md:text-3xl font-bold',
          cell.marked ? 'text-purple-700' : 'text-gray-700'
        )}>
          {cell.value}
        </span>
      )}

      {/* Imagem */}
      {cell.imageUrl && (
        <img
          src={cell.imageUrl}
          alt={`Cell ${cell.row},${cell.col}`}
          className="size-full rounded-md object-cover"
        />
      )}

      {/* Texto */}
      {cell.text && (
        <span className="px-1 text-center text-sm font-medium md:text-base">
          {cell.text}
        </span>
      )}

      {/* Casa Livre */}
      {isFree && (
        <span className="text-lg font-semibold text-gray-400">LIVRE</span>
      )}

      {/* Marcação visual */}
      {cell.marked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="size-16 rounded-full border-4 border-purple-500 bg-purple-500/20" />
        </motion.div>
      )}
    </motion.div>
  );
}
