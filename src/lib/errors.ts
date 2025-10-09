type ErrorConstructor<T> = abstract new (...args: any[]) => T

export function isErrorInstance<T>(
  error: unknown,
  constructor: ErrorConstructor<T> | undefined | null
): error is T {
  return typeof constructor === 'function' && error instanceof constructor
}

export class CredentialsAuthError extends Error {
  public readonly status = 401

  constructor(message = 'Credenciais inválidas', options?: ErrorOptions) {
    super(message, options)
    this.name = 'CredentialsAuthError'
  }
}
