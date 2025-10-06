'use client'

import {
  ArrowLeft,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  DollarSign,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useVendors, useCreateVendor, useUpdateVendor, useDeleteVendor } from '@/hooks'
import { formatCurrency } from '@/lib/utils'

interface Vendor {
  id: string
  name: string
  category: string
  contact: string
  email: string | null
  phone: string | null
  contractValue: number
  amountPaid: number
  paymentStatus: string
  contractUrl: string | null
  notes: string | null
  _count: {
    tasks: number
  }
}

const CATEGORIES = [
  'Buffet',
  'Decoração',
  'Fotografia',
  'Música',
  'Local',
  'Convites',
  'Floricultura',
  'Bolo',
  'Outros',
]

const PAYMENT_STATUS_COLORS = {
  pago: 'bg-green-100 text-green-800 border-green-200',
  parcial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pendente: 'bg-red-100 text-red-800 border-red-200',
}

export default function VendorsPage() {
  const params = useParams()
  const eventId = params.id as string

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Buffet',
    contact: '',
    email: '',
    phone: '',
    contractValue: 0,
    amountPaid: 0,
    paymentStatus: 'pendente',
    notes: '',
  })

  // Use backend API via TanStack Query
  const { data: vendors = [], isLoading: loading } = useVendors(eventId)
  const createVendorMutation = useCreateVendor(eventId)
  const updateVendorMutation = useUpdateVendor(eventId)
  const deleteVendorMutation = useDeleteVendor(eventId)

  // Client-side filtering
  const filteredVendors = useMemo(() => {
    let filtered = vendors

    if (search) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.contact.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((v) => v.category === filterCategory)
    }

    if (filterPayment !== 'all') {
      filtered = filtered.filter((v) => v.paymentStatus === filterPayment)
    }

    return filtered
  }, [search, filterCategory, filterPayment, vendors])

  function openCreateModal() {
    setEditingVendor(null)
    setFormData({
      name: '',
      category: 'Buffet',
      contact: '',
      email: '',
      phone: '',
      contractValue: 0,
      amountPaid: 0,
      paymentStatus: 'pendente',
      notes: '',
    })
    setShowModal(true)
  }

  function openEditModal(vendor: Vendor) {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contact: vendor.contact,
      email: vendor.email || '',
      phone: vendor.phone || '',
      contractValue: vendor.contractValue,
      amountPaid: vendor.amountPaid,
      paymentStatus: vendor.paymentStatus,
      notes: vendor.notes || '',
    })
    setShowModal(true)
  }

  async function handleSubmit() {
    if (editingVendor) {
      updateVendorMutation.mutate(
        {
          id: editingVendor.id,
          data: formData as any,
        },
        {
          onSuccess: () => {
            setShowModal(false)
          },
        }
      )
    } else {
      createVendorMutation.mutate(formData as any, {
        onSuccess: () => {
          setShowModal(false)
        },
      })
    }
  }

  async function handleDelete(vendorId: string) {
    if (!confirm('Tem certeza que deseja deletar este fornecedor?')) return

    deleteVendorMutation.mutate(vendorId)
  }

  function getPaymentLabel(status: string) {
    const labels: Record<string, string> = {
      pago: 'Pago',
      parcial: 'Parcial',
      pendente: 'Pendente',
    }
    return labels[status] || status
  }

  const totalContractValue = vendors.reduce((sum, v) => sum + v.contractValue, 0)
  const totalPaid = vendors.reduce((sum, v) => sum + v.amountPaid, 0)
  const totalPending = totalContractValue - totalPaid

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-celebre-bg">
        <div className="text-center">
          <div className="border-celebre-brand mx-auto mb-4 size-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-celebre-muted">Carregando fornecedores...</p>
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
                <h1 className="font-heading text-3xl font-bold text-celebre-ink">Fornecedores</h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  {vendors.length} fornecedor{vendors.length !== 1 ? 'es' : ''} cadastrados
                </p>
              </div>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 size-4" />
              Novo Fornecedor
            </Button>
          </div>
        </div>
      </header>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading">
                  {editingVendor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                  <X className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium text-celebre-ink">Nome do Fornecedor</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Buffet Delícias"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-celebre-ink">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="focus:ring-celebre-brand mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-celebre-ink">Pessoa de Contato</label>
                  <Input
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Nome do responsável"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-celebre-ink">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@fornecedor.com"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-celebre-ink">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-celebre-ink">Valor do Contrato</label>
                  <Input
                    type="number"
                    value={formData.contractValue}
                    onChange={(e) =>
                      setFormData({ ...formData, contractValue: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-celebre-ink">Valor Pago</label>
                  <Input
                    type="number"
                    value={formData.amountPaid}
                    onChange={(e) =>
                      setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-celebre-ink">
                    Status de Pagamento
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="focus:ring-celebre-brand mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="parcial">Parcial</option>
                    <option value="pago">Pago</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium text-celebre-ink">Observações</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionais sobre o fornecedor..."
                    rows={3}
                    className="focus:ring-celebre-brand mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="flex-1">
                  {editingVendor ? 'Salvar Alterações' : 'Criar Fornecedor'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="text-celebre-brand size-8" />
                <div>
                  <p className="text-sm text-celebre-muted">Valor Total Contratado</p>
                  <p className="text-2xl font-bold text-celebre-ink">
                    {formatCurrency(totalContractValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="size-8 text-green-500" />
                <div>
                  <p className="text-sm text-celebre-muted">Total Pago</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="size-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-celebre-muted">Pendente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(totalPending)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-celebre-muted" />
                <Input
                  type="text"
                  placeholder="Buscar fornecedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="focus:ring-celebre-brand rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="all">Todas as Categorias</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Payment Filter */}
              <select
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
                className="focus:ring-celebre-brand rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              >
                <option value="all">Todos os Status</option>
                <option value="pago">Pago</option>
                <option value="parcial">Parcial</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Vendors Grid */}
        {filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 size-12 text-celebre-muted opacity-50" />
              <p className="text-celebre-muted">Nenhum fornecedor encontrado</p>
              <Button variant="outline" className="mt-4" onClick={openCreateModal}>
                <Plus className="mr-2 size-4" />
                Adicionar Primeiro Fornecedor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-celebre-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-1 text-lg font-semibold text-celebre-ink">{vendor.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {vendor.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(vendor)}
                        className="hover:bg-celebre-accent rounded-lg p-2 transition-colors"
                      >
                        <Edit2 className="size-4 text-celebre-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="rounded-lg p-2 transition-colors hover:bg-red-100"
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-celebre-muted">
                      <Phone className="size-4" />
                      <span>{vendor.phone || 'Sem telefone'}</span>
                    </div>
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-celebre-muted">
                        <Mail className="size-4" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-celebre-muted">
                      <FileText className="size-4" />
                      <span>{vendor._count.tasks} tarefas vinculadas</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-celebre-muted">Valor do Contrato</span>
                      <span className="font-semibold text-celebre-ink">
                        {formatCurrency(vendor.contractValue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-celebre-muted">Pago</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(vendor.amountPaid)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-celebre-muted">Status</span>
                      <Badge
                        className={`text-xs ${PAYMENT_STATUS_COLORS[vendor.paymentStatus as keyof typeof PAYMENT_STATUS_COLORS]}`}
                      >
                        {getPaymentLabel(vendor.paymentStatus)}
                      </Badge>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{
                          width: `${vendor.contractValue > 0 ? (vendor.amountPaid / vendor.contractValue) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
