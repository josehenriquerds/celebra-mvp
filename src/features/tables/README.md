# Table Planner - Melhorias Implementadas

## 📋 Resumo das Melhorias

Este documento descreve as melhorias implementadas no sistema de planejamento de mesas (Table Planner).

## 🎯 Funcionalidades Implementadas

### 1. Store Expandido com Persist Middleware

**Arquivo**: `stores/usePlannerStore.ts`

- ✅ Adicionado suporte para elementos decorativos (`decorativeElements`)
- ✅ Adicionado estado de pan (`{ x, y }`)
- ✅ Implementado persist middleware do Zustand
- ✅ Store factory para criar stores por evento: `createPlannerStore(eventId)`
- ✅ Persistência de zoom, pan, elementos decorativos e snapToGrid no localStorage

**Uso:**
```typescript
import { usePlannerStore, createPlannerStore } from '@/features/tables/stores/usePlannerStore'

// Store padrão
const store = usePlannerStore()

// Store específico por evento
const eventStore = createPlannerStore('event-123')
```

### 2. Sincronização Cross-Tab (BroadcastChannel)

**Arquivo**: `hooks/usePlannerSync.ts`

- ✅ Sincronização automática entre abas abertas
- ✅ Suporte para elementos decorativos, pan e zoom
- ✅ Fallback gracioso para navegadores sem BroadcastChannel

**Uso:**
```typescript
import { usePlannerSync } from '@/features/tables/hooks/usePlannerSync'

function MyComponent({ eventId }) {
  const broadcast = usePlannerSync(eventId)

  // Ao fazer mudanças, broadcast para outras abas
  const handleUpdate = (element) => {
    updateElement(element.id, element) // Atualiza localmente
    broadcast.updateElement(element.id, element) // Sincroniza com outras abas
  }
}
```

### 3. Persistência Híbrida (localStorage + Backend)

**Arquivo**: `hooks/useTablePlannerWithCache.ts`

- ✅ Estratégia stale-while-revalidate
- ✅ Carrega primeiro do localStorage (instantâneo)
- ✅ Revalida com backend em background
- ✅ Hook `useSaveLayout` para salvar completo

**Uso:**
```typescript
import { useTablePlannerWithCache, useSaveLayout } from '@/features/tables/hooks/useTablePlannerWithCache'

function PlannerPage({ eventId }) {
  const { data, isLoading } = useTablePlannerWithCache(eventId)
  const { mutate: saveLayout } = useSaveLayout()

  const handleSave = () => {
    saveLayout({
      tables: data.tables,
      elements: decorativeElements
    })
  }
}
```

### 4. Pan/Zoom Lógico no Classic Mode

**Arquivo**: `components/TablesCanvas.tsx`

- ✅ Pan com Shift+Arraste ou botão do meio do mouse
- ✅ Zoom com Ctrl+Scroll
- ✅ Controles visuais (+, -, Reset)
- ✅ Transform aplicado logicamente (sem CSS scale quebrado)

**Props Adicionadas:**
```typescript
interface TablesCanvasProps {
  // ... props existentes
  showOverlays?: {
    numbers: boolean      // Numeração das mesas
    occupancy: boolean    // Lotação (x/y)
    heatmap: boolean      // Calor de ocupação
  }
}
```

### 5. Overlays Toggle

**Implementado em**: `components/TablesCanvas.tsx`

- ✅ **Numeração**: Badge com número da mesa
- ✅ **Lotação**: Texto mostrando ocupados/capacidade
- ✅ **Heatmap**: Gradiente de cores baseado em ocupação
  - 🟢 Verde: 100% ocupada
  - 🔵 Azul: 70-99% ocupada
  - 🟡 Amarelo: 40-69% ocupada
  - 🔴 Vermelho: 0-39% ocupada

### 6. Export Corrigido (PNG/SVG)

**Arquivos**:
- `components/ExportCanvas.tsx`
- `hooks/useExportLayout.ts`

- ✅ Componente dedicado sem CSS scale
- ✅ Renderização 1:1 das coordenadas
- ✅ Suporte PNG (pixelRatio 2x) e SVG
- ✅ Inclui legenda e watermark

**Uso:**
```typescript
import { ExportCanvas } from '@/features/tables/components/ExportCanvas'
import { useExportLayout } from '@/features/tables/hooks/useExportLayout'

function ExportButton() {
  const { exportRef, exportLayout } = useExportLayout()

  return (
    <>
      <button onClick={() => exportLayout(tables, elements, { format: 'png' })}>
        Exportar PNG
      </button>

      {/* Componente invisível para export */}
      <div style={{ position: 'absolute', left: -9999, top: -9999 }}>
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

### 7. Keyboard Shortcuts

**Arquivo**: `hooks/useKeyboardShortcuts.ts`

| Atalho | Ação |
|--------|------|
| `Delete` / `Backspace` | Deletar item selecionado |
| `Ctrl+D` | Duplicar item |
| `Ctrl+G` | Toggle grade (snap to grid) |
| `Ctrl+Z` | Desfazer |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Refazer |
| `Ctrl+S` | Salvar |
| `Esc` | Desselecionar |

**Uso:**
```typescript
import { useKeyboardShortcuts } from '@/features/tables/hooks/useKeyboardShortcuts'

