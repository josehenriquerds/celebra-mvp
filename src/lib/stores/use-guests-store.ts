import { create } from 'zustand';

export type GuestFilter =
  | 'all'
  | 'confirmed'
  | 'pending'
  | 'declined'
  | 'vip'
  | 'children'
  | 'no-phone'
  | 'vendors';

interface GuestsState {
  // Filters
  activeFilters: GuestFilter[];
  searchQuery: string;

  // Selection
  selectedGuestIds: string[];

  // Pagination
  page: number;
  pageSize: number;

  // Actions
  setActiveFilters: (filters: GuestFilter[]) => void;
  toggleFilter: (filter: GuestFilter) => void;
  setSearchQuery: (query: string) => void;
  setSelectedGuestIds: (ids: string[]) => void;
  toggleGuestSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

const initialState = {
  activeFilters: ['all'] as GuestFilter[],
  searchQuery: '',
  selectedGuestIds: [],
  page: 1,
  pageSize: 10,
};

export const useGuestsStore = create<GuestsState>((set) => ({
  ...initialState,

  setActiveFilters: (filters) => set({ activeFilters: filters, page: 1 }),

  toggleFilter: (filter) =>
    set((state) => {
      const isActive = state.activeFilters.includes(filter);
      let newFilters: GuestFilter[];

      if (filter === 'all') {
        newFilters = ['all'];
      } else if (isActive) {
        newFilters = state.activeFilters.filter((f) => f !== filter);
        if (newFilters.length === 0) newFilters = ['all'];
      } else {
        newFilters = state.activeFilters.filter((f) => f !== 'all');
        newFilters.push(filter);
      }

      return { activeFilters: newFilters, page: 1 };
    }),

  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),

  setSelectedGuestIds: (ids) => set({ selectedGuestIds: ids }),

  toggleGuestSelection: (id) =>
    set((state) => ({
      selectedGuestIds: state.selectedGuestIds.includes(id)
        ? state.selectedGuestIds.filter((gid) => gid !== id)
        : [...state.selectedGuestIds, id],
    })),

  selectAll: (ids) => set({ selectedGuestIds: ids }),

  clearSelection: () => set({ selectedGuestIds: [] }),

  setPage: (page) => set({ page }),

  setPageSize: (size) => set({ pageSize: size, page: 1 }),

  reset: () => set(initialState),
}));
