'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Baby,
  Clock,
  Edit,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Send,
  Shield,
  Star,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useGuest, useUpdateGuest } from '@/features/guests/hooks/useGuests'
import { formatDate, formatTime } from '@/lib/utils'

const RSVP_COLORS = {
  sim: 'bg-green-100 text-green-800 border-green-200',
  nao: 'bg-red-100 text-red-800 border-red-200',
  talvez: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pendente: 'bg-gray-100 text-gray-800 border-gray-200',
}

const RSVP_LABELS = {
  sim: 'Confirmado',
  nao: 'Recusado',
  talvez: 'Talvez',
  pendente: 'Pendente',
}

const ENGAGEMENT_COLORS = {
  ouro: 'bg-yellow-100 text-yellow-900',
  prata: 'bg-gray-200 text-gray-800',
  bronze: 'bg-orange-100 text-orange-800',
}

export default function GuestProfilePage() {
  const params = useParams()
  const eventId = params.id as string
  const guestId = params.guestId as string
  const { toast } = useToast()

  // Queries
  const { data: guest, isLoading } = useGuest(guestId)

  // Mutations
  const updateMutation = useUpdateGuest()

  // Local state
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    seats: guest?.seats || 0,
    children: guest?.children || 0,
    transportNeeded: guest?.transportNeeded || false,
    restrictions: guest?.contact.restrictions || '',
  })

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        id: guestId,
        data: editForm,
      })
      toast({
        title: 'Convidado atualizado',
        description: 'As informações foram atualizadas com sucesso.',
      })
      setEditing(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o convidado.',
        variant: 'destructive',
      })
    }
  }

  function getInteractionIcon(type: string) {
    if (type === 'whatsapp_message') return MessageSquare
    if (type === 'email_sent') return Mail
    if (type === 'phone_call') return Phone
    return Clock
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="border-celebre-brand mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-celebre-muted">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
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
      <header className="shadow-celebre border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}/guests`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-3xl font-bold text-celebre-ink">
                    {guest.contact.fullName}
                  </h1>
                  {guest.contact.isVip && (
                    <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
                  )}
                </div>
                <p className="mt-1 text-sm text-celebre-muted">
                  {guest.contact.relation}
                  {guest.household && ` • ${guest.household.label}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Mensagem
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                    <p className="mb-2 text-xs text-celebre-muted">RSVP</p>
                    <Badge className={`text-sm ${RSVP_COLORS[guest.rsvp] || RSVP_COLORS.pendente}`}>
                      {RSVP_LABELS[guest.rsvp]}
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
                {!guest.timeline || guest.timeline.length === 0 ? (
                  <div className="py-8 text-center text-celebre-muted">
                    <Clock className="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p>Nenhuma interação registrada</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {guest.timeline.map((item) => {
                      const Icon = getInteractionIcon(item.type)
                      return (
                        <div
                          key={item.id}
                          className="hover:bg-celebre-accent/20 flex items-start gap-4 rounded-lg border p-4 transition-colors"
                        >
                          <div className="mt-1">
                            <Icon className="h-5 w-5 text-celebre-muted" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-celebre-ink">{item.title}</p>
                            {item.description && (
                              <p className="mt-1 text-sm text-celebre-muted">{item.description}</p>
                            )}
                            <p className="mt-2 text-xs text-celebre-muted">
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
                        <p className="text-lg font-medium">
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
                      <MapPin className="mr-2 h-4 w-4" />
                      Ver no Planner de Mesas
                    </Button>
                  </div>
                ) : (
                  <div className="py-8 text-center text-celebre-muted">
                    <MapPin className="mx-auto mb-2 h-12 w-12 opacity-50" />
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
                      <div className="text-celebre-brand mb-2 text-5xl font-bold">
                        {guest.engagementScore.value}
                      </div>
                      <Badge className={`text-sm ${ENGAGEMENT_COLORS[guest.engagementScore.tier]}`}>
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

                    <div className="border-t pt-4">
                      <h4 className="mb-3 font-medium">Histórico de Interações</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-celebre-muted">Mensagens WhatsApp</span>
                          <span className="font-medium">
                            {guest.interactions?.filter((i) => i.type === 'whatsapp_message')
                              .length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-celebre-muted">Emails</span>
                          <span className="font-medium">
                            {guest.interactions?.filter((i) => i.type === 'email_sent').length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-celebre-muted">Check-ins</span>
                          <span className="font-medium">{guest.checkins?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-celebre-muted">
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
                {!guest.consentLogs || guest.consentLogs.length === 0 ? (
                  <div className="py-8 text-center text-celebre-muted">
                    <Shield className="mx-auto mb-2 h-12 w-12 opacity-50" />
                    <p>Nenhum log de consentimento registrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {guest.consentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium text-celebre-ink">
                            {log.action === 'opt_in' ? 'Opt-in' : 'Opt-out'}
                          </p>
                          <p className="mt-1 text-xs text-celebre-muted">{log.context}</p>
                          <p className="mt-2 text-xs text-celebre-muted">
                            {formatDate(log.occurredAt)} às {formatTime(log.occurredAt)}
                          </p>
                        </div>
                        <Badge className="text-xs">
                          {log.action === 'opt_in' ? 'Consentiu' : 'Recusou'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {guest.optOut && (
                  <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <span>🚫</span>
                      <p className="font-medium">Opt-out ativo</p>
                    </div>
                    <p className="mt-1 text-sm text-red-600">
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
