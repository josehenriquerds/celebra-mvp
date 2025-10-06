'use client'

import { ArrowLeft, Send, MessageCircle, Mail, Calendar, Gift } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  useThankYouNotes,
  useSendThankYou,
  useGiftContributions,
} from '@/hooks/useGiftsApi'
import type { ThankYouNote, GiftContribution } from '@/types/api'

type ThankYouStatus = 'pending' | 'sent' | 'all'

export default function GiftThankYouPage() {
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  // Queries
  const { data: thankYouNotes = [], isLoading: notesLoading } = useThankYouNotes(eventId)
  const { data: contributions = [], isLoading: contributionsLoading } = useGiftContributions(eventId)

  // Mutations
  const sendThankYouMutation = useSendThankYou(eventId)

  // Local state
  const [statusFilter, setStatusFilter] = useState<ThankYouStatus>('pending')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedContribution, setSelectedContribution] = useState<GiftContribution | null>(null)
  const [formData, setFormData] = useState({
    message: '',
    channel: 'whatsapp' as 'whatsapp' | 'email',
    imageUrl: '',
  })

  // Pending contributions (confirmed but no thank you sent)
  const pendingContributions = useMemo(() => {
    const sentContributionIds = new Set(thankYouNotes.map((n) => n.contributionId))
    return contributions.filter(
      (c) => c.status === 'confirmed' && !sentContributionIds.has(c.id)
    )
  }, [contributions, thankYouNotes])

  // Filtered notes
  const filteredNotes = useMemo(() => {
    let filtered = thankYouNotes

    if (search) {
      filtered = filtered.filter(
        (n) =>
          n.guestName?.toLowerCase().includes(search.toLowerCase()) ||
          n.giftTitle?.toLowerCase().includes(search.toLowerCase())
      )
    }

    return filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
  }, [thankYouNotes, search])

  // Stats
  const stats = useMemo(() => {
    const totalSent = thankYouNotes.length
    const totalPending = pendingContributions.length
    const whatsapp = thankYouNotes.filter((n) => n.channel === 'whatsapp').length
    const email = thankYouNotes.filter((n) => n.channel === 'email').length

    return { totalSent, totalPending, whatsapp, email }
  }, [thankYouNotes, pendingContributions])

  function handleSendClick(contribution: GiftContribution) {
    setSelectedContribution(contribution)
    setFormData({
      message: `Olá ${contribution.guestName || 'querido(a)'}!\n\nMuito obrigado(a) pela sua generosa contribuição para nosso ${contribution.giftTitle}. Seu carinho e apoio significam muito para nós!\n\nCom amor,\n[Seus nomes]`,
      channel: 'whatsapp',
      imageUrl: '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedContribution) return

    if (!formData.message.trim()) {
      toast({
        title: 'Erro',
        description: 'A mensagem é obrigatória.',
        variant: 'destructive',
      })
      return
    }

    sendThankYouMutation.mutate(
      {
        contributionId: selectedContribution.id,
        message: formData.message,
        channel: formData.channel,
        imageUrl: formData.imageUrl || undefined,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Agradecimento enviado!',
            description: `Mensagem enviada via ${formData.channel === 'whatsapp' ? 'WhatsApp' : 'E-mail'}.`,
          })
          setShowModal(false)
          setSelectedContribution(null)
        },
      }
    )
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const isLoading = notesLoading || contributionsLoading

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Carregando agradecimentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}/gifts`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-celebre-ink">
                  Agradecimentos
                </h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  Envie mensagens de agradecimento aos convidados
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-orange-600">Pendentes</div>
              <div className="mt-2 text-3xl font-bold text-orange-600">{stats.totalPending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-green-600">Enviados</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{stats.totalSent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <MessageCircle className="size-4" />
                WhatsApp
              </div>
              <div className="mt-2 text-3xl font-bold">{stats.whatsapp}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Mail className="size-4" />
                E-mail
              </div>
              <div className="mt-2 text-3xl font-bold">{stats.email}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('pending')}
          >
            Pendentes ({stats.totalPending})
          </Button>
          <Button
            variant={statusFilter === 'sent' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('sent')}
          >
            Enviados ({stats.totalSent})
          </Button>
        </div>

        {/* Search (only for sent) */}
        {statusFilter === 'sent' && (
          <div className="mb-6">
            <Input
              placeholder="Buscar por convidado ou presente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
        )}

        {/* Pending Contributions */}
        {statusFilter === 'pending' && (
          <>
            {pendingContributions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-celebre-muted">
                    Nenhum agradecimento pendente! 🎉
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingContributions.map((contribution) => (
                  <Card key={contribution.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="flex size-12 items-center justify-center rounded-full bg-orange-100">
                            <Gift className="size-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              {contribution.guestName || 'Anônimo'}
                            </h3>
                            <p className="mt-1 text-sm text-gray-600">
                              Presente: <span className="font-medium">{contribution.giftTitle}</span>
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
                              <span>{formatCurrency(contribution.amount)}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {formatDate(contribution.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => handleSendClick(contribution)}>
                          <Send className="mr-2 size-4" />
                          Enviar Agradecimento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Sent Thank You Notes */}
        {statusFilter === 'sent' && (
          <>
            {filteredNotes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-celebre-muted">Nenhum agradecimento enviado ainda</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {note.guestName || 'Anônimo'}
                            </h3>
                            <Badge className="bg-green-100 text-green-800">
                              Enviado
                            </Badge>
                            {note.channel === 'whatsapp' ? (
                              <Badge variant="outline">
                                <MessageCircle className="mr-1 size-3" />
                                WhatsApp
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <Mail className="mr-1 size-3" />
                                E-mail
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-gray-600">
                            Presente: <span className="font-medium">{note.giftTitle}</span>
                          </p>
                          <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                            {note.message}
                          </p>
                          {note.imageUrl && (
                            <img
                              src={note.imageUrl}
                              alt="Imagem do agradecimento"
                              className="mt-3 h-32 rounded-lg object-cover"
                            />
                          )}
                          <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="size-3" />
                            Enviado em {formatDate(note.sentAt)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Send Thank You Modal */}
      {showModal && selectedContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">
              Enviar Agradecimento para {selectedContribution.guestName}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Canal de Envio</Label>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant={formData.channel === 'whatsapp' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, channel: 'whatsapp' })}
                    className="flex-1"
                  >
                    <MessageCircle className="mr-2 size-4" />
                    WhatsApp
                  </Button>
                  <Button
                    type="button"
                    variant={formData.channel === 'email' ? 'default' : 'outline'}
                    onClick={() => setFormData({ ...formData, channel: 'email' })}
                    className="flex-1"
                  >
                    <Mail className="mr-2 size-4" />
                    E-mail
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Mensagem *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Escreva sua mensagem de agradecimento..."
                  rows={8}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.message.length} caracteres
                </p>
              </div>

              <div>
                <Label htmlFor="imageUrl">Imagem (URL) - Opcional</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/imagem.jpg"
                />
              </div>

              {formData.imageUrl && (
                <div>
                  <Label>Preview da Imagem</Label>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="mt-2 h-40 rounded-lg object-cover"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={sendThankYouMutation.isPending}
                  className="flex-1"
                >
                  {sendThankYouMutation.isPending ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="mr-2 size-4" />
                      Enviar Agradecimento
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
