/**
 * Server-Side API Utilities
 * Typed fetch utilities for RSC with caching support
 */

import 'server-only'

export interface ApiGetOptions {
  nextTags?: string[]
  revalidate?: number | false
  headers?: HeadersInit
}

/**
 * Type-safe GET request for Server Components
 * Supports Next.js caching with tags and revalidation
 */
export async function apiGet<T>(
  path: string,
  init?: RequestInit,
  { nextTags = [], revalidate = 30, headers }: ApiGetOptions = {}
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const url = `${baseUrl}${path}`

  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...init?.headers,
      },
      next: { tags: nextTags, revalidate },
    })

    if (!res.ok) {
      throw new Error(`API GET ${path} failed with status ${res.status}`)
    }

    return (await res.json()) as T
  } catch (error) {
    console.error(`[apiGet] Error fetching ${path}:`, error)
    throw error
  }
}

/**
 * Type-safe POST request for Server Components
 */
export async function apiPost<T, D = unknown>(
  path: string,
  data: D,
  init?: RequestInit
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  const url = `${baseUrl}${path}`

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      body: JSON.stringify(data),
      ...init,
    })

    if (!res.ok) {
      throw new Error(`API POST ${path} failed with status ${res.status}`)
    }

    return (await res.json()) as T
  } catch (error) {
    console.error(`[apiPost] Error posting to ${path}:`, error)
    throw error
  }
}

/**
 * Safe array extraction from API responses
 * Handles both array and { data: [] } patterns
 */
export function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[]
  }
  if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
    return data.data as T[]
  }
  return []
}
