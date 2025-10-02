'use client'

import { useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  GiftCard,
  GiftFormModal,
  GiftsStats,
  GiftsFilters,
  GiftsEmptyState,
} from '@/features/gifts/components'
import {
  useGifts,
  useCreateGift,
  useUpdateGift,
  useDeleteGift,
  useUpdateGiftStatus,
} from '@/features/gifts/hooks/useGifts'
import type { Gift, GiftFormData, GiftStatus } from '@/schemas'

export default function GiftsPage() {
  const params = useParams()
  const eventId = params.id as string
  const { toast } = useToast()

  // Queries
  const { data: gifts = [], isLoading } = useGifts(eventId)

  // Mutations
  const createMutation = useCreateGift()
  const updateMutation = useUpdateGift()
  const deleteMutation = useDeleteGift()
  const updateStatusMutation = useUpdateGiftStatus()

  // Local state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<GiftStatus | 'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)

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
    setShowModal(true)
  }

  function handleEditClick(gift: Gift) {
    setEditingGift(gift)
    setShowModal(true)
  }

  async function handleSubmit(data: GiftFormData) {
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
        await createMutation.mutateAsync(data)
        toast({
          title: 'Presente criado',
          description: 'O presente foi criado com sucesso.',
        })
      }
      setShowModal(false)
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

  async function handleMarkReceived(id: string) {
    try {
      await updateStatusMutation.mutateAsync({ id, status: 'recebido' })
      toast({
        title: 'Status atualizado',
        description: 'O presente foi marcado como recebido.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description:
          error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o status.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="border-celebre-brand mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
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
                  <ArrowLeft className="h-5 w-5" />
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
              <Plus className="mr-2 h-4 w-4" />
              Novo Presente
            </Button>
          </div>
        </div>
      </header>

      {/* Modal */}
      <GiftFormModal
        gift={editingGift}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingGift(null)
        }}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="mb-8">
          <GiftsStats gifts={gifts} />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <GiftsFilters
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
                onEdit={handleEditClick}
                onDelete={handleDelete}
                onMarkReceived={handleMarkReceived}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
