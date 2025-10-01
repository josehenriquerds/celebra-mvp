import { useState } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

// Simple toast hook (can be enhanced later with a proper toast library)
export function useToast() {
  const [, setToasts] = useState<Toast[]>([])

  const toast = (options: Toast) => {
    // For now, use native alert/console
    if (options.variant === 'destructive') {
      console.error(options.title, options.description)
      alert(`❌ ${options.title}\n${options.description || ''}`)
    } else {
      console.log(options.title, options.description)
      // You can implement a proper toast UI component later
      // For now, we'll use console.log to avoid blocking UX
    }

    setToasts((prev) => [...prev, options])
  }

  return { toast }
}
