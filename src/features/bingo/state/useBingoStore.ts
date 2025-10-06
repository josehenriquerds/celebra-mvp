import { create } from 'zustand';
import type {
  BingoConfig,
  CardMatrix,
  DrawState,
  TemplateMeta,
  ViewMode,
  FreeLayer,
} from '../types';
import { generateCard } from '../logic/generateCard';
import { generateDeck } from '../logic/generateDeck';
import { DrawEngine } from '../logic/drawEngine';

interface BingoStore {
  // Configuração
  config: BingoConfig;
  setConfig: (config: Partial<BingoConfig>) => void;

  // Cartelas
  currentCard: CardMatrix | null;
  deckCards: CardMatrix[];
  generateNewCard: () => void;
  generateMultipleCards: (count: number) => void;
  updateCell: (row: number, col: number, updates: Partial<CardMatrix['cells'][0]>) => void;

  // Sorteio (Host)
  drawEngine: DrawEngine | null;
  initDrawEngine: () => void;
  drawNumber: () => number | null;
  resetDraw: () => void;

  // UI
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Templates
  templates: TemplateMeta[];
  applyTemplate: (templateId: string) => void;
  saveTemplate: (name: string, description?: string) => void;

  // Free Layers (novo)
  freeLayers: FreeLayer[];
  selectedLayerId: string | null;
  snapToGrid: boolean;
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

const defaultConfig: BingoConfig = {
  gridSize: 5,
  minNumber: 1,
  maxNumber: 75,
  freeCenter: true,
  groupingMode: 'equalBuckets',
  columnsLabels: ['B', 'I', 'N', 'G', 'O'],
  theme: {
    palette: 'lavender',
  },
  allowImagesPerCell: false,
  allowCenterImage: false,
  seed: Date.now().toString(),
  title: 'Meu Bingo',
  showTitle: true,
  cellTheme: {
    pattern: 'none',
    colorA: 'bg-purple-50',
    colorB: 'bg-pink-50',
  },
};

const defaultTemplates: TemplateMeta[] = [
  {
    id: 'traditional',
    name: 'Bingo Tradicional',
    description: '5x5, números 1-75, casa central livre',
    config: {
      gridSize: 5,
      minNumber: 1,
      maxNumber: 75,
      freeCenter: true,
      groupingMode: 'equalBuckets',
      columnsLabels: ['B', 'I', 'N', 'G', 'O'],
      theme: { palette: 'lavender' },
      allowImagesPerCell: false,
      allowCenterImage: false,
    },
  },
  {
    id: 'baby-shower',
    name: 'Chá de Bebê',
    description: '5x5 personalizado com ícones',
    config: {
      gridSize: 5,
      minNumber: 1,
      maxNumber: 50,
      freeCenter: true,
      groupingMode: 'none',
      theme: { palette: 'mint' },
      allowImagesPerCell: true,
      allowCenterImage: true,
    },
  },
  {
    id: 'lingerie-shower',
    name: 'Chá de Lingerie',
    description: '5x5 personalizado, tema coral/peach',
    config: {
      gridSize: 5,
      minNumber: 1,
      maxNumber: 50,
      freeCenter: true,
      groupingMode: 'none',
      theme: { palette: 'coral' },
      allowImagesPerCell: true,
      allowCenterImage: true,
    },
  },
  {
    id: 'custom',
    name: 'Bingo Personalizado',
    description: 'Grade e intervalo livres',
    config: {
      gridSize: 5,
      minNumber: 1,
      maxNumber: 60,
      freeCenter: false,
      groupingMode: 'none',
      theme: { palette: 'sky' },
      allowImagesPerCell: true,
      allowCenterImage: true,
    },
  },
];

export const useBingoStore = create<BingoStore>((set, get) => ({
  config: defaultConfig,
  currentCard: null,
  deckCards: [],
  drawEngine: null,
  viewMode: 'editor',
  templates: defaultTemplates,
  freeLayers: [],
  selectedLayerId: null,
  snapToGrid: false,

  setConfig: (updates) =>
    set((state) => ({
      config: { ...state.config, ...updates },
    })),

  generateNewCard: () => {
    const { config } = get();
    const card = generateCard(config);
    set({ currentCard: card });
  },

  generateMultipleCards: (count) => {
    const { config } = get();
    const result = generateDeck(config, { count });
    set({ deckCards: result.cards });
  },

  updateCell: (row, col, updates) => {
    const { currentCard } = get();
    if (!currentCard) return;

    const cells = currentCard.cells.map((cell) => {
      if (cell.row === row && cell.col === col) {
        return { ...cell, ...updates };
      }
      return cell;
    });

    set({ currentCard: { cells } });
  },

  initDrawEngine: () => {
    const { config } = get();
    const engine = new DrawEngine(config.minNumber, config.maxNumber, config.seed);
    set({ drawEngine: engine });
  },

  drawNumber: () => {
    const { drawEngine } = get();
    if (!drawEngine) return null;
    return drawEngine.draw();
  },

  resetDraw: () => {
    const { drawEngine } = get();
    if (!drawEngine) return;
    drawEngine.reset();
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  applyTemplate: (templateId) => {
    const { templates } = get();
    const template = templates.find((t) => t.id === templateId);

    if (template) {
      set((state) => ({
        config: { ...state.config, ...template.config },
      }));
      // Gerar nova cartela com o template
      get().generateNewCard();
    }
  },

  saveTemplate: (name, description) => {
    const { config, templates } = get();

    const newTemplate: TemplateMeta = {
      id: `custom-${Date.now()}`,
      name,
      description,
      config,
    };

    set({ templates: [...templates, newTemplate] });
  },

  // Free Layers actions
  addFreeLayer: (layer) => {
    set((s) => ({
      freeLayers: [
        ...s.freeLayers,
        { ...layer, id: `layer-${Date.now()}`, zIndex: s.freeLayers.length },
      ],
    }));
  },

  updateFreeLayer: (id, updates) => {
    set((s) => ({
      freeLayers: s.freeLayers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  },

  deleteFreeLayer: (id) => {
    set((s) => ({
      freeLayers: s.freeLayers.filter((l) => l.id !== id),
      selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId,
    }));
  },

  setSelectedLayer: (id) => set({ selectedLayerId: id }),

  bringToFront: (id) => {
    set((s) => {
      const maxZ = Math.max(...s.freeLayers.map((l) => l.zIndex), 0);
      return {
        freeLayers: s.freeLayers.map((l) => (l.id === id ? { ...l, zIndex: maxZ + 1 } : l)),
      };
    });
  },

  sendToBack: (id) => {
    set((s) => {
      const minZ = Math.min(...s.freeLayers.map((l) => l.zIndex), 0);
      return {
        freeLayers: s.freeLayers.map((l) => (l.id === id ? { ...l, zIndex: minZ - 1 } : l)),
      };
    });
  },

  duplicateLayer: (id) => {
    set((s) => {
      const layer = s.freeLayers.find((l) => l.id === id);
      if (!layer) return s;
      return {
        freeLayers: [
          ...s.freeLayers,
          { ...layer, id: `layer-${Date.now()}`, x: layer.x + 20, y: layer.y + 20 },
        ],
      };
    });
  },

  replaceLayerAsset: (id, newUrl) => {
    set((s) => ({
      freeLayers: s.freeLayers.map((l) => (l.id === id ? { ...l, assetUrl: newUrl } : l)),
    }));
  },

  toggleSnapToGrid: () => set((s) => ({ snapToGrid: !s.snapToGrid })),
}));
