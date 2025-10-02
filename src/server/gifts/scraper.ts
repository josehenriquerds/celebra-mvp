import { z } from "zod"

const SUPPORTED_DOMAINS = [
  { domain: "amazon.com.br", store: "Amazon" },
  { domain: "magazineluiza.com.br", store: "Magazine Luiza" },
  { domain: "casasbahia.com.br", store: "Casas Bahia" },
  { domain: "americanas.com.br", store: "Americanas" },
  { domain: "mercadolivre.com.br", store: "Mercado Livre" },
  { domain: "shopee.com.br", store: "Shopee" },
  { domain: "carrefour.com.br", store: "Carrefour" },
  { domain: "leroymerlin.com.br", store: "Leroy Merlin" },
  { domain: "cobasi.com.br", store: "Cobasi" },
]

const PRICE_FALLBACK_CURRENCY = "BRL"
const MAX_HTML_BYTES = 1_500_000
const REQUEST_TIMEOUT_MS = 10_000

interface JsonLdProductOffer {
  price?: string | number
  priceCurrency?: string
  priceValidUntil?: string
  url?: string
}

interface JsonLdProduct {
  "@type"?: string | string[]
  name?: string
  description?: string
  image?: string | string[]
  offers?: JsonLdProductOffer | JsonLdProductOffer[]
  brand?: { name?: string } | string
  sku?: string
}

export interface ScrapedProduct {
  title: string
  description?: string
  priceCents?: number
  currency?: string
  imageUrl?: string
  imageOptions: string[]
  store: string
  domain: string
  canonicalUrl: string
  url: string
  attributes?: Record<string, string>
}

export class GiftScraperError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = "ScraperError"
    this.status = status
  }
}

const urlSchema = z
  .string()
  .url({ message: "URL inválida" })
  .refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
    message: "Apenas URLs HTTP(s) são suportadas",
  })

function getAbortController(timeoutMs: number): { controller: AbortController; timeout: NodeJS.Timeout } {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  return { controller, timeout }
}

async function fetchWithTimeout(url: string) {
  const { controller, timeout } = getAbortController(REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CelebreGiftBot/1.0; +https://celebre.app/presentes)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
      },
    })

    if (!response.ok) {
      throw new GiftScraperError("Falha ao acessar a página da loja", response.status)
    }

    const contentLengthHeader = response.headers.get("content-length")
    if (contentLengthHeader) {
      const contentLength = Number.parseInt(contentLengthHeader, 10)
      if (!Number.isNaN(contentLength) && contentLength > MAX_HTML_BYTES) {
        throw new GiftScraperError("A página é muito grande para processar com segurança", 413)
      }
    }

    const buffer = await response.arrayBuffer()
    if (buffer.byteLength > MAX_HTML_BYTES) {
      throw new GiftScraperError("A página é muito grande para processar com segurança", 413)
    }

    const html = new TextDecoder("utf-8", { fatal: false }).decode(buffer)

    return { html, finalUrl: response.url }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new GiftScraperError("Tempo limite excedido ao buscar a página", 504)
    }
    if (error instanceof GiftScraperError) {
      throw error
    }
    throw new GiftScraperError("Não foi possível buscar os dados do produto", 500)
  } finally {
    clearTimeout(timeout)
  }
}

function normalizeWhitespace(value?: string | null) {
  if (!value) return undefined
  return value.replace(/\s+/g, " ").trim()
}

function decodeHtmlEntities(value?: string | null): string | undefined {
  if (!value) return undefined
  return value
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&nbsp;/gi, " ")
}

function extractCanonical(html: string): string | undefined {
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)
  if (canonicalMatch) {
    const hrefMatch = canonicalMatch[0].match(/href=["']([^"']+)/i)
    return hrefMatch ? hrefMatch[1].trim() : undefined
  }

  const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i)
  if (ogUrlMatch) {
    return ogUrlMatch[1].trim()
  }

  return undefined
}

function parseJsonLd(html: string): JsonLdProduct | undefined {
  const scripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  if (!scripts) return undefined

  for (const script of scripts) {
    const contentMatch = script.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
    if (!contentMatch) continue

    try {
      const rawJson = contentMatch[1].trim()
      const parsed = JSON.parse(rawJson)
      const products: JsonLdProduct[] = Array.isArray(parsed)
        ? (parsed as JsonLdProduct[])
        : parsed["@graph"] && Array.isArray(parsed["@graph"])
          ? ((parsed["@graph"] as JsonLdProduct[]).filter(Boolean))
          : [parsed as JsonLdProduct]

      for (const product of products) {
        const type = product["@type"]
        if (typeof type === "string" && type.toLowerCase().includes("product")) {
          return product
        }
        if (Array.isArray(type) && type.some((t) => String(t).toLowerCase().includes("product"))) {
          return product
        }
      }
    } catch {
      continue
    }
  }

  return undefined
}

interface MetaTagsResult {
  title?: string
  description?: string
  price?: string
  currency?: string
  image?: string
  images: string[]
}

