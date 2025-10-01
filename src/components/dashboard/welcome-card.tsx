import { Card } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'

interface WelcomeCardProps {
  eventName: string
  userName?: string
  eventDate?: Date
  daysUntilEvent?: number
}

export function WelcomeCard({
  eventName,
  userName = 'Organizador',
  eventDate,
  daysUntilEvent,
}: WelcomeCardProps) {
  return (
    <Card className="bg-gradient-to-br from-[#863F44] to-[#a85560] p-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <p className="text-sm font-medium opacity-90">Bem-vindo(a)</p>
          </div>
          <h1 className="mb-1 text-2xl font-bold">{eventName}</h1>
          <p className="text-sm opacity-90">
            Olá, {userName}! Vamos tornar este evento inesquecível.
          </p>
          {daysUntilEvent !== undefined && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <span className="text-2xl font-bold">{daysUntilEvent}</span>
              <span className="text-sm">{daysUntilEvent === 1 ? 'dia' : 'dias'} até o evento</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
