'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Star,
  Phone,
  Mail,
  Users,
  MapPin,
  Baby,
  Clock,
  MessageSquare,
  CheckCircle,
  Gift,
  Shield,
  Edit,
  Send,
  Trash2,
  Save,
  X,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { formatDate, formatTime } from '@/lib/utils'

interface GuestProfile {
  id: string
  contact: {
    id: string
    fullName: string
    phone: string
    email: string | null
    relation: string
    isVip: boolean
    restrictions: any
  }
  household: {
    id: string
    label: string
    size: number
  } | null
  inviteStatus: string
  rsvp: string
  seats: number
  children: number
  transportNeeded: boolean
  optOut: boolean
  engagementScore: {
    id: string
    value: number
    tier: string
    lastDecayAt: string
  } | null
  seatAssignment: {
    id: string
    seat: {
      id: string
      index: number
      table: {
        id: string
        label: string
      }
    }
  } | null
  interactions: Array<{
    id: string
    type: string
    direction: string
    channel: string
    messageSnippet: string | null
    occurredAt: string
  }>
  checkins: Array<{
    id: string
    status: string
    method: string
    occurredAt: string
  }>
  gifts: Array<{
    id: string
    title: string
    price: number
    status: string
  }>
  consentLogs: Array<{
    id: string
    action: string
    context: string
    occurredAt: string
  }>
  timeline: Array<{
    id: string
    type: string
    title: string
    description: string | null
    occurredAt: string
  }>
}

const RSVP_COLORS = {
  sim: 'bg-green-100 text-green-800 border-green-200',
  nao: 'bg-red-100 text-red-800 border-red-200',
  talvez: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pendente: 'bg-gray-100 text-gray-800 border-gray-200',
}

const ENGAGEMENT_COLORS = {
  ouro: 'bg-yellow-100 text-yellow-900',
  prata: 'bg-gray-200 text-gray-800',
  bronze: 'bg-orange-100 text-orange-800',
}

