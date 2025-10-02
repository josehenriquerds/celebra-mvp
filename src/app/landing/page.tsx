'use client'

import {
  MessageCircle,
  Gift,
  BookText,
  CheckCircle,
  Infinity,
  LayoutDashboard,
  Heart,
  Users,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { Hero } from '@/components/ui/hero'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import FAQAccordion from '@/app/components/landing2/FAQSection'

const features = [
  {
    icon: MessageCircle,
    title: 'Convites pelo WhatsApp',
    desc: 'Crie e envie convites sofisticados diretamente pelo WhatsApp com respostas instantâneas.',
  },
  {
    icon: Gift,
    title: 'Lista de Presentes Integrada',
    desc: 'Permita que seus convidados escolham presentes com facilidade (taxa de 3%).',
  },
  {
    icon: BookText,
    title: 'Mural de Recados e Fotos',
    desc: 'Capture memórias com mensagens e fotos compartilhadas pelos convidados.',
  },
  {
    icon: CheckCircle,
    title: 'RSVP Automático',
    desc: 'Gerencie confirmações em tempo real com lembretes automáticos.',
  },
  {
    icon: Infinity,
    title: 'Convidados Ilimitados',
    desc: 'Convide quantas pessoas desejar, sem custos adicionais.',
  },
  {
    icon: LayoutDashboard,
    title: 'Dashboard Centralizado',
    desc: 'Organize todos os detalhes do evento em uma interface elegante.',
  },
]

const heroStats = [
  { label: 'Casais felizes', value: '1.2k+', icon: Heart, variant: 'default' as const },
  { label: 'Convidados', value: '50k+', icon: Users, variant: 'success' as const },
  { label: 'Eventos', value: '2.5k+', icon: Calendar, variant: 'warning' as const },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Topbar simples para landing */}
      <header className="sticky top-4 z-30 mx-4">
        <div className="glass rounded-3xl px-6 py-4 shadow-elevation-2">
          <div className="flex items-center justify-between">
            <div className="bg-gradient-to-r from-pastel-lavender-600 to-pastel-rose-600 bg-clip-text text-2xl font-bold text-transparent">
              Celebre
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="primary">Começar Grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container-8pt py-12">
        <Hero
          image="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=800&fit=crop"
          imageAlt="Casal feliz em seu casamento"
          title="Organize o casamento dos seus sonhos"
          subtitle="Tudo que você precisa em um só lugar: convites, lista de presentes, RSVP e muito mais"
          stats={heroStats}
          ctaLabel="Começar Grátis →"
          onCtaClick={() => (window.location.href = '/dashboard')}
        />
      </section>

      {/* Features Section */}
      <section className="container-8pt py-16">
        <div className="mb-12 text-center">
          <Badge variant="info" size="lg" className="mb-4">
            Funcionalidades
          </Badge>
          <h2 className="mb-4 text-4xl font-bold text-celebre-ink md:text-5xl">
            Tudo que você precisa
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-celebre-muted">
            Planeje cada detalhe do seu evento com ferramentas profissionais e intuitivas
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                variant="glass"
                interactive
                padding="lg"
                className="group transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pastel-lavender-100 to-pastel-rose-100 transition-colors group-hover:from-pastel-lavender-200 group-hover:to-pastel-rose-200">
                    <Icon className="h-8 w-8 text-pastel-lavender-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-celebre-muted">{feature.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container-8pt py-16">
        <div className="mb-12 text-center">
          <Badge variant="success" size="lg" className="mb-4">
            Preços
          </Badge>
          <h2 className="mb-4 text-4xl font-bold text-celebre-ink md:text-5xl">Comece grátis</h2>
          <p className="mx-auto max-w-2xl text-lg text-celebre-muted">
            Sem custos iniciais. Cobramos apenas 3% sobre presentes vendidos.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Plano Gratuito */}
          <Card variant="elevated" padding="lg">
            <CardHeader>
              <Badge variant="default" className="mb-4 w-fit">
                Gratuito
              </Badge>
              <CardTitle className="text-3xl">R$ 0</CardTitle>
              <CardDescription>Para sempre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pastel-mint-500" />
                  <span className="text-sm">Convidados ilimitados</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pastel-mint-500" />
                  <span className="text-sm">Convites pelo WhatsApp</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pastel-mint-500" />
                  <span className="text-sm">RSVP automático</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pastel-mint-500" />
                  <span className="text-sm">Dashboard completo</span>
                </div>
              </div>
              <Button variant="soft" className="mt-6 w-full">
                Começar Agora
              </Button>
            </CardContent>
          </Card>

          {/* Plano Pro */}
          <Card
            variant="glass"
            padding="lg"
            className="border-2 border-pastel-lavender-300 shadow-elevation-4"
          >
            <CardHeader>
              <Badge variant="success" className="mb-4 w-fit">
                Popular
              </Badge>
              <CardTitle className="text-3xl">Lista de Presentes</CardTitle>
              <CardDescription>Taxa de 3% sobre vendas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pastel-mint-500" />
                  <span className="text-sm">Tudo do plano gratuito</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pastel-mint-500" />
                  <span className="text-sm">Lista de presentes integrada</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pastel-mint-500" />
                  <span className="text-sm">Pagamento online</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-pastel-mint-500" />
                  <span className="text-sm">Mural de fotos</span>
                </div>
              </div>
              <Button variant="primary" className="mt-6 w-full">
                Ativar Lista de Presentes
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container-8pt py-16">
        <div className="mb-12 text-center">
          <Badge variant="warning" size="lg" className="mb-4">
            Perguntas Frequentes
          </Badge>
          <h2 className="mb-4 text-4xl font-bold text-celebre-ink md:text-5xl">Dúvidas?</h2>
        </div>
        <div className="mx-auto max-w-3xl">
          <FAQAccordion />
        </div>
      </section>

      {/* CTA Final */}
      <section className="container-8pt py-20">
        <Card variant="glass" padding="none" className="overflow-hidden">
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-pastel-lavender-100 via-pastel-rose-100 to-pastel-peach-100 opacity-50" />

            {/* Content */}
            <div className="relative px-8 py-20 text-center">
              <h2 className="mb-6 text-4xl font-bold text-celebre-ink md:text-5xl">
                Pronto para começar?
              </h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-celebre-muted">
                Junte-se a milhares de casais que já estão planejando o casamento dos sonhos com o
                Celebre
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/dashboard">
                  <Button variant="primary" size="xl">
                    Começar Grátis →
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="xl">
                    Já tenho conta
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-pastel-lavender-100 py-12">
        <div className="container-8pt">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="bg-gradient-to-r from-pastel-lavender-600 to-pastel-rose-600 bg-clip-text text-2xl font-bold text-transparent">
              Celebre
            </div>
            <div className="flex gap-6 text-sm text-celebre-muted">
              <Link href="/sobre" className="hover:text-celebre-ink">
                Sobre
              </Link>
              <Link href="/contato" className="hover:text-celebre-ink">
                Contato
              </Link>
              <Link href="/termos" className="hover:text-celebre-ink">
                Termos
              </Link>
              <Link href="/privacidade" className="hover:text-celebre-ink">
                Privacidade
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-celebre-muted">
            © 2025 Celebre. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
