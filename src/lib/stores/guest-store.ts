import { create } from 'zustand'

interface GuestState {
  selectedGuests: string[]
  toggleGuest: (id: string) => void
  clearSelection: () => void
  selectAll: (ids: string[]) => void
  isSelected: (id: string) => boolean
}

export const useGuestStore = create<GuestState>((set, get) => ({
  selectedGuests: [],

  toggleGuest: (id) =>
    set((state) => ({
      selectedGuests: state.selectedGuests.includes(id)
        ? state.selectedGuests.filter((guestId) => guestId !== id)
        : [...state.selectedGuests, id],
    })),

  clearSelection: () => set({ selectedGuests: [] }),

  selectAll: (ids) => set({ selectedGuests: ids }),

  isSelected: (id) => get().selectedGuests.includes(id),
}))
