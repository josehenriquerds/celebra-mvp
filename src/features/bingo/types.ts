export type GroupingMode = 'equalBuckets' | 'dozens' | 'none';
export type GridSize = 3 | 4 | 5;
export type PaletteTheme = 'lavender' | 'rose' | 'mint' | 'peach' | 'sky' | 'coral';
export type LayerType = 'image' | 'sticker' | 'text' | 'shape' | 'mask';
export type CellPattern = 'chess' | 'row-stripes' | 'col-stripes' | 'none';
export type ClipType = 'circle' | 'rounded' | 'none';

export interface FreeLayer {
  id: string;
  type: LayerType;
  url?: string; // for images
  content?: string; // for text
  assetUrl?: string; // legacy support
  text?: string; // legacy support
  position: { x: number; y: number };
  size: { width: number; height: number };
  x?: number; // legacy support
  y?: number; // legacy support
  width?: number; // legacy support
  height?: number; // legacy support
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  placeholderId?: string;
  clip?: ClipType;
  opacity?: number;
  // Text-specific
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  // Shape-specific
  shape?: 'rectangle' | 'circle';
}

export interface CellTheme {
  pattern: CellPattern;
  colorA: string;
  colorB: string;
}

export interface BingoConfig {
  gridSize: GridSize;
  minNumber: number;
  maxNumber: number;
  freeCenter: boolean;
  groupingMode: GroupingMode;
  columnsLabels?: string[];
  theme: {
    palette: PaletteTheme;
    accentHex?: string;
  };
  allowImagesPerCell: boolean;
  allowCenterImage: boolean;
  seed?: string;
  title?: string;
  showTitle?: boolean;
  cellTheme?: CellTheme;
}

export interface CardCell {
  row: number;
  col: number;
  value?: number;
  imageUrl?: string;
  text?: string;
  marked?: boolean;
}

export interface CardMatrix {
  cells: CardCell[];
  freeLayers?: FreeLayer[];
  title?: string;
  cellTheme?: CellTheme;
}

export interface DrawState {
  available: number[];
  drawn: number[];
  last?: number;
  rngSeed?: string;
}

export interface TemplateMeta {
  id: string;
  name: string;
  description?: string;
  config: Partial<BingoConfig>;
  assets?: string[];
  placeholders?: FreeLayer[];
}

export type ViewMode = 'editor' | 'host' | 'player' | 'preview';

export interface BingoDeck {
  id: string;
  eventId: string;
  config: BingoConfig;
  cards: CardMatrix[];
  createdAt: Date;
}

export interface DragItem {
  type: 'image' | 'text';
  id: string;
  url?: string;
  content?: string;
}
