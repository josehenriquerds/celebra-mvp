interface RateLimitOptions {
  windowMs: number
  max: number
}

interface LockoutOptions {
  limit: number
  cooldownMs: number
}

interface RateLimitBucket {
  count: number
  expiresAt: number
}

interface LockoutBucket {
  failures: number
  blockedUntil?: number
}

const defaultRateLimit: RateLimitOptions = {
  windowMs: 60_000,
  max: 5,
}

const defaultLockout: LockoutOptions = {
  limit: 5,
  cooldownMs: 10 * 60_000,
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()
const lockoutBuckets = new Map<string, LockoutBucket>()

export class RateLimitError extends Error {
  public readonly status = 429
  public readonly retryAfter?: number

  constructor(message: string, retryAfter?: number) {
    super(message)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

export class LockoutError extends Error {
  public readonly status = 429
  public readonly retryAfter?: number

  constructor(message: string, retryAfter?: number) {
    super(message)
    this.name = 'LockoutError'
    this.retryAfter = retryAfter
  }
}

export function assertWithinRateLimit(
  key: string,
  options: Partial<RateLimitOptions> = {}
) {
  const { windowMs, max } = { ...defaultRateLimit, ...options }
  const now = Date.now()
  const bucket = rateLimitBuckets.get(key)

  if (!bucket || bucket.expiresAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      expiresAt: now + windowMs,
    })
    return
  }

  if (bucket.count >= max) {
    const retryAfter = Math.ceil((bucket.expiresAt - now) / 1000)
    throw new RateLimitError('Limite de tentativas atingido. Tente novamente mais tarde.', retryAfter)
  }

  bucket.count += 1
  rateLimitBuckets.set(key, bucket)
}

export function registerAuthFailure(
  key: string,
  options: Partial<LockoutOptions> = {}
) {
  const { limit, cooldownMs } = { ...defaultLockout, ...options }
  const now = Date.now()
  const bucket = lockoutBuckets.get(key) ?? { failures: 0 }

  if (bucket.blockedUntil && bucket.blockedUntil > now) {
    const retryAfter = Math.ceil((bucket.blockedUntil - now) / 1000)
    throw new LockoutError(
      'Muitas tentativas inválidas. Tente novamente mais tarde.',
      retryAfter
    )
  }

  if (bucket.blockedUntil && bucket.blockedUntil <= now) {
    bucket.failures = 0
    bucket.blockedUntil = undefined
  }

  bucket.failures += 1

  if (bucket.failures >= limit) {
    bucket.blockedUntil = now + cooldownMs
    lockoutBuckets.set(key, bucket)
    const retryAfter = Math.ceil(cooldownMs / 1000)
    throw new LockoutError(
      'Muitas tentativas inválidas. Sua conta está temporariamente bloqueada.',
      retryAfter
    )
  }

  lockoutBuckets.set(key, bucket)
}

export function clearAuthFailures(key: string) {
  lockoutBuckets.delete(key)
}

export function getLockoutState(key: string) {
  const bucket = lockoutBuckets.get(key)
  const now = Date.now()

  if (!bucket?.blockedUntil) {
    return { blocked: false as const }
  }

  if (bucket.blockedUntil <= now) {
    lockoutBuckets.delete(key)
    return { blocked: false as const }
  }

  return {
    blocked: true as const,
    retryAfter: Math.ceil((bucket.blockedUntil - now) / 1000),
  }
}
