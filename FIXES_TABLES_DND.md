# Correções - Tables Drag & Drop

## 🐛 Problemas Identificados

1. **Enum `shape` incorreto**: Página usava `'circular'` mas Prisma define como `'round'`
2. **Campos faltando na API**: Response não incluía `eventId`, `createdAt`, `updatedAt`, `color`
3. **Erros TypeScript**: Type assertions faltando em `usePlannerStore` e `ElementsPalette`
4. **Cache do Next.js**: `.next` com código antigo após alterações

## ✅ Correções Aplicadas

### 1. `src/app/events/[id]/tables/page.tsx` (linha 337)
```typescript
// ANTES:
shape: 'circular',

// DEPOIS:
shape: 'round',
```

### 2. `src/app/api/events/[id]/tables/route.ts` (linhas 37-48)
```typescript
// Adicionados campos obrigatórios na response:
const formattedTables = tables.map((table) => ({
  id: table.id,
  eventId: table.eventId,          // ✅ NOVO
  label: table.label,
  capacity: table.capacity,
  shape: table.shape,
  x: table.x,
  y: table.y,
  radius: 80,
  color: '#C7B7F3',               // ✅ NOVO
  createdAt: table.createdAt,     // ✅ NOVO
  updatedAt: table.updatedAt,     // ✅ NOVO
  seats: table.seats.map(...),
}))
```

### 3. `src/features/tables/stores/usePlannerStore.ts`
```typescript
// Adicionadas type assertions:
undo: () => {
  // ...
  return JSON.parse(JSON.stringify(history[historyIndex - 1])) as TablePlannerData
},

redo: () => {
  // ...
  return JSON.parse(JSON.stringify(history[historyIndex + 1])) as TablePlannerData
},

addToHistory: (data) => {
  // ...
  newHistory.push(JSON.parse(JSON.stringify(data)) as TablePlannerData)
},
```

### 4. `src/features/tables/components/ElementsPalette.tsx`
```typescript
// Atualizada interface para aceitar color prop:
interface ElementDef {
  type: ElementType
  label: string
  icon: React.ComponentType<{ className?: string; color?: string }>  // ✅ ADICIONADO color
  color: string
  defaultWidth: number
  defaultHeight: number
}

// Mudado de style para color prop:
<Icon className="h-6 w-6" color={element.color} />
```

## 🚀 Como Testar

### 1. Limpar cache e reiniciar servidor
```bash
rm -rf .next
npm run dev
```

### 2. Acessar página
```
http://localhost:3000/events/cmg7932an000013g79a1jig3q/tables
```

### 3. Funcionalidades para testar

#### ✅ Criar Mesa
1. Preencher "Nome da mesa" (opcional)
2. Definir capacidade (2-20)
3. Clicar "+ Mesa"
4. Mesa aparece no canvas com assentos ao redor

#### ✅ Arrastar Mesa
1. Hover sobre a mesa
2. Aparece handle (ícone 3 linhas) no topo
3. Clicar e arrastar o handle
4. Mesa se move com snap para grid (16px)
5. Detecta colisão e ajusta posição automaticamente

#### ✅ Editar/Deletar Mesa
1. Hover sobre a mesa
2. Botões aparecem no canto superior direito
3. Azul = Editar (abre modal)
4. Vermelho = Deletar (pede confirmação)

#### ✅ Alocar Convidado
1. Sidebar esquerda lista convidados não alocados
2. Clicar e arrastar convidado
3. Soltar sobre um assento (círculo ao redor da mesa)
4. Assento fica preenchido com índice ou ⭐ (VIP)

#### ✅ Desalocar Convidado
1. Clicar e arrastar assento ocupado
2. Soltar na zona "Convidados" (sidebar esquerda)
3. Convidado volta para lista de não alocados

#### ✅ Realocar Convidado
1. Arrastar assento ocupado
2. Soltar em outro assento vazio
3. Convidado muda de lugar

