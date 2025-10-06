# 🎲 Módulo Bingo - Celebre

Sistema completo para geração de cartelas de bingo personalizadas, com suporte a sorteio ao vivo, drag-and-drop, exportação e múltiplos templates.

## 📋 Recursos Implementados

### ✅ Core Features

- **Geração de Cartelas**
  - Configuração de grid (3x3, 4x4, 5x5)
  - Intervalo customizável de números (min/max - "pedras")
  - 3 modos de distribuição: Faixas Iguais, Dezenas, Aleatório
  - Casa central livre (opcional)
  - Geração de múltiplas cartelas únicas (anti-duplicatas)
  - RNG sementeado para reprodutibilidade

- **Editor Visual**
  - Drag-and-drop de imagens por célula
  - Imagem central customizável
  - Textos personalizados
  - 6 paletas de cores pastel (Lavanda, Rosa, Menta, Pêssego, Céu, Coral)
  - Preview em tempo real

- **Templates Pré-definidos**
  - ✨ Bingo Tradicional (5x5, 1-75, BINGO)
  - 👶 Chá de Bebê (5x5, customizável)
  - 💄 Chá de Lingerie (5x5, tema coral/peach)
  - 🎨 Bingo Personalizado (totalmente livre)

- **Modo Sorteio (Host)**
  - Sorteio com animações suaves
  - Histórico visual de números sorteados
  - Atalhos de teclado (Espaço = sortear, R = reset)
  - RNG sementeado para reprodutibilidade
  - Contador de números disponíveis/sorteados

- **Modo Jogador**
  - Marcação interativa de células
  - Feedback visual com animações
  - Modo mobile-first responsivo

- **Exportação & Compartilhamento**
  - Geração em lote (1 a 100 cartelas)
  - Preview das cartelas geradas
  - Exportação PNG/PDF (em desenvolvimento)
  - QR Codes por cartela (planejado)
  - Compartilhamento via WhatsApp

## 🗂️ Estrutura de Arquivos

```
src/features/bingo/
├── types.ts                      # TypeScript types & interfaces
├── index.ts                      # Public exports
│
├── state/
│   └── useBingoStore.ts         # Zustand store (config, cards, draw state)
│
├── logic/
│   ├── generateCard.ts          # Lógica de geração de cartela única
│   ├── generateDeck.ts          # Geração de múltiplas cartelas
│   ├── drawEngine.ts            # Motor de sorteio (RNG sementeado)
│   └── validators.ts            # Validações de config e uniqueness
│
├── components/
│   ├── BingoShell.tsx           # Shell principal (tabs, layout)
│   ├── SidebarConfigurator.tsx  # Painel de configuração
│   ├── CardGrid.tsx             # Grid da cartela (NxN)
│   ├── Cell.tsx                 # Célula individual (número/imagem/texto)
│   ├── TemplatesDrawer.tsx      # Drawer de templates
│   ├── HostPanel.tsx            # Painel de sorteio ao vivo
│   ├── AssetTray.tsx            # Galeria de imagens/textos (DnD)
│   └── ExportBar.tsx            # Barra de exportação/compartilhamento
│
└── dnd/
    └── DndProvider.tsx          # Provider @dnd-kit (drag-and-drop)
```

## 🚀 Como Usar

### Acessar o Módulo

1. Navegue para `/events/[id]/bingo` em qualquer evento
2. Ou clique em "Gerar Cartelas" na sidebar do evento

### Criar Cartelas Personalizadas

1. **Escolher Template** (opcional)
   - Clique em "Templates" e selecione um template pronto
   - Ou configure manualmente

2. **Configurar**
   - Defina o tamanho do grid (3x3, 4x4, 5x5)
   - Ajuste o intervalo de números (min/max)
   - Escolha o modo de distribuição
   - Ative casa central livre (se desejado)
   - Selecione paleta de cores
   - Habilite imagens por célula/central

3. **Editar Visualmente** (se imagens habilitadas)
   - Arraste imagens da biblioteca para as células
   - Faça upload de imagens personalizadas
   - Adicione textos customizados

4. **Gerar & Exportar**
   - Vá para a aba "Exportar"
   - Defina quantidade de cartelas (1-100)
   - Clique em "Gerar N Cartelas"
   - Exporte como PNG/PDF ou compartilhe

### Sortear ao Vivo

1. Vá para a aba "Sortear"
2. Clique em "Sortear" ou pressione Espaço
3. Os números aparecerão com animação
4. Visualize o histórico completo
5. Pressione "R" para resetar

### Jogar

1. Vá para a aba "Jogar"
2. Clique nas células para marcá-las
3. Acompanhe o sorteio do host

## 🎨 Design System

### Paletas de Cores

