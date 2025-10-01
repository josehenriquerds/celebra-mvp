import { StatCard } from './stat-card'
import { DonutChart } from '@/components/ui/donut-chart'
import { Users, DollarSign, CheckSquare, Calendar } from 'lucide-react'

interface KPIData {
  rsvps: {
    yes: number
    no: number
    pending: number
  }
  budget: {
    total: number
    used: number
  }
  tasks: {
    done: number
    total: number
  }
  totalGuests: number
}

interface KPIGridProps {
  data: KPIData
}

export function KPIGrid({ data }: KPIGridProps) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100)
  }

  const rsvpPercentage =
    data.totalGuests > 0 ? Math.round((data.rsvps.yes / data.totalGuests) * 100) : 0

  const budgetPercentage =
    data.budget.total > 0 ? Math.round((data.budget.used / data.budget.total) * 100) : 0

  const tasksPercentage =
    data.tasks.total > 0 ? Math.round((data.tasks.done / data.tasks.total) * 100) : 0

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={Users}
        title="Confirmações"
        value={`${data.rsvps.yes}/${data.totalGuests}`}
        description={`${rsvpPercentage}% confirmaram presença`}
      />

      <StatCard
        icon={DollarSign}
        title="Orçamento"
        value={formatCurrency(data.budget.used)}
        description={`${budgetPercentage}% de ${formatCurrency(data.budget.total)}`}
      />

      <StatCard
        icon={CheckSquare}
        title="Progresso de Tarefas"
        value={`${data.tasks.done}/${data.tasks.total}`}
        description={`${tasksPercentage}% concluídas`}
      />

      <StatCard
        icon={Calendar}
        title="Total de Convidados"
        value={data.totalGuests.toString()}
        description={`${data.rsvps.pending} aguardando resposta`}
      />
    </div>
  )
}
