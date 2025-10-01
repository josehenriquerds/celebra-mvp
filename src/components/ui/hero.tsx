'use client'

import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Stat, StatProps } from './stat'

interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  image?: string
  imageAlt?: string
  title?: string
  subtitle?: string
  stats?: StatProps[]
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  ({
    className,
    image = '/placeholder-hero.jpg',
    imageAlt = 'Hero image',
    title = 'Bem-vindo ao seu evento',
    subtitle = 'Gerencie todos os detalhes do seu grande dia',
    stats = [],
    ctaLabel = 'Começar',
    onCtaClick,
    ...props
  }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(
          'relative rounded-3xl overflow-hidden',
          'bg-gradient-to-br from-pastel-peach-50 via-pastel-rose-50 to-pastel-lavender-50',
          'shadow-lg',
          'animate-fade-in',
          className
        )}
        {...props}
      >
        <div className="grid lg:grid-cols-2 gap-8 p-8 lg:p-12">
          {/* Coluna Esquerda: Imagem */}
          <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-lg">
            <img
              src={image}
              alt={imageAlt}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Overlay sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Painel translúcido sobre a imagem (opcional) */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="glass-soft rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {title}
                </h2>
                <p className="text-white/90 text-sm">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Stats/KPIs */}
          <div className="flex flex-col justify-between gap-6">
            {/* Grid de Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index}>
                  <Stat {...stat} />
                </div>
              ))}
            </div>

            {/* CTA */}
            {ctaLabel && (
              <div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onCtaClick}
                  className="w-full sm:w-auto"
                >
                  {ctaLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    )
  }
)
Hero.displayName = 'Hero'

export { Hero }
