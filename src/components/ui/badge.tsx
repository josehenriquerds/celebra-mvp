import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // Pastel variants (novos)
        default:
          'bg-pastel-lavender-100 text-pastel-lavender-700 border border-pastel-lavender-200',
        success:
          'bg-pastel-mint-100 text-pastel-mint-700 border border-pastel-mint-200',
        warning:
          'bg-pastel-peach-100 text-pastel-peach-700 border border-pastel-peach-200',
        danger:
          'bg-pastel-coral-100 text-pastel-coral-700 border border-pastel-coral-200',
        info:
          'bg-pastel-sky-100 text-pastel-sky-700 border border-pastel-sky-200',

        // Legacy variants
        secondary:
          'bg-secondary text-secondary-foreground border-transparent',
        destructive:
          'bg-destructive text-destructive-foreground border-transparent',
        outline:
          'text-foreground border border-input',
        bronze:
          'bg-orange-100 text-orange-800 border border-orange-200',
        prata:
          'bg-gray-200 text-gray-800 border border-gray-300',
        ouro:
          'bg-yellow-100 text-yellow-900 border border-yellow-200',
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
  return (
    <div
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }