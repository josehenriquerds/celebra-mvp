# Exemplo de Integração Completa

Este arquivo mostra como integrar todas as melhorias implementadas em uma página de planejamento de mesas.

## Exemplo Completo de Uso

```typescript
'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

// Hooks
import { useTablePlannerWithCache, useSaveLayout } from './hooks/useTablePlannerWithCache'
import { usePlannerSync } from './hooks/usePlannerSync'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useExportLayout } from './hooks/useExportLayout'
import { createPlannerStore } from './stores/usePlannerStore'

// Components
import { TableStage } from './components/TableStage'
import { TablesCanvas } from './components/TablesCanvas'
import { ExportCanvas } from './components/ExportCanvas'

// Types
import type { Table, DecorElement } from '@/schemas'

export default function TablePlannerPage() {
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  // Store específico para este evento
  const usePlannerStore = createPlannerStore(eventId)

  // State do store
  const {
    zoom,
    pan,
    decorativeElements,
    snapToGrid,
    selectedTableId,
    selectedElementId,
    setZoom,
    setPan,
    addElement,
    updateElement,
    deleteElement,
    setSnapToGrid,
    setSelectedTableId,
    setSelectedElementId,
    undo,
    redo,
    canUndo,
    canRedo,
  } = usePlannerStore()

  // Data fetching com cache híbrido
  const { data, isLoading, error } = useTablePlannerWithCache(eventId)
  const { mutate: saveLayout, isPending: isSaving } = useSaveLayout()

  // Sincronização cross-tab
  const broadcast = usePlannerSync(eventId)

  // Export
  const { exportRef, exportLayout } = useExportLayout()

  // State local
  const [mode, setMode] = useState<'stage' | 'classic'>('stage')
  const [showOverlays, setShowOverlays] = useState({
    numbers: true,
    occupancy: false,
    heatmap: false,
  })

  // Handlers
  const handleUpdateTable = useCallback(
    async (id: string, updates: Partial<Table>) => {
      // Atualizar via mutation do TanStack Query
      // (já implementado em useTables.ts)

      // Broadcast para outras abas se pan/zoom mudou
      if (updates.x !== undefined || updates.y !== undefined) {
        broadcast.updatePan({ x: updates.x!, y: updates.y! })
      }
    },
    [broadcast]
  )

  const handleAddElement = useCallback(
    (element: DecorElement) => {
      addElement(element)
      broadcast.addElement(element)
    },
    [addElement, broadcast]
  )

  const handleUpdateElement = useCallback(
    (id: string, updates: Partial<DecorElement>) => {
      updateElement(id, updates)
      broadcast.updateElement(id, updates)
    },
    [updateElement, broadcast]
  )

  const handleDeleteElement = useCallback(
    (id: string) => {
      deleteElement(id)
      broadcast.deleteElement(id)
    },
    [deleteElement, broadcast]
  )

  const handleSave = useCallback(() => {
    if (!data) return

    saveLayout(
      {
        tables: data.tables,
        elements: decorativeElements,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Layout salvo',
            description: 'As alterações foram salvas com sucesso',
          })
        },
        onError: (error) => {
          toast({
            title: 'Erro ao salvar',
            description: 'Não foi possível salvar o layout. Tente novamente.',
            variant: 'destructive',
          })
        },
      }
    )
  }, [data, decorativeElements, saveLayout, toast])

  const handleDuplicate = useCallback(() => {
    if (!selectedTableId || !data) return

    const table = data.tables.find((t) => t.id === selectedTableId)
    if (!table) return

    // Criar cópia da mesa com offset
    const newTable = {
      ...table,
      id: `table-${Date.now()}`,
      x: table.x + 50,
      y: table.y + 50,
      label: `${table.label} (cópia)`,
    }

    // Criar via mutation
    // createTable(newTable)
  }, [selectedTableId, data])

  const handleDelete = useCallback(() => {
    if (selectedTableId) {
      // deleteTable(selectedTableId)
      setSelectedTableId(null)
    } else if (selectedElementId) {
      handleDeleteElement(selectedElementId)
      setSelectedElementId(null)
    }
  }, [selectedTableId, selectedElementId, handleDeleteElement, setSelectedTableId, setSelectedElementId])

  const handleExportPNG = useCallback(async () => {
    if (!data) return

    const result = await exportLayout(data.tables, decorativeElements, {
      format: 'png',
      pixelRatio: 2,
    })

    if (result.success) {
      toast({
        title: 'Export realizado',
        description: 'Layout exportado como PNG',
      })
    } else {
      toast({
        title: 'Erro no export',
        description: 'Não foi possível exportar o layout',
        variant: 'destructive',
      })
    }
  }, [data, decorativeElements, exportLayout, toast])

  const handleExportSVG = useCallback(async () => {
    if (!data) return

    const result = await exportLayout(data.tables, decorativeElements, {
      format: 'svg',
    })

    if (result.success) {
      toast({
        title: 'Export realizado',
        description: 'Layout exportado como SVG',
      })
    }
  }, [data, decorativeElements, exportLayout, toast])

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onToggleGrid: () => setSnapToGrid(!snapToGrid),
    onUndo: () => {
      const previousData = undo()
      if (previousData) {
        // Apply previous data
      }
    },
    onRedo: () => {
      const nextData = redo()
      if (nextData) {
        // Apply next data
      }
    },
    onSave: handleSave,
    onEscape: () => {
      setSelectedTableId(null)
      setSelectedElementId(null)
    },
    selectedItemId: selectedTableId || selectedElementId,
    snapToGrid,
  })

  if (isLoading) {
    return <div>Carregando...</div>
  }

  if (error || !data) {
    return <div>Erro ao carregar dados</div>
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Planejamento de Mesas</h1>

          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'stage' ? 'default' : 'outline'}
              onClick={() => setMode('stage')}
            >
              Stage Mode
            </Button>
            <Button
              variant={mode === 'classic' ? 'default' : 'outline'}
              onClick={() => setMode('classic')}
            >
              Classic Mode
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Overlays (Classic Mode only) */}
          {mode === 'classic' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={showOverlays.numbers}
                  onCheckedChange={(checked) =>
                    setShowOverlays((prev) => ({ ...prev, numbers: checked }))
                  }
                />
                <Label>Números</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showOverlays.occupancy}
                  onCheckedChange={(checked) =>
                    setShowOverlays((prev) => ({ ...prev, occupancy: checked }))
                  }
                />
                <Label>Lotação</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={showOverlays.heatmap}
                  onCheckedChange={(checked) =>
                    setShowOverlays((prev) => ({ ...prev, heatmap: checked }))
                  }
                />
                <Label>Heatmap</Label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setSnapToGrid(!snapToGrid)}
              title="Ctrl+G"
            >
              Grade {snapToGrid ? 'ON' : 'OFF'}
            </Button>

            <Button
              variant="outline"
              onClick={undo}
              disabled={!canUndo()}
              title="Ctrl+Z"
            >
              Desfazer
            </Button>

            <Button
              variant="outline"
              onClick={redo}
              disabled={!canRedo()}
              title="Ctrl+Shift+Z"
            >
              Refazer
            </Button>

            <Button variant="outline" onClick={handleExportPNG}>
              Export PNG
            </Button>

            <Button variant="outline" onClick={handleExportSVG}>
              Export SVG
            </Button>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4">
        {mode === 'stage' ? (
          <TableStage
            tables={data.tables}
            decorativeElements={decorativeElements}
            snapToGrid={snapToGrid}
            onUpdateTable={handleUpdateTable}
            onAddElement={handleAddElement}
            onUpdateElement={handleUpdateElement}
            onDeleteElement={handleDeleteElement}
            selectedTableId={selectedTableId}
            onSelectTable={setSelectedTableId}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
        ) : (
          <TablesCanvas
            tables={data.tables}
            zoom={zoom}
            canvasWidth={2000}
            canvasHeight={1500}
            onEditTable={(table) => {
              // Open edit modal
            }}
            onDeleteTable={(id) => {
              // Delete table
            }}
            showOverlays={showOverlays}
          />
        )}
      </div>

      {/* Export Canvas (hidden) */}
      <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
        <ExportCanvas
          ref={exportRef}
          tables={data.tables}
          elements={decorativeElements}
          width={2000}
          height={1500}
          showNumbers={true}
          showOccupancy={true}
        />
      </div>

      {/* Status Bar */}
      <div className="border-t p-2 text-sm text-gray-600 flex items-center justify-between">
        <div>
          {data.tables.length} mesas · {decorativeElements.length} elementos · Zoom: {Math.round(zoom * 100)}%
        </div>
        <div className="flex items-center gap-4">
          <span>Ctrl+Z: Desfazer</span>
          <span>Ctrl+S: Salvar</span>
          <span>Ctrl+G: Grade</span>
          <span>Delete: Remover</span>
        </div>
      </div>
    </div>
  )
}
```

## Notas de Implementação

1. **Store por Evento**: Use `createPlannerStore(eventId)` para criar um store específico
2. **Sincronização**: `usePlannerSync` cuida automaticamente da sincronização
3. **Cache**: `useTablePlannerWithCache` carrega do localStorage primeiro
4. **Export**: Componente `ExportCanvas` fica escondido e é usado só para export
5. **Shortcuts**: `useKeyboardShortcuts` registra automaticamente os atalhos

## Endpoints Backend Necessários

```typescript
// 1. GET /api/events/[id]/tables
// Response:
{
  "tables": Table[],
  "unassigned": UnassignedGuest[],
  "elements": DecorElement[] // NOVO
}

// 2. PUT /api/events/[id]/layout (NOVO)
// Body:
{
  "version": 2,
  "updatedAt": "2025-10-06T12:00:00Z",
  "tables": Table[],
  "elements": DecorElement[]
}
// Response:
{
  "ok": true,
  "version": 2,
  "updatedAt": "2025-10-06T12:00:00Z"
}

// 3. PUT /api/tables/[id] (MODIFICAR)
// Ao atualizar radius, recalcular seats[].x e seats[].y automaticamente
```

## Performance Tips

1. **Debounce localStorage writes**: Já implementado no batcher
2. **Memoize calculations**: TableItem e TableStageItem já usam useMemo
3. **Batch updates**: Use LocalStorageBatcher para múltiplos writes
4. **Virtualização**: Para >100 elementos, considere react-window

## Fluxo de Sincronização

```
Usuário move mesa
    ↓
Atualiza store local (Zustand)
    ↓
    ├─→ Persiste no localStorage (debounced)
    ├─→ Broadcast via BroadcastChannel
    └─→ Mutation para backend (otimista)
        ↓
    Revalida cache do TanStack Query
```

## Testes de Integração

Execute estes testes manualmente:

- [ ] Mover mesa no Stage Mode → trocar para Classic → mesa está na nova posição
- [ ] Adicionar elemento decorativo → trocar de modo → elemento aparece
- [ ] Abrir duas abas → mover mesa em uma → ver movimento na outra
- [ ] Fechar aba e reabrir → estado mantido (localStorage)
- [ ] Redimensionar mesa → assentos recalculados corretamente
- [ ] Export PNG/SVG → sem distorção, coordenadas corretas
- [ ] Ctrl+Z, Ctrl+S, Delete funcionando
- [ ] Pan/Zoom no Classic Mode sem quebrar hit detection
