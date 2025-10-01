'use client'

import { Users, Check, X, Clock, Plus, Search, Download, Upload } from 'lucide-react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stat } from '@/components/ui/stat'

// Mock data - substituir por dados reais
const guestStats = [
  { label: 'Total', value: '240', icon: Users, variant: 'default' as const },
  { label: 'Confirmados', value: '180', icon: Check, variant: 'success' as const, trend: { value: 12 } },
  { label: 'Pendentes', value: '45', icon: Clock, variant: 'warning' as const },
  { label: 'Recusados', value: '15', icon: X, variant: 'danger' as const },
]

const guestList = [
  { id: 1, name: 'João Silva', email: 'joao@email.com', status: 'confirmed', phone: '(11) 99999-9999' },
  { id: 2, name: 'Ana Costa', email: 'ana@email.com', status: 'pending', phone: '(11) 98888-8888' },
  { id: 3, name: 'Carlos Santos', email: 'carlos@email.com', status: 'declined', phone: '(11) 97777-7777' },
  { id: 4, name: 'Maria Oliveira', email: 'maria@email.com', status: 'confirmed', phone: '(11) 96666-6666' },
  { id: 5, name: 'Pedro Lima', email: 'pedro@email.com', status: 'pending', phone: '(11) 95555-5555' },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'confirmed':
      return <Badge variant="success" size="sm">Confirmado</Badge>
    case 'pending':
      return <Badge variant="warning" size="sm">Pendente</Badge>
    case 'declined':
      return <Badge variant="danger" size="sm">Recusou</Badge>
    default:
      return <Badge variant="default" size="sm">{status}</Badge>
  }
}

export default function ConvidadosPage() {
  return (
    <DashboardLayout searchPlaceholder="Buscar convidados...">
      <div className="space-y-8">
        {/* Header com ações */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-celebre-ink">Convidados</h1>
            <p className="text-celebre-muted mt-1">Gerencie sua lista de convidados</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" size="default">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button variant="primary" size="default">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guestStats.map((stat, index) => (
            <Stat key={index} {...stat} />
          ))}
        </div>

        {/* Filtros e ações */}
        <Card variant="elevated" padding="default">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-celebre-muted" />
              <input
                type="search"
                placeholder="Buscar por nome, email ou telefone..."
                className="w-full h-10 pl-10 pr-4 rounded-2xl bg-pastel-lavender-50 border border-pastel-lavender-100 text-sm focus-ring"
              />
            </div>
            <Button variant="soft" size="default">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </Card>

        {/* Lista de Convidados */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <CardTitle>Lista de Convidados</CardTitle>
            <CardDescription>Total de {guestList.length} convidados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {guestList.map((guest) => (
                <div
                  key={guest.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-pastel-lavender-100 rounded-2xl hover:bg-pastel-lavender-50 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pastel-lavender-200 to-pastel-rose-200 flex items-center justify-center font-semibold text-pastel-lavender-700">
                      {guest.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-celebre-ink">{guest.name}</p>
                      <p className="text-sm text-celebre-muted">{guest.email}</p>
                      <p className="text-xs text-celebre-muted">{guest.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {getStatusBadge(guest.status)}
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação (placeholder) */}
            <div className="flex justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" disabled>Anterior</Button>
              <Button variant="soft" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Próximo</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass" padding="default">
            <CardHeader>
              <CardTitle className="text-lg">Enviar Convites</CardTitle>
              <CardDescription>WhatsApp em massa</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="primary" className="w-full">
                Enviar para Todos
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass" padding="default">
            <CardHeader>
              <CardTitle className="text-lg">Lembretes</CardTitle>
              <CardDescription>Para pendentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="soft" className="w-full">
                Enviar Lembrete
              </Button>
            </CardContent>
          </Card>

          <Card variant="glass" padding="default">
            <CardHeader>
              <CardTitle className="text-lg">Segmentação</CardTitle>
              <CardDescription>Criar grupos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Gerenciar Grupos
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