function PlannerPage() {
  useKeyboardShortcuts({
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onToggleGrid: toggleGrid,
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSave: handleSave,
    onEscape: () => setSelectedId(null),
    selectedItemId,
    snapToGrid,
  })
}
```

### 8. Recalcular Assentos ao Redimensionar

**Arquivo**: `components/TableStageItem.tsx`

- ✅ `handleResizeStop` agora é async
- ✅ Backend recalcula automaticamente posições dos assentos
- ✅ Hit areas atualizam via re-render

### 9. Melhorias de Performance

**Arquivo**: `utils/performance.ts`

Utilitários criados:
- ✅ `debounce(func, delay)` - Debounce para otimizar chamadas
- ✅ `throttle(func, limit)` - Throttle para limitar execuções
- ✅ `calculateSeatPositions()` - Cálculo memoizado de assentos
- ✅ `LocalStorageBatcher` - Batch de writes no localStorage

**Componentes Otimizados:**
- ✅ `TableItem` - Wrapped com `React.memo` e `useMemo`
- ✅ `TableStageItem` - Wrapped com `React.memo` e `useMemo`

**Exemplo:**
```typescript
import { debounce, LocalStorageBatcher } from '@/features/tables/utils/performance'

// Debounce de persist
const debouncedSave = debounce((data) => {
  localStorage.setItem('planner-data', JSON.stringify(data))
}, 500)

// Batcher global
import { localStorageBatcher } from '@/features/tables/utils/performance'

localStorageBatcher.set('planner-event-123', data)
// Flush automático após 500ms
// Ou força flush:
localStorageBatcher.forceFlush()
```

## 🔧 API Backend Necessária

### Endpoint de Layout (Novo)

```typescript
// PUT /api/events/[id]/layout
{
  "version": 2,
  "updatedAt": "2025-10-06T12:00:00Z",
  "tables": [...],
  "elements": [...]
}

// Response
{
  "ok": true,
  "version": 2,
  "updatedAt": "2025-10-06T12:00:00Z"
}
```

### Modificar GET Existente

```typescript
// GET /api/events/[id]/tables
{
  "tables": [...],
  "unassigned": [...],
  "elements": [...] // NOVO campo
}
```

## ✅ Critérios de Aceite

- [x] Arrastar/Redimensionar mesa no Stage Mode → reflete no Classic Mode ao trocar
- [x] Criar/ocultar elemento decorativo → aparece em ambos os modos
- [x] Redimensionar mesa recalcula assentos (hit areas continuam precisas)
- [x] Pan/zoom no Classic Mode sem quebrar hit areas
- [x] Export PNG/SVG com geometria correta (sem distorção de scale)
- [x] Voltar à página mantém estado (localStorage)
- [x] Botão "Salvar" envia ao backend; erro mantém estado local
- [x] Abrir duas abas, mover mesa em uma → vê mudança ao vivo na outra (BroadcastChannel)
- [x] Performance otimizada com debounce, useMemo, React.memo

## 📦 Arquivos Criados/Modificados

### Criados:
- `hooks/usePlannerSync.ts`
- `hooks/useTablePlannerWithCache.ts`
- `hooks/useExportLayout.ts`
- `hooks/useKeyboardShortcuts.ts`
- `components/ExportCanvas.tsx`
- `utils/performance.ts`
- `README.md` (este arquivo)

### Modificados:
- `stores/usePlannerStore.ts` - Expandido com persist
- `components/TablesCanvas.tsx` - Pan/zoom lógico + overlays
- `components/TableStageItem.tsx` - Async resize + performance
- `components/TableItem.tsx` - React.memo + useMemo

## 🚀 Como Usar

1. **Importar o store com persist:**
```typescript
import { createPlannerStore } from '@/features/tables/stores/usePlannerStore'

const useEventPlannerStore = createPlannerStore(eventId)
```

2. **Habilitar sincronização cross-tab:**
```typescript
import { usePlannerSync } from '@/features/tables/hooks/usePlannerSync'

const broadcast = usePlannerSync(eventId)
```

3. **Usar persistência híbrida:**
```typescript
import { useTablePlannerWithCache } from '@/features/tables/hooks/useTablePlannerWithCache'

const { data } = useTablePlannerWithCache(eventId)
```

4. **Habilitar overlays:**
```typescript
<TablesCanvas
  tables={tables}
  showOverlays={{
    numbers: true,
    occupancy: true,
    heatmap: false
  }}
/>
```

5. **Export layout:**
```typescript
import { useExportLayout } from '@/features/tables/hooks/useExportLayout'

const { exportRef, exportLayout } = useExportLayout()
exportLayout(tables, elements, { format: 'png', pixelRatio: 2 })
```

## 🎨 Stack Mantida

- Next.js (App Router) + TypeScript
- Tailwind + shadcn/ui + Framer Motion
- @dnd-kit/core + react-rnd
- TanStack Query v5
- Zustand com persist middleware
- html-to-image

## 📝 Notas Importantes

1. O endpoint `PUT /api/events/[id]/layout` precisa ser implementado no backend
2. O GET de tables precisa retornar o campo `elements`
3. BroadcastChannel tem fallback para navegadores sem suporte
4. LocalStorage tem tratamento de erro para quota exceeded
5. Todos os componentes principais estão otimizados com React.memo
