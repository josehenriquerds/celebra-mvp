import { parsePhoneNumberFromString } from 'libphonenumber-js'

const DEFAULT_COUNTRY = process.env.AUTH_DEFAULT_COUNTRY ?? 'BR'

export function normalizePhone(input: string): string {
  const candidate = input?.trim()

  if (!candidate) {
    throw new Error('Telefone inválido')
  }

  const phone = parsePhoneNumberFromString(candidate, DEFAULT_COUNTRY)
  if (!phone || !phone.isValid()) {
    throw new Error('Telefone inválido')
  }

  return phone.number
}

export function isValidPhone(input: string): boolean {
  try {
    normalizePhone(input)
    return true
  } catch {
    return false
  }
}

export function formatDisplayPhone(input: string): string {
  const phone = parsePhoneNumberFromString(input, DEFAULT_COUNTRY)
  if (!phone || !phone.isValid()) {
    return input
  }
  return phone.formatInternational()
}
