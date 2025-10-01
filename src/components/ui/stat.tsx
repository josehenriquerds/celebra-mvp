import * as React from 'react'
import { motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from './badge'

export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label?: string
  }
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  ({ className, label, value, icon: Icon, trend, variant = 'default', ...props }, ref) => {
    const variantColors = {
      default: 'from-pastel-lavender-50 to-pastel-lavender-100',
      success: 'from-pastel-mint-50 to-pastel-mint-100',
      warning: 'from-pastel-peach-50 to-pastel-peach-100',
      danger: 'from-pastel-coral-50 to-pastel-coral-100',
    }

    const iconColors = {
      default: 'text-pastel-lavender-500',
      success: 'text-pastel-mint-500',
      warning: 'text-pastel-peach-500',
      danger: 'text-pastel-coral-500',
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-3xl bg-gradient-to-br p-6',
          variantColors[variant],
          'shadow-elevation-1 hover:shadow-elevation-2',
          'transition-smooth',
          className
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium uppercase tracking-wide text-celebre-muted">
              {label}
            </p>
            <p className="text-3xl font-bold tabular-nums text-celebre-ink">{value}</p>
            {trend && (
              <Badge variant={trend.value >= 0 ? 'success' : 'danger'} className="text-xs">
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%{trend.label && ` ${trend.label}`}
              </Badge>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80',
                'shadow-elevation-1'
              )}
            >
              <Icon className={cn('h-6 w-6', iconColors[variant])} />
            </div>
          )}
        </div>
      </motion.div>
    )
  }
)
Stat.displayName = 'Stat'

export { Stat }
