'use client'

import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
 useDroppable, useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  DollarSign,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTasks, useUpdateTask, useCreateTask } from '@/hooks'
import { formatDate, formatTime, getSLABadgeColor } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'aberta' | 'em_andamento' | 'concluida'
  dueAt: string | null
  slaHours: number | null
  assignedTo: string | null
  vendor: {
    id: string
    name: string
  } | null
  cost: number | null
}

interface TasksData {
  aberta: Task[]
  em_andamento: Task[]
  concluida: Task[]
}

const SLA_BADGE_CLASSES: Record<'success' | 'warning' | 'danger', string> = {
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
}

// Draggable Task Card
function DraggableTask({ task }: { task: Task }) {
  const slaStatus = task.dueAt ? getSLABadgeColor(task.dueAt) : null
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-3 cursor-grab rounded-xl border bg-white p-4 transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-sm font-semibold text-celebre-ink">{task.title}</h3>
        {slaStatus && (
          <Badge variant="outline" className={`ml-2 text-xs ${SLA_BADGE_CLASSES[slaStatus]}`}>
            {slaStatus === 'danger' ? 'Atrasada' : 'No prazo'}
          </Badge>
        )}
      </div>

      {task.description && (
        <p className="mb-3 line-clamp-2 text-xs text-celebre-muted">{task.description}</p>
      )}

      <div className="space-y-1">
        {task.dueAt && (
          <div className="flex items-center gap-2 text-xs text-celebre-muted">
            <Calendar className="size-3" />
            <span>
              {formatDate(task.dueAt)} às {formatTime(task.dueAt)}
            </span>
          </div>
        )}
        {task.assignedTo && (
          <div className="flex items-center gap-2 text-xs text-celebre-muted">
            <User className="size-3" />
            <span>{task.assignedTo}</span>
          </div>
        )}
        {task.vendor && (
          <div className="flex items-center gap-2 text-xs text-celebre-muted">
            <span>🏢</span>
            <span>{task.vendor.name}</span>
          </div>
        )}
        {task.cost && (
          <div className="flex items-center gap-2 text-xs text-celebre-muted">
            <DollarSign className="size-3" />
            <span>R$ {task.cost.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Droppable Column
function DroppableColumn({
  status,
  tasks,
  title,
  icon: Icon,
  color,
}: {
  status: string
  tasks: Task[]
  title: string
  icon: LucideIcon
  color: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-celebre-accent/20 min-w-[300px] flex-1 rounded-xl p-4 ${isOver ? 'ring-celebre-brand ring-2' : ''}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <Icon className={`size-5 ${color}`} />
        <h2 className="font-heading font-semibold text-celebre-ink">{title}</h2>
        <Badge variant="outline" className="ml-auto">
          {tasks.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="py-8 text-center text-celebre-muted">
            <p className="text-sm">Nenhuma tarefa</p>
          </div>
        ) : (
          tasks.map((task) => <DraggableTask key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}

export default function TasksPage() {
  const params = useParams()
  const eventId = params.id as string

  const [activeId, setActiveId] = useState<string | null>(null)
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueAt: '',
    assignedTo: '',
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Use backend API via TanStack Query
  const { data: tasks = [], isLoading: loading } = useTasks(eventId)
  const updateTaskMutation = useUpdateTask(eventId)
  const createTaskMutation = useCreateTask(eventId)

  // Group tasks by status
  const data = useMemo<TasksData>(() => {
    const grouped: TasksData = {
      aberta: [],
      em_andamento: [],
      concluida: [],
    }

    tasks.forEach((task: Task) => {
      if (task.status in grouped) {
        grouped[task.status].push(task)
      }
    })

    return grouped
  }, [tasks])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as 'aberta' | 'em_andamento' | 'concluida'

    // Find the task
    const allTasks = [...data.aberta, ...data.em_andamento, ...data.concluida]
    const task = allTasks.find((t) => t.id === taskId)

    if (!task || task.status === newStatus) return

    // Update task status via backend API with optimistic update
    updateTaskMutation.mutate({
      id: taskId,
      data: { status: newStatus },
    })
  }

  async function handleCreateTask() {
    if (!newTask.title) return

    createTaskMutation.mutate({
      title: newTask.title,
      description: newTask.description || undefined,
      dueAt: newTask.dueAt ? new Date(newTask.dueAt).toISOString() : undefined,
      assignedTo: newTask.assignedTo || undefined,
      status: 'aberta',
    } as any, {
      onSuccess: () => {
        setNewTask({ title: '', description: '', dueAt: '', assignedTo: '' })
        setShowNewTaskForm(false)
      },
    })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="border-celebre-brand mx-auto mb-4 size-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-celebre-muted">Carregando tarefas...</p>
        </div>
      </div>
    )
  }

  const allTasks = [...data.aberta, ...data.em_andamento, ...data.concluida]
  const activeTask = allTasks.find((t) => t.id === activeId)

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="shadow-celebre border-b bg-white">
        <div className="max-w-full px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading text-3xl font-bold text-celebre-ink">
                  Gestão de Tarefas
                </h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  {allTasks.length} tarefa{allTasks.length !== 1 ? 's' : ''} no total
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowNewTaskForm(true)}>
              <Plus className="mr-2 size-4" />
              Nova Tarefa
            </Button>
          </div>
        </div>
      </header>

      {/* New Task Form */}
      {showNewTaskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="font-heading">Nova Tarefa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-celebre-ink">Título</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Ex: Confirmar buffet"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-celebre-ink">Descrição</label>
                <Input
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detalhes da tarefa..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-celebre-ink">Prazo</label>
                <Input
                  type="datetime-local"
                  value={newTask.dueAt}
                  onChange={(e) => setNewTask({ ...newTask, dueAt: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-celebre-ink">Responsável</label>
                <Input
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  placeholder="Nome do responsável"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowNewTaskForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleCreateTask} className="flex-1">
                  Criar Tarefa
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Kanban Board */}
      <main className="max-w-full px-4 py-8 sm:px-6 lg:px-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            <DroppableColumn
              status="aberta"
              tasks={data.aberta}
              title="Aberta"
              icon={Clock}
              color="text-gray-600"
            />
            <DroppableColumn
              status="em_andamento"
              tasks={data.em_andamento}
              title="Em Andamento"
              icon={AlertCircle}
              color="text-yellow-600"
            />
            <DroppableColumn
              status="concluida"
              tasks={data.concluida}
              title="Concluída"
              icon={CheckCircle}
              color="text-green-600"
            />
          </div>

          <DragOverlay>
            {activeId && activeTask && (
              <div className="border-celebre-brand rounded-xl border-2 bg-white p-4 shadow-lg">
                <h3 className="text-sm font-semibold text-celebre-ink">{activeTask.title}</h3>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  )
}
