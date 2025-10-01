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
  setGuestFilter: (key: keyof GuestFilters, value: any) => void
  clearGuestFilters: () => void
  setTaskFilter: (key: keyof TaskFilters, value: any) => void
  clearTaskFilters: () => void
  setVendorFilter: (key: keyof VendorFilters, value: any) => void
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
