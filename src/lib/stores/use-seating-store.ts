import { create } from 'zustand'

export interface SeatAssignment {
  id: string
  guestId: string
  seatId: string
  locked: boolean
}

export interface Seat {
  id: string
  tableId: string
  index: number
  x: number
  y: number
  rotation: number
}

export interface Table {
  id: string
  label: string
  capacity: number
  zone?: string
  x: number
  y: number
  rotation: number
  shape: 'round' | 'square' | 'rect'
  seats: Seat[]
}

interface SeatingState {
  tables: Table[]
  assignments: SeatAssignment[]
  history: SeatAssignment[][]
  historyIndex: number
  selectedTableId: string | null

  // Actions
  setTables: (tables: Table[]) => void
  setAssignments: (assignments: SeatAssignment[]) => void
  assignGuestToSeat: (guestId: string, seatId: string) => void
  unassignSeat: (seatId: string) => void
  lockAssignment: (assignmentId: string, locked: boolean) => void
  setSelectedTableId: (id: string | null) => void

  // Undo/Redo
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // Auto-allocation
  autoAllocateByHousehold: () => void
  autoAllocateVIPs: () => void
}

export const useSeatingStore = create<SeatingState>((set, get) => ({
  tables: [],
  assignments: [],
  history: [[]],
  historyIndex: 0,
  selectedTableId: null,

  setTables: (tables) => set({ tables }),

  setAssignments: (assignments) =>
    set({
      assignments,
      history: [assignments],
      historyIndex: 0,
    }),

  assignGuestToSeat: (guestId, seatId) =>
    set((state) => {
      const newAssignments = state.assignments.filter(
        (a) => a.seatId !== seatId && a.guestId !== guestId
      )
      newAssignments.push({
        id: `${guestId}-${seatId}`,
        guestId,
        seatId,
        locked: false,
      })

      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(newAssignments)

      return {
        assignments: newAssignments,
        history: newHistory,
        historyIndex: state.historyIndex + 1,
      }
    }),

  unassignSeat: (seatId) =>
    set((state) => {
      const newAssignments = state.assignments.filter((a) => a.seatId !== seatId)

      const newHistory = state.history.slice(0, state.historyIndex + 1)
      newHistory.push(newAssignments)

      return {
        assignments: newAssignments,
        history: newHistory,
        historyIndex: state.historyIndex + 1,
      }
    }),

  lockAssignment: (assignmentId, locked) =>
    set((state) => ({
      assignments: state.assignments.map((a) => (a.id === assignmentId ? { ...a, locked } : a)),
    })),

  setSelectedTableId: (id) => set({ selectedTableId: id }),

  undo: () =>
    set((state) => {
      if (state.historyIndex > 0) {
        return {
          historyIndex: state.historyIndex - 1,
          assignments: state.history[state.historyIndex - 1],
        }
      }
      return state
    }),

  redo: () =>
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          historyIndex: state.historyIndex + 1,
          assignments: state.history[state.historyIndex + 1],
        }
      }
      return state
    }),

  canUndo: () => get().historyIndex > 0,

  canRedo: () => get().historyIndex < get().history.length - 1,

  autoAllocateByHousehold: () => {
    // Implementation would go here
  },

  autoAllocateVIPs: () => {
    // Implementation would go here
  },
}))
