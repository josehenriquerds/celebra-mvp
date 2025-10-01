'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  User,
  Calendar,
  MapPin,
  Users,
  Clock,
  Shield,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatTime } from '@/lib/utils'

interface GuestPortalData {
  guest: {
    id: string
    rsvp: string
    seats: number
    children: number
    contact: {
      fullName: string
      phone: string
      email: string | null
      restrictions: any
    }
    household: {
      label: string
      size: number
    } | null
    table: {
      label: string
    } | null
    optOut: boolean
  }
  event: {
    id: string
    title: string
    dateTime: string
    venueName: string
    address: string
  }
  consentLogs: Array<{
    id: string
    action: string
    context: string
    occurredAt: string
  }>
  interactions: Array<{
    id: string
    type: string
    occurredAt: string
  }>
}

const RSVP_OPTIONS = [
  { value: 'sim', label: 'Confirmo Presença', icon: CheckCircle, color: 'text-green-600' },
  { value: 'talvez', label: 'Talvez', icon: AlertCircle, color: 'text-yellow-600' },
  { value: 'nao', label: 'Não Poderei Comparecer', icon: XCircle, color: 'text-red-600' },
]

export default function GuestPortalPage() {
  const params = useParams()
  const token = params.token as string

  const [data, setData] = useState<GuestPortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchPortalData()
  }, [token])

  async function fetchPortalData() {
    try {
      setLoading(true)
      const res = await fetch(`/api/guest-portal/${token}`)

      if (!res.ok) {
        if (res.status === 404) {
          setError('Link inválido ou expirado')
        } else {
          setError('Erro ao carregar dados')
        }
        return
      }

      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Error fetching portal data:', err)
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateRSVP(newRsvp: string) {
    try {
      setUpdating(true)
      const res = await fetch(`/api/guest-portal/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rsvp: newRsvp }),
      })

      if (res.ok) {
        await fetchPortalData()
        alert('RSVP atualizado com sucesso!')
      }
    } catch (err) {
      console.error('Error updating RSVP:', err)
      alert('Erro ao atualizar RSVP')
    } finally {
      setUpdating(false)
    }
  }

  async function handleOptOut() {
    if (!confirm('Tem certeza que deseja parar de receber comunicações? Esta ação não pode ser desfeita.')) return

    try {
      setUpdating(true)
      const res = await fetch(`/api/guest-portal/${token}/opt-out`, {
        method: 'POST',
      })

      if (res.ok) {
        await fetchPortalData()
        alert('Você não receberá mais comunicações sobre este evento.')
      }
    } catch (err) {
      console.error('Error opting out:', err)
      alert('Erro ao processar solicitação')
    } finally {
      setUpdating(false)
    }
  }

  async function handleExportData() {
    try {
      const res = await fetch(`/api/guest-portal/${token}/export`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meus-dados-${Date.now()}.json`
      a.click()
    } catch (err) {
      console.error('Error exporting data:', err)
      alert('Erro ao exportar dados')
    }
  }

  async function handleDeleteData() {
    if (!confirm('ATENÇÃO: Seus dados serão permanentemente excluídos do sistema. Esta ação é irreversível. Deseja continuar?')) return

    try {
      setUpdating(true)
      const res = await fetch(`/api/guest-portal/${token}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        alert('Seus dados foram excluídos com sucesso.')
        setData(null)
      }
    } catch (err) {
      console.error('Error deleting data:', err)
      alert('Erro ao excluir dados')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebre-brand mx-auto mb-4"></div>
          <p className="text-celebre-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-celebre-ink font-semibold mb-2">{error || 'Link inválido'}</p>
            <p className="text-sm text-celebre-muted">
              Entre em contato com os organizadores do evento.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (data.guest.optOut) {
    return (
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-celebre-brand mx-auto mb-4" />
            <p className="text-celebre-ink font-semibold mb-2">Comunicações Desativadas</p>
            <p className="text-sm text-celebre-muted">
              Você optou por não receber mais comunicações sobre este evento.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="bg-white shadow-celebre border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-heading font-bold text-celebre-ink">
              {data.event.title}
            </h1>
            <p className="text-sm text-celebre-muted mt-2">
              Olá, {data.guest.contact.fullName}! 👋
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Event Info */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Informações do Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-celebre-muted" />
              <div>
                <p className="text-sm text-celebre-muted">Data e Horário</p>
                <p className="font-medium text-celebre-ink">
                  {formatDate(data.event.dateTime, 'long')} às {formatTime(data.event.dateTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-celebre-muted" />
              <div>
                <p className="text-sm text-celebre-muted">Local</p>
                <p className="font-medium text-celebre-ink">{data.event.venueName}</p>
                <p className="text-sm text-celebre-muted">{data.event.address}</p>
              </div>
            </div>
            {data.guest.table && (
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-celebre-muted" />
                <div>
                  <p className="text-sm text-celebre-muted">Sua Mesa</p>
                  <p className="font-medium text-celebre-ink">{data.guest.table.label}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* RSVP */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Confirmação de Presença</CardTitle>
            <CardDescription>Por favor, confirme sua presença no evento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {RSVP_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = data.guest.rsvp === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => handleUpdateRSVP(option.value)}
                    disabled={updating}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-celebre-brand bg-celebre-accent'
                        : 'border-gray-200 hover:border-celebre-brand hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mx-auto mb-2 ${isSelected ? 'text-celebre-brand' : option.color}`} />
                    <p className={`text-sm font-medium ${isSelected ? 'text-celebre-brand' : 'text-celebre-ink'}`}>
                      {option.label}
                    </p>
                  </button>
                )
              })}
            </div>

            {data.guest.rsvp && (
              <div className="p-3 bg-celebre-accent/20 rounded-lg">
                <p className="text-sm text-celebre-muted">
                  Seu RSVP atual: <span className="font-semibold text-celebre-ink">{data.guest.rsvp}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Data */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Meus Dados</CardTitle>
            <CardDescription>Informações cadastradas no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-celebre-muted">Nome Completo</p>
              <p className="font-medium text-celebre-ink">{data.guest.contact.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-celebre-muted">Telefone</p>
              <p className="font-medium text-celebre-ink">{data.guest.contact.phone}</p>
            </div>
            {data.guest.contact.email && (
              <div>
                <p className="text-sm text-celebre-muted">Email</p>
                <p className="font-medium text-celebre-ink">{data.guest.contact.email}</p>
              </div>
            )}
            {data.guest.household && (
              <div>
                <p className="text-sm text-celebre-muted">Família</p>
                <p className="font-medium text-celebre-ink">
                  {data.guest.household.label} ({data.guest.household.size} membros)
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-celebre-muted">Assentos</p>
              <p className="font-medium text-celebre-ink">{data.guest.seats}</p>
            </div>
            {data.guest.children > 0 && (
              <div>
                <p className="text-sm text-celebre-muted">Crianças</p>
                <p className="font-medium text-celebre-ink">{data.guest.children}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy & LGPD */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-celebre-brand" />
              <CardTitle className="font-heading">Privacidade e Dados (LGPD)</CardTitle>
            </div>
            <CardDescription>
              Você tem controle total sobre seus dados pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Meus Dados (JSON)
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-yellow-600 hover:text-yellow-700"
                onClick={handleOptOut}
                disabled={updating}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Parar de Receber Comunicações
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleDeleteData}
                disabled={updating}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Permanentemente Meus Dados
              </Button>
            </div>

            {/* Consent History */}
            {data.consentLogs.length > 0 && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-celebre-ink mb-3">Histórico de Consentimentos</h4>
                <div className="space-y-2">
                  {data.consentLogs.map((log) => (
                    <div key={log.id} className="text-xs text-celebre-muted bg-gray-50 p-2 rounded">
                      {log.action} - {log.context} ({formatDate(log.occurredAt)})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction Stats */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-celebre-ink mb-2">Estatísticas</h4>
              <p className="text-sm text-celebre-muted">
                Total de interações registradas: <span className="font-semibold">{data.interactions.length}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-celebre-muted">
            Este portal segue as normas da LGPD (Lei Geral de Proteção de Dados)
          </p>
        </div>
      </footer>
    </div>
  )
}