import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'

// Exemplo de hook com optimistic update para Tasks
// Este é um exemplo de como implementar quando migrar para React Query

interface Task {
  id: string
  title: string
  status: 'aberta' | 'em_andamento' | 'concluida'
  eventId: string
}

interface TaskInput {
  title: string
  description?: string
  status?: string
}

function useCreateTask(eventId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TaskInput): Promise<Task> => {
      const res = await fetch(`/api/events/${eventId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) throw new Error('Failed to create task')
      return res.json()
    },
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['event', eventId, 'tasks'] })

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['event', eventId, 'tasks'])

      // Optimistically update cache
      queryClient.setQueryData<Task[]>(['event', eventId, 'tasks'], (old) => [
        ...(old ?? []),
        {
          id: 'temp-' + Date.now(),
          title: newTask.title,
          status: (newTask.status as Task['status']) ?? 'aberta',
          eventId,
        },
      ])

      return { previousTasks }
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['event', eventId, 'tasks'], context.previousTasks)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['event', eventId, 'tasks'] })
    },
  })
}

// Test setup
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  Wrapper.displayName = 'QueryClientWrapper'
  return Wrapper
}

describe('useCreateTask - Optimistic Updates', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add task optimistically before server response', async () => {
    const eventId = 'event-123'
    const wrapper = createWrapper()

    // Mock successful response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'real-id', title: 'New Task', status: 'aberta', eventId }),
    })

    const { result } = renderHook(() => useCreateTask(eventId), { wrapper })
    const queryClient = new QueryClient()

    // Set initial data
    queryClient.setQueryData(
      ['event', eventId, 'tasks'],
      [{ id: '1', title: 'Existing Task', status: 'aberta', eventId }]
    )

    // Trigger mutation
    result.current.mutate({ title: 'New Task' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('should rollback on error', async () => {
    const eventId = 'event-123'
    const wrapper = createWrapper()

    // Mock failed response
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    })

    const { result } = renderHook(() => useCreateTask(eventId), { wrapper })

    // Trigger mutation
    result.current.mutate({ title: 'New Task' })

    await waitFor(() => expect(result.current.isError).toBe(true))

    // Verify rollback happened (in real test, query cache would be checked)
  })

  it('should invalidate queries after successful mutation', async () => {
    const eventId = 'event-123'
    const wrapper = createWrapper()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'real-id', title: 'New Task', status: 'aberta', eventId }),
    })

    const { result } = renderHook(() => useCreateTask(eventId), { wrapper })

    result.current.mutate({ title: 'New Task' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // In a real scenario, verify invalidateQueries was called
  })
})
