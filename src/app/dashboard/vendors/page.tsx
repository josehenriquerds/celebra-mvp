'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface VendorPartner {
  id: string
  slug: string
  companyName: string
  contactName: string
  email: string
  phoneE164: string
  city: string
  state: string
  categories: string[]
  status: 'pending_review' | 'approved' | 'rejected' | 'suspended'
  profileScore: number
  createdAt: string
  _count: {
    reviews: number
    notes: number
  }
}

interface VendorListResponse {
  vendors: VendorPartner[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function VendorCRMPage() {
  const [activeTab, setActiveTab] = useState('pending_review')
  const [vendors, setVendors] = useState<VendorPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: activeTab,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchQuery && { q: searchQuery }),
        ...(selectedCity && { city: selectedCity }),
        ...(selectedCategory && { category: selectedCategory }),
      })

      const res = await fetch(`/api/vendors?${params}`)
      const data: VendorListResponse = await res.json()

      setVendors(data.vendors)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }, [activeTab, pagination.limit, pagination.page, searchQuery, selectedCity, selectedCategory])

  useEffect(() => {
    void fetchVendors()
  }, [fetchVendors])

  const handleStatusChange = async (
    vendorId: string,
    action: 'approve' | 'reject' | 'suspend' | 'reactivate'
  ) => {
    if (!confirm(`Confirmar ação: ${action}?`)) return

    try {
      const res = await fetch(`/api/vendor-partners/${vendorId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          actorUserId: 'admin', // TODO: pegar do auth
          reason: `Ação realizada via CRM`,
        }),
      })

      if (res.ok) {
        alert('Status atualizado com sucesso!')
        fetchVendors()
      } else {
        alert('Erro ao atualizar status')
      }
    } catch (error) {
      console.error('Error changing status:', error)
      alert('Erro ao atualizar status')
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending_review: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Aprovado', className: 'bg-green-100 text-green-800' },
      rejected: { label: 'Reprovado', className: 'bg-red-100 text-red-800' },
      suspended: { label: 'Suspenso', className: 'bg-gray-100 text-gray-800' },
    }

    const variant = variants[status] || variants.pending_review

    return <Badge className={variant.className}>{variant.label}</Badge>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Parceiros</h1>
          <p className="text-gray-600">Modere e gerencie cadastros de fornecedores</p>
        </div>
        <Link href="/partners/apply" target="_blank">
          <Button variant="outline">Ver Formulário Público</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            placeholder="Buscar por nome, e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Input
            placeholder="Filtrar por cidade"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          />
          <Input
            placeholder="Filtrar por categoria"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending_review">Pendentes</TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="rejected">Reprovados</TabsTrigger>
          <TabsTrigger value="suspended">Suspensos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {loading ? (
            <div className="py-12 text-center">Carregando...</div>
          ) : vendors.length === 0 ? (
            <Card className="p-12 text-center text-gray-500">Nenhum parceiro encontrado</Card>
          ) : (
            <>
              {vendors.map((vendor) => (
                <Card key={vendor.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-bold">{vendor.companyName}</h3>
                        {getStatusBadge(vendor.status)}
                        <span className="text-sm text-gray-500">
                          Score: {vendor.profileScore}/100
                        </span>
                      </div>

                      <p className="mb-2 text-gray-600">
                        {vendor.contactName} • {vendor.city}/{vendor.state}
                      </p>

                      <div className="mb-3 flex flex-wrap gap-2">
                        {vendor.categories.map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-1 text-sm text-gray-500">
                        <p>📧 {vendor.email}</p>
                        <p>📱 {vendor.phoneE164}</p>
                        <p>🔗 /p/{vendor.slug}</p>
                        <p>
                          📝 {vendor._count.notes} notas | ⭐ {vendor._count.reviews} avaliações
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col gap-2">
                      {vendor.status === 'pending_review' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(vendor.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            ✓ Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(vendor.id, 'reject')}
                          >
                            ✗ Reprovar
                          </Button>
                        </>
                      )}

                      {vendor.status === 'approved' && (
                        <>
                          <Link href={`/p/${vendor.slug}`} target="_blank">
                            <Button size="sm" variant="outline" className="w-full">
                              👁 Ver Portfólio
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(vendor.id, 'suspend')}
                          >
                            Suspender
                          </Button>
                        </>
                      )}

                      {vendor.status === 'suspended' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(vendor.id, 'reactivate')}
                        >
                          Reativar
                        </Button>
                      )}

                      {vendor.status === 'rejected' && (
                        <Button size="sm" onClick={() => handleStatusChange(vendor.id, 'approve')}>
                          Aprovar
                        </Button>
                      )}

                      <Link href={`/dashboard/vendors/${vendor.id}`}>
                        <Button size="sm" variant="ghost" className="w-full">
                          📋 Detalhes
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.pages} • Total: {pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Anterior
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
