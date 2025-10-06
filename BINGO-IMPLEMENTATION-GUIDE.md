# 🎯 Guia de Implementação - Melhorias do Bingo

## ✅ Já Implementado

### 1. Infraestrutura Base
- ✅ Módulo completo com geração de cartelas
- ✅ Drag-and-drop de imagens em células
- ✅ Sorteio ao vivo (Host mode)
- ✅ Templates pré-definidos
- ✅ Integração com sidebar do Celebre

### 2. Novas Estruturas
- ✅ **Types estendidos** (`FreeLayer`, `CellTheme`, `LayerType`, etc.)
- ✅ **Lógica de cores alternadas** (`cellColors.ts`)
- ✅ **BingoHeader** component (título editável)
- ✅ **Dependências instaladas** (react-rnd, html-to-image, jsPDF, JSZip)

---

## 🚧 Para Completar a Implementação

### PASSO 1: Atualizar Store (15 min)

**Arquivo**: `src/features/bingo/state/useBingoStore.ts`

```typescript
// Adicionar ao interface BingoStore:
interface BingoStore {
  // ... existing

  // Novos estados
  freeLayers: FreeLayer[];
  selectedLayerId: string | null;
  snapToGrid: boolean;

  // Novas actions
  addFreeLayer: (layer: Omit<FreeLayer, 'id'>) => void;
  updateFreeLayer: (id: string, updates: Partial<FreeLayer>) => void;
  deleteFreeLayer: (id: string) => void;
  setSelectedLayer: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  duplicateLayer: (id: string) => void;
  replaceLayerAsset: (id: string, newUrl: string) => void;
  toggleSnapToGrid: () => void;
}

// Implementação:
export const useBingoStore = create<BingoStore>((set, get) => ({
  // ... existing state
  freeLayers: [],
  selectedLayerId: null,
  snapToGrid: false,

  addFreeLayer: (layer) => {
    set((s) => ({
      freeLayers: [
        ...s.freeLayers,
        { ...layer, id: `layer-${Date.now()}`, zIndex: s.freeLayers.length }
      ]
    }));
  },

  updateFreeLayer: (id, updates) => {
    set((s) => ({
      freeLayers: s.freeLayers.map((l) => l.id === id ? { ...l, ...updates } : l)
    }));
  },

  deleteFreeLayer: (id) => {
    set((s) => ({
      freeLayers: s.freeLayers.filter((l) => l.id !== id),
      selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId
    }));
  },

  setSelectedLayer: (id) => set({ selectedLayerId: id }),

  bringToFront: (id) => {
    set((s) => {
      const maxZ = Math.max(...s.freeLayers.map(l => l.zIndex), 0);
      return {
        freeLayers: s.freeLayers.map(l =>
          l.id === id ? { ...l, zIndex: maxZ + 1 } : l
        )
      };
    });
  },

  sendToBack: (id) => {
    set((s) => {
      const minZ = Math.min(...s.freeLayers.map(l => l.zIndex), 0);
      return {
        freeLayers: s.freeLayers.map(l =>
          l.id === id ? { ...l, zIndex: minZ - 1 } : l
        )
      };
    });
  },

  duplicateLayer: (id) => {
    set((s) => {
      const layer = s.freeLayers.find(l => l.id === id);
      if (!layer) return s;
      return {
        freeLayers: [
          ...s.freeLayers,
          { ...layer, id: `layer-${Date.now()}`, x: layer.x + 20, y: layer.y + 20 }
        ]
      };
    });
  },

  replaceLayerAsset: (id, newUrl) => {
    set((s) => ({
      freeLayers: s.freeLayers.map(l =>
        l.id === id ? { ...l, assetUrl: newUrl } : l
      )
    }));
  },

  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
}));
```

---

### PASSO 2: Atualizar Cell Component (10 min)

**Arquivo**: `src/features/bingo/components/Cell.tsx`

```typescript
import { getCellColorClass } from '../logic/cellColors';

interface CellProps {
  cell: CardCell;
  colorClass?: string; // Novo
  // ... rest
}

export function Cell({ cell, colorClass, ... }: CellProps) {
  return (
    <motion.div
      className={cn(
        'relative aspect-square flex items-center justify-center border-2 rounded-lg transition-all',
        colorClass || 'bg-purple-50', // Usar colorClass customizado
        cell.marked && 'ring-4 ring-purple-400',
        // ...
      )}
    >
      {/* ... rest */}
    </motion.div>
  );
}
```

---

### PASSO 3: Atualizar CardGrid (15 min)

**Arquivo**: `src/features/bingo/components/CardGrid.tsx`

```typescript
import { getCellColorClass } from '../logic/cellColors';

interface CardGridProps {
  // ... existing
  cellTheme?: CellTheme;
}

export function CardGrid({ card, gridSize, labels, cellTheme, ... }: CardGridProps) {
  const defaultTheme: CellTheme = {
    pattern: 'none',
    colorA: 'bg-purple-50',
    colorB: 'bg-pink-50',
  };

  const theme = cellTheme || defaultTheme;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ... labels */}

      <div
        className="grid gap-2 p-4 bg-white/50 rounded-xl shadow-lg"
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
              colorClass={colorClass}
              {...otherProps}
            />
          );
        })}
      </div>
    </div>
  );
}
```

---

### PASSO 4: Atualizar SidebarConfigurator (20 min)

**Arquivo**: `src/features/bingo/components/SidebarConfigurator.tsx`

Adicionar seção de título e cores:

