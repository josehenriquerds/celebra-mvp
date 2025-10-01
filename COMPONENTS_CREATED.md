# Componentes Criados - Tables Refactoring

## ✅ Estrutura Completa Implementada

### Componentes Criados ([src/features/tables/components/](src/features/tables/components/))

#### 1. **DroppableSeat.tsx**
Componente de assento com hit-area ampliada (56px visual, 40px interno).

**Funcionalidades**:
- Droppable: Aceita guest ou assignment
- Draggable: Quando ocupado, pode ser arrastado para outro seat
- Visual: VIP mostra ⭐, outros mostram número
- Cores: Personaliz adas pela cor da mesa

**Uso**:
```tsx
<DroppableSeat
  seat={seat}
  tableId={table.id}
  tableColor={table.color}
  zoom={zoom}
/>
```

---

#### 2. **TableItem.tsx**
Componente de mesa individual com todas as funcionalidades.

**Funcionalidades**:
- Draggable: Arrasta a mesa inteira
- Zoom lógico: Renderiza escalonado sem blur
- Ações: Editar e Excluir (aparecem no hover)
- Contador: Mostra ocupação (ex: "5/8")
- Assentos: Renderiza todos os DroppableSeat

**Uso**:
```tsx
<TableItem
  table={table}
  zoom={zoom}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

---

#### 3. **GuestChip.tsx**
Chip de convidado não alocado (arrast ável).

**Funcionalidades**:
- Draggable: Pode ser arrastado para qualquer seat
- Visual: Badge VIP (⭐), household, assentos, crianças
- Compacto: Design otimizado para sidebar

**Uso**:
```tsx
<GuestChip guest={guest} />
```

---

#### 4. **UnassignedZone.tsx**
Zona droppable para desalocar convidados.

**Funcionalidades**:
- Droppable: Aceita assignments para desalocar
- Feedback visual: Ring azul quando hovering
- Container: Envolve lista de GuestChip

**Uso**:
```tsx
<UnassignedZone>
  {unassigned.map(g => <GuestChip key={g.id} guest={g} />)}
</UnassignedZone>
```

---

#### 5. **TablesCanvas.tsx**
Canvas principal com grid de fundo.

**Funcionalidades**:
- Grid visual: 16px escalado por zoom
- Renderiza todas as TableItem
- Exportável: id="tables-canvas" para toPng
- Zoom lógico: Dimensões escaladas

**Uso**:
```tsx
<TablesCanvas
  tables={tables}
  zoom={zoom}
  canvasWidth={2000}
  canvasHeight={1500}
  onEditTable={handleEdit}
  onDeleteTable={handleDelete}
/>
```

---

#### 6. **Toolbar.tsx**
Barra de ferramentas com zoom, undo/redo e ações.

**Funcionalidades**:
- Zoom In/Out: Controles com limite (0.5x - 2x)
- Undo/Redo: Integrado com Zustand store
- Botão Elementos: Toggle do painel lateral
- Auto-Organizar: Layout automático em grade
- Auto-Alocar: Alocação inteligente (futura)
- Exportar: PNG de alta qualidade

**Uso**:
```tsx
<Toolbar
  onExport={handleExport}
  onAutoArrange={handleAutoArrange}
  onAutoAllocate={handleAutoAllocate}
  exporting={isExporting}
/>
```

---

#### 7. **ElementsPalette.tsx** ⭐ NOVO
Painel de elementos decorativos arrastáveis.

**Elementos Disponíveis**:
| Tipo | Ícone | Cor | Dimensões |
|------|-------|-----|-----------|
| cakeTable | 🍰 | Amarelo | 120x80 |
| danceFloor | 🎵 | Roxo | 200x200 |
| restroom | 🚪 | Cinza | 80x80 |
| buffet | 🍴 | Verde | 180x100 |
| dj | 🎧 | Vermelho | 100x100 |
| entrance | 🚪 | Azul | 100x60 |
| exit | 🚪 | Laranja | 100x60 |
| bar | 🍷 | Rosa | 150x80 |
| photoArea | 📷 | Teal | 120x120 |

**Funcionalidades**:
- Draggable: Cada elemento pode ser arrastado
- Visual: Ícone colorido + label
- Grid: Layout 2 colunas responsivo

**Uso**:
```tsx
{showElementsPalette && (
  <div className="col-span-3">
    <ElementsPalette />
  </div>
)}
```

---

## 🎨 Layout da Página

```
┌─────────────────────────────────────────────────────┐
│  Header: Título + Toolbar                           │
├──────────────┬────────────────────┬─────────────────┤
│  Sidebar L   │   Canvas Central   │  Sidebar R      │
│              │                    │                 │
│  Convidados  │   Mesas + Grid     │  Elementos      │
│  (3 cols)    │   (6 cols)         │  (3 cols)       │
│              │                    │                 │
│  [ Unassigned│   [ TablesCanvas ] │  [ Palette ]    │
│    Zone ]    │                    │                 │
│              │   DnD Context      │  Toggle on/off  │
└──────────────┴────────────────────┴─────────────────┘
```

**Responsivo**:
- Desktop: 3-6-3 (com palette)
- Desktop: 3-9 (sem palette)
- Mobile: Stack vertical 12 cols cada

---

## 🔌 Integração com a Página

### Imports Necessários
```tsx
import {
  ElementsPalette,
  GuestChip,
  TablesCanvas,
  Toolbar,
  UnassignedZone,
} from '@/features/tables/components'

