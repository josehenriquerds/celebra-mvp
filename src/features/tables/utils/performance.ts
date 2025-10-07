/**
 * Utilitários de performance para Table Planner
 */

/**
 * Debounce function para otimizar chamadas frequentes
 * @param func Função a ser debounced
 * @param delay Delay em ms (padrão 300ms)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }
}

/**
 * Throttle function para limitar execuções
 * @param func Função a ser throttled
 * @param limit Limite em ms (padrão 100ms)
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 100
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Calcula coordenadas de assentos em círculo
 * Memoizada para evitar recálculos desnecessários
 */
export function calculateSeatPositions(
  capacity: number,
  radius: number,
  centerX: number,
  centerY: number
): Array<{ x: number; y: number; rotation: number }> {
  const seats = []
  const angleStep = (2 * Math.PI) / capacity

  for (let i = 0; i < capacity; i++) {
    const angle = i * angleStep - Math.PI / 2
    const seatRadius = radius - 8 // Offset do centro
    const x = centerX + Math.cos(angle) * seatRadius
    const y = centerY + Math.sin(angle) * seatRadius
    const rotation = (angle * 180) / Math.PI + 90 // Rotação para apontar para o centro

    seats.push({ x, y, rotation })
  }

  return seats
}

/**
 * Verifica se dois objetos são iguais (shallow comparison)
 * Útil para React.memo
 */
export function shallowEqual<T extends Record<string, any>>(obj1: T, obj2: T): boolean {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false
    }
  }

  return true
}

/**
 * Batching de updates para localStorage
 * Evita múltiplas escritas simultâneas
 */
export class LocalStorageBatcher {
  private queue: Map<string, any> = new Map()
  private timeoutId: NodeJS.Timeout | null = null
  private delay: number

  constructor(delay: number = 500) {
    this.delay = delay
  }

  set(key: string, value: any) {
    this.queue.set(key, value)
    this.scheduleFlush()
  }

  private scheduleFlush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }

    this.timeoutId = setTimeout(() => {
      this.flush()
    }, this.delay)
  }

  private flush() {
    this.queue.forEach((value, key) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error)
      }
    })

    this.queue.clear()
    this.timeoutId = null
  }

  // Força flush imediato (útil para unmount)
  forceFlush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
    this.flush()
  }
}

// Instância global do batcher
export const localStorageBatcher = new LocalStorageBatcher(500)
