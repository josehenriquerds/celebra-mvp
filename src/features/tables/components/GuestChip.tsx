'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Baby, Star, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { UnassignedGuest } from '@/schemas'

interface GuestChipProps {
  guest: UnassignedGuest
}

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
      className="cursor-grab touch-none select-none rounded-lg border bg-white p-3 transition-shadow hover:shadow-sm active:cursor-grabbing"
      title={guest.contact.fullName}
    >
      <div className="flex items-center gap-2">
        {guest.contact.isVip && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
        <span className="truncate text-sm font-medium">{guest.contact.fullName}</span>
      </div>
      {guest.household && (
        <p className="mt-1 text-xs text-celebre-muted">{guest.household.label}</p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <Badge variant="outline" className="text-xs">
          <Users className="mr-1 h-3 w-3" />
          {guest.seats}
        </Badge>
        {guest.children > 0 && (
          <Badge variant="outline" className="text-xs">
            <Baby className="mr-1 h-3 w-3" />
            {guest.children}
          </Badge>
        )}
      </div>
    </div>
  )
}
