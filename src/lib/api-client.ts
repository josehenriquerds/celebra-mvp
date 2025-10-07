/**
 * API Client - HTTP layer para comunicação com backend
 *
 * Features:
 * - Axios com interceptores
 * - Auth Bearer token automático
 * - Normalização de erros
 * - Retry strategy exponencial
 * - Request/Response logging (dev)
 */

import axios, { type AxiosError, type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { getSession } from 'next-auth/react'

// Configuração de ambiente
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const API_TIMEOUT = 30000 // 30s

// Tipos de erro normalizado
export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  statusCode?: number
}

// Configuração de retry
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504]

/**
 * Cria instância do Axios configurada
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Interceptor de Request: Adiciona token de autenticação
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const session = await getSession()

        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`
        }

        // Log em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data,
          })
        }

        return config
      } catch (error) {
        return Promise.reject(error)
      }
    },
    (error) => Promise.reject(error)
  )

  // Interceptor de Response: Normaliza erros e logging
  client.interceptors.response.use(
    (response) => {
      // Log em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ✅ ${response.config.url}`, response.data)
      }

      return response
    },
    async (error: AxiosError) => {
      const normalizedError = normalizeError(error)

      // Log de erro
      if (process.env.NODE_ENV === 'development') {
        console.error(`[API] ❌ ${error.config?.url}`, normalizedError)
      }

      // Retry logic
      const config = error.config as AxiosRequestConfig & { _retry?: number }

      if (
        config &&
        normalizedError.statusCode &&
        RETRY_STATUS_CODES.includes(normalizedError.statusCode)
      ) {
        config._retry = (config._retry || 0) + 1

        if (config._retry <= MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, config._retry - 1)

          if (process.env.NODE_ENV === 'development') {
            console.log(`[API] 🔄 Retry ${config._retry}/${MAX_RETRIES} após ${delay}ms`)
          }

          await new Promise((resolve) => setTimeout(resolve, delay))
          return client(config)
        }
      }

      return Promise.reject(normalizedError)
    }
  )

  return client
}

/**
 * Normaliza erros da API para formato consistente
 */
function normalizeError(error: AxiosError): ApiError {
  // Erro de rede
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Erro de conexão com o servidor',
      details: { originalError: error.message },
    }
  }

  // Erro da API
  const { status, data } = error.response

  // Se backend já retorna formato esperado
  if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
    return {
      ...(data as ApiError),
      statusCode: status,
    }
  }

  // Mapear status codes comuns
  const statusMessages: Record<number, { code: string; message: string }> = {
    400: { code: 'BAD_REQUEST', message: 'Requisição inválida' },
    401: { code: 'UNAUTHORIZED', message: 'Não autenticado' },
    403: { code: 'FORBIDDEN', message: 'Sem permissão' },
    404: { code: 'NOT_FOUND', message: 'Recurso não encontrado' },
    409: { code: 'CONFLICT', message: 'Conflito de dados' },
    422: { code: 'VALIDATION_ERROR', message: 'Erro de validação' },
    500: { code: 'SERVER_ERROR', message: 'Erro interno do servidor' },
    502: { code: 'BAD_GATEWAY', message: 'Erro de gateway' },
    503: { code: 'SERVICE_UNAVAILABLE', message: 'Serviço indisponível' },
  }

  const errorInfo = statusMessages[status] || {
    code: 'UNKNOWN_ERROR',
    message: 'Erro desconhecido',
  }

  return {
    ...errorInfo,
    statusCode: status,
    details: data as Record<string, any>,
  }
}

/**
 * Instância singleton do API Client
 */
export const apiClient = createApiClient()

/**
 * Helper para tipagem de respostas
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.request<T>(config)
  return response.data
}

/**
 * Helpers HTTP por método
 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'GET', url }),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'POST', url, data }),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PUT', url, data }),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'PATCH', url, data }),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiRequest<T>({ ...config, method: 'DELETE', url }),
}

/**
 * Type guard para verificar se é ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  )
}

/**
 * Circuit Breaker simples (contador de falhas consecutivas)
 */
class CircuitBreaker {
  private failures = 0
  private readonly threshold = 5
  private readonly resetTimeout = 60000 // 1 min

  public recordFailure(): void {
    this.failures++

    if (this.failures >= this.threshold) {
      console.error('[API] ⚠️ Circuit breaker ativado - muitas falhas consecutivas')

      // Reset após timeout
      setTimeout(() => {
        this.failures = 0
        console.log('[API] ✅ Circuit breaker resetado')
      }, this.resetTimeout)
    }
  }

  public recordSuccess(): void {
    this.failures = 0
  }

  public isOpen(): boolean {
    return this.failures >= this.threshold
  }
}

export const circuitBreaker = new CircuitBreaker()

// Adiciona circuit breaker ao client
apiClient.interceptors.response.use(
  (response) => {
    circuitBreaker.recordSuccess()
    return response
  },
  (error) => {
    circuitBreaker.recordFailure()
    return Promise.reject(error)
  }
)
