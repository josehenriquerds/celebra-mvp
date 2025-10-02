'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  Cake,
  Music,
  DoorClosed,
  DoorOpen,
  UtensilsCrossed,
  Music2,
  WineIcon,
  Camera,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ElementType } from '@/schemas'

interface ElementDef {
  type: ElementType
  label: string
  icon: React.ComponentType<{ className?: string; color?: string }>
  color: string
  defaultWidth: number
  defaultHeight: number
}

const ELEMENT_DEFS: ElementDef[] = [
  {
    type: 'cakeTable',
    label: 'Mesa do Bolo',
    icon: Cake,
    color: '#fbbf24',
    defaultWidth: 120,
    defaultHeight: 80,
  },
  {
    type: 'danceFloor',
    label: 'Pista de Dança',
    icon: Music,
    color: '#8b5cf6',
    defaultWidth: 200,
    defaultHeight: 200,
  },
  {
    type: 'restroom',
    label: 'Banheiro',
    icon: DoorClosed,
    color: '#6b7280',
    defaultWidth: 80,
    defaultHeight: 80,
  },
  {
    type: 'buffet',
    label: 'Buffet',
    icon: UtensilsCrossed,
    color: '#10b981',
    defaultWidth: 180,
    defaultHeight: 100,
  },
  {
    type: 'dj',
    label: 'DJ',
    icon: Music2,
    color: '#ef4444',
    defaultWidth: 100,
    defaultHeight: 100,
  },
  {
    type: 'entrance',
    label: 'Entrada',
    icon: DoorOpen,
    color: '#3b82f6',
    defaultWidth: 100,
    defaultHeight: 60,
  },
  {
    type: 'exit',
    label: 'Saída',
    icon: DoorClosed,
    color: '#f59e0b',
    defaultWidth: 100,
    defaultHeight: 60,
  },
  {
    type: 'bar',
    label: 'Bar',
    icon: WineIcon,
    color: '#ec4899',
    defaultWidth: 150,
    defaultHeight: 80,
  },
  {
    type: 'photoArea',
    label: 'Área de Fotos',
    icon: Camera,
    color: '#14b8a6',
    defaultWidth: 120,
    defaultHeight: 120,
  },
]

function DraggableElement({ element }: { element: ElementDef }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-element-${element.type}`,
    data: {
      type: 'new-element',
      elementType: element.type,
      width: element.defaultWidth,
      height: element.defaultHeight,
      color: element.color,
    },
  })

  const Icon = element.icon

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.6 : 1 }}
      {...listeners}
      {...attributes}
      tabIndex={0}
      role="button"
      aria-grabbed={isDragging}
      className={cn(
        'group flex cursor-grab touch-none select-none flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-card p-3 transition duration-200 ease-smooth hover:border-celebre-brand/40 hover:bg-muted/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:cursor-grabbing',
        isDragging && 'ring-2 ring-primary ring-offset-2'
      )}
      title={element.label}
    >
      <div
        className="flex size-12 items-center justify-center rounded-lg transition-colors duration-200 ease-smooth"
        style={{ backgroundColor: `${element.color}20` }}
      >
        <Icon className="size-6" color={element.color} aria-hidden="true" />
      </div>
      <span className="group-hover:text-celebre-ink/80 text-center text-xs font-medium text-celebre-ink transition-colors duration-200 ease-smooth">
        {element.label}
      </span>
    </div>
  )
}

export function ElementsPalette() {
  return (
    <Card className="h-full border border-border bg-card shadow-elevation-2">
      <CardHeader className="border-b pb-4">
        <CardTitle className="font-heading text-lg">Elementos do Espaço</CardTitle>
        <p className="text-xs text-celebre-muted">
          Arraste elementos para o canvas para organizar o layout do evento
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {ELEMENT_DEFS.map((element) => (
            <DraggableElement key={element.type} element={element} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
