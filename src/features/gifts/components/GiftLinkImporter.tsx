import { Link2, Loader2, RefreshCcw } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { BestPriceBadge } from './BestPriceBadge'
import { useScrapeGiftLink } from '../hooks/useGifts'
import type { ScrapedGiftProduct } from '../services/gifts.api'

interface GiftLinkImporterProps {
  initialUrl?: string
  onImported: (data: ScrapedGiftProduct) => void
  onImageSelected?: (imageUrl: string | undefined) => void
  className?: string
}

export function GiftLinkImporter({ initialUrl = '', onImported, onImageSelected, className }: GiftLinkImporterProps) {
  const [url, setUrl] = useState(initialUrl)
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined)
  const scrapeMutation = useScrapeGiftLink()

  const result = scrapeMutation.data
  const images = useMemo(() => result?.imageOptions ?? [], [result])

  useEffect(() => {
    if (result) {
      const image = result.imageUrl || result.imageOptions?.[0]
      setSelectedImage(image)
      onImported({ ...result, imageUrl: image })
      onImageSelected?.(image)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl)
    }
  }, [initialUrl])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!url) return
    scrapeMutation.mutate(url)
  }

  function handleReset() {
    setUrl('')
    setSelectedImage(undefined)
    scrapeMutation.reset()
  }

  function handleSelectImage(imageUrl: string) {
    setSelectedImage(imageUrl)
    if (result) {
      onImported({ ...result, imageUrl })
      onImageSelected?.(imageUrl)
    }
  }

  return (
    <div className={`rounded-2xl border border-[#E3E8F1] bg-white p-4 shadow-sm ${className ?? ''}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1F3A5F]">Link inteligente</p>
            <p className="text-xs text-[#5B6C92]">
              Cole a URL do produto para preencher os campos automaticamente
            </p>
          </div>
          {result ? (
            <Button type="button" variant="ghost" size="icon" onClick={handleReset}>
              <RefreshCcw className="size-4" />
            </Button>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8AA0B8]" />
              <Input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://www.sualoja.com/produto"
                className="pl-9"
                disabled={scrapeMutation.isPending}
              />
            </div>
          </div>
          <Button type="submit" disabled={!url || scrapeMutation.isPending}>
            {scrapeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" /> Buscando...
              </>
            ) : (
              'Buscar'
            )}
          </Button>
        </div>
      </form>

      {scrapeMutation.isError ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {(scrapeMutation.error as Error).message}
        </p>
      ) : null}

      {scrapeMutation.isPending ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-[120px,1fr]">
          <Skeleton className="h-[120px] w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ) : null}

      {result && !scrapeMutation.isPending ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-[140px,1fr]">
          <div className="space-y-2">
            <div className="aspect-square overflow-hidden rounded-2xl border border-[#E5EEF5] bg-[#F5F9FC]">
              {selectedImage ? (
                <div className="relative size-full">
                  <Image
                    src={selectedImage}
                    alt={result.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 40vw, 140px"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[#8AA0B8]">
                  Sem imagem
                </div>
              )}
            </div>
            {images.length > 1 ? (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image) => (
                  <button
                    key={image}
                    type="button"
                    className={`overflow-hidden rounded-xl border transition focus:outline-none focus:ring-2 focus:ring-[#3F8F6B] ${
                      selectedImage === image ? 'border-[#3F8F6B]' : 'border-transparent'
                    }`}
                    onClick={() => handleSelectImage(image)}
                  >
                    <Image
                      src={image}
                      alt="Opção de imagem"
                      width={96}
                      height={48}
                      className="h-12 w-full object-cover"
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="text-base font-semibold text-[#1F3A5F]">{result.title}</h4>
              {result.store ? (
                <Badge variant="outline" className="mt-1 bg-[#F5F9FC] text-xs text-[#4E6A85]">
                  {result.store}
                </Badge>
              ) : null}
            </div>
            <BestPriceBadge
              priceCents={result.priceCents}
              currency={result.currency}
              store={result.store}
              domain={result.domain}
            />
            {result.description ? (
              <p className="text-sm text-[#5B6C92]">{result.description}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
