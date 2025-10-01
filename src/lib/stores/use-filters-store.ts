import { create } from 'zustand'

interface FiltersState {
  // Global date range
  dateRange: {
    from: Date | null
    to: Date | null
  }

  // Quick filters
  quickFilter: 'today' | 'week' | 'month' | 'all'

  // Actions
  setDateRange: (from: Date | null, to: Date | null) => void
  setQuickFilter: (filter: 'today' | 'week' | 'month' | 'all') => void
  reset: () => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  dateRange: {
    from: null,
    to: null,
  },
  quickFilter: 'all',

  setDateRange: (from, to) => set({ dateRange: { from, to }, quickFilter: 'all' }),

  setQuickFilter: (filter) => {
    const now = new Date()
    let from: Date | null = null
    let to: Date | null = null

    switch (filter) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        break
      case 'week':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        to = now
        break
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        to = now
        break
      case 'all':
        from = null
        to = null
        break
    }

    set({ quickFilter: filter, dateRange: { from, to } })
  },

  reset: () =>
    set({
      dateRange: { from: null, to: null },
      quickFilter: 'all',
    }),
}))
