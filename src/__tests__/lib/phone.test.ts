import { describe, expect, it } from 'vitest'
import { normalizePhone, isValidPhone } from '@/lib/phone'

describe('phone utilities', () => {
  it('normalizes Brazilian phone numbers to E.164', () => {
    const normalized = normalizePhone('(27) 99999-0000')
    expect(normalized).toBe('+5527999990000')
  })

  it('keeps numbers with country code intact', () => {
    const normalized = normalizePhone('+44 20 7946 0958')
    expect(normalized).toBe('+442079460958')
  })

  it('throws on invalid numbers', () => {
    expect(() => normalizePhone('12345')).toThrowError('Telefone inválido')
  })

  it('validates format correctly', () => {
    expect(isValidPhone('+5527999990000')).toBe(true)
    expect(isValidPhone('invalid')).toBe(false)
  })
})
