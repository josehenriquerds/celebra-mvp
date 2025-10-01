import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion, type HTMLMotionProps } from 'motion/react'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-3xl overflow-hidden transition-smooth',
  {
    variants: {
      variant: {
        // Elevated: card com sombra e fundo branco
        elevated:
          'bg-white shadow-elevation-2 hover:shadow-elevation-3 border border-pastel-lavender-100',

        // Glass: glassmorphism com blur
        glass:
          'glass shadow-glass hover:shadow-glass-sm',

        // Flat: sem sombra, apenas fundo
        flat:
          'bg-white border border-pastel-lavender-50',

        // Legacy (compatibilidade)
        default:
          'bg-celebre-card border border-border shadow-celebre',
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'elevated',
      padding: 'default',
    },
  }
)

export interface CardProps
  extends Omit<HTMLMotionProps<'div'>, 'children'>,
    VariantProps<typeof cardVariants> {
  children?: React.ReactNode
  interactive?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive = false, ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      initial={false}
      whileHover={interactive ? { y: -4 } : undefined}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 p-6', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-xl font-semibold leading-tight tracking-tight text-celebre-ink',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-celebre-muted', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-4 p-6 pt-0', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants } 