'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    fetchVendors()
  }, [eventId])

  useEffect(() => {
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

    setFilteredVendors(filtered)
  }, [search, filterCategory, filterPayment, vendors])

  async function fetchVendors() {
    try {
      setLoading(true)
      const res = await fetch(`/api/events/${eventId}/vendors`)
      const data = await res.json()
      setVendors(data || [])
      setFilteredVendors(data || [])
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

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
    try {
      const url = editingVendor
        ? `/api/vendors/${editingVendor.id}`
        : `/api/events/${eventId}/vendors`

      const res = await fetch(url, {
        method: editingVendor ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setShowModal(false)
        await fetchVendors()
      }
    } catch (error) {
      console.error('Error saving vendor:', error)
    }
  }

  async function handleDelete(vendorId: string) {
    if (!confirm('Tem certeza que deseja deletar este fornecedor?')) return

    try {
      const res = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await fetchVendors()
      }
    } catch (error) {
      console.error('Error deleting vendor:', error)
    }
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
      <div className="min-h-screen bg-celebre-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-celebre-brand mx-auto mb-4"></div>
          <p className="text-celebre-muted">Carregando fornecedores...</p>
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
                  Fornecedores
                </h1>
                <p className="text-sm text-celebre-muted mt-1">
                  {vendors.length} fornecedor{vendors.length !== 1 ? 'es' : ''} cadastrados
                </p>
              </div>
            </div>
            <Button onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
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
                  {editingVendor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                  <X className="h-4 w-4" />
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
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
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
                  <label className="text-sm font-medium text-celebre-ink">Status de Pagamento</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
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
                    className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-celebre-brand" />
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
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-celebre-muted">Total Pago</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-500" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-celebre-muted" />
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
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
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
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
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
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-celebre-muted opacity-50" />
              <p className="text-celebre-muted">Nenhum fornecedor encontrado</p>
              <Button variant="outline" className="mt-4" onClick={openCreateModal}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Fornecedor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-celebre-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-celebre-ink mb-1">
                        {vendor.name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {vendor.category}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(vendor)}
                        className="p-2 hover:bg-celebre-accent rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4 text-celebre-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-celebre-muted">
                      <Phone className="h-4 w-4" />
                      <span>{vendor.phone || 'Sem telefone'}</span>
                    </div>
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm text-celebre-muted">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{vendor.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-celebre-muted">
                      <FileText className="h-4 w-4" />
                      <span>{vendor._count.tasks} tarefas vinculadas</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
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
                    <div className="flex justify-between items-center">
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
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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