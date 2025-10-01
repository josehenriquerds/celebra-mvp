'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Search, Filter, Download, Send, Users, Star, Baby, Clock, Phone, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Guest {
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
    value: number
    tier: string
  } | null
  table: {
    id: string
    label: string
  } | null
}

const FILTERS = [
  { value: 'all', label: 'Todos', icon: Users },
  { value: 'confirmed', label: 'Confirmados', icon: Users },
  { value: 'pending', label: 'Pendentes', icon: Clock },
  { value: 'vip', label: 'VIPs', icon: Star },
  { value: 'children', label: 'Com Crianças', icon: Baby },
  { value: 'no_phone', label: 'Sem Telefone', icon: Phone },
]

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

export default function GuestsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    fetchGuests()
  }, [eventId, filter, search, page])

  async function fetchGuests() {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams({
        ...(filter !== 'all' && { filter }),
        ...(search && { search }),
        page: page.toString(),
        limit: '50',
      })

      const res = await fetch(`/api/events/${eventId}/guests?${queryParams}`)
      const data = await res.json()

      setGuests(data.guests || [])
      setTotal(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 0)
    } catch (error) {
      console.error('Error fetching guests:', error)
    } finally {
      setLoading(false)
    }
  }

  function toggleSelectGuest(guestId: string) {
    const newSelected = new Set(selectedGuests)
    if (newSelected.has(guestId)) {
      newSelected.delete(guestId)
    } else {
      newSelected.add(guestId)
    }
    setSelectedGuests(newSelected)
  }

  function toggleSelectAll() {
    if (selectedGuests.size === guests.length) {
      setSelectedGuests(new Set())
    } else {
      setSelectedGuests(new Set(guests.map((g) => g.id)))
    }
  }

  function handleExportCSV() {
    // Build CSV
    const headers = ['Nome', 'Telefone', 'Email', 'Relação', 'RSVP', 'Mesa', 'Família']
    const rows = guests.map((g) => [
      g.contact.fullName,
      g.contact.phone,
      g.contact.email || '',
      g.contact.relation,
      g.rsvp,
      g.table?.label || 'Não alocado',
      g.household?.label || '',
    ])

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `convidados-${eventId}.csv`
    a.click()
  }

  async function handleSendInvites() {
    if (selectedGuests.size === 0) {
      alert('Selecione pelo menos um convidado')
      return
    }

    // TODO: Implement send invites API call
    alert(`Enviando convites para ${selectedGuests.size} convidado(s)...`)
    setSelectedGuests(new Set())
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
                  Convidados
                </h1>
                <p className="text-sm text-celebre-muted mt-1">
                  {total} convidado{total !== 1 ? 's' : ''} no total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              {selectedGuests.size > 0 && (
                <Button size="sm" onClick={handleSendInvites}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Convites ({selectedGuests.size})
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Search */}
        <div className="mb-6 space-y-4">
          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const Icon = f.icon
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    setFilter(f.value)
                    setPage(1)
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                    filter === f.value
                      ? 'bg-celebre-brand text-white border-celebre-brand'
                      : 'bg-white text-celebre-ink border-gray-300 hover:bg-celebre-accent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{f.label}</span>
                </button>
              )
            })}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-celebre-muted" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-celebre-brand"
            />
          </div>
        </div>

        {/* Guests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebre-brand mx-auto mb-4"></div>
            <p className="text-celebre-muted">Carregando convidados...</p>
          </div>
        ) : guests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-celebre-muted opacity-50" />
              <p className="text-celebre-muted">Nenhum convidado encontrado</p>
              {(filter !== 'all' || search) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setFilter('all')
                    setSearch('')
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedGuests.size === guests.length && guests.length > 0}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-celebre-brand focus:ring-celebre-brand"
              />
              <span className="text-sm text-celebre-muted">
                Selecionar todos ({guests.length})
              </span>
            </div>

            {/* Guest Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guests.map((guest) => (
                <Card
                  key={guest.id}
                  className={`cursor-pointer transition-all hover:shadow-celebre-lg ${
                    selectedGuests.has(guest.id) ? 'ring-2 ring-celebre-brand' : ''
                  }`}
                  onClick={() => router.push(`/events/${eventId}/guests/${guest.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedGuests.has(guest.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleSelectGuest(guest.id)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-celebre-brand focus:ring-celebre-brand"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-celebre-ink truncate">
                              {guest.contact.fullName}
                            </h3>
                            {guest.contact.isVip && (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-celebre-muted">
                            {guest.contact.phone}
                          </p>
                          {guest.household && (
                            <p className="text-xs text-celebre-muted mt-1">
                              {guest.household.label}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        className={`text-xs ${RSVP_COLORS[guest.rsvp as keyof typeof RSVP_COLORS] || RSVP_COLORS.pendente}`}
                      >
                        {getRsvpLabel(guest.rsvp)}
                      </Badge>
                      {guest.engagementScore && (
                        <Badge
                          className={`text-xs ${ENGAGEMENT_COLORS[guest.engagementScore.tier as keyof typeof ENGAGEMENT_COLORS]}`}
                        >
                          {guest.engagementScore.tier.charAt(0).toUpperCase() + guest.engagementScore.tier.slice(1)} ({guest.engagementScore.value})
                        </Badge>
                      )}
                      {guest.children > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Baby className="h-3 w-3 mr-1" />
                          {guest.children}
                        </Badge>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1 text-xs text-celebre-muted">
                      {guest.table && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Mesa:</span>
                          <span>{guest.table.label}</span>
                        </div>
                      )}
                      {guest.contact.restrictions && (
                        <div className="flex items-center gap-1 text-orange-600">
                          <span>⚠️ Restrições alimentares</span>
                        </div>
                      )}
                      {guest.optOut && (
                        <div className="flex items-center gap-1 text-red-600">
                          <span>🚫 Opt-out ativo</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <span className="text-sm text-celebre-muted">
                  Página {page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}