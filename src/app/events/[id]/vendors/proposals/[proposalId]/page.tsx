'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  X,
  Star,
  MessageCircle,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  Clock,
  TrendingDown,
  Award,
  FileText,
  Download,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatCurrency } from '@/lib/utils'

// Mock data - replace with API
const MOCK_PROPOSAL_REQUEST = {
  id: '1',
  vendorCategory: 'Fotografia',
  eventDate: new Date('2024-06-15'),
  guestCount: 150,
  budgetMaxCents: 500000,
  description: 'Procuro fotógrafo para casamento ao ar livre, estilo natural e espontâneo...',
  requestType: 'auction',
  auctionEndsAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
  status: 'active',
  createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
}

const MOCK_PROPOSALS = [
  {
    id: '1',
    vendor: {
      id: 'v1',
      name: 'Fotografia João Silva',
      rating: 4.9,
      reviewCount: 89,
      imageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
    },
    priceCents: 380000,
    deliveryDays: 30,
    message:
      'Olá! Adoraria fotografar seu casamento. Tenho experiência com eventos ao ar livre e meu estilo é exatamente o que você procura...',
    includes: [
      'Cobertura completa de 8 horas',
      '500+ fotos editadas em alta resolução',
      'Álbum digital premium',
      'Galeria online privada por 2 anos',
      'Sessão de pré-wedding inclusa',
    ],
    portfolio: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=200',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=200',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=200',
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    id: '2',
    vendor: {
      id: 'v2',
      name: 'Studio Moments',
      rating: 4.7,
      reviewCount: 65,
    },
    priceCents: 420000,
    deliveryDays: 45,
    message: 'Boa tarde! Seria uma honra registrar esse momento especial...',
    includes: [
      'Cobertura de 10 horas',
      '400+ fotos editadas',
      'Álbum físico 30x30cm',
      'Vídeo highlights 5min',
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
  {
    id: '3',
    vendor: {
      id: 'v3',
      name: 'Lens & Love Fotografia',
      rating: 4.8,
      reviewCount: 102,
      imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400',
    },
    priceCents: 450000,
    deliveryDays: 35,
    message: 'Olá! Vi sua solicitação e me identifiquei muito com o que busca...',
    includes: [
      'Cobertura completa de 12 horas',
      '600+ fotos editadas',
      'Segundo fotógrafo incluso',
      'Álbum físico + digital',
      'Drone para fotos aéreas',
    ],
    status: 'pending',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
]

export default function ProposalDetailPage() {
  const params = useParams()
  const { id: eventId, proposalId } = params as { id: string; proposalId: string }

  const [selectedProposals, setSelectedProposals] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'compare'>('list')

  const proposalRequest = MOCK_PROPOSAL_REQUEST
  const proposals = MOCK_PROPOSALS.sort((a, b) => a.priceCents - b.priceCents)

  const lowestPrice = proposals.length > 0 ? proposals[0].priceCents / 100 : 0
  const avgPrice =
    proposals.length > 0
      ? proposals.reduce((sum, p) => sum + p.priceCents, 0) / proposals.length / 100
      : 0
  const savingsPercent =
    proposalRequest.budgetMaxCents > 0
      ? ((proposalRequest.budgetMaxCents - proposals[0].priceCents) /
          proposalRequest.budgetMaxCents) *
        100
      : 0

  const timeRemaining = proposalRequest.auctionEndsAt
    ? Math.max(0, proposalRequest.auctionEndsAt.getTime() - Date.now())
    : 0
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60))

  const toggleProposalSelection = (proposalId: string) => {
    setSelectedProposals((prev) =>
      prev.includes(proposalId)
        ? prev.filter((id) => id !== proposalId)
        : [...prev, proposalId]
    )
  }

  const handleAcceptProposal = (proposalId: string) => {
    console.log('Accept proposal:', proposalId)
    // Implementar lógica de aceitação
  }

  const handleDeclineProposal = (proposalId: string) => {
    console.log('Decline proposal:', proposalId)
    // Implementar lógica de recusa
  }

  const handleContact = (vendorId: string) => {
    console.log('Contact vendor:', vendorId)
    // Abrir chat/contato
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}/vendors/marketplace`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading text-2xl font-bold text-celebre-ink">
                  Propostas Recebidas
                </h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  {proposals.length} proposta{proposals.length !== 1 ? 's' : ''} para{' '}
                  {proposalRequest.vendorCategory}
                </p>
              </div>
            </div>

            {selectedProposals.length > 1 && (
              <Button
                variant={viewMode === 'compare' ? 'default' : 'outline'}
                onClick={() => setViewMode(viewMode === 'compare' ? 'list' : 'compare')}
              >
                {viewMode === 'compare' ? 'Ver Lista' : `Comparar (${selectedProposals.length})`}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Stats Banner */}
      <div className="border-b bg-gradient-to-r from-green-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(lowestPrice)}
              </p>
              <p className="text-xs text-celebre-muted">Melhor Oferta</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(avgPrice)}</p>
              <p className="text-xs text-celebre-muted">Preço Médio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {savingsPercent.toFixed(0)}%
              </p>
              <p className="text-xs text-celebre-muted">Economia</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{hoursRemaining}h</p>
              <p className="text-xs text-celebre-muted">Tempo Restante</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar - Request Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Sua Solicitação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="size-4 text-celebre-muted" />
                  <span className="text-celebre-ink">
                    {proposalRequest.eventDate.toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="size-4 text-celebre-muted" />
                  <span className="text-celebre-ink">
                    Orçamento: {formatCurrency(proposalRequest.budgetMaxCents / 100)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-celebre-muted" />
                  <span className="text-celebre-ink">
                    {proposalRequest.guestCount} convidados
                  </span>
                </div>

                <div className="border-t pt-4">
                  <p className="mb-2 text-sm font-semibold text-celebre-ink">Descrição:</p>
                  <p className="text-sm text-celebre-muted">
                    {proposalRequest.description}
                  </p>
                </div>

                {proposalRequest.requestType === 'auction' && (
                  <div className="rounded-lg bg-blue-50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Clock className="size-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">
                        Leilão em Andamento
                      </span>
                    </div>
                    <p className="text-xs text-blue-700">
                      O leilão termina em{' '}
                      <span className="font-bold">{hoursRemaining} horas</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Proposals */}
          <div className="lg:col-span-2">
            {viewMode === 'list' ? (
              <div className="space-y-4">
                {proposals.map((proposal, index) => {
                  const price = proposal.priceCents / 100
                  const isLowest = index === 0
                  const isSelected = selectedProposals.includes(proposal.id)

                  return (
                    <Card
                      key={proposal.id}
                      className={cn(
                        'relative overflow-hidden transition-all',
                        isSelected && 'ring-2 ring-purple-500',
                        isLowest && 'border-green-500'
                      )}
                    >
                      {isLowest && (
                        <div className="absolute right-0 top-0">
                          <div className="flex items-center gap-1 rounded-bl-xl bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                            <Award className="size-3" />
                            Melhor Oferta
                          </div>
                        </div>
                      )}

                      <CardContent className="p-6">
                        <div className="mb-4 flex items-start justify-between">
                          {/* Vendor Info */}
                          <div className="flex gap-4">
                            {proposal.vendor.imageUrl ? (
                              <img
                                src={proposal.vendor.imageUrl}
                                alt={proposal.vendor.name}
                                className="size-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex size-16 items-center justify-center rounded-lg bg-gray-200 text-2xl">
                                📸
                              </div>
                            )}

                            <div>
                              <h3 className="mb-1 font-semibold text-celebre-ink">
                                {proposal.vendor.name}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-celebre-muted">
                                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{proposal.vendor.rating}</span>
                                <span>({proposal.vendor.reviewCount} avaliações)</span>
                              </div>
                              <p className="mt-1 text-xs text-celebre-muted">
                                Enviado há{' '}
                                {Math.floor(
                                  (Date.now() - proposal.createdAt.getTime()) /
                                    (1000 * 60 * 60)
                                )}
                                h
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">
                              {formatCurrency(price)}
                            </p>
                            {price < proposalRequest.budgetMaxCents / 100 && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                                <TrendingDown className="size-3" />
                                <span>
                                  {(
                                    ((proposalRequest.budgetMaxCents / 100 - price) /
                                      (proposalRequest.budgetMaxCents / 100)) *
                                    100
                                  ).toFixed(0)}
                                  % abaixo do orçamento
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Message */}
                        <div className="mb-4 rounded-lg bg-gray-50 p-3">
                          <p className="text-sm text-celebre-ink">{proposal.message}</p>
                        </div>

                        {/* Includes */}
                        <div className="mb-4">
                          <p className="mb-2 text-sm font-semibold text-celebre-ink">
                            O que está incluso:
                          </p>
                          <ul className="space-y-1">
                            {proposal.includes.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <Check className="mt-0.5 size-4 flex-shrink-0 text-green-500" />
                                <span className="text-celebre-muted">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Portfolio Preview */}
                        {proposal.portfolio && proposal.portfolio.length > 0 && (
                          <div className="mb-4">
                            <p className="mb-2 text-sm font-semibold text-celebre-ink">
                              Portfolio:
                            </p>
                            <div className="flex gap-2">
                              {proposal.portfolio.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt={`Portfolio ${i + 1}`}
                                  className="size-20 rounded-lg object-cover"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleProposalSelection(proposal.id)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              className="mr-2"
                              readOnly
                            />
                            Comparar
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContact(proposal.vendor.id)}
                          >
                            <MessageCircle className="mr-1 size-4" />
                            Contato
                          </Button>

                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleAcceptProposal(proposal.id)}
                          >
                            <Check className="mr-1 size-4" />
                            Aceitar Proposta
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDeclineProposal(proposal.id)}
                          >
                            <X className="mr-1 size-4" />
                            Recusar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              /* Comparison View */
              <Card>
                <CardHeader>
                  <CardTitle>Comparação de Propostas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left text-sm font-semibold">Critério</th>
                          {selectedProposals.map((id) => {
                            const proposal = proposals.find((p) => p.id === id)
                            return (
                              <th key={id} className="p-3 text-center text-sm font-semibold">
                                {proposal?.vendor.name}
                              </th>
                            )
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="p-3 text-sm font-medium">Preço</td>
                          {selectedProposals.map((id) => {
                            const proposal = proposals.find((p) => p.id === id)
                            return (
                              <td key={id} className="p-3 text-center">
                                <span className="text-lg font-bold text-green-600">
                                  {formatCurrency((proposal?.priceCents || 0) / 100)}
                                </span>
                              </td>
                            )
                          })}
                        </tr>
                        <tr>
                          <td className="p-3 text-sm font-medium">Avaliação</td>
                          {selectedProposals.map((id) => {
                            const proposal = proposals.find((p) => p.id === id)
                            return (
                              <td key={id} className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                  <span>{proposal?.vendor.rating}</span>
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                        <tr>
                          <td className="p-3 text-sm font-medium">Prazo de Entrega</td>
                          {selectedProposals.map((id) => {
                            const proposal = proposals.find((p) => p.id === id)
                            return (
                              <td key={id} className="p-3 text-center text-sm">
                                {proposal?.deliveryDays} dias
                              </td>
                            )
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
