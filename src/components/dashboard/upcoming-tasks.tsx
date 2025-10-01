import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  dueDate: Date
  category: string
  priority: 'low' | 'medium' | 'high'
}

interface UpcomingTasksProps {
  tasks: Task[]
  eventId: string
}

export function UpcomingTasks({ tasks, eventId }: UpcomingTasksProps) {
  const getSLABadge = (dueDate: Date) => {
    const now = new Date()
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilDue < 0) {
      return <Badge variant="destructive">Vencida</Badge>
    }
    if (hoursUntilDue < 24) {
      return <Badge className="bg-yellow-500">Urgente</Badge>
    }
    return <Badge className="bg-green-500">No prazo</Badge>
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-neutral-600" />
          <h2 className="text-lg font-semibold text-neutral-900">Próximas Tarefas</h2>
        </div>
        <Link href={`/events/${eventId}/tasks`}>
          <Button variant="ghost" size="sm">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-500">Nenhuma tarefa pendente</p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 transition-colors hover:bg-neutral-100"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">{task.title}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {task.category} • {task.dueDate.toLocaleDateString('pt-BR')}
                </p>
              </div>
              {getSLABadge(task.dueDate)}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
