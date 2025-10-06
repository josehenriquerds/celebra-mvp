'use client';

import { useBingoStore } from '../state/useBingoStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  RotateCw,
  Image as ImageIcon,
  Type,
  Square,
  Circle,
  Grid3x3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LayerToolbar() {
  const {
    freeLayers,
    selectedLayerId,
    updateFreeLayer,
    deleteFreeLayer,
    duplicateLayer,
    bringToFront,
    sendToBack,
    snapToGrid,
    toggleSnapToGrid,
    addFreeLayer,
  } = useBingoStore();

  const selectedLayer = freeLayers.find((l) => l.id === selectedLayerId);

  const handleAddTextLayer = () => {
    const newLayer = {
      id: `layer-text-${Date.now()}`,
      type: 'text' as const,
      content: 'Texto aqui',
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      rotation: 0,
      zIndex: freeLayers.length,
      locked: false,
      visible: true,
      fontSize: 24,
      color: '#000000',
      fontFamily: 'system-ui',
    };
    addFreeLayer(newLayer);
  };

  const handleAddShapeLayer = (shape: 'rectangle' | 'circle') => {
    const newLayer = {
      id: `layer-shape-${Date.now()}`,
      type: 'shape' as const,
      shape,
      position: { x: 150, y: 150 },
      size: { width: 100, height: 100 },
      rotation: 0,
      zIndex: freeLayers.length,
      locked: false,
      visible: true,
      color: '#9333ea',
      opacity: 1,
    };
    addFreeLayer(newLayer);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-lg">Camadas & Controles</h3>
        <p className="text-xs text-gray-500 mt-1">
          Gerencie elementos do Stage
        </p>
      </div>

      {/* Quick Add */}
      <div className="p-4 border-b border-gray-200 space-y-3">
        <Label className="text-sm font-semibold">Adicionar Elemento</Label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTextLayer}
            className="flex-col h-auto py-3 gap-1"
          >
            <Type className="w-5 h-5" />
            <span className="text-xs">Texto</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddShapeLayer('rectangle')}
            className="flex-col h-auto py-3 gap-1"
          >
            <Square className="w-5 h-5" />
            <span className="text-xs">Retângulo</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddShapeLayer('circle')}
            className="flex-col h-auto py-3 gap-1"
          >
            <Circle className="w-5 h-5" />
            <span className="text-xs">Círculo</span>
          </Button>
        </div>
      </div>

      {/* Snap to Grid */}
      <div className="p-4 border-b border-gray-200">
        <Button
          variant={snapToGrid ? 'default' : 'outline'}
          size="sm"
          onClick={toggleSnapToGrid}
          className="w-full gap-2"
        >
          <Grid3x3 className="w-4 h-4" />
          {snapToGrid ? 'Grade Ativa' : 'Ativar Grade'}
        </Button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 pb-2">
          <Label className="text-sm font-semibold">
            Camadas ({freeLayers.length})
          </Label>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2 pb-4">
            <AnimatePresence>
              {[...freeLayers]
                .sort((a, b) => b.zIndex - a.zIndex)
                .map((layer) => (
                  <motion.div
                    key={layer.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`p-3 border rounded-lg transition-all cursor-pointer ${
                      selectedLayerId === layer.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => useBingoStore.getState().setSelectedLayer(layer.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {layer.type === 'image' && <ImageIcon className="w-4 h-4 text-gray-500" />}
                      {layer.type === 'text' && <Type className="w-4 h-4 text-gray-500" />}
                      {layer.type === 'shape' && <Square className="w-4 h-4 text-gray-500" />}
                      <span className="text-sm font-medium flex-1 truncate">
                        {layer.type === 'text' ? layer.content : layer.type}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateFreeLayer(layer.id, { visible: !layer.visible });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateFreeLayer(layer.id, { locked: !layer.locked });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {layer.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          bringToFront(layer.id);
                        }}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendToBack(layer.id);
                        }}
                      >
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateLayer(layer.id);
                        }}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFreeLayer(layer.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>

            {freeLayers.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhuma camada ainda
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Selected Layer Properties */}
      {selectedLayer && (
        <div className="p-4 border-t border-gray-200 space-y-3 bg-gray-50">
          <Label className="text-sm font-semibold">Propriedades</Label>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={selectedLayer.position.x}
                onChange={(e) =>
                  updateFreeLayer(selectedLayer.id, {
                    position: { ...selectedLayer.position, x: parseInt(e.target.value) || 0 },
                  })
                }
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={selectedLayer.position.y}
                onChange={(e) =>
                  updateFreeLayer(selectedLayer.id, {
                    position: { ...selectedLayer.position, y: parseInt(e.target.value) || 0 },
                  })
                }
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Largura</Label>
              <Input
                type="number"
                value={selectedLayer.size.width}
                onChange={(e) =>
                  updateFreeLayer(selectedLayer.id, {
                    size: { ...selectedLayer.size, width: parseInt(e.target.value) || 0 },
                  })
                }
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Altura</Label>
              <Input
                type="number"
                value={selectedLayer.size.height}
                onChange={(e) =>
                  updateFreeLayer(selectedLayer.id, {
                    size: { ...selectedLayer.size, height: parseInt(e.target.value) || 0 },
                  })
                }
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs flex items-center gap-2">
              <RotateCw className="w-3 h-3" />
              Rotação: {selectedLayer.rotation}°
            </Label>
            <Input
              type="range"
              min="0"
              max="360"
              value={selectedLayer.rotation}
              onChange={(e) =>
                updateFreeLayer(selectedLayer.id, {
                  rotation: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          {selectedLayer.type === 'text' && (
            <>
              <div>
                <Label className="text-xs">Texto</Label>
                <Input
                  value={selectedLayer.content || ''}
                  onChange={(e) =>
                    updateFreeLayer(selectedLayer.id, {
                      content: e.target.value,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Tamanho da Fonte</Label>
                <Input
                  type="number"
                  value={selectedLayer.fontSize || 16}
                  onChange={(e) =>
                    updateFreeLayer(selectedLayer.id, {
                      fontSize: parseInt(e.target.value) || 16,
                    })
                  }
                  className="h-8 text-xs"
                />
              </div>
            </>
          )}

          {(selectedLayer.type === 'shape' || selectedLayer.type === 'text') && (
            <div>
              <Label className="text-xs">Cor</Label>
              <Input
                type="color"
                value={selectedLayer.color || '#000000'}
                onChange={(e) =>
                  updateFreeLayer(selectedLayer.id, {
                    color: e.target.value,
                  })
                }
                className="h-8"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
