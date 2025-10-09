import bcrypt from 'bcrypt'

const DEFAULT_COST = Math.max(Number(process.env.BCRYPT_COST ?? 12), 10)

export async function hashPassword(password: string, cost = DEFAULT_COST): Promise<string> {
  return bcrypt.hash(password, cost)
}

export async function verifyPassword(password: string, hash: string | null | undefined) {
  if (!hash) return false
  return bcrypt.compare(password, hash)
}

export function passwordMeetsRequirements(password: string): boolean {
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasLength = password.length >= 8
  return hasUppercase && hasNumber && hasLength
}
