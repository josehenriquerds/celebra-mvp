import { create } from 'zustand'

export type TaskStatus = 'aberta' | 'em_andamento' | 'concluida' | 'atrasada'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  assigneeUserId?: string
  dueAt?: Date
  slaHours?: number
  relatedVendorId?: string
  createdAt: Date
  updatedAt: Date
}

interface TasksState {
  tasks: Task[]
  activeTaskId: string | null
  filterAssignee: string | null
  filterDate: Date | null

  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  deleteTask: (id: string) => void
  setActiveTaskId: (id: string | null) => void
  setFilterAssignee: (userId: string | null) => void
  setFilterDate: (date: Date | null) => void
}

export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  activeTaskId: null,
  filterAssignee: null,
  filterDate: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    })),

  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  setActiveTaskId: (id) => set({ activeTaskId: id }),

  setFilterAssignee: (userId) => set({ filterAssignee: userId }),

  setFilterDate: (date) => set({ filterDate: date }),
}))
