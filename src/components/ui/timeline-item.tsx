'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimelineItemProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  timestamp: Date;
  iconColor?: string;
  isLast?: boolean;
  onClick?: () => void;
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
        'flex gap-4 pb-6 relative',
        onClick && 'cursor-pointer hover:bg-[#FAF7F4] rounded-lg p-3 -m-3 transition-colors'
      )}
      onClick={onClick}
    >
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[20px] top-[40px] bottom-0 w-[2px] bg-border" />
      )}

      {/* Icon */}
      <div className={cn('relative z-10 rounded-full p-2 flex-shrink-0', iconColor)}>
        <Icon className="h-5 w-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-foreground">{title}</h4>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {format(timestamp, "d 'de' MMM, HH:mm", { locale: ptBR })}
          </time>
        </div>
      </div>
    </div>
  );
}
