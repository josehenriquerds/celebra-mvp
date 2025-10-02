import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Pastel variants (novos)
        default:
          'border border-pastel-lavender-200 bg-pastel-lavender-100 text-pastel-lavender-700',
        success: 'border border-pastel-mint-200 bg-pastel-mint-100 text-pastel-mint-700',
        warning: 'border border-pastel-peach-200 bg-pastel-peach-100 text-pastel-peach-700',
        danger: 'border border-pastel-coral-200 bg-pastel-coral-100 text-pastel-coral-700',
        info: 'border border-pastel-sky-200 bg-pastel-sky-100 text-pastel-sky-700',

        // Legacy variants
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'border border-input text-foreground',
        bronze: 'border border-orange-200 bg-orange-100 text-orange-800',
        prata: 'border border-gray-300 bg-gray-200 text-gray-800',
        ouro: 'border border-yellow-200 bg-yellow-100 text-yellow-900',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
}

export { Badge, badgeVariants }