export default function GuestProfilePage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const guestId = params.guestId as string

  const [guest, setGuest] = useState<GuestProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    seats: 0,
    children: 0,
    transportNeeded: false,
    restrictions: '',
  })

  useEffect(() => {
    fetchGuest()
  }, [guestId])

  async function fetchGuest() {
    try {
      setLoading(true)
      const res = await fetch(`/api/guests/${guestId}`)
      const data = await res.json()
      setGuest(data)
      setEditForm({
        seats: data.seats,
        children: data.children,
        transportNeeded: data.transportNeeded,
        restrictions: data.contact.restrictions || '',
      })
    } catch (error) {
      console.error('Error fetching guest:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      const res = await fetch(`/api/guests/${guestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (res.ok) {
        const updated = await res.json()
        setGuest(updated)
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating guest:', error)
    }
  }

  function getRsvpLabel(rsvp: string) {
    const labels: Record<string, string> = {
      sim: 'Confirmado',
      nao: 'Recusado',
      talvez: 'Talvez',
      pendente: 'Pendente',
    }
    return labels[rsvp] || rsvp
  }

  function getInteractionIcon(type: string) {
    if (type === 'whatsapp_message') return MessageSquare
    if (type === 'email_sent') return Mail
    if (type === 'phone_call') return Phone
    return Clock
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebre-brand mx-auto mb-4"></div>
          <p className="text-celebre-muted">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-celebre-muted">Convidado não encontrado</p>
          <Link href={`/events/${eventId}/guests`}>
            <Button variant="outline" className="mt-4">
              Voltar à lista
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="bg-white shadow-celebre border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}/guests`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-heading font-bold text-celebre-ink">
                    {guest.contact.fullName}
                  </h1>
                  {guest.contact.isVip && (
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-celebre-muted mt-1">
                  {guest.contact.relation}
                  {guest.household && ` • ${guest.household.label}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Dados Gerais</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="seat">Assentos</TabsTrigger>
            <TabsTrigger value="engagement">Engajamento</TabsTrigger>
            <TabsTrigger value="consent">Consentimento</TabsTrigger>
          </TabsList>

          {/* Dados Gerais */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-celebre-muted" />
                    <div>
                      <p className="text-xs text-celebre-muted">Telefone</p>
                      <p className="font-medium">{guest.contact.phone}</p>
                    </div>
                  </div>
                  {guest.contact.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-celebre-muted" />
                      <div>
                        <p className="text-xs text-celebre-muted">Email</p>
                        <p className="font-medium">{guest.contact.email}</p>
                      </div>
                    </div>
                  )}
                  {guest.household && (
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-celebre-muted" />
                      <div>
                        <p className="text-xs text-celebre-muted">Família</p>
                        <p className="font-medium">
                          {guest.household.label} ({guest.household.size} membros)
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RSVP & Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Status do Convite</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-celebre-muted mb-2">RSVP</p>
                    <Badge
                      className={`text-sm ${RSVP_COLORS[guest.rsvp as keyof typeof RSVP_COLORS] || RSVP_COLORS.pendente}`}
                    >
                      {getRsvpLabel(guest.rsvp)}
                    </Badge>
                  </div>
                  {editing ? (
                    <>
                      <div>
                        <label className="text-xs text-celebre-muted">Assentos</label>
                        <Input
                          type="number"
                          value={editForm.seats}
                          onChange={(e) =>
                            setEditForm({ ...editForm, seats: parseInt(e.target.value) || 0 })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-celebre-muted">Crianças</label>
                        <Input
                          type="number"
                          value={editForm.children}
                          onChange={(e) =>
                            setEditForm({ ...editForm, children: parseInt(e.target.value) || 0 })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-celebre-muted">Restrições Alimentares</label>
                        <Input
                          value={editForm.restrictions}
                          onChange={(e) =>
                            setEditForm({ ...editForm, restrictions: e.target.value })
                          }
                          className="mt-1"
                          placeholder="Ex: Vegetariano, sem glúten..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-celebre-muted" />
                        <div>
                          <p className="text-xs text-celebre-muted">Assentos</p>
                          <p className="font-medium">{guest.seats}</p>
                        </div>
                      </div>
                      {guest.children > 0 && (
                        <div className="flex items-center gap-3">
                          <Baby className="h-5 w-5 text-celebre-muted" />
                          <div>
                            <p className="text-xs text-celebre-muted">Crianças</p>
                            <p className="font-medium">{guest.children}</p>
                          </div>
                        </div>
                      )}
                      {guest.contact.restrictions && (
                        <div className="flex items-center gap-3">
                          <span className="text-orange-600">⚠️</span>
                          <div>
                            <p className="text-xs text-celebre-muted">Restrições Alimentares</p>
                            <p className="font-medium text-orange-600">
                              {guest.contact.restrictions}
                            </p>
                          </div>
                        </div>
                      )}
                      {guest.optOut && (
                        <div className="flex items-center gap-3">
                          <span className="text-red-600">🚫</span>
                          <div>
                            <p className="text-xs text-celebre-muted">Status</p>
                            <p className="font-medium text-red-600">Opt-out ativo</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Timeline de Interações</CardTitle>
                <CardDescription>
                  Histórico completo de interações com este convidado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(!guest.timeline || guest.timeline.length === 0) ? (
                  <div className="text-center py-8 text-celebre-muted">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma interação registrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guest.timeline.map((item) => {
                      const Icon = getInteractionIcon(item.type)
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 p-4 rounded-lg border hover:bg-celebre-accent/20 transition-colors"
                        >
                          <div className="mt-1">
                            <Icon className="h-5 w-5 text-celebre-muted" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-celebre-ink">{item.title}</p>
                            {item.description && (
                              <p className="text-sm text-celebre-muted mt-1">{item.description}</p>
                            )}
                            <p className="text-xs text-celebre-muted mt-2">
                              {formatDate(item.occurredAt)} às {formatTime(item.occurredAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seat Assignment */}
          <TabsContent value="seat">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Alocação de Assento</CardTitle>
                <CardDescription>Mesa e posição atribuídas</CardDescription>
              </CardHeader>
              <CardContent>
                {guest.seatAssignment ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-celebre-muted" />
                      <div>
                        <p className="text-xs text-celebre-muted">Mesa</p>
                        <p className="font-medium text-lg">
                          {guest.seatAssignment.seat.table.label}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-celebre-muted" />
                      <div>
                        <p className="text-xs text-celebre-muted">Assento</p>
                        <p className="font-medium">#{guest.seatAssignment.seat.index + 1}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      Ver no Planner de Mesas
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 text-celebre-muted">
                    <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Assento não alocado</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Alocar Assento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engagement */}
          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Score de Engajamento</CardTitle>
                <CardDescription>Nível de interação e interesse do convidado</CardDescription>
              </CardHeader>
              <CardContent>
                {guest.engagementScore ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-celebre-brand mb-2">
                        {guest.engagementScore.value}
                      </div>
                      <Badge
                        className={`text-sm ${ENGAGEMENT_COLORS[guest.engagementScore.tier as keyof typeof ENGAGEMENT_COLORS]}`}
                      >
                        {guest.engagementScore.tier.charAt(0).toUpperCase() +
                          guest.engagementScore.tier.slice(1)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-celebre-muted">Bronze</span>
                        <span className="text-celebre-muted">0-24</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-celebre-muted">Prata</span>
                        <span className="text-celebre-muted">25-49</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-celebre-muted">Ouro</span>
                        <span className="text-celebre-muted">50+</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">Histórico de Interações</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-celebre-muted">Mensagens WhatsApp</span>
                          <span className="font-medium">
                            {
                              guest.interactions.filter((i) => i.type === 'whatsapp_message')
                                .length
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-celebre-muted">Emails</span>
                          <span className="font-medium">
                            {guest.interactions.filter((i) => i.type === 'email_sent').length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-celebre-muted">Check-ins</span>
                          <span className="font-medium">{guest.checkins.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-celebre-muted">
                    <p>Score de engajamento não disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consent & Privacy */}
          <TabsContent value="consent">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Consentimento e Privacidade</CardTitle>
                <CardDescription>Logs LGPD e preferências de comunicação</CardDescription>
              </CardHeader>
              <CardContent>
                {guest.consentLogs.length === 0 ? (
                  <div className="text-center py-8 text-celebre-muted">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum log de consentimento registrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guest.consentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between p-3 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium text-celebre-ink">
                            {log.action === 'opt_in' ? 'Opt-in' : 'Opt-out'}
                          </p>
                          <p className="text-xs text-celebre-muted mt-1">{log.context}</p>
                          <p className="text-xs text-celebre-muted mt-2">
                            {formatDate(log.occurredAt)} às {formatTime(log.occurredAt)}
                          </p>
                        </div>
                        <Badge
                          variant={log.action === 'opt_in' ? 'success' : 'danger'}
                          className="text-xs"
                        >
                          {log.action === 'opt_in' ? 'Consentiu' : 'Recusou'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {guest.optOut && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <span>🚫</span>
                      <p className="font-medium">Opt-out ativo</p>
                    </div>
                    <p className="text-sm text-red-600 mt-1">
                      Este convidado solicitou não receber mais comunicações.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}