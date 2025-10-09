import type { NextRequest } from 'next/server'

export class CsrfError extends Error {
  public readonly status = 403

  constructor(message = 'Falha na validação CSRF') {
    super(message)
    this.name = 'CsrfError'
  }
}

export function assertCsrf(req: NextRequest) {
  const headerToken =
    req.headers.get('x-csrf-token') ??
    req.headers.get('X-CSRF-Token') ??
    req.headers.get('x-xsrf-token')

  const cookieRaw = req.cookies.get('next-auth.csrf-token')?.value
  const cookieToken = cookieRaw ? cookieRaw.split('|')[0] : undefined

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    throw new CsrfError()
  }
}
