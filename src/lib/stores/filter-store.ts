import { create } from 'zustand'

interface GuestFilters {
  rsvp?: 'yes' | 'no' | 'pending'
  isVip?: boolean
  hasChildren?: boolean
  hasPhone?: boolean
  tags?: string[]
}

interface TaskFilters {
  status?: 'backlog' | 'doing' | 'done'
  priority?: 'low' | 'medium' | 'high'
  assignee?: string
}

interface VendorFilters {
  category?: string
  city?: string
  status?: 'pending' | 'approved' | 'rejected' | 'suspended'
}

interface FilterState {
  guests: GuestFilters
  tasks: TaskFilters
  vendors: VendorFilters
  setGuestFilter: <K extends keyof GuestFilters>(key: K, value: GuestFilters[K]) => void
  clearGuestFilters: () => void
  setTaskFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
  clearTaskFilters: () => void
  setVendorFilter: <K extends keyof VendorFilters>(key: K, value: VendorFilters[K]) => void
  clearVendorFilters: () => void
}

export const useFilterStore = create<FilterState>((set) => ({
  guests: {},
  tasks: {},
  vendors: {},

  setGuestFilter: (key, value) =>
    set((state) => ({
      guests: { ...state.guests, [key]: value },
    })),

  clearGuestFilters: () => set({ guests: {} }),

  setTaskFilter: (key, value) =>
    set((state) => ({
      tasks: { ...state.tasks, [key]: value },
    })),

  clearTaskFilters: () => set({ tasks: {} }),

  setVendorFilter: (key, value) =>
    set((state) => ({
      vendors: { ...state.vendors, [key]: value },
    })),

  clearVendorFilters: () => set({ vendors: {} }),
}))
