'use client'

import {
  Search,
  Download,
  Send,
  Users,
  Star,
  Baby,
  Clock,
  Phone,
  ArrowLeft,
  Tag,
  Plus,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGuests } from '@/hooks'
import type { GuestGroup } from '@/lib/schemas'
import type { GetGuestsParams } from '@/services'

interface _Guest {
  id: string
  contact: {
    id: string
    fullName: string
    phone: string
    email: string | null
    relation: string
    isVip: boolean
    restrictions: string | null
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
  tags?: {
    id: string
    name: string
  }[]
}

const FILTERS = [
  { value: undefined, label: 'Todos', icon: Users },
  { value: 'confirmed' as const, label: 'Confirmados', icon: Users },
  { value: 'pending' as const, label: 'Pendentes', icon: Clock },
  { value: 'vip' as const, label: 'VIPs', icon: Star },
  { value: 'children' as const, label: 'Com Crianças', icon: Baby },
  { value: 'no_phone' as const, label: 'Sem Telefone', icon: Phone },
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

  const [filter, setFilter] = useState<GetGuestsParams['filter']>()
  const [search, setSearch] = useState('')
  const [selectedGuests, setSelectedGuests] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  // Use backend API via TanStack Query
  const { data: guestsData, isLoading: loading, refetch } = useGuests({
    eventId,
    filter,
    search: search || undefined,
    page,
    limit: 50,
  })

  const guests = guestsData?.items || []
  const total = guestsData?.total || 0
  const totalPages = guestsData?.totalPages || 0
  const groups = Array.isArray(guestsData?.groups) ? guestsData.groups : []

  async function createGroup() {
    if (!newGroupName.trim()) return

    try {
      const res = await fetch(`/api/events/${eventId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName }),
      })

      if (res.ok) {
        setNewGroupName('')
        setShowGroupModal(false)
        await refetch()
      }
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  async function assignToGroup(groupId: string) {
    if (selectedGuests.size === 0) return

    try {
      const res = await fetch(`/api/events/${eventId}/groups/${groupId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestIds: Array.from(selectedGuests) }),
      })

      if (res.ok) {
        setShowAssignModal(false)
        setSelectedGuests(new Set())
        await refetch()
      }
    } catch (error) {
      console.error('Error assigning guests:', error)
    }
  }

  async function deleteGroup(groupId: string) {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return

    try {
      const res = await fetch(`/api/events/${eventId}/groups/${groupId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await refetch()
      }
    } catch (error) {
      console.error('Error deleting group:', error)
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
                <h1 className="font-heading text-3xl font-bold text-celebre-ink">Convidados</h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  {total} convidado{total !== 1 ? 's' : ''} no total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowGroupModal(true)}>
                <Plus className="mr-2 size-4" />
                Novo Grupo
              </Button>
              {selectedGuests.size > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowAssignModal(true)}>
                  <Tag className="mr-2 size-4" />
                  Atribuir Grupo ({selectedGuests.size})
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="mr-2 size-4" />
                Exportar CSV
              </Button>
              {selectedGuests.size > 0 && (
                <Button size="sm" onClick={handleSendInvites}>
                  <Send className="mr-2 size-4" />
                  Enviar Convites ({selectedGuests.size})
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Groups Section */}
        {groups.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-celebre-ink">Grupos</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="group inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 transition-all hover:shadow-sm"
                >
                  <Tag className="text-celebre-brand size-4" />
                  <span className="text-sm font-medium text-celebre-ink">{group.name}</span>
                  <span className="text-xs text-celebre-muted">({group.guestCount})</span>
                  <button
                    onClick={() => deleteGroup(group.id)}
                    className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3 text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 transition-all ${
                    filter === f.value
                      ? 'bg-celebre-brand border-celebre-brand text-white'
                      : 'hover:bg-celebre-accent border-gray-300 bg-white text-celebre-ink'
                  }`}
                >
                  <Icon className="size-4" />
                  <span className="text-sm font-medium">{f.label}</span>
                </button>
              )
            })}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-celebre-muted" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="focus:ring-celebre-brand w-full rounded-xl border border-gray-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2"
            />
          </div>
        </div>

        {/* Guests List */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="border-celebre-brand mx-auto mb-4 size-12 animate-spin rounded-full border-b-2"></div>
            <p className="text-celebre-muted">Carregando convidados...</p>
          </div>
        ) : guests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto mb-4 size-12 text-celebre-muted opacity-50" />
              <p className="text-celebre-muted">Nenhum convidado encontrado</p>
              {(filter || search) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setFilter(undefined)
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
                className="text-celebre-brand focus:ring-celebre-brand size-4 rounded border-gray-300"
              />
              <span className="text-sm text-celebre-muted">Selecionar todos ({guests.length})</span>
            </div>

            {/* Guest Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {guests.map((guest) => (
                <Card
                  key={guest.id}
                  className={`hover:shadow-celebre-lg cursor-pointer transition-all ${
                    selectedGuests.has(guest.id) ? 'ring-celebre-brand ring-2' : ''
                  }`}
                  onClick={() => router.push(`/events/${eventId}/guests/${guest.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedGuests.has(guest.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleSelectGuest(guest.id)
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-celebre-brand focus:ring-celebre-brand mt-1 size-4 rounded border-gray-300"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h3 className="truncate font-semibold text-celebre-ink">
                              {guest.contact.fullName}
                            </h3>
                            {guest.contact.isVip && (
                              <Star className="size-4 shrink-0 fill-yellow-500 text-yellow-500" />
                            )}
                          </div>
                          <p className="text-xs text-celebre-muted">{guest.contact.phone}</p>
                          {guest.household && (
                            <p className="mt-1 text-xs text-celebre-muted">
                              {guest.household.label}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge
                        className={`text-xs ${RSVP_COLORS[guest.rsvp as keyof typeof RSVP_COLORS] || RSVP_COLORS.pendente}`}
                      >
                        {getRsvpLabel(guest.rsvp)}
                      </Badge>
                      {guest.engagementScore && (
                        <Badge
                          className={`text-xs ${ENGAGEMENT_COLORS[guest.engagementScore.tier as keyof typeof ENGAGEMENT_COLORS]}`}
                        >
                          {guest.engagementScore.tier.charAt(0).toUpperCase() +
                            guest.engagementScore.tier.slice(1)}{' '}
                          ({guest.engagementScore.value})
                        </Badge>
                      )}
                      {guest.children > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Baby className="mr-1 size-3" />
                          {guest.children}
                        </Badge>
                      )}
                      {guest.tags?.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="bg-celebre-accent text-xs">
                          <Tag className="mr-1 size-3" />
                          {tag.name}
                        </Badge>
                      ))}
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

      {/* Create Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-semibold text-celebre-ink">Criar Novo Grupo</h2>
            <input
              type="text"
              placeholder="Nome do grupo (ex: Amigos da Noiva)"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createGroup()}
              className="focus:ring-celebre-brand mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowGroupModal(false)
                  setNewGroupName('')
                }}
              >
                Cancelar
              </Button>
              <Button onClick={createGroup} disabled={!newGroupName.trim()}>
                Criar Grupo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign to Group Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-semibold text-celebre-ink">
              Atribuir {selectedGuests.size} convidado(s) ao grupo
            </h2>
            <div className="mb-4 max-h-64 space-y-2 overflow-y-auto">
              {groups.length === 0 ? (
                <p className="py-4 text-center text-sm text-celebre-muted">
                  Nenhum grupo criado. Crie um grupo primeiro.
                </p>
              ) : (
                groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => assignToGroup(group.id)}
                    className="hover:bg-celebre-accent flex w-full items-center justify-between rounded-xl border border-gray-300 px-4 py-3 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="text-celebre-brand size-4" />
                      <span className="font-medium text-celebre-ink">{group.name}</span>
                    </div>
                    <span className="text-xs text-celebre-muted">
                      {group.guestCount} convidados
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
