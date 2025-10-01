'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Search,
  Gift,
  ExternalLink,
  CheckCircle,
  Clock,
  ShoppingCart,
  X,
  Edit2,
  Trash2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface GiftItem {
  id: string
  title: string
  description: string | null
  price: number
  imageUrl: string | null
  externalUrl: string | null
  status: string
  guest: {
    id: string
    contact: {
      fullName: string
    }
  } | null
}

const STATUS_COLORS = {
  disponivel: 'bg-gray-100 text-gray-800 border-gray-200',
  reservado: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  recebido: 'bg-green-100 text-green-800 border-green-200',
}

const STATUS_ICONS = {
  disponivel: ShoppingCart,
  reservado: Clock,
  recebido: CheckCircle,
}

export default function GiftsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [gifts, setGifts] = useState<GiftItem[]>([])
  const [filteredGifts, setFilteredGifts] = useState<GiftItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingGift, setEditingGift] = useState<GiftItem | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    externalUrl: '',
  })

  useEffect(() => {
    fetchGifts()
  }, [eventId])

  useEffect(() => {
    let filtered = gifts

    if (search) {
      filtered = filtered.filter((g) =>
        g.title.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((g) => g.status === filterStatus)
    }

    setFilteredGifts(filtered)
  }, [search, filterStatus, gifts])

  async function fetchGifts() {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}/gifts`)
      const data = await res.json()
      setGifts(data || [])
      setFilteredGifts(data || [])
    } catch (error) {
      console.error('Error fetching gifts:', error)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingGift(null)
    setFormData({
      title: '',
      description: '',
      price: 0,
      imageUrl: '',
      externalUrl: '',
    })
    setShowModal(true)
  }

  function openEditModal(gift: GiftItem) {
    setEditingGift(gift)
    setFormData({
      title: gift.title,
      description: gift.description || '',
      price: gift.price,
      imageUrl: gift.imageUrl || '',
      externalUrl: gift.externalUrl || '',
    })
    setShowModal(true)
  }

  async function handleSubmit() {
    try {
      const url = editingGift
        ? `/api/gifts/${editingGift.id}`
        : `/api/events/${eventId}/gifts`

      const res = await fetch(url, {
        method: editingGift ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        await fetchGifts()
      }
    } catch (error) {
      console.error('Error saving gift:', error)
    }
  }

  async function handleDelete(giftId: string) {
    if (!confirm('Tem certeza que deseja deletar este presente?')) return

    try {
      const res = await fetch(`/api/gifts/${giftId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchGifts()
      }
    } catch (error) {
      console.error('Error deleting gift:', error)
    }
  }

  async function handleMarkAsReceived(giftId: string) {
    try {
      const res = await fetch(`/api/gifts/${giftId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'recebido' }),
      })

      if (res.ok) {
        await fetchGifts()
        // Trigger thank you workflow (already exists in n8n)
      }
    } catch (error) {
      console.error('Error marking gift as received:', error)
    }
  }

  function getStatusLabel(status: string) {
    const labels: Record<string, string> = {
      disponivel: 'Disponível',
      reservado: 'Reservado',
      recebido: 'Recebido',
    }
    return labels[status] || status
  }

  const totalValue = gifts.reduce((sum, g) => sum + g.price, 0)
  const receivedCount = gifts.filter((g) => g.status === 'recebido').length
  const reservedCount = gifts.filter((g) => g.status === 'reservado').length
  const availableCount = gifts.filter((g) => g.status === 'disponivel').length

  if (loading) {
    return (
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebre-brand mx-auto mb-4"></div>
          <p className="text-celebre-muted">Carregando presentes...</p>
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
              <Link href={`/events/${eventId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-heading font-bold text-celebre-ink">
                  Lista de Presentes
                </h1>
                <p className="text-sm text-celebre-muted mt-1">
                  {gifts.length} item{gifts.length !== 1 ? 's' : ''} cadastrados
                </p>
              </div>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Presente
            </Button>
          </div>
        </div>
      </header>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading">
                  {editingGift ? 'Editar Presente' : 'Novo Presente'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-celebre-ink">Título</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Jogo de Panelas"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-celebre-ink">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição detalhada do presente..."
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-celebre-ink">Preço (R$)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-celebre-ink">URL da Imagem</label>
                <Input
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-celebre-ink">Link Externo (Opcional)</label>
                <Input
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  placeholder="https://loja.com/produto"
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  {editingGift ? 'Salvar Alterações' : 'Criar Presente'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 text-celebre-brand" />
              <div className="text-3xl font-bold text-celebre-brand">{gifts.length}</div>
              <p className="text-sm text-celebre-muted mt-1">Total de Itens</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-3xl font-bold text-green-600">{receivedCount}</div>
              <p className="text-sm text-celebre-muted mt-1">Recebidos</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-3xl font-bold text-yellow-600">{reservedCount}</div>
              <p className="text-sm text-celebre-muted mt-1">Reservados</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-gray-500" />
              <div className="text-3xl font-bold text-gray-600">{availableCount}</div>
              <p className="text-sm text-celebre-muted mt-1">Disponíveis</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-celebre-muted" />
                <Input
                  type="text"
                  placeholder="Buscar presente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
              >
                <option value="all">Todos os Status</option>
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservado</option>
                <option value="recebido">Recebido</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Gifts Grid */}
        {filteredGifts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Gift className="h-12 w-12 mx-auto mb-4 text-celebre-muted opacity-50" />
              <p className="text-celebre-muted">Nenhum presente encontrado</p>
              <Button variant="outline" className="mt-4" onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Presente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGifts.map((gift) => {
              const StatusIcon = STATUS_ICONS[gift.status as keyof typeof STATUS_ICONS]
              return (
                <Card key={gift.id} className="hover:shadow-celebre-lg transition-shadow overflow-hidden">
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {gift.imageUrl ? (
                      <img
                        src={gift.imageUrl}
                        alt={gift.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift className="h-16 w-16 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        onClick={() => openEditModal(gift)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-celebre-brand" />
                      </button>
                      <button
                        onClick={() => handleDelete(gift.id)}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="mb-3">
                      <h3 className="font-semibold text-celebre-ink mb-1 line-clamp-2">
                        {gift.title}
                      </h3>
                      {gift.description && (
                        <p className="text-xs text-celebre-muted line-clamp-2">
                          {gift.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-celebre-brand">
                        {formatCurrency(gift.price)}
                      </span>
                      <Badge
                        className={`text-xs ${STATUS_COLORS[gift.status as keyof typeof STATUS_COLORS]}`}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {getStatusLabel(gift.status)}
                      </Badge>
                    </div>

                    {gift.guest && (
                      <p className="text-xs text-celebre-muted mb-3">
                        Reservado por: <span className="font-medium">{gift.guest.contact.fullName}</span>
                      </p>
                    )}

                    <div className="flex gap-2">
                      {gift.externalUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(gift.externalUrl!, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ver Loja
                        </Button>
                      )}
                      {gift.status === 'reservado' && (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleMarkAsReceived(gift.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Marcar Recebido
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}