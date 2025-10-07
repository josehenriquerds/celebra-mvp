# 🚀 Quick Start - Table Planner 2.0

Guia rápido para começar a usar as novas funcionalidades do Table Planner.

## 📦 Instalação

Nada precisa ser instalado! Todas as dependências já estão no projeto.

## 🎯 Uso Básico em 5 Minutos

### 1. Criar Store por Evento (Recomendado)

```typescript
'use client'

import { createPlannerStore } from '@/features/tables/stores/usePlannerStore'

export default function TablePlannerPage({ params }: { params: { id: string } }) {
  // Criar store específico para este evento
  const usePlannerStore = createPlannerStore(params.id)

  // Usar normalmente
  const { zoom, setZoom, decorativeElements } = usePlannerStore()

  return (
    <div>
      Zoom: {zoom * 100}%
      Elementos: {decorativeElements.length}
    </div>
  )
}
```

### 2. Habilitar Sincronização Cross-Tab

```typescript
import { usePlannerSync } from '@/features/tables/hooks'

function MyComponent({ eventId }) {
  const broadcast = usePlannerSync(eventId)
  const { updateElement } = usePlannerStore()

  const handleUpdate = (id, updates) => {
    updateElement(id, updates)        // Atualiza localmente
    broadcast.updateElement(id, updates) // Sincroniza com outras abas
  }
}
```

### 3. Usar Cache Híbrido

```typescript
import { useTablePlannerWithCache } from '@/features/tables/hooks'

function MyComponent({ eventId }) {
  // Carrega do localStorage primeiro, depois revalida com backend
  const { data, isLoading } = useTablePlannerWithCache(eventId)

  if (isLoading) return <div>Carregando...</div>

  return <div>{data.tables.length} mesas</div>
}
```

### 4. Adicionar Overlays no Classic Mode

```typescript
import { TablesCanvas } from '@/features/tables/components/TablesCanvas'

function ClassicMode({ tables }) {
  const [overlays, setOverlays] = useState({
    numbers: true,
    occupancy: false,
    heatmap: false,
  })

  return (
    <TablesCanvas
      tables={tables}
      zoom={1}
      canvasWidth={2000}
      canvasHeight={1500}
      showOverlays={overlays}
      onEditTable={handleEdit}
      onDeleteTable={handleDelete}
    />
  )
}
```

### 5. Exportar Layout

```typescript
import { useExportLayout } from '@/features/tables/hooks'
import { ExportCanvas } from '@/features/tables/components/ExportCanvas'

function ExportButton({ tables, elements }) {
  const { exportRef, exportLayout } = useExportLayout()

  const handleExport = async () => {
    await exportLayout(tables, elements, {
      format: 'png',
      pixelRatio: 2,
    })
  }

  return (
    <>
      <button onClick={handleExport}>Export PNG</button>

      {/* Componente escondido para export */}
      <div style={{ position: 'absolute', left: -9999 }}>
        <ExportCanvas
          ref={exportRef}
          tables={tables}
          elements={elements}
          width={2000}
          height={1500}
        />
      </div>
    </>
  )
}
```

### 6. Keyboard Shortcuts

```typescript
import { useKeyboardShortcuts } from '@/features/tables/hooks'

function MyComponent() {
  const { selectedTableId, setSelectedTableId, snapToGrid, setSnapToGrid } = usePlannerStore()

  useKeyboardShortcuts({
    onDelete: () => deleteTable(selectedTableId),
    onDuplicate: () => duplicateTable(selectedTableId),
    onToggleGrid: () => setSnapToGrid(!snapToGrid),
    onSave: () => saveLayout(),
    onEscape: () => setSelectedTableId(null),
    selectedItemId: selectedTableId,
    snapToGrid,
  })

  // Atalhos funcionam automaticamente!
}
```

## 🎨 Exemplo Completo Mínimo

