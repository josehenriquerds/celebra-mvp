import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

interface BestPriceBadgeProps {
  priceCents?: number | null
  currency?: string
  store?: string
  domain?: string
  className?: string
}

function getFaviconUrl(domain?: string | null) {
  if (!domain) return undefined
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
}

export function BestPriceBadge({ priceCents, currency = 'BRL', store, domain, className }: BestPriceBadgeProps) {
  const price = typeof priceCents === 'number' ? priceCents / 100 : null
  const formattedPrice = typeof price === 'number' ? formatCurrency(price) : 'Preço indisponível'
  const favicon = getFaviconUrl(domain)

  return (
    <Badge
      variant="outline"
      className={`inline-flex items-center gap-2 rounded-full border-2 border-[#C7E8CA] bg-[#F6FBF7] px-3 py-1 text-sm font-medium text-[#246240] ${className ?? ''}`}
    >
      {favicon ? (
        <Image
          src={favicon}
          alt={store ?? domain ?? ''}
          width={16}
          height={16}
          className="rounded-full"
          unoptimized
        />
      ) : null}
      <span>{formattedPrice}</span>
      {store ? <span className="text-xs text-[#4E7E5E]">· {store}</span> : null}
      {!store && domain ? <span className="text-xs text-[#4E7E5E]">· {domain}</span> : null}
      {currency !== 'BRL' ? <span className="text-xs text-[#4E7E5E]">({currency})</span> : null}
    </Badge>
  )
}