- **Lavanda** 🟣 (`lavender`) - Roxo pastel suave
- **Rosa** 🌸 (`rose`) - Rosa delicado
- **Menta** 🍃 (`mint`) - Verde suave
- **Pêssego** 🍑 (`peach`) - Laranja pastel
- **Céu** 🌤️ (`sky`) - Azul claro
- **Coral** 🪸 (`coral`) - Vermelho suave

### Animações

- Entrada de células: `fade-in` + `scale-in` (200-250ms)
- Sorteio de número: `rotate` + `scale` (spring animation)
- Marcação: círculo com `scale` suave
- Hover: `scale: 1.05` nas células

## 🔧 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript** - Tipagem completa
- **Zustand** - State management
- **Framer Motion** - Animações fluidas
- **@dnd-kit** - Drag and drop
- **shadcn/ui** - Componentes base
- **Tailwind CSS** - Estilização
- **seedrandom** - RNG determinístico

## 📊 Algoritmos

### Geração de Cartelas

1. **equalBuckets**: Divide o range em N faixas iguais (padrão para BINGO)
   - Exemplo: 1-75 em 5 colunas → [1-15, 16-30, 31-45, 46-60, 61-75]

2. **dozens**: Agrupa por dezenas
   - Exemplo: [1-9, 10-19, 20-29, ...]

3. **none**: Números aleatórios sem vínculo de coluna

### Anti-duplicatas

- Cada cartela gera um hash canônico (valores separados por `|`)
- Set para verificação O(1) de duplicatas
- Seed única por cartela derivada do master seed

## 🎯 Critérios de Aceite (QA)

✅ **Implementado**
- [x] Editor define grid (3/4/5), min/max, groupingMode, freeCenter
- [x] Cartela gerada válida (sem números repetidos; buckets/dezenas respeitados)
- [x] Drag-and-drop funciona para célula e centro
- [x] Sorteio não repete número; mantém histórico e reset
- [x] Geração de N cartelas sem duplicatas
- [x] Mobile-first: usável em telas pequenas
- [x] Animações suaves e feedback visual
- [x] Templates pré-definidos aplicáveis
- [x] Acessibilidade: foco visível, ARIA nas áreas de drop

⏳ **Planejado (v2)**
- [ ] Export PNG/PDF com alta resolução
- [ ] QR codes por cartela
- [ ] Padrões de vitória (linha/coluna/diag/X/moldura)
- [ ] Tempo real (canal Host → Jogadores)
- [ ] Auto-marcação sincronizada
- [ ] Relatórios (cartelas emitidas, vencedores)

## 🔗 Rotas & APIs

### Frontend
- `GET /events/[id]/bingo` - Página principal do bingo

### Backend (planejado)
- `POST /api/events/[id]/bingo/decks` - Criar deck
- `GET /api/events/[id]/bingo/decks/:deckId` - Buscar deck
- `POST /api/events/[id]/bingo/decks/:deckId/draw` - Registrar sorteio
- `POST /api/events/[id]/bingo/decks/:deckId/share` - Gerar links/QRs

## 📱 Mobile-First

- Sidebar colapsável em desktop
- Tabs horizontais com scroll em mobile
- Controles touch-friendly (56x56px mínimo)
- Gestos: tap para marcar, long-press para editar
- Bottom nav para atalhos rápidos

## 🎮 Atalhos de Teclado

### Modo Sorteio
- `Espaço` - Sortear próximo número
- `R` - Reset/Reiniciar sorteio

### Modo Editor (planejado)
- `Ctrl+Z` - Desfazer
- `Ctrl+Shift+Z` - Refazer
- `Ctrl+S` - Salvar template

## 🚧 Roadmap

### v1.1 (Próxima)
- [ ] Exportação PNG/PDF funcional (html2canvas, jsPDF)
- [ ] Geração de QR codes por cartela
- [ ] Links compartilháveis para jogadores
- [ ] Persistência em banco (Prisma)

### v2.0
- [ ] Tempo real com WebSockets
- [ ] Auto-marcação sincronizada
- [ ] Padrões de vitória configuráveis
- [ ] Confete/animação de vitória
- [ ] Multi-idioma (i18n)

### v3.0 (Outros Destacáveis)
- [ ] Quiz interativo
- [ ] Caça-palavras
- [ ] "Quem é mais provável que..."
- [ ] Liga-os-pontos

## 👨‍💻 Contribuindo

Para adicionar novos templates:

```typescript
// useBingoStore.ts
{
  id: 'meu-template',
  name: 'Meu Template',
  description: 'Descrição curta',
  config: {
    gridSize: 5,
    minNumber: 1,
    maxNumber: 60,
    groupingMode: 'none',
    theme: { palette: 'mint' },
    // ...
  },
}
```

## 📄 Licença

Parte do sistema Celebre - Gestão de Eventos.