```typescript
'use client'

import { useState } from 'react'
import { createPlannerStore } from '@/features/tables/stores/usePlannerStore'
import {
  useTablePlannerWithCache,
  usePlannerSync,
  useKeyboardShortcuts,
} from '@/features/tables/hooks'
import { TableStage } from '@/features/tables/components/TableStage'
import { TablesCanvas } from '@/features/tables/components/TablesCanvas'

export default function PlannerPage({ params }: { params: { id: string } }) {
  const eventId = params.id

  // Store
  const usePlannerStore = createPlannerStore(eventId)
  const {
    zoom,
    decorativeElements,
    snapToGrid,
    selectedTableId,
    setSelectedTableId,
    setSnapToGrid,
    addElement,
    updateElement,
  } = usePlannerStore()

  // Data
  const { data } = useTablePlannerWithCache(eventId)

  // Sincronização
  const broadcast = usePlannerSync(eventId)

  // Mode
  const [mode, setMode] = useState<'stage' | 'classic'>('stage')

  // Handlers
  const handleUpdateElement = (id: string, updates: any) => {
    updateElement(id, updates)
    broadcast.updateElement(id, updates)
  }

  // Shortcuts
  useKeyboardShortcuts({
    onToggleGrid: () => setSnapToGrid(!snapToGrid),
    onEscape: () => setSelectedTableId(null),
    selectedItemId: selectedTableId,
    snapToGrid,
  })

  if (!data) return <div>Carregando...</div>

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="border-b p-4">
        <button onClick={() => setMode('stage')}>Stage</button>
        <button onClick={() => setMode('classic')}>Classic</button>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        {mode === 'stage' ? (
          <TableStage
            tables={data.tables}
            decorativeElements={decorativeElements}
            snapToGrid={snapToGrid}
            onUpdateElement={handleUpdateElement}
            selectedTableId={selectedTableId}
            onSelectTable={setSelectedTableId}
          />
        ) : (
          <TablesCanvas
            tables={data.tables}
            zoom={zoom}
            canvasWidth={2000}
            canvasHeight={1500}
            showOverlays={{ numbers: true, occupancy: false, heatmap: false }}
          />
        )}
      </div>
    </div>
  )
}
```

## 🔑 Principais Recursos

### Pan/Zoom no Classic Mode
- **Shift + Arraste** = Pan
- **Ctrl + Scroll** = Zoom
- Botões visuais de controle

### Keyboard Shortcuts
- `Delete` = Deletar
- `Ctrl+D` = Duplicar
- `Ctrl+G` = Toggle Grade
- `Ctrl+Z` = Desfazer
- `Ctrl+S` = Salvar
- `Esc` = Desselecionar

### Overlays
- **Numbers** = Numeração das mesas
- **Occupancy** = Lotação (x/y)
- **Heatmap** = Calor de ocupação (cores)

### Sincronização
- Cross-tab automática via BroadcastChannel
- Persistência híbrida (localStorage + backend)
- Store por evento para isolamento

## 📚 Próximos Passos

1. **Explorar a documentação completa**: [README.md](src/features/tables/README.md)
2. **Ver exemplo de integração**: [INTEGRATION_EXAMPLE.md](src/features/tables/INTEGRATION_EXAMPLE.md)
3. **Revisar o changelog**: [CHANGELOG_TABLE_PLANNER.md](CHANGELOG_TABLE_PLANNER.md)
4. **Implementar endpoints backend** (veja API necessária abaixo)

## 🔌 API Backend Necessária

### 1. Modificar GET existente
```typescript
GET /api/events/[id]/tables
// Adicionar campo "elements": DecorElement[]
```

### 2. Criar novo endpoint
```typescript
PUT /api/events/[id]/layout
// Body: { version: 2, tables: [], elements: [] }
```

### 3. Atualizar lógica
```typescript
PUT /api/tables/[id]
// Ao mudar radius, recalcular seats[].x e seats[].y
```

## 💡 Dicas Rápidas

1. **Performance**: Componentes já otimizados com React.memo
2. **Persistência**: localStorage usa debounce de 500ms
3. **Sincronização**: Funciona automaticamente entre abas
4. **Export**: Sem distorção, coordenadas 1:1
5. **Shortcuts**: Funcionam automaticamente após hook

## 🐛 Troubleshooting

### Sincronização não funciona?
- Verifique se o eventId é o mesmo em todas as abas
- BroadcastChannel tem fallback gracioso

### Export com distorção?
- Use o componente ExportCanvas dedicado
- Não use CSS scale() no canvas

### Hit detection errado?
- Certifique-se de usar zoom lógico (não CSS scale)
- TablesCanvas já implementa corretamente

## 📞 Suporte

Consulte:
- [README.md](src/features/tables/README.md) - Documentação completa
- [INTEGRATION_EXAMPLE.md](src/features/tables/INTEGRATION_EXAMPLE.md) - Exemplo completo
- [CHANGELOG_TABLE_PLANNER.md](CHANGELOG_TABLE_PLANNER.md) - Mudanças

---

**Versão**: 2.0.0
**Status**: ✅ Pronto para uso (pendente endpoints backend)
**Última atualização**: 2025-10-06