#### ✅ Zoom
1. Botões +/- no Toolbar (centro superior)
2. Range: 0.5x a 2x
3. Zoom lógico (coordenadas multiplicadas, não CSS transform)

#### ✅ Undo/Redo
1. Botões com setas no Toolbar
2. Histórico de todas as ações (criar, mover, alocar, etc.)
3. Desabilitado quando não há histórico

#### ✅ Painel de Elementos
1. Botão "Elementos" no Toolbar
2. Toggle sidebar direita
3. 9 elementos decorativos:
   - Mesa do Bolo
   - Pista de Dança
   - Banheiro
   - Buffet
   - DJ
   - Entrada
   - Saída
   - Bar
   - Área de Fotos

#### ✅ Auto-Organizar
1. Botão no Toolbar
2. Reorganiza mesas em grid
3. Respeita spacing mínimo de 64px

#### ✅ Exportar PNG
1. Botão no Toolbar
2. Gera imagem do canvas
3. Download automático

## 📊 Status TypeScript

✅ **0 erros** na feature `src/features/tables`
⚠️ Outros erros no projeto (seed, tests, APIs antigas) não afetam funcionalidade

## 🔍 Debug

Se ainda houver problemas:

### Console do Navegador (F12)
```javascript
// Verificar se dados estão carregando:
console.log(tables, unassigned)

// Verificar DnD context:
console.log(activeId, activeType)

// Verificar Zustand store:
console.log(usePlannerStore.getState())
```

### Logs do Server
```bash
# Verificar se API está respondendo:
curl http://localhost:3000/api/events/cmg7932an000013g79a1jig3q/tables

# Criar mesa via API:
curl -X POST http://localhost:3000/api/events/cmg7932an000013g79a1jig3q/tables \
  -H "Content-Type: application/json" \
  -d '{"label":"Teste","capacity":8,"shape":"round","x":400,"y":400}'
```

## 🎯 Arquitetura

```
src/
├── schemas/
│   └── tables.schema.ts          # Zod schemas + type inference
├── features/
│   └── tables/
│       ├── services/
│       │   └── tables.api.ts     # API calls (fetch)
│       ├── hooks/
│       │   └── useTables.ts      # React Query hooks
│       ├── stores/
│       │   └── usePlannerStore.ts # Zustand store (UI state)
│       └── components/
│           ├── index.ts          # Barrel export
│           ├── TablesCanvas.tsx  # Canvas container
│           ├── TableItem.tsx     # Individual table
│           ├── DroppableSeat.tsx # Seat with DnD
│           ├── GuestChip.tsx     # Draggable guest
│           ├── UnassignedZone.tsx # Dropzone for unassign
│           ├── Toolbar.tsx       # Actions bar
│           └── ElementsPalette.tsx # Decorative elements
└── app/
    ├── events/[id]/tables/
    │   └── page.tsx              # Main page component
    └── api/events/[id]/tables/
        └── route.ts              # API route handlers
```

## 📝 Padrões Usados

- **RSC**: React Server Components
- **React Query v5**: Server state com optimistic updates
- **Zod**: Runtime validation + type inference
- **Zustand**: Client UI state (zoom, activeId, history)
- **dnd-kit**: Drag and drop
- **shadcn/ui**: UI components
- **Feature-based architecture**: Código organizado por feature

## ✨ Melhorias Implementadas

1. **Type Safety 100%**: Todos os dados tipados via Zod inference
2. **Optimistic Updates**: UI atualiza instantaneamente com rollback em erro
3. **Logical Zoom**: Evita blur do CSS transform
4. **Enlarged Hit-areas**: Assentos com 56px (área) vs 40px (visual)
5. **Collision Detection**: Mesas não sobrepõem
6. **Snap to Grid**: Posições alinhadas (16px)
7. **History with Undo/Redo**: Histórico completo de ações
8. **Modular Components**: 7 componentes reutilizáveis
9. **Query Keys Factory**: Cache management centralizado
10. **Error Boundaries**: Toast notifications para todos os erros
