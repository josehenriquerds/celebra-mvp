import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary: gradiente sutil + elevação
        primary:
          'bg-gradient-to-br from-pastel-lavender-400 to-pastel-lavender-500 text-white shadow-md hover:from-pastel-lavender-500 hover:to-pastel-lavender-600 hover:shadow-lg',

        // Soft: fundo pastel suave
        soft: 'bg-pastel-lavender-100 text-pastel-lavender-700 shadow-sm hover:bg-pastel-lavender-200 hover:shadow-md',

        // Ghost: transparente
        ghost: 'hover:bg-pastel-lavender-50 hover:text-pastel-lavender-700',

        // Destructive
        destructive:
          'bg-gradient-to-br from-pastel-coral-400 to-pastel-coral-500 text-white shadow-md hover:shadow-lg',

        // Success
        success:
          'bg-gradient-to-br from-pastel-mint-400 to-pastel-mint-500 text-white shadow-md hover:shadow-lg',

        // Outline
        outline:
          'border-2 border-pastel-lavender-300 bg-transparent text-pastel-lavender-700 hover:bg-pastel-lavender-50',

        // Link
        link: 'text-pastel-lavender-600 underline-offset-4 hover:underline',

        // Legacy (compatibilidade)
        default: 'bg-celebre-brand hover:bg-celebre-brand/90 text-white shadow-md',
        secondary: 'bg-celebre-accent hover:bg-celebre-accent-2 text-celebre-ink',
      },
      size: {
        sm: 'h-8 px-4 text-xs',
        default: 'h-10 px-6',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
