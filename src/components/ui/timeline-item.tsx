'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type LucideIcon } from 'lucide-react'
import * as React from 'react'
import { cn } from '@/lib/utils'

interface TimelineItemProps {
  icon: LucideIcon
  title: string
  description?: string
  timestamp: Date
  iconColor?: string
  isLast?: boolean
  onClick?: () => void
}

export function TimelineItem({
  icon: Icon,
  title,
  description,
  timestamp,
  iconColor = 'bg-primary',
  isLast = false,
  onClick,
}: TimelineItemProps) {
  return (
    <div
      className={cn(
        'relative flex gap-4 pb-6',
        onClick && '-m-3 cursor-pointer rounded-lg p-3 transition-colors hover:bg-[#FAF7F4]'
      )}
      onClick={onClick}
    >
      {/* Timeline line */}
      {!isLast && <div className="absolute bottom-0 left-[20px] top-[40px] w-[2px] bg-border" />}

      {/* Icon */}
      <div className={cn('relative z-10 flex-shrink-0 rounded-full p-2', iconColor)}>
        <Icon className="size-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <time className="whitespace-nowrap text-xs text-muted-foreground">
            {format(timestamp, "d 'de' MMM, HH:mm", { locale: ptBR })}
          </time>
        </div>
      </div>
    </div>
  )
}
