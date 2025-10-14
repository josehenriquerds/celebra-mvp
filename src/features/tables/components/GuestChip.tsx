'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Baby, Star, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getGuestIcon } from '@/lib/guest-icons'
import type { UnassignedGuest } from '@/schemas'

interface GuestChipProps {
  guest: UnassignedGuest
}

const chipBaseClasses =
  'group cursor-grab touch-none select-none rounded-xl border border-border bg-card p-3 transition duration-200 ease-smooth hover:bg-muted/60 hover:shadow-elevation-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:cursor-grabbing'

export function GuestChip({ guest }: GuestChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `guest-${guest.id}`,
    data: { type: 'guest', guest },
  })

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
        chipBaseClasses,
        isDragging && 'ring-2 ring-primary ring-offset-2'
      )}
      title={guest.contact.fullName}
    >
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0">
          {getGuestIcon(guest.contact.gender, guest.contact.ageGroup)}
        </div>
        {guest.contact.isVip && (
          <Star className="size-4 text-yellow-500 transition-colors duration-200 ease-smooth group-hover:text-yellow-600" />
        )}
        <span className="truncate text-sm font-medium transition-colors duration-200 ease-smooth group-hover:text-celebre-ink">
          {guest.contact.fullName}
        </span>
      </div>
      {guest.household && (
        <p className="mt-1 text-xs text-celebre-muted">{guest.household.label}</p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <Users className="size-3" aria-hidden="true" />
          {guest.seats}
        </Badge>
        {guest.children > 0 && (
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Baby className="size-3" aria-hidden="true" />
            {guest.children}
          </Badge>
        )}
      </div>
    </div>
  )
}
