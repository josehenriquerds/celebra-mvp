'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Search, Filter, Grid3x3, List, Star, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { VendorMarketplaceCard } from '@/features/vendors/components/VendorMarketplaceCard'
import { vendorCategories } from '@/lib/validations/vendor'
import { cn } from '@/lib/utils'

// Dados mockados - substituir pela API real
const MOCK_VENDORS = [
  {
    id: '1',
    name: 'Buffet Delícias Premium',
    category: 'Buffet',
    city: 'Vitória',
    state: 'ES',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=400',
    rating: 4.8,
    reviewCount: 127,
    priceFromCents: 12000000,
    descriptionShort: 'Buffet completo para casamentos com mais de 20 anos de experiência',
    isContracted: true,
    isFavorited: false,
  },
  {
    id: '2',
    name: 'Fotografia João Silva',
    category: 'Fotografia',
    city: 'Vila Velha',
    state: 'ES',
    imageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400',
    rating: 4.9,
    reviewCount: 89,
    priceFromCents: 450000,
    descriptionShort: 'Fotografia artística e natural para seu grande dia',
    hasActiveProposal: true,
    proposalCount: 3,
    lowestBidCents: 380000,
    isFavorited: true,
    auctionEndsAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
  },
  {
    id: '3',
    name: 'DJ Som & Luz',
    category: 'DJ',
    city: 'Serra',
    state: 'ES',
    rating: 4.7,
    reviewCount: 65,
    priceFromCents: 250000,
    descriptionShort: 'Animação profissional com equipamento de alta qualidade',
    isFavorited: false,
  },
  {
    id: '4',
    name: 'Flores & Decoração',
    category: 'Flores',
    city: 'Vitória',
    state: 'ES',
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400',
    rating: 4.6,
    reviewCount: 45,
    priceFromCents: 180000,
    descriptionShort: 'Decoração floral exclusiva e personalizada',
    hasActiveProposal: true,
    proposalCount: 2,
    lowestBidCents: 160000,
    isFavorited: true,
  },
  {
    id: '5',
    name: 'Música Ao Vivo Eventos',
    category: 'Música ao vivo',
    city: 'Vitória',
    state: 'ES',
    rating: 4.5,
    reviewCount: 32,
    priceFromCents: 320000,
    descriptionShort: 'Banda profissional com repertório variado',
    isFavorited: false,
  },
]

const CATEGORY_ICONS: Record<string, string> = {
  Buffet: '🍽️',
  DJ: '🎧',
  Decoração: '🎨',
  Fotografia: '📸',
  Filmagem: '🎥',
  Doces: '🍰',
  Convites: '💌',
  Iluminação: '💡',
  'Música ao vivo': '🎵',
  Espaço: '🏛️',
  Cerimonial: '🎭',
  Segurança: '🛡️',
  Bolo: '🎂',
  Bebidas: '🍾',
  Som: '🔊',
  Flores: '🌸',
  Maquiagem: '💄',
  Cabelo: '💇',
  'Vestido/Traje': '👗',
  Transporte: '🚗',
  'Atrações': '🎪',
}

