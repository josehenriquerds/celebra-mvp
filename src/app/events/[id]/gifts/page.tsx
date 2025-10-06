'use client'

import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  GiftCard,
  GiftsEmptyState,
  GiftDrawerForm,
  KpiGifts,
  GiftFilters,
} from '@/features/gifts/components'
import {
  useGiftsApi,
  useCreateGiftApi,
  useUpdateGiftApi,
  useDeleteGiftApi,
} from '@/hooks/useGiftsApi'
import type { Gift, GiftStatus } from '@/types/api'
import {
  ReserveCotaoModal,
  ConfirmPaymentModal,
  ThankYouModal,
} from './components'

export default function GiftsPage() {
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  // Queries
  const { data: gifts = [], isLoading } = useGiftsApi(eventId)

  // Mutations
  const createMutation = useCreateGiftApi(eventId)
  const updateMutation = useUpdateGiftApi()
  const deleteMutation = useDeleteGiftApi()

  // Local state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<GiftStatus | 'all'>('all')
  const [showDrawer, setShowDrawer] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)

  // Cotão flow state
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [showReserveModal, setShowReserveModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showThankYouModal, setShowThankYouModal] = useState(false)
  const [reservationData, setReservationData] = useState<{
    reservationId: string
    pixQRCode?: string
  } | null>(null)
  const [contributionId, setContributionId] = useState<string | null>(null)

  // Filtered gifts
  const filteredGifts = useMemo(() => {
    let filtered = gifts

    if (search) {
      filtered = filtered.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()))
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((g) => g.status === statusFilter)
    }

    return filtered
  }, [gifts, search, statusFilter])

  // Handlers
  function handleCreateClick() {
    setEditingGift(null)
    setShowDrawer(true)
  }

  function handleEditClick(gift: Gift) {
    setEditingGift(gift)
    setShowDrawer(true)
  }

  async function handleSubmit(data: Partial<Gift>) {
    try {
      if (editingGift) {
        await updateMutation.mutateAsync({
          id: editingGift.id,
          data,
        })
        toast({
          title: 'Presente atualizado',
          description: 'O presente foi atualizado com sucesso.',
        })
      } else {
        await createMutation.mutateAsync(data as any)
        toast({
          title: 'Presente criado',
          description: 'O presente foi criado com sucesso.',
        })
      }
      setShowDrawer(false)
      setEditingGift(null)
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          error instanceof Error ? error.message : 'Ocorreu um erro ao salvar o presente.',
        variant: 'destructive',
      })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja deletar este presente?')) return

    try {
      await deleteMutation.mutateAsync(id)
      toast({
        title: 'Presente excluído',
        description: 'O presente foi excluído com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          error instanceof Error ? error.message : 'Ocorreu um erro ao excluir o presente.',
        variant: 'destructive',
      })
    }
  }

  // Cotão flow handlers
  function handleReserveClick(gift: Gift) {
    setSelectedGift(gift)
    setShowReserveModal(true)
  }

  function handleReserveSuccess(reservationId: string, pixQRCode?: string) {
    setReservationData({ reservationId, pixQRCode })
    setShowReserveModal(false)
    setShowConfirmModal(true)
    toast({
      title: 'Reserva realizada!',
      description: 'Agora confirme seu pagamento.',
    })
  }

  function handleConfirmSuccess() {
    setShowConfirmModal(false)
    toast({
      title: 'Pagamento enviado!',
      description: 'Aguarde a confirmação dos noivos.',
    })
    // Could automatically open thank you modal after confirmation
  }

  function handleThankYouSuccess() {
    setShowThankYouModal(false)
    toast({
      title: 'Agradecimento enviado!',
      description: 'Sua mensagem foi enviada com sucesso.',
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="border-celebre-brand mx-auto mb-4 size-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-celebre-muted">Carregando presentes...</p>
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
              <Link href={`/events/${eventId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading text-3xl font-bold text-celebre-ink">
                  Lista de Presentes
                </h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  {gifts.length} item{gifts.length !== 1 ? 's' : ''} cadastrados
                </p>
              </div>
            </div>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 size-4" />
              Novo Presente
            </Button>
          </div>
        </div>
      </header>

      {/* Drawer Form */}
      <GiftDrawerForm
        gift={editingGift}
        isOpen={showDrawer}
        onClose={() => {
          setShowDrawer(false)
          setEditingGift(null)
        }}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Cotão Flow Modals */}
      {selectedGift && (
        <>
          <ReserveCotaoModal
            gift={selectedGift}
            isOpen={showReserveModal}
            onClose={() => setShowReserveModal(false)}
            onSuccess={handleReserveSuccess}
          />

          {reservationData && (
            <ConfirmPaymentModal
              gift={selectedGift}
              reservationId={reservationData.reservationId}
              pixQRCode={reservationData.pixQRCode}
              isOpen={showConfirmModal}
              onClose={() => setShowConfirmModal(false)}
              onSuccess={handleConfirmSuccess}
            />
          )}

          {contributionId && (
            <ThankYouModal
              contributionId={contributionId}
              guestName="Convidado"
              eventId={eventId}
              isOpen={showThankYouModal}
              onClose={() => setShowThankYouModal(false)}
              onSuccess={handleThankYouSuccess}
            />
          )}
        </>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="mb-8">
          <KpiGifts eventId={eventId} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <GiftFilters
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>

        {/* Gifts Grid */}
        {filteredGifts.length === 0 ? (
          <GiftsEmptyState onCreateClick={handleCreateClick} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredGifts.map((gift) => (
              <GiftCard
                key={gift.id}
                gift={gift}
                onEdit={() => handleEditClick(gift)}
                onDelete={() => handleDelete(gift.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
