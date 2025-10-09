import { describe, expect, it } from 'vitest'
import {
  assertWithinRateLimit,
  registerAuthFailure,
  clearAuthFailures,
  getLockoutState,
  RateLimitError,
  LockoutError,
} from '@/lib/rate-limit'

describe('rate limit helpers', () => {
  it('enforces max attempts per window', () => {
    const key = `test:${Date.now()}`
    for (let i = 0; i < 5; i += 1) {
      assertWithinRateLimit(key)
    }
    expect(() => assertWithinRateLimit(key)).toThrow(RateLimitError)
  })

  it('locks out after repeated failures and releases after clear', () => {
    const key = `auth:${Date.now()}`
    for (let i = 0; i < 5; i += 1) {
      try {
        registerAuthFailure(key, { limit: 5, cooldownMs: 10 })
      } catch (error) {
        expect(error).toBeInstanceOf(LockoutError)
      }
    }
    const state = getLockoutState(key)
    expect(state.blocked).toBe(true)
    clearAuthFailures(key)
    const afterClear = getLockoutState(key)
    expect(afterClear.blocked).toBe(false)
  })
})