export default function VendorMarketplacePage() {
  const params = useParams()
  const eventId = params.id as string

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [minRating, setMinRating] = useState(0)
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)

  // Statistics
  const stats = useMemo(() => {
    const total = MOCK_VENDORS.length
    const contracted = MOCK_VENDORS.filter((v) => v.isContracted).length
    const withProposals = MOCK_VENDORS.filter((v) => v.hasActiveProposal).length
    const favorited = MOCK_VENDORS.filter((v) => v.isFavorited).length

    return { total, contracted, withProposals, favorited }
  }, [])

  // Filter and sort vendors
  const filteredVendors = useMemo(() => {
    let filtered = MOCK_VENDORS

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((v) => v.category === selectedCategory)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.category.toLowerCase().includes(query) ||
          v.descriptionShort?.toLowerCase().includes(query)
      )
    }

    // Price filter
    filtered = filtered.filter((v) => {
      const price = (v.priceFromCents || 0) / 100
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter((v) => (v.rating || 0) >= minRating)
    }

    // Favorites filter
    if (showOnlyFavorites) {
      filtered = filtered.filter((v) => v.isFavorited)
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => (a.priceFromCents || 0) - (b.priceFromCents || 0))
        break
      case 'price-desc':
        filtered.sort((a, b) => (b.priceFromCents || 0) - (a.priceFromCents || 0))
        break
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      // 'relevance' is default order
    }

    return filtered
  }, [selectedCategory, searchQuery, priceRange, minRating, showOnlyFavorites, sortBy])

  const handleFavorite = (vendorId: string) => {
    console.log('Toggle favorite:', vendorId)
    // Implementar API call
  }

  const handleContact = (vendorId: string) => {
    console.log('Contact vendor:', vendorId)
    // Abrir modal de contato
  }

  const handleRequestProposal = (vendorId: string) => {
    console.log('Request proposal:', vendorId)
    // Abrir modal de solicitação de orçamento/leilão
  }

  const handleViewProposals = (vendorId: string) => {
    console.log('View proposals:', vendorId)
    // Navegar para página de propostas
  }

  return (
    <div className="min-h-screen bg-celebre-bg">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/events/${eventId}/vendors`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="size-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-heading text-3xl font-bold text-celebre-ink">
                  Marketplace de Fornecedores
                </h1>
                <p className="mt-1 text-sm text-celebre-muted">
                  Encontre e compare fornecedores para seu evento
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Row */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Grid3x3 className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-celebre-ink">{stats.total}</p>
                    <p className="text-xs text-celebre-muted">Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2">
                    <Users className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-celebre-ink">{stats.contracted}</p>
                    <p className="text-xs text-celebre-muted">Contratados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <TrendingUp className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-celebre-ink">{stats.withProposals}</p>
                    <p className="text-xs text-celebre-muted">Com Propostas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                    <Star className="size-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-celebre-ink">{stats.favorited}</p>
                    <p className="text-xs text-celebre-muted">Favoritos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="h-auto flex-wrap justify-start gap-2 bg-transparent">
            <TabsTrigger value="all" className="rounded-full">
              Todas
              <Badge variant="secondary" className="ml-2">
                {MOCK_VENDORS.length}
              </Badge>
            </TabsTrigger>
            {vendorCategories.map((category) => {
              const count = MOCK_VENDORS.filter((v) => v.category === category).length
              if (count === 0) return null

              return (
                <TabsTrigger key={category} value={category} className="rounded-full">
                  <span className="mr-1">{CATEGORY_ICONS[category]}</span>
                  {category}
                  <Badge variant="secondary" className="ml-2">
                    {count}
                  </Badge>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-celebre-muted" />
                <Input
                  type="text"
                  placeholder="Buscar fornecedores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
              >
                <option value="relevance">Mais Relevantes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
                <option value="rating">Melhor Avaliado</option>
              </select>

              {/* View Mode */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="size-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="size-4" />
                </Button>
              </div>

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(showFilters && 'bg-celebre-accent')}
              >
                <Filter className="mr-2 size-4" />
                Filtros
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 space-y-4 border-t pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Price Range */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-celebre-ink">
                      Faixa de Preço (R$)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Mín"
                        value={priceRange[0]}
                        onChange={(e) =>
                          setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])
                        }
                        className="w-full"
                      />
                      <Input
                        type="number"
                        placeholder="Máx"
                        value={priceRange[1]}
                        onChange={(e) =>
                          setPriceRange([priceRange[0], parseFloat(e.target.value) || 50000])
                        }
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-celebre-ink">
                      Avaliação Mínima
                    </label>
                    <select
                      value={minRating}
                      onChange={(e) => setMinRating(parseFloat(e.target.value))}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-celebre-brand"
                    >
                      <option value={0}>Todas</option>
                      <option value={4.5}>4.5+ ⭐</option>
                      <option value={4.0}>4.0+ ⭐</option>
                      <option value={3.5}>3.5+ ⭐</option>
                      <option value={3.0}>3.0+ ⭐</option>
                    </select>
                  </div>

                  {/* Show Only Favorites */}
                  <div className="flex items-end">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={showOnlyFavorites}
                        onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                        className="size-4 rounded border-gray-300 text-celebre-brand focus:ring-celebre-brand"
                      />
                      <span className="text-sm font-medium text-celebre-ink">
                        Apenas Favoritos
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-celebre-muted">
            {filteredVendors.length} fornecedor{filteredVendors.length !== 1 ? 'es' : ''}{' '}
            encontrado
            {filteredVendors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Vendors Grid/List */}
        {filteredVendors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mb-4 text-6xl opacity-50">🔍</div>
              <p className="mb-2 text-lg font-semibold text-celebre-ink">
                Nenhum fornecedor encontrado
              </p>
              <p className="text-sm text-celebre-muted">
                Tente ajustar os filtros ou buscar por outros termos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {filteredVendors.map((vendor) => (
              <VendorMarketplaceCard
                key={vendor.id}
                vendor={vendor}
                onFavorite={handleFavorite}
                onContact={handleContact}
                onRequestProposal={handleRequestProposal}
                onViewProposals={handleViewProposals}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