function extractMetaTags(html: string): MetaTagsResult {
  const metaRegex = /<meta[^>]+>/gi
  const metas = html.match(metaRegex) ?? []
  const result: MetaTagsResult = { images: [] }

  for (const tag of metas) {
    const propertyMatch = tag.match(/property=["']([^"']+)/i)
    const nameMatch = tag.match(/name=["']([^"']+)/i)
    const contentMatch = tag.match(/content=["']([^"']*)/i)
    const key = propertyMatch?.[1] ?? nameMatch?.[1]
    if (!key || !contentMatch) continue

    const value = contentMatch[1].trim()
    const lowerKey = key.toLowerCase()

    switch (lowerKey) {
      case "og:title":
      case "twitter:title":
        result.title = result.title || value
        break
      case "description":
      case "og:description":
      case "twitter:description":
        result.description = result.description || value
        break
      case "og:image":
      case "og:image:url":
      case "twitter:image":
        if (!result.images.includes(value)) {
          result.images.push(value)
        }
        if (!result.image) result.image = value
        break
      case "product:price:amount":
      case "og:price:amount":
      case "twitter:data1":
        result.price = result.price || value
        break
      case "product:price:currency":
      case "og:price:currency":
        result.currency = result.currency || value
        break
      default:
        break
    }
  }

  return result
}

function extractTitle(html: string): string | undefined {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i)
  return match ? normalizeWhitespace(decodeHtmlEntities(match[1])) : undefined
}

function extractImagesFromHtml(html: string, limit = 5): string[] {
  const imageRegex = /<img[^>]+src=["']([^"'>]+)["'][^>]*>/gi
  const images = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = imageRegex.exec(html)) && images.size < limit) {
    const src = match[1]
    if (src.startsWith("data:")) continue
    images.add(src)
  }
  return Array.from(images)
}

function normalizePrice(price?: string | number | null): number | undefined {
  if (price === undefined || price === null) return undefined
  const numeric =
    typeof price === "number"
      ? price
      : Number.parseFloat(price.replace(/[^0-9,.-]/g, "").replace(",", "."))
  if (Number.isNaN(numeric)) return undefined
  return Math.round(numeric * 100)
}

function ensureAbsoluteUrl(url: string, base: string): string {
  try {
    return new URL(url, base).toString()
  } catch {
    return url
  }
}

function determineStore(hostname: string) {
  const match = SUPPORTED_DOMAINS.find(
    (entry) => hostname === entry.domain || hostname.endsWith(entry.domain)
  )
  if (match) return match
  return { domain: hostname, store: hostname.replace(/^www\./, "") }
}

function consolidateImages(
  baseUrl: string,
  ...imageGroups: Array<string | undefined | (string | undefined)[]>
) {
  const set = new Set<string>()
  for (const group of imageGroups) {
    if (!group) continue
    if (Array.isArray(group)) {
      for (const img of group) {
        if (!img) continue
        set.add(ensureAbsoluteUrl(img, baseUrl))
      }
    } else if (group) {
      set.add(ensureAbsoluteUrl(group, baseUrl))
    }
  }
  return Array.from(set)
}

export async function scrapeProduct(rawUrl: string): Promise<ScrapedProduct> {
  const safeUrl = urlSchema.parse(rawUrl)
  const { html, finalUrl } = await fetchWithTimeout(safeUrl)

  const canonical = extractCanonical(html) ?? finalUrl
  const { hostname } = new URL(canonical)
  const store = determineStore(hostname)

  const jsonLd = parseJsonLd(html)
  const meta = extractMetaTags(html)

  const title = normalizeWhitespace(
    decodeHtmlEntities(jsonLd?.name) || decodeHtmlEntities(meta.title) || extractTitle(html)
  )

  if (!title) {
    throw new GiftScraperError("Não foi possível identificar o título do produto")
  }

  const description = normalizeWhitespace(
    decodeHtmlEntities(jsonLd?.description) || decodeHtmlEntities(meta.description)
  )

  const images = consolidateImages(
    finalUrl,
    Array.isArray(jsonLd?.image) ? jsonLd?.image : jsonLd?.image,
    meta.image,
    meta.images,
    extractImagesFromHtml(html)
  )

  const offers = Array.isArray(jsonLd?.offers) ? jsonLd?.offers : jsonLd?.offers ? [jsonLd.offers] : []
  const offer = offers.find((candidate) => candidate.price) || offers[0]
  const priceFromLd = normalizePrice(offer?.price)
  const priceFromMeta = normalizePrice(meta.price)
  const priceCents = priceFromLd ?? priceFromMeta
  const currency = offer?.priceCurrency || meta.currency || PRICE_FALLBACK_CURRENCY

  const attributes: Record<string, string> = {}
  if (jsonLd?.brand) {
    attributes["Marca"] =
      typeof jsonLd.brand === "string" ? jsonLd.brand : jsonLd.brand.name ?? ""
  }
  if (jsonLd?.sku) {
    attributes["SKU"] = jsonLd.sku
  }
  if (offer?.priceValidUntil) {
    attributes["Válido até"] = offer.priceValidUntil
  }

  return {
    title,
    description,
    priceCents,
    currency,
    imageUrl: images[0],
    imageOptions: images,
    store: store.store,
    domain: store.domain,
    canonicalUrl: canonical,
    url: finalUrl,
    attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
  }
}

export function isSupportedDomain(url: string) {
  try {
    const parsed = new URL(url)
    return SUPPORTED_DOMAINS.some(
      (entry) => parsed.hostname === entry.domain || parsed.hostname.endsWith(entry.domain)
    )
  } catch {
    return false
  }
}


export function resolveStoreFromUrl(url: string) {
  try {
    const { hostname } = new URL(url)
    return determineStore(hostname)
  } catch {
    return { domain: url, store: url }
  }
}
