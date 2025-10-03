'use client'

import Image from 'next/image'
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Stat, type StatProps } from './stat'

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
  (
    {
      className,
      image = '/placeholder-hero.jpg',
      imageAlt = 'Hero image',
      title = 'Bem-vindo ao seu evento',
      subtitle = 'Gerencie todos os detalhes do seu grande dia',
      stats = [],
      ctaLabel = 'Começar',
      onCtaClick,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-3xl',
          'bg-gradient-to-br from-pastel-peach-50 via-pastel-rose-50 to-pastel-lavender-50',
          'shadow-lg',
          'animate-fade-in',
          className
        )}
        {...props}
      >
        <div className="grid gap-8 p-8 lg:grid-cols-2 lg:p-12">
          {/* Coluna Esquerda: Imagem */}
          <div className="relative h-[400px] overflow-hidden rounded-3xl shadow-lg lg:h-[500px]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {/* Overlay sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            {/* Painel translúcido sobre a imagem (opcional) */}
            <div className="absolute inset-x-6 bottom-6">
              <div className="glass-soft rounded-2xl p-6">
                <h2 className="mb-2 text-2xl font-bold text-white">{title}</h2>
                <p className="text-sm text-white/90">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Stats/KPIs */}
          <div className="flex flex-col justify-between gap-6">
            {/* Grid de Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
