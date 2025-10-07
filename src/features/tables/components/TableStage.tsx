'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, Maximize2 } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import type { Table , ElementType } from '@/schemas';
import { DecorativeElement } from './DecorativeElement';
import { TableStageItem } from './TableStageItem';

interface DecorativeElementData {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

interface TableStageProps {
  tables: Table[];
  width?: number;
  height?: number;
  showGrid?: boolean;
  snapToGrid?: boolean;
  onUpdateTable: (id: string, updates: Partial<Table>) => Promise<void>;
  onEditTable: (table: Table) => void;
  onDeleteTable: (id: string) => void;
  selectedTableId?: string | null;
  onSelectTable: (id: string | null) => void;
  decorativeElements?: DecorativeElementData[];
  onAddElement?: (element: DecorativeElementData) => void;
  onUpdateElement?: (id: string, updates: Partial<DecorativeElementData>) => void;
  onDeleteElement?: (id: string) => void;
  selectedElementId?: string | null;
  onSelectElement?: (id: string | null) => void;
}

export function TableStage({
  tables,
  width = 2000,
  height = 1500,
  showGrid = true,
  snapToGrid = true,
  onUpdateTable,
  onEditTable,
  onDeleteTable,
  selectedTableId,
  onSelectTable,
  decorativeElements = [],
  onAddElement,
  onUpdateElement,
  onDeleteElement,
  selectedElementId,
  onSelectElement,
}: TableStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [viewOffset, setViewOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const gridSize = snapToGrid ? 16 : 0;

  const handleStageClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectTable(null);
      onSelectElement?.(null);
    }
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)));
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse or Shift+Left mouse for panning
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setViewOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  return (
    <div className="relative size-full overflow-hidden rounded-lg bg-gray-50">
      {/* Controls */}
      <div className="absolute right-4 top-4 z-10 flex gap-2 rounded-lg bg-white p-2 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
          className="rounded px-3 py-1 text-sm hover:bg-gray-100"
          title="Zoom In (Ctrl+Scroll)"
        >
          +
        </button>
        <span className="min-w-[60px] px-2 py-1 text-center text-sm text-gray-600">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
          className="rounded px-3 py-1 text-sm hover:bg-gray-100"
          title="Zoom Out (Ctrl+Scroll)"
        >
          −
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setViewOffset({ x: 0, y: 0 });
          }}
          className="ml-2 rounded px-3 py-1 text-sm hover:bg-gray-100"
          title="Reset View"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-4 z-10 space-y-1 rounded-lg bg-white px-3 py-2 text-xs text-gray-600 shadow-lg">
        <div>{tables.length} mesa{tables.length !== 1 ? 's' : ''}</div>
        <div>{decorativeElements.length} elemento{decorativeElements.length !== 1 ? 's' : ''}</div>
        {snapToGrid && (
          <div className="flex items-center gap-1">
            <Grid3x3 className="size-3" />
            Grade {gridSize}px
          </div>
        )}
        <div className="text-gray-400">
          Shift+Arraste para mover canvas
        </div>
      </div>

      {/* Stage Container */}
      <div
        ref={stageRef}
        className={`relative size-full overflow-auto ${
          isPanning ? 'cursor-grabbing' : 'cursor-default'
        }`}
        onClick={handleStageClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative origin-top-left transition-transform duration-100"
          style={{
            width,
            height,
            transform: `scale(${zoom}) translate(${viewOffset.x / zoom}px, ${viewOffset.y / zoom}px)`,
          }}
        >
          {/* Grid Background */}
          {showGrid && snapToGrid && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}

          {/* Canvas Border */}
          <div className="pointer-events-none absolute inset-0 border-2 border-dashed border-gray-300" />

          {/* Empty State */}
          {tables.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
            >
              <div className="mb-4 size-32 rounded-full border-4 border-dashed border-gray-300" />
              <p className="text-lg font-medium">Nenhuma mesa ainda</p>
              <p className="text-sm">Clique em "Nova Mesa" para começar</p>
            </motion.div>
          )}

          {/* Decorative Elements */}
          <AnimatePresence>
            {decorativeElements.map((element) => (
              <DecorativeElement
                key={element.id}
                id={element.id}
                type={element.type}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                color={element.color}
                isSelected={selectedElementId === element.id}
                onSelect={() => onSelectElement?.(element.id)}
                onUpdate={(updates) => {
                  if (onUpdateElement) {
                    onUpdateElement(element.id, updates);
                  }
                }}
                onDelete={() => onDeleteElement?.(element.id)}
                gridSize={snapToGrid ? gridSize : 0}
              />
            ))}
          </AnimatePresence>

          {/* Tables */}
          <AnimatePresence>
            {tables.map((table) => (
              <TableStageItem
                key={table.id}
                table={table}
                isSelected={selectedTableId === table.id}
                onSelect={() => onSelectTable(table.id)}
                onUpdate={(updates) => onUpdateTable(table.id, updates)}
                onEdit={() => onEditTable(table)}
                onDelete={() => onDeleteTable(table.id)}
                gridSize={snapToGrid ? gridSize : 0}
                zoom={zoom}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
