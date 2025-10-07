'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TablePlannerData, DecorElement } from '@/schemas'

interface PanOffset {
  x: number
  y: number
}

interface PlannerStore {
  // UI State
  zoom: number
  pan: PanOffset
  activeId: string | null
  activeType: 'guest' | 'table' | 'assignment' | 'element' | null

  // Data
  decorativeElements: DecorElement[]

  // History for undo/redo
  history: TablePlannerData[]
  historyIndex: number

  // Editing state
  editingTableId: string | null
  editingElementId: string | null
  showElementsPalette: boolean
  snapToGrid: boolean
  selectedTableId: string | null
  selectedElementId: string | null

  // Actions
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  setPan: (pan: PanOffset) => void
  setActiveId: (
    id: string | null,
    type: 'guest' | 'table' | 'assignment' | 'element' | null
  ) => void

  // Decorative Elements
  addElement: (element: DecorElement) => void
  updateElement: (id: string, updates: Partial<DecorElement>) => void
  deleteElement: (id: string) => void
  setElements: (elements: DecorElement[]) => void

  // History actions
  addToHistory: (data: TablePlannerData) => void
  undo: () => TablePlannerData | null
  redo: () => TablePlannerData | null
  canUndo: () => boolean
  canRedo: () => boolean

  // Editing actions
  setEditingTableId: (id: string | null) => void
  setEditingElementId: (id: string | null) => void
  toggleElementsPalette: () => void
  setSnapToGrid: (snap: boolean) => void
  setSelectedTableId: (id: string | null) => void
  setSelectedElementId: (id: string | null) => void

  // Reset
  reset: () => void
}

const initialState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  activeId: null,
  activeType: null,
  decorativeElements: [],
  history: [],
  historyIndex: -1,
  editingTableId: null,
  editingElementId: null,
  showElementsPalette: false,
  snapToGrid: true,
  selectedTableId: null,
  selectedElementId: null,
}

// Store factory para criar store por evento
export const createPlannerStore = (eventId: string) =>
  create<PlannerStore>()(
    persist(
      (set, get) => ({
        ...initialState,

        setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),

        zoomIn: () => set((state) => ({ zoom: Math.min(2, state.zoom + 0.1) })),

        zoomOut: () => set((state) => ({ zoom: Math.max(0.5, state.zoom - 0.1) })),

        setPan: (pan) => set({ pan }),

        setActiveId: (id, type) => set({ activeId: id, activeType: type }),

        // Decorative Elements
        addElement: (element) =>
          set((state) => ({
            decorativeElements: [...state.decorativeElements, element],
          })),

        updateElement: (id, updates) =>
          set((state) => ({
            decorativeElements: state.decorativeElements.map((el) =>
              el.id === id ? { ...el, ...updates } : el
            ),
          })),

        deleteElement: (id) =>
          set((state) => ({
            decorativeElements: state.decorativeElements.filter((el) => el.id !== id),
          })),

        setElements: (elements) => set({ decorativeElements: elements }),

        addToHistory: (data) => {
          const { history, historyIndex } = get()
          const newHistory = history.slice(0, historyIndex + 1)
          newHistory.push(JSON.parse(JSON.stringify(data)) as TablePlannerData)
          set({
            history: newHistory,
            historyIndex: newHistory.length - 1,
          })
        },

        undo: () => {
          const { history, historyIndex } = get()
          if (historyIndex > 0) {
            set({ historyIndex: historyIndex - 1 })
            return JSON.parse(
              JSON.stringify(history[historyIndex - 1])
            ) as TablePlannerData
          }
          return null
        },

        redo: () => {
          const { history, historyIndex } = get()
          if (historyIndex < history.length - 1) {
            set({ historyIndex: historyIndex + 1 })
            return JSON.parse(
              JSON.stringify(history[historyIndex + 1])
            ) as TablePlannerData
          }
          return null
        },

        canUndo: () => get().historyIndex > 0,

        canRedo: () => get().historyIndex < get().history.length - 1,

        setEditingTableId: (id) => set({ editingTableId: id }),

        setEditingElementId: (id) => set({ editingElementId: id }),

        toggleElementsPalette: () =>
          set((state) => ({ showElementsPalette: !state.showElementsPalette })),

        setSnapToGrid: (snap) => set({ snapToGrid: snap }),

        setSelectedTableId: (id) => set({ selectedTableId: id }),

        setSelectedElementId: (id) => set({ selectedElementId: id }),

        reset: () => set(initialState),
      }),
      {
        name: `planner-${eventId}`,
        partialize: (state) => ({
          zoom: state.zoom,
          pan: state.pan,
          decorativeElements: state.decorativeElements,
          snapToGrid: state.snapToGrid,
        }),
      }
    )
  )

// Default store (para compatibilidade com código existente)
export const usePlannerStore = createPlannerStore('default')

// Selectors (for performance optimization)
export const useZoom = () => usePlannerStore((state) => state.zoom)
export const usePan = () => usePlannerStore((state) => state.pan)
export const useActiveId = () => usePlannerStore((state) => state.activeId)
export const useActiveType = () => usePlannerStore((state) => state.activeType)
export const useCanUndo = () => usePlannerStore((state) => state.canUndo())
export const useCanRedo = () => usePlannerStore((state) => state.canRedo())
export const useShowElementsPalette = () =>
  usePlannerStore((state) => state.showElementsPalette)
export const useDecorativeElements = () =>
  usePlannerStore((state) => state.decorativeElements)
export const useSnapToGrid = () => usePlannerStore((state) => state.snapToGrid)
export const useSelectedTableId = () => usePlannerStore((state) => state.selectedTableId)
export const useSelectedElementId = () =>
  usePlannerStore((state) => state.selectedElementId)
