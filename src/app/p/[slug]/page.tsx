import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface VendorPublicData {
  slug: string
  companyName: string
  city: string
  categories: string[]
  priceFrom: string
  cover: string | null
  logo: string | null
  gallery: Array<{
    url: string
    alt?: string | null
    width?: number | null
    height?: number | null
  }>
  about: string | null
  shortDescription: string | null
  whatsappUrl: string | null
  instagram: string | null
  website: string | null
  avgRating: number
  reviewCount: number
  profileScore: number
}

async function getVendorData(slug: string): Promise<VendorPublicData | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vendor-partners/public/${slug}`,
      { cache: 'no-store' }
    )

    if (!res.ok) return null

    return await res.json()
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const vendor = await getVendorData(params.slug)

  if (!vendor) {
    return {
      title: 'Parceiro não encontrado | Celebre',
    }
  }

  return {
    title: `${vendor.companyName} | Parceiro Celebre`,
    description: vendor.shortDescription || `${vendor.companyName} - ${vendor.city}`,
    openGraph: {
      title: `${vendor.companyName} | Parceiro Celebre`,
      description: vendor.shortDescription || '',
      images: vendor.cover ? [vendor.cover] : [],
    },
  }
}

export default async function VendorPortfolioPage({ params }: { params: { slug: string } }) {
  const vendor = await getVendorData(params.slug)

  if (!vendor) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        {vendor.cover ? (
          <Image src={vendor.cover} alt={vendor.companyName} fill className="object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-pink-200 to-purple-200" />
        )}
        <div className="absolute inset-0 bg-black/30" />

        {/* Logo and Company Name */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="mx-auto flex max-w-6xl items-end gap-6">
            {vendor.logo && (
              <div className="relative h-32 w-32 rounded-full bg-white p-2 shadow-xl">
                <Image
                  src={vendor.logo}
                  alt={vendor.companyName}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            )}
            <div className="text-white">
              <h1 className="mb-2 text-4xl font-bold md:text-5xl">{vendor.companyName}</h1>
              <p className="text-lg">{vendor.city}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 md:px-12">
        {/* Categories and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {vendor.categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="text-sm">
                {cat}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            {vendor.whatsappUrl && (
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href={vendor.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  💬 Falar no WhatsApp
                </a>
              </Button>
            )}
            {vendor.instagram && (
              <Button asChild variant="outline">
                <a href={vendor.instagram} target="_blank" rel="noopener noreferrer">
                  📷 Instagram
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* About */}
        {vendor.about && (
          <Card className="p-6">
            <h2 className="mb-4 text-2xl font-bold">Sobre</h2>
            <p className="whitespace-pre-wrap text-gray-700">{vendor.about}</p>
          </Card>
        )}

        {/* Pricing */}
        <Card className="p-6">
          <h2 className="mb-4 text-2xl font-bold">Investimento</h2>
          <p className="text-3xl font-bold" style={{ color: 'var(--brand, #863F44)' }}>
            {vendor.priceFrom}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            *Valores podem variar de acordo com as necessidades do seu evento
          </p>
        </Card>

        {/* Gallery */}
        {vendor.gallery.length > 0 && (
          <div>
            <h2 className="mb-4 text-2xl font-bold">Galeria</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {vendor.gallery.map((img, idx) => (
                <div key={idx} className="relative aspect-square overflow-hidden rounded-lg">
                  <Image
                    src={img.url}
                    alt={img.alt || `${vendor.companyName} - foto ${idx + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {vendor.reviewCount > 0 && (
          <Card className="p-6">
            <h2 className="mb-4 text-2xl font-bold">Avaliações</h2>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold">{vendor.avgRating.toFixed(1)}</span>
              <div>
                <div className="text-2xl text-yellow-500">
                  {'★'.repeat(Math.round(vendor.avgRating))}
                </div>
                <p className="text-sm text-gray-500">{vendor.reviewCount} avaliações</p>
              </div>
            </div>
          </Card>
        )}

        {/* CTA Fixo Mobile */}
        {vendor.whatsappUrl && (
          <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-lg md:hidden">
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <a href={vendor.whatsappUrl} target="_blank" rel="noopener noreferrer">
                💬 Falar no WhatsApp
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
