'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Users,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Gift,
  CheckCircle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

interface ReportData {
  rsvpVsPresenca: Array<{ name: string; confirmados: number; presentes: number }>
  mensagensPorDia: Array<{ data: string; mensagens: number }>
  custoPorConvidado: {
    total: number
    porPessoa: number
    confirmados: number
  }
  conversaoPresentes: {
    total: number
    reservados: number
    recebidos: number
    percentRecebidos: number
  }
  engajamentoPorTier: Array<{ name: string; value: number; color: string }>
  taxaRespostaPorSegmento: Array<{ segmento: string; taxa: number }>
}

const COLORS = {
  brand: '#863F44',
  accent: '#F1D7C8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  ouro: '#fbbf24',
  prata: '#9ca3af',
  bronze: '#fb923c',
}

export default function ReportsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [eventId])

  async function fetchReports() {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}/reports`)
      const json = await res.json()
      setData(json)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebre-brand mx-auto mb-4"></div>
          <p className="text-celebre-muted">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <p className="text-celebre-muted">Erro ao carregar relatórios</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="bg-white shadow-celebre border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href={`/events/${eventId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold text-celebre-ink">
                Relatórios e Analytics
              </h1>
              <p className="text-sm text-celebre-muted mt-1">
                Insights e métricas do seu evento
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* RSVP vs Presença */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Users className="h-5 w-5" />
              Confirmações vs Presença
            </CardTitle>
            <CardDescription>Comparação entre RSVPs e check-ins realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.rsvpVsPresenca}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EADFD7" />
                <XAxis dataKey="name" stroke="#8E7B73" />
                <YAxis stroke="#8E7B73" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EADFD7',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="confirmados" fill={COLORS.brand} name="Confirmados" radius={[8, 8, 0, 0]} />
                <Bar dataKey="presentes" fill={COLORS.success} name="Presentes" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Row: Mensagens por Dia + Engajamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mensagens por Dia */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Mensagens por Dia
              </CardTitle>
              <CardDescription>Volume de interações ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.mensagensPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EADFD7" />
                  <XAxis dataKey="data" stroke="#8E7B73" />
                  <YAxis stroke="#8E7B73" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EADFD7',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mensagens"
                    stroke={COLORS.brand}
                    strokeWidth={2}
                    dot={{ fill: COLORS.brand, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Engajamento por Tier */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Engajamento por Tier
              </CardTitle>
              <CardDescription>Distribuição de convidados por nível</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.engajamentoPorTier}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.engajamentoPorTier.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Row: Custo + Presentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Custo por Convidado */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custo por Convidado
              </CardTitle>
              <CardDescription>Análise financeira do evento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-celebre-brand">
                    {formatCurrency(data.custoPorConvidado.porPessoa)}
                  </div>
                  <p className="text-sm text-celebre-muted mt-2">Por convidado confirmado</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-celebre-accent/20 rounded-lg">
                    <div className="text-2xl font-bold text-celebre-ink">
                      {formatCurrency(data.custoPorConvidado.total)}
                    </div>
                    <p className="text-xs text-celebre-muted mt-1">Orçamento Total</p>
                  </div>
                  <div className="text-center p-4 bg-celebre-accent/20 rounded-lg">
                    <div className="text-2xl font-bold text-celebre-ink">
                      {data.custoPorConvidado.confirmados}
                    </div>
                    <p className="text-xs text-celebre-muted mt-1">Confirmados</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversão de Presentes */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Conversão de Presentes
              </CardTitle>
              <CardDescription>Status da lista de presentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-celebre-brand">
                    {data.conversaoPresentes.percentRecebidos}%
                  </div>
                  <p className="text-sm text-celebre-muted mt-2">Taxa de conversão</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                    <span className="text-sm text-celebre-muted">Total de Itens</span>
                    <span className="font-semibold text-celebre-ink">
                      {data.conversaoPresentes.total}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                    <span className="text-sm text-yellow-800">Reservados</span>
                    <span className="font-semibold text-yellow-900">
                      {data.conversaoPresentes.reservados}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                    <span className="text-sm text-green-800">Recebidos</span>
                    <span className="font-semibold text-green-900">
                      {data.conversaoPresentes.recebidos}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-1000"
                    style={{ width: `${data.conversaoPresentes.percentRecebidos}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Taxa de Resposta por Segmento */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Taxa de Resposta por Segmento
            </CardTitle>
            <CardDescription>Engajamento por categoria de convidados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.taxaRespostaPorSegmento} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EADFD7" />
                <XAxis type="number" stroke="#8E7B73" />
                <YAxis dataKey="segmento" type="category" stroke="#8E7B73" width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EADFD7',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => `${value}%`}
                />
                <Bar dataKey="taxa" fill={COLORS.brand} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}