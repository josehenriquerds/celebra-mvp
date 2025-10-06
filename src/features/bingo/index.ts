// Components
export { BingoShell } from './components/BingoShell';
export { CardGrid } from './components/CardGrid';
export { Cell } from './components/Cell';
export { SidebarConfigurator } from './components/SidebarConfigurator';
export { TemplatesDrawer } from './components/TemplatesDrawer';
export { HostPanel } from './components/HostPanel';
export { AssetTray } from './components/AssetTray';
export { ExportBar } from './components/ExportBar';

// DnD
export { DndProvider } from './dnd/DndProvider';

// State
export { useBingoStore } from './state/useBingoStore';

// Logic
export { generateCard } from './logic/generateCard';
export { generateDeck, calculateMaxUniqueCards } from './logic/generateDeck';
export { DrawEngine } from './logic/drawEngine';
export { validateConfig, validateCardUniqueness, cardToHash } from './logic/validators';

// Types
export type {
  BingoConfig,
  CardCell,
  CardMatrix,
  DrawState,
  TemplateMeta,
  ViewMode,
  BingoDeck,
  DragItem,
  GroupingMode,
  GridSize,
  PaletteTheme,
} from './types';
