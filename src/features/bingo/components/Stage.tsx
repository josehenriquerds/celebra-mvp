'use client';

import { useState, useRef } from 'react';
import { useBingoStore } from '../state/useBingoStore';
import { LayerItem } from './LayerItem';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Grid3x3 } from 'lucide-react';
import type { LayerType } from '../types';

interface StageProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
}

export function Stage({ width = 800, height = 800, showGrid = true }: StageProps) {
  const {
    freeLayers,
    selectedLayerId,
    setSelectedLayer,
    updateFreeLayer,
    snapToGrid,
  } = useBingoStore();

  const stageRef = useRef<HTMLDivElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    try {
      const asset = JSON.parse(data) as { type?: string; url?: string };
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left - 50; // Center on cursor
      const y = e.clientY - rect.top - 50;

      const newLayer = {
        id: `layer-${Date.now()}`,
        type: (asset.type || 'image') as LayerType,
        url: asset.url || '',
        position: { x, y },
        size: { width: 100, height: 100 },
        rotation: 0,
        zIndex: freeLayers.length,
        locked: false,
        visible: true,
      };

      useBingoStore.getState().addFreeLayer(newLayer);
    } catch (error) {
      console.error('Failed to parse drop data:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleStageClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelectedLayer(null);
    }
  };

  const gridSize = snapToGrid ? 20 : 0;

  return (
    <div className="relative">
      {/* Stage Container */}
      <div
        ref={stageRef}
        className={`relative bg-white rounded-lg shadow-lg overflow-hidden transition-all ${
          isDraggingOver ? 'ring-4 ring-purple-400 ring-opacity-50' : ''
        }`}
        style={{ width, height }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleStageClick}
      >
        {/* Grid Background */}
        {showGrid && snapToGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(156, 163, 175, 0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(156, 163, 175, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
          />
        )}

        {/* Empty State */}
        {freeLayers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
          >
            <Layers className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Arraste elementos para o Stage</p>
            <p className="text-sm">Imagens, textos e formas</p>
          </motion.div>
        )}

        {/* Layers */}
        <AnimatePresence>
          {freeLayers
            .filter((layer) => layer.visible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((layer) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerId === layer.id}
                onSelect={() => setSelectedLayer(layer.id)}
                onUpdate={(updates) => updateFreeLayer(layer.id, updates)}
                gridSize={snapToGrid ? gridSize : 0}
              />
            ))}
        </AnimatePresence>

        {/* Drop Overlay */}
        {isDraggingOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-purple-500 bg-opacity-10 pointer-events-none flex items-center justify-center"
          >
            <div className="text-purple-600 font-bold text-xl">
              Solte aqui para adicionar
            </div>
          </motion.div>
        )}
      </div>

      {/* Stage Info */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{freeLayers.length} camadas</span>
        {snapToGrid && (
          <span className="flex items-center gap-1">
            <Grid3x3 className="w-3 h-3" />
            Grade ativa ({gridSize}px)
          </span>
        )}
      </div>
    </div>
  );
}
