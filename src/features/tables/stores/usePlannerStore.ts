'use client'

import { create } from 'zustand'
import type { TablePlannerData } from '@/schemas'

interface PlannerStore {
  // UI State
  zoom: number
  activeId: string | null
  activeType: 'guest' | 'table' | 'assignment' | 'element' | null

  // History for undo/redo
  history: TablePlannerData[]
  historyIndex: number

  // Editing state
  editingTableId: string | null
  editingElementId: string | null
  showElementsPalette: boolean

  // Actions
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  setActiveId: (
    id: string | null,
    type: 'guest' | 'table' | 'assignment' | 'element' | null
  ) => void

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

  // Reset
  reset: () => void
}

const initialState = {
  zoom: 1,
  activeId: null,
  activeType: null,
  history: [],
  historyIndex: -1,
  editingTableId: null,
  editingElementId: null,
  showElementsPalette: false,
}

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  ...initialState,

  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),

  zoomIn: () => set((state) => ({ zoom: Math.min(2, state.zoom + 0.1) })),

  zoomOut: () => set((state) => ({ zoom: Math.max(0.5, state.zoom - 0.1) })),

  setActiveId: (id, type) => set({ activeId: id, activeType: type }),

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
      return JSON.parse(JSON.stringify(history[historyIndex - 1])) as TablePlannerData
    }
    return null
  },

  redo: () => {
    const { history, historyIndex } = get()
    if (historyIndex < history.length - 1) {
      set({ historyIndex: historyIndex + 1 })
      return JSON.parse(JSON.stringify(history[historyIndex + 1])) as TablePlannerData
    }
    return null
  },

  canUndo: () => get().historyIndex > 0,

  canRedo: () => get().historyIndex < get().history.length - 1,

  setEditingTableId: (id) => set({ editingTableId: id }),

  setEditingElementId: (id) => set({ editingElementId: id }),

  toggleElementsPalette: () =>
    set((state) => ({ showElementsPalette: !state.showElementsPalette })),

  reset: () => set(initialState),
}))

// Selectors (for performance optimization)
export const useZoom = () => usePlannerStore((state) => state.zoom)
export const useActiveId = () => usePlannerStore((state) => state.activeId)
export const useActiveType = () => usePlannerStore((state) => state.activeType)
export const useCanUndo = () => usePlannerStore((state) => state.canUndo())
export const useCanRedo = () => usePlannerStore((state) => state.canRedo())
export const useShowElementsPalette = () => usePlannerStore((state) => state.showElementsPalette)
