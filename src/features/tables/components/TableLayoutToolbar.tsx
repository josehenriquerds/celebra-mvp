'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Circle,
  Square,
  Grid3x3,
  Palette,
  Maximize2,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Table } from '@/schemas';

interface TableLayoutToolbarProps {
  tables: Table[];
  selectedTable: Table | null;
  onUpdateTable: (id: string, updates: Partial<Table>) => void;
  snapToGrid: boolean;
  onToggleSnapToGrid: () => void;
}

export function TableLayoutToolbar({
  tables,
  selectedTable,
  onUpdateTable,
  snapToGrid,
  onToggleSnapToGrid,
}: TableLayoutToolbarProps) {
  const totalSeats = tables.reduce((sum, t) => sum + t.capacity, 0);
  const occupiedSeats = tables.reduce(
    (sum, t) => sum + (t.seats?.filter((s) => s.assignment).length || 0),
    0
  );

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-lg">Controles do Layout</h3>
        <p className="text-xs text-gray-500 mt-1">
          Gerencie as mesas visualmente
        </p>
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-500">Total de Mesas</div>
            <div className="text-2xl font-bold text-gray-900">{tables.length}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Assentos
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {occupiedSeats}/{totalSeats}
            </div>
          </div>
        </div>
      </div>

      {/* Snap to Grid */}
      <div className="p-4 border-b border-gray-200">
        <Button
          variant={snapToGrid ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleSnapToGrid}
          className="w-full gap-2"
        >
          <Grid3x3 className="w-4 h-4" />
          {snapToGrid ? 'Grade Ativa' : 'Ativar Grade'}
        </Button>
        {snapToGrid && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Elementos alinhados em grade de 16px
          </p>
        )}
      </div>

      {/* Selected Table Properties */}
      {selectedTable ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 pb-2 bg-purple-50 border-b border-purple-100">
            <Label className="text-sm font-semibold text-purple-900">
              Mesa Selecionada
            </Label>
            <p className="text-xs text-purple-600 mt-1">{selectedTable.label}</p>
          </div>

          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4">
              {/* Position */}
              <div>
                <Label className="text-xs font-semibold mb-2 block">Posição</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-600">X</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedTable.x)}
                      onChange={(e) =>
                        onUpdateTable(selectedTable.id, {
                          x: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Y</Label>
                    <Input
                      type="number"
                      value={Math.round(selectedTable.y)}
                      onChange={(e) =>
                        onUpdateTable(selectedTable.id, {
                          y: parseInt(e.target.value) || 0,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Size */}
              <div>
                <Label className="text-xs font-semibold mb-2 flex items-center gap-2">
                  <Maximize2 className="w-3 h-3" />
                  Tamanho (Raio)
                </Label>
                <Input
                  type="number"
                  value={Math.round(selectedTable.radius)}
                  onChange={(e) =>
                    onUpdateTable(selectedTable.id, {
                      radius: parseInt(e.target.value) || 40,
                    })
                  }
                  min={40}
                  max={200}
                  className="h-8 text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Diâmetro: {Math.round(selectedTable.radius * 2)}px
                </p>
              </div>

              <Separator />

              {/* Shape */}
              <div>
                <Label className="text-xs font-semibold mb-2 block">Formato</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      onUpdateTable(selectedTable.id, { shape: 'round' })
                    }
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      selectedTable.shape === 'round'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Circle className="w-6 h-6" />
                    <span className="text-xs font-medium">Redonda</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateTable(selectedTable.id, { shape: 'square' })
                    }
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all ${
                      selectedTable.shape === 'square'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Square className="w-6 h-6" />
                    <span className="text-xs font-medium">Quadrada</span>
                  </button>
                </div>
              </div>

              <Separator />

              {/* Color */}
              <div>
                <Label className="text-xs font-semibold mb-2 flex items-center gap-2">
                  <Palette className="w-3 h-3" />
                  Cor
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedTable.color || '#C7B7F3'}
                    onChange={(e) =>
                      onUpdateTable(selectedTable.id, {
                        color: e.target.value,
                      })
                    }
                    className="h-10 w-20"
                  />
                  <Input
                    type="text"
                    value={selectedTable.color || '#C7B7F3'}
                    onChange={(e) =>
                      onUpdateTable(selectedTable.id, {
                        color: e.target.value,
                      })
                    }
                    className="h-10 flex-1 text-xs font-mono"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>

              <Separator />

              {/* Capacity */}
              <div>
                <Label className="text-xs font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  Capacidade
                </Label>
                <Input
                  type="number"
                  value={selectedTable.capacity}
                  onChange={(e) =>
                    onUpdateTable(selectedTable.id, {
                      capacity: parseInt(e.target.value) || 2,
                    })
                  }
                  min={2}
                  max={20}
                  className="h-8 text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {selectedTable.seats?.filter((s) => s.assignment).length || 0} /
                  {selectedTable.capacity} ocupados
                </p>
              </div>
            </div>
          </ScrollArea>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-dashed border-gray-300" />
            <p className="text-sm font-medium">Nenhuma mesa selecionada</p>
            <p className="text-xs mt-1">Clique em uma mesa para editá-la</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Label className="text-xs font-semibold mb-2 block">Atalhos</Label>
        <div className="space-y-1 text-xs text-gray-600">
          <div>• Arraste para mover</div>
          <div>• Cantos para redimensionar</div>
          <div>• Handle inferior para rotacionar</div>
          <div>• Shift+Arraste canvas para mover vista</div>
          <div>• Ctrl+Scroll para zoom</div>
        </div>
      </div>
    </div>
  );
}
