'use client';

import { motion } from 'framer-motion';
import { Cell } from './Cell';
import type { CardMatrix, CellTheme } from '../types';
import { useBingoStore } from '../state/useBingoStore';
import { getCellColorClass } from '../logic/cellColors';

interface CardGridProps {
  card: CardMatrix;
  gridSize: number;
  labels?: string[];
  isEditable?: boolean;
  palette?: string;
  cellTheme?: CellTheme;
}

export function CardGrid({ card, gridSize, labels, isEditable, palette, cellTheme }: CardGridProps) {
  const updateCell = useBingoStore((s) => s.updateCell);

  const defaultTheme: CellTheme = {
    pattern: 'none',
    colorA: 'bg-purple-50',
    colorB: 'bg-pink-50',
  };

  const theme = cellTheme || defaultTheme;

  const handleCellMark = (row: number, col: number) => {
    const cell = card.cells.find((c) => c.row === row && c.col === col);
    if (cell) {
      updateCell(row, col, { marked: !cell.marked });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Labels superiores (ex: B I N G O) */}
      {labels && (
        <div
          className="grid gap-2 mb-2"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {labels.map((label, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="text-center text-2xl md:text-3xl font-bold text-purple-600"
            >
              {label}
            </motion.div>
          ))}
        </div>
      )}

      {/* Grid de células */}
      <div
        className="grid gap-2 p-4 bg-white/50 rounded-xl shadow-lg backdrop-blur-sm"
        style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
      >
        {card.cells.map((cell) => {
          const colorClass = getCellColorClass(
            cell.row,
            cell.col,
            theme.colorA,
            theme.colorB,
            theme.pattern
          );

          return (
            <Cell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              onMark={() => handleCellMark(cell.row, cell.col)}
              isEditable={isEditable}
              palette={palette}
              colorClass={colorClass}
            />
          );
        })}
      </div>
    </div>
  );
}
