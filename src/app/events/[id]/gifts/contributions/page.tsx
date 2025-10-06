'use client'

import { ArrowLeft, Download, CheckCircle, Clock, XCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState, useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import {
  useGiftContributions,
  useUpdateContribution,
} from '@/hooks/useGiftsApi'
import type { GiftContribution } from '@/types/api'

type ContributionStatus = 'pending' | 'confirmed' | 'rejected' | 'all'

export default function GiftContributionsPage() {
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  // Queries
  const { data: contributions = [], isLoading } = useGiftContributions(eventId)

  // Mutations
  const updateMutation = useUpdateContribution(eventId)

  // Local state
  const [statusFilter, setStatusFilter] = useState<ContributionStatus>('all')
  const [search, setSearch] = useState('')
  const [selectedContribution, setSelectedContribution] = useState<GiftContribution | null>(null)
  const [showProofModal, setShowProofModal] = useState(false)

  // Filtered contributions
  const filteredContributions = useMemo(() => {
    let filtered = contributions

    if (statusFilter !== 'all') {
      filtered = filtered.filter((c) => c.status === statusFilter)
    }

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.guestName?.toLowerCase().includes(search.toLowerCase()) ||
          c.giftTitle?.toLowerCase().includes(search.toLowerCase())
      )
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [contributions, statusFilter, search])

  // Stats
  const stats = useMemo(() => {
    const total = contributions.length
    const pending = contributions.filter((c) => c.status === 'pending').length
    const confirmed = contributions.filter((c) => c.status === 'confirmed').length
    const rejected = contributions.filter((c) => c.status === 'rejected').length
    const totalAmount = contributions
      .filter((c) => c.status === 'confirmed')
      .reduce((sum, c) => sum + c.amount, 0)

    return { total, pending, confirmed, rejected, totalAmount }
  }, [contributions])

  function handleConfirm(contribution: GiftContribution) {
    if (!confirm('Confirmar pagamento desta contribuição?')) return

    updateMutation.mutate(
      {
        id: contribution.id,
        data: { status: 'confirmed' },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Contribuição confirmada',
            description: 'O pagamento foi confirmado com sucesso.',
          })
        },
      }
    )
  }

  function handleReject(contribution: GiftContribution) {
    if (!confirm('Rejeitar esta contribuição?')) return

    updateMutation.mutate(
      {
        id: contribution.id,
        data: { status: 'rejected' },
      },
      {
        onSuccess: () => {
          toast({
            title: 'Contribuição rejeitada',
            description: 'A contribuição foi rejeitada.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  function handleViewProof(contribution: GiftContribution) {
    setSelectedContribution(contribution)
    setShowProofModal(true)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 size-3" />
            Confirmado
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 size-3" />
            Pendente
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="mr-1 size-3" />
            Rejeitado
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="mx-auto mb-4 size-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Carregando contribuições...</p>
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
                  Contribuições de Presentes
                </h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  Gerencie pagamentos e confirmações
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
              <div className="text-sm font-medium text-gray-600">Total de Contribuições</div>
              <div className="mt-2 text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-yellow-600">Pendentes</div>
              <div className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-green-600">Confirmadas</div>
              <div className="mt-2 text-3xl font-bold text-green-600">{stats.confirmed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-600">Valor Confirmado</div>
              <div className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(stats.totalAmount)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <Input
            placeholder="Buscar por convidado ou presente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <div className="flex gap-2">
            {(['all', 'pending', 'confirmed', 'rejected'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                onClick={() => setStatusFilter(status)}
                size="sm"
              >
                {status === 'all' && 'Todos'}
                {status === 'pending' && 'Pendentes'}
                {status === 'confirmed' && 'Confirmados'}
                {status === 'rejected' && 'Rejeitados'}
              </Button>
            ))}
          </div>
        </div>

        {/* Contributions List */}
        {filteredContributions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-celebre-muted">Nenhuma contribuição encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredContributions.map((contribution) => (
              <Card key={contribution.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{contribution.guestName || 'Anônimo'}</h3>
                        {getStatusBadge(contribution.status)}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Presente: <span className="font-medium">{contribution.giftTitle}</span>
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span>Valor: {formatCurrency(contribution.amount)}</span>
                        {contribution.quotas && <span>Quotas: {contribution.quotas}</span>}
                        <span>{formatDate(contribution.createdAt)}</span>
                      </div>
                      {contribution.paymentMethod && (
                        <div className="mt-2">
                          <Badge variant="outline">
                            {contribution.paymentMethod === 'pix' && 'PIX'}
                            {contribution.paymentMethod === 'credit_card' && 'Cartão de Crédito'}
                            {contribution.paymentMethod === 'bank_transfer' && 'Transferência'}
                          </Badge>
                        </div>
                      )}
                      {contribution.transactionId && (
                        <p className="mt-1 text-xs text-gray-500">
                          ID: {contribution.transactionId}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {contribution.paymentProofUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewProof(contribution)}
                        >
                          <Eye className="mr-1 size-4" />
                          Ver Comprovante
                        </Button>
                      )}
                      {contribution.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConfirm(contribution)}
                            className="text-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="mr-1 size-4" />
                            Confirmar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(contribution)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="mr-1 size-4" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                      {contribution.receiptUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(contribution.receiptUrl, '_blank')}
                        >
                          <Download className="mr-1 size-4" />
                          Recibo
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Payment Proof Modal */}
      {showProofModal && selectedContribution?.paymentProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">Comprovante de Pagamento</h2>
            <div className="mb-4">
              <img
                src={selectedContribution.paymentProofUrl}
                alt="Comprovante de pagamento"
                className="w-full rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowProofModal(false)}
                className="flex-1"
              >
                Fechar
              </Button>
              <Button
                onClick={() => {
                  window.open(selectedContribution.paymentProofUrl, '_blank')
                }}
                className="flex-1"
              >
                <Download className="mr-2 size-4" />
                Baixar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
