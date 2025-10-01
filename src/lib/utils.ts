import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (format === 'short') {
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return d.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function getDaysUntil(date: Date | string | null | undefined): number {
  if (!date) return 0

  const d = typeof date === 'string' ? new Date(date) : date
  const time = d.getTime()
  if (Number.isNaN(time)) return 0

  const now = new Date()
  const diff = time - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getEngagementTier(score: number): 'bronze' | 'prata' | 'ouro' {
  if (score >= 50) return 'ouro'
  if (score >= 25) return 'prata'
  return 'bronze'
}

export function getSLABadgeColor(dueAt: Date | string | null): 'success' | 'warning' | 'danger' {
  if (!dueAt) return 'success'

  const d = typeof dueAt === 'string' ? new Date(dueAt) : dueAt
  const hoursRemaining = (d.getTime() - Date.now()) / (1000 * 60 * 60)

  if (hoursRemaining < 0) return 'danger'
  if (hoursRemaining < 8) return 'danger'
  if (hoursRemaining < 24) return 'warning'
  return 'success'
} 
