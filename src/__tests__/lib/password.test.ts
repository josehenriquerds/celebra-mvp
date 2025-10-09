import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword, passwordMeetsRequirements } from '@/lib/auth/password'

describe('password utilities', () => {
  it('hashes and verifies passwords correctly', async () => {
    const hash = await hashPassword('Celebre123')
    expect(hash).toBeDefined()
    expect(hash).not.toBe('Celebre123')
    const valid = await verifyPassword('Celebre123', hash)
    expect(valid).toBe(true)
  })

  it('fails verification with wrong password', async () => {
    const hash = await hashPassword('Celebre123')
    const valid = await verifyPassword('Celebre321', hash)
    expect(valid).toBe(false)
  })

  it('validates password requirements', () => {
    expect(passwordMeetsRequirements('Celebre123')).toBe(true)
    expect(passwordMeetsRequirements('short')).toBe(false)
    expect(passwordMeetsRequirements('nocaps123')).toBe(false)
    expect(passwordMeetsRequirements('UppercaseOnly')).toBe(false)
  })
})