```typescript
export function SidebarConfigurator() {
  const { config, setConfig } = useBingoStore();

  return (
    <div className="space-y-6">
      {/* ... existing sections */}

      {/* Título do Bingo */}
      <div className="space-y-2">
        <Label>Título do Bingo</Label>
        <Input
          value={config.title || ''}
          onChange={(e) => setConfig({ title: e.target.value })}
          placeholder="Ex: Dalila faz 20 e poucos"
        />
        <div className="flex items-center gap-2">
          <Switch
            checked={config.showTitle ?? true}
            onCheckedChange={(checked) => setConfig({ showTitle: checked })}
          />
          <Label className="text-sm">Mostrar título no preview</Label>
        </div>
      </div>

      <Separator />

      {/* Cores da Grade */}
      <div className="space-y-2">
        <Label>Padrão de Cores</Label>
        <Select
          value={config.cellTheme?.pattern || 'none'}
          onValueChange={(val) => setConfig({
            cellTheme: { ...config.cellTheme, pattern: val as CellPattern }
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem padrão</SelectItem>
            <SelectItem value="chess">Xadrez</SelectItem>
            <SelectItem value="row-stripes">Linhas</SelectItem>
            <SelectItem value="col-stripes">Colunas</SelectItem>
          </SelectContent>
        </Select>

        {config.cellTheme?.pattern !== 'none' && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Cor A</Label>
              <Input
                type="text"
                value={config.cellTheme?.colorA || 'bg-purple-50'}
                onChange={(e) => setConfig({
                  cellTheme: { ...config.cellTheme!, colorA: e.target.value }
                })}
                placeholder="bg-purple-50"
                className="text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Cor B</Label>
              <Input
                type="text"
                value={config.cellTheme?.colorB || 'bg-pink-50'}
                onChange={(e) => setConfig({
                  cellTheme: { ...config.cellTheme!, colorB: e.target.value }
                })}
                placeholder="bg-pink-50"
                className="text-xs"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### PASSO 5: Integrar BingoHeader no Shell (10 min)

**Arquivo**: `src/features/bingo/components/BingoShell.tsx`

```typescript
import { BingoHeader } from './BingoHeader';

export function BingoShell() {
  const { config, setConfig } = useBingoStore();

  return (
    <div className="...">
      {/* ... existing header */}

      <Tabs value={viewMode} ...>
        {/* ... tabs list */}

        <div className="grid ...">
          <div>{/* Sidebar */}</div>

          <div className="flex-1">
            <TabsContent value="editor">
              {/* Adicionar BingoHeader */}
              {config.showTitle && (
                <BingoHeader
                  title={config.title}
                  showTitle={config.showTitle}
                  onTitleChange={(title) => setConfig({ title })}
                  onToggleShow={() => setConfig({ showTitle: !config.showTitle })}
                  editable={true}
                  palette={config.theme.palette}
                />
              )}

              {currentCard && (
                <CardGrid
                  card={currentCard}
                  gridSize={config.gridSize}
                  labels={config.columnsLabels}
                  cellTheme={config.cellTheme}
                  isEditable={true}
                  palette={config.theme.palette}
                />
              )}
            </TabsContent>

            {/* ... other tabs */}
          </div>
        </div>
      </Tabs>
    </div>
  );
}
```

---

### PASSO 6: Implementar Exportação Real (30 min)

**Arquivo**: `src/features/bingo/components/ExportBar.tsx`

```typescript
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

export function ExportBar() {
  const { deckCards, config } = useBingoStore();

  const handleExportPNG = async () => {
    const element = document.getElementById('bingo-card-preview');
    if (!element) return;

    // Esperar fontes carregarem
    await document.fonts.ready;

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 3, // 300 DPI
      backgroundColor: '#ffffff',
    });

    // Download
    const link = document.createElement('a');
    link.download = `${config.title || 'bingo'}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleExportPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm

    // Para cada cartela, gerar PNG e adicionar ao PDF
    for (let i = 0; i < deckCards.length; i++) {
      if (i > 0) pdf.addPage();

      const element = document.getElementById(`card-${i}`);
      if (!element) continue;

      await document.fonts.ready;
      const imgData = await toPng(element, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: '#fff',
      });

      // Adicionar imagem centralizada
      const imgWidth = pageWidth - 20;
      const imgHeight = imgWidth; // Assumindo quadrado
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    }

    pdf.save(`${config.title || 'bingo'}.pdf`);
  };

  // ... rest
}
```

---

## 📋 Checklist Final

- [ ] Store atualizado com freeLayers
- [ ] Cell aceita colorClass prop
- [ ] CardGrid aplica getCellColorClass
- [ ] SidebarConfigurator tem controles de título e cores
- [ ] BingoHeader integrado no Shell
- [ ] Exportação PNG/PDF funcional
- [ ] Testar com padrão xadrez
- [ ] Testar export de 4 cartelas

---

## 🎯 Resultado Esperado

Após seguir estes passos, você terá:

1. ✅ Título editável no topo das cartelas
2. ✅ Cores alternadas (xadrez/linhas/colunas)
3. ✅ Exportação PNG 300dpi funcional
4. ✅ Exportação PDF com múltiplas cartelas
5. ✅ Base pronta para layers livres (Stage)

O sistema de **layers livres** (Stage) pode ser adicionado depois, pois requer mais componentes (LayerItem, LayerToolbar, react-rnd integration).

---

## 🚀 Para Ir Além

Depois de completar o básico, implemente:

1. Stage component (container absoluto)
2. LayerItem com react-rnd
3. LayerToolbar (zIndex, duplicate, delete)
4. Templates com placeholders de fotos
5. Snap to grid
6. Guias de alinhamento

Tudo isso está documentado em `BINGO-IMPROVEMENTS-PLAN.md`.
