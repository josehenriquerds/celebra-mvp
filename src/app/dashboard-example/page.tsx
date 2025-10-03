'use client'

/**
 * EXEMPLO DE DASHBOARD COM NOVO DESIGN SYSTEM
 *
 * Este é um exemplo de como usar os novos componentes pastel.
 * Para usar em produção, renomeie para /dashboard/page.tsx
 */

import {
  Users,
  Check,
  DollarSign,
  ClipboardList,
  Home,
  Calendar,
  Settings,
  Heart,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Hero } from '@/components/ui/hero'
import { NavigationRail } from '@/components/ui/navigation-rail'
import { Topbar } from '@/components/ui/topbar'

// Dados de exemplo
const heroStats = [
  { label: 'Convidados', value: '240', icon: Users, variant: 'default' as const },
  {
    label: 'Confirmados',
    value: '180',
    icon: Check,
    variant: 'success' as const,
    trend: { value: 12 },
  },
  { label: 'Orçamento', value: 'R$ 50k', icon: DollarSign, variant: 'warning' as const },
  { label: 'Tarefas', value: '12/30', icon: ClipboardList, variant: 'danger' as const },
]

const navSections = [
  {
    id: 'main',
    label: 'Principal',
    items: [
      { icon: Home, label: 'Dashboard', href: '/dashboard' },
      { icon: Users, label: 'Convidados', href: '/dashboard/guests', badge: 5 },
      { icon: Calendar, label: 'Eventos', href: '/dashboard/events' },
      { icon: Heart, label: 'Fornecedores', href: '/dashboard/vendors' },
    ],
  },
  {
    id: 'config',
    label: 'Configurações',
    items: [{ icon: Settings, label: 'Ajustes', href: '/dashboard/settings' }],
  },
]

export default function DashboardExamplePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation Rail */}
      <NavigationRail sections={navSections} />

      {/* Main Content */}
      <div className="ml-20 transition-all duration-300 lg:ml-[260px]">
        {/* Topbar */}
        <Topbar
          searchPlaceholder="Buscar convidados, fornecedores..."
          userName="Maria Silva"
          userEmail="maria@celebre.app"
          notificationCount={3}
        />

        {/* Content Area */}
        <main className="container-8pt space-y-8 py-8">
          {/* Hero Section */}
          <Hero
            image="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop"
            imageAlt="Casal em evento elegante"
            title="Bem-vindo ao seu casamento"
            subtitle="Gerencie todos os detalhes do seu grande dia"
            stats={heroStats}
            ctaLabel="Importar Convidados"
            onCtaClick={() => alert('Importar convidados')}
          />

          {/* Quick Stats Grid */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-celebre-ink">Visão Geral</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card variant="elevated" padding="default">
                <CardHeader>
                  <CardTitle>Lista de Presença</CardTitle>
                  <CardDescription>Últimas atualizações</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">João Silva</span>
                      <Badge variant="success" size="sm">
                        Confirmado
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ana Costa</span>
                      <Badge variant="warning" size="sm">
                        Pendente
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Carlos Santos</span>
                      <Badge variant="danger" size="sm">
                        Recusou
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass" padding="default">
                <CardHeader>
                  <CardTitle>Próximas Tarefas</CardTitle>
                  <CardDescription>Hoje</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" />
                      <span className="text-sm">Confirmar com DJ</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" />
                      <span className="text-sm">Revisar cardápio</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <input type="checkbox" checked className="mt-1" />
                      <span className="text-sm line-through opacity-50">Enviar convites</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="elevated" padding="default" className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Orçamento vs. Gastos</CardTitle>
                  <CardDescription>R$ 45.000 de R$ 50.000</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Barra de progresso simples */}
                    <div className="h-4 overflow-hidden rounded-full bg-pastel-lavender-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pastel-mint-400 to-pastel-mint-500"
                        style={{ width: '90%' }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-celebre-muted">90% utilizado</span>
                      <span className="font-semibold text-pastel-mint-600">R$ 5.000 restantes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Actions */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-celebre-ink">Ações Rápidas</h2>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" size="lg">
                <Users className="mr-2 size-5" />
                Adicionar Convidado
              </Button>
              <Button variant="soft" size="lg">
                <Calendar className="mr-2 size-5" />
                Nova Tarefa
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="mr-2 size-5" />
                Buscar Fornecedor
              </Button>
              <Button variant="ghost" size="lg">
                Ver Relatório
              </Button>
            </div>
          </section>

          {/* Demo de variantes de Card */}
          <section>
            <h2 className="mb-6 text-2xl font-bold text-celebre-ink">Variantes de Card (Demo)</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card variant="elevated" interactive padding="lg">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>Sombra + fundo branco</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-celebre-muted">
                    Variante padrão com elevação N2. Hover aumenta para N3.
                  </p>
                </CardContent>
              </Card>

              <Card variant="glass" padding="lg">
                <CardHeader>
                  <CardTitle>Glass Card</CardTitle>
                  <CardDescription>Glassmorphism</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-celebre-muted">
                    Backdrop blur + transparência. Perfeito sobre gradientes.
                  </p>
                </CardContent>
              </Card>

              <Card variant="flat" padding="lg">
                <CardHeader>
                  <CardTitle>Flat Card</CardTitle>
                  <CardDescription>Sem sombra</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-celebre-muted">
                    Apenas fundo branco e borda sutil. Minimalista.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