import {
  useAssignGuestToSeat,
  useCreateTable,
  useDeleteTable,
  useTablePlannerData,
  useUnassignGuestFromSeat,
  useUpdateTable,
} from '@/features/tables/hooks/useTables'

import { usePlannerStore } from '@/features/tables/stores/usePlannerStore'
```

### Setup no Componente
```tsx
export default function TablePlannerPage() {
  // React Query hooks
  const { data, isLoading } = useTablePlannerData(eventId)
  const createTableMutation = useCreateTable()
  const updateTableMutation = useUpdateTable()
  const deleteTableMutation = useDeleteTable()
  const assignMutation = useAssignGuestToSeat()
  const unassignMutation = useUnassignGuestFromSeat()

  // Zustand store
  const {
    zoom,
    activeId,
    setActiveId,
    addToHistory,
    showElementsPalette,
  } = usePlannerStore()

  // Dados extraídos
  const tables = data?.tables || []
  const unassigned = data?.unassigned || []

  // ... handlers DnD, CRUD, etc.
}
```

---

## 🎯 Como Usar os Novos Componentes

### 1. Renderizar Sidebar de Convidados
```tsx
<Card>
  <CardHeader>
    <CardTitle>
      <Users className="mr-2 inline h-5 w-5" />
      Convidados ({unassigned.length})
    </CardTitle>
  </CardHeader>
  <CardContent className="max-h-[70vh] overflow-y-auto">
    <UnassignedZone>
      {unassigned.map((guest) => (
        <GuestChip key={guest.id} guest={guest} />
      ))}
    </UnassignedZone>
  </CardContent>
</Card>
```

### 2. Renderizar Canvas Central
```tsx
<Card>
  <CardHeader>
    <CardTitle>Layout das Mesas</CardTitle>
  </CardHeader>
  <CardContent className="overflow-auto p-4">
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TablesCanvas
        tables={tables}
        zoom={zoom}
        canvasWidth={2000}
        canvasHeight={1500}
        onEditTable={setEditingTable}
        onDeleteTable={handleDeleteTable}
      />
      <DragOverlay>
        {activeId ? <div>Arrastando...</div> : null}
      </DragOverlay>
    </DndContext>
  </CardContent>
</Card>
```

### 3. Renderizar Painel de Elementos (Condicional)
```tsx
{showElementsPalette && (
  <div className="col-span-12 lg:col-span-3">
    <div className="sticky top-4">
      <ElementsPalette />
    </div>
  </div>
)}
```

### 4. Toolbar no Header
```tsx
<header className="border-b bg-white">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Link href={`/events/${eventId}`}>
        <Button variant="ghost" size="icon">
          <ArrowLeft />
        </Button>
      </Link>
      <h1>Planner de Mesas</h1>
    </div>

    <Toolbar
      onExport={handleExport}
      onAutoArrange={handleAutoArrange}
      onAutoAllocate={handleAutoAllocate}
      exporting={exporting}
    />
  </div>
</header>
```

---

## 🐛 Para Testar as Novas Funcionalidades

### 1. Painel de Elementos Aparece?
```tsx
// No store, verificar:
const { showElementsPalette, toggleElementsPalette } = usePlannerStore()

// No botão da Toolbar:
<Button onClick={toggleElementsPalette}>
  {showElementsPalette ? 'Ocultar' : 'Elementos'}
</Button>

// Na página:
{showElementsPalette && <ElementsPalette />}
```

### 2. Undo/Redo Funciona?
```tsx
// Verificar no store:
const { undo, redo, canUndo, canRedo, addToHistory } = usePlannerStore()

// Adicionar ao histórico quando data muda:
useEffect(() => {
  if (data) addToHistory(data)
}, [data?.tables.length, data?.unassigned.length])

// Nos botões:
<Button onClick={undo} disabled={!canUndo()}>Undo</Button>
<Button onClick={redo} disabled={!canRedo()}>Redo</Button>
```

### 3. Criação de Mesa Funciona?
```tsx
const createMutation = useCreateTable()

async function handleCreateTable() {
  await createMutation.mutateAsync({
    label: 'Mesa 1',
    capacity: 8,
    shape: 'circular',
    x: 400,
    y: 300,
    radius: 80,
    color: '#C7B7F3',
  })
  // React Query invalida cache automaticamente
}
```

---

## 📝 Arquivo de Referência

Para integrar tudo na página, consulte o exemplo completo em:
- **Backup original**: `src/app/events/[id]/tables/page-backup.tsx`
- **Componentes**: `src/features/tables/components/*.tsx`
- **Hooks**: `src/features/tables/hooks/useTables.ts`
- **Store**: `src/features/tables/stores/usePlannerStore.ts`

---

## 🚀 Próximo Passo

Substitua o conteúdo de `src/app/events/[id]/tables/page.tsx` integrando todos os componentes criados. Use o padrão:

1. Imports dos componentes
2. Setup dos hooks (React Query + Zustand)
3. Handlers DnD (dragStart, dragEnd)
4. Handlers CRUD (create, update, delete)
5. Render com layout 3-6-3 (Guests | Canvas | Elements)

**Status**: Todos os componentes estão prontos e testados individualmente. Falta apenas integrá-los na página principal.
