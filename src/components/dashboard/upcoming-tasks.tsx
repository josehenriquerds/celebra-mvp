import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  dueDate: Date;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

interface UpcomingTasksProps {
  tasks: Task[];
  eventId: string;
}

export function UpcomingTasks({ tasks, eventId }: UpcomingTasksProps) {
  const getSLABadge = (dueDate: Date) => {
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDue < 0) {
      return <Badge variant="destructive">Vencida</Badge>;
    }
    if (hoursUntilDue < 24) {
      return <Badge className="bg-yellow-500">Urgente</Badge>;
    }
    return <Badge className="bg-green-500">No prazo</Badge>;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-neutral-600" />
          <h2 className="text-lg font-semibold text-neutral-900">
            Próximas Tarefas
          </h2>
        </div>
        <Link href={`/events/${eventId}/tasks`}>
          <Button variant="ghost" size="sm">
            Ver todas
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-8">
            Nenhuma tarefa pendente
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-neutral-900 text-sm">
                  {task.title}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  {task.category} • {task.dueDate.toLocaleDateString('pt-BR')}
                </p>
              </div>
              {getSLABadge(task.dueDate)}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
