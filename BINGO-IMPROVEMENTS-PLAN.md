# 🎨 Plano de Melhorias do Módulo Bingo

## ✅ Concluído
- [x] Types estendidos (FreeLayer, CellTheme, LayerType, CellPattern)
- [x] Lógica de cores alternadas (cellColors.ts)

## 📝 Próximos Passos

### 1. Atualizar Store (useBingoStore.ts)
```typescript
// Adicionar ao state:
freeLayers: FreeLayer[]
selectedLayerId: string | null
snapToGrid: boolean

// Adicionar actions:
addFreeLayer(layer: Omit<FreeLayer, 'id'>)
updateFreeLayer(id: string, updates: Partial<FreeLayer>)
deleteFreeLayer(id: string)
setSelectedLayer(id: string | null)
bringToFront(id: string)
sendToBack(id: string)
duplicateLayer(id: string)
replaceLayerAsset(id: string, newUrl: string)
```

### 2. Componente BingoHeader
Criar `src/features/bingo/components/BingoHeader.tsx`:
- Input editável para título
- Toggle showTitle
- Decorações (opcional)
- Integrar com config.title

### 3. Atualizar CardGrid
Em `CardGrid.tsx`:
- Importar `getCellColorClass`
- Aplicar cores alternadas em cada Cell
- Passar `cellTheme` do config

### 4. Criar Stage Component
`src/features/bingo/components/Stage.tsx`:
- Container absoluto sobre o grid
- Renderizar freeLayers ordenados por zIndex
- Wrapper com dimensões fixas (ex: 800x800px)

### 5. Criar LayerItem Component
`src/features/bingo/components/LayerItem.tsx`:
- Usa react-rnd para resize/drag
- Handle de rotação custom
- Visual de seleção
- Máscara (clip-path)
- Opacity
- Bloqueio (disabled quando locked)

### 6. Criar LayerToolbar
`src/features/bingo/components/LayerToolbar.tsx`:
- Botões: Trazer frente, Enviar trás, Duplicar, Deletar, Bloquear
- Slider de opacidade
- Selector de máscara (circle/rounded/none)
- Snap toggle

### 7. Atualizar SidebarConfigurator
Adicionar seções:
- **Título**: Input + toggle showTitle
- **Cores da Grade**: Pattern selector + 2 color pickers
- **Snap**: Toggle snapToGrid

### 8. Atualizar Templates
Em `useBingoStore.ts`, adicionar templates com placeholders:
```typescript
{
  id: 'baby-shower-photos',
  name: 'Chá de Bebê - 3 Fotos',
  config: { gridSize: 5, ... },
  placeholders: [
    { id: 'ph1', type: 'image', x: 50, y: 50, width: 150, height: 150, ... },
    { id: 'ph2', type: 'image', x: 500, y: 50, width: 150, height: 150, ... },
    { id: 'ph3', type: 'image', x: 275, y: 600, width: 200, height: 200, clip: 'circle', ... }
  ]
}
```

### 9. Implementar Exportação (ExportBar.tsx)
```typescript
// Instalar dependências:
npm install html-to-image jspdf jszip --save

// Lógica:
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import JSZip from 'jszip';

async function exportPNG(element: HTMLElement) {
  await document.fonts.ready;
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 3, // 300 DPI
    backgroundColor: '#ffffff',
  });
  // Download
}

async function exportPDF(cards: CardMatrix[], cardsPerPage: 1 | 2 | 4) {
  const pdf = new jsPDF('p', 'mm', 'a4');
  // Gerar PNG de cada card
  // Adicionar ao PDF com layout
  // Salvar
}
```

### 10. Integração no BingoShell
- Importar Stage e sobrepor ao CardGrid
- Importar LayerToolbar (quando viewMode = 'editor')
- Importar BingoHeader acima do grid

## 🎯 Prioridades

### Alta (MVP)
1. ✅ Types e cores alternadas
2. BingoHeader com título
3. CardGrid com cores alternadas
4. Store com freeLayers
5. Exportação PNG/PDF funcional

### Média (v1.1)
6. Stage + LayerItem (posicionamento livre)
7. LayerToolbar (manipulação)
8. Templates com placeholders

### Baixa (v1.2)
9. Snap to grid e guias
10. Multi-seleção
11. Undo/Redo de layers

## 📦 Dependências a Instalar
```bash
npm install react-rnd html-to-image jspdf jszip --save
```

## 🔧 Arquivos a Criar/Modificar

### Criar:
- [x] `logic/cellColors.ts`
- [ ] `components/BingoHeader.tsx`
- [ ] `components/Stage.tsx`
- [ ] `components/LayerItem.tsx`
- [ ] `components/LayerToolbar.tsx`
- [ ] `utils/export.ts`

### Modificar:
- [ ] `state/useBingoStore.ts` (adicionar freeLayers state)
- [ ] `components/CardGrid.tsx` (cores alternadas)
- [ ] `components/Cell.tsx` (aceitar colorClass)
- [ ] `components/SidebarConfigurator.tsx` (título + cores)
- [ ] `components/BingoShell.tsx` (integrar novos componentes)
- [ ] `components/ExportBar.tsx` (implementar export real)

## 📸 Screenshots Esperados

1. **Editor com Stage**: Grid + layers flutuantes sobrepostos
2. **Cores Alternadas**: Padrão xadrez aplicado
3. **Título Editável**: Header com nome do bingo
4. **Export Preview**: PNG 300dpi idêntico ao preview
5. **PDF**: 4 cartelas por página com marcas de corte

## 🧪 Testes

- [ ] Criar cartela com título
- [ ] Aplicar padrão xadrez
- [ ] Adicionar layer de imagem livre
- [ ] Redimensionar/rotacionar layer
- [ ] Exportar PNG (verificar qualidade)
- [ ] Exportar PDF 4x
- [ ] Substituir foto em placeholder
- [ ] Aplicar template com placeholders

## 📚 Referências

- html-to-image: https://github.com/bubkoo/html-to-image
- jsPDF: https://github.com/parallax/jsPDF
- react-rnd: https://github.com/bokuweb/react-rnd
- JSZip: https://stuk.github.io/jszip/
