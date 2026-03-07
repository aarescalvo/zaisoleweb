/**
 * Rate Limiter para control de peticiones
 * Implementa un algoritmo de ventana deslizante para limitar peticiones por IP
 */

interface RateLimitEntry {
  requests: number[]
  blocked: boolean
  blockedUntil?: Date
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: Date
  retryAfter?: number  // segundos hasta que se pueda reintentar
  isBlocked: boolean
}

export interface RateLimiterOptions {
  /** Ventana de tiempo en milisegundos */
  windowMs: number
  /** Máximo de requests permitidos en la ventana */
  maxRequests: number
  /** Duración del bloqueo en milisegundos cuando se excede el límite */
  blockDuration: number
  /** Mensaje personalizado para el error */
  message?: string
  /** Si debe omitir la primera request */
  skipFirstRequest?: boolean
}

export class RateLimiter {
  private entries: Map<string, RateLimitEntry> = new Map()
  private windowMs: number
  private maxRequests: number
  private blockDuration: number
  private message: string
  private skipFirstRequest: boolean
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs
    this.maxRequests = options.maxRequests
    this.blockDuration = options.blockDuration
    this.message = options.message || 'Demasiadas peticiones, intente más tarde'
    this.skipFirstRequest = options.skipFirstRequest || false

    // Limpiar entradas antiguas cada 5 minutos
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000)
  }

  /**
   * Verifica si una IP puede hacer una petición
   */
  check(identifier: string): RateLimitResult {
    const now = new Date()
    const entry = this.entries.get(identifier) || {
      requests: [],
      blocked: false
    }

    // Verificar si está bloqueado
    if (entry.blocked && entry.blockedUntil) {
      if (now < entry.blockedUntil) {
        const retryAfter = Math.ceil((entry.blockedUntil.getTime() - now.getTime()) / 1000)
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.blockedUntil,
          retryAfter,
          isBlocked: true
        }
      }
      // El bloqueo expiró
      entry.blocked = false
      entry.blockedUntil = undefined
    }

    // Filtrar requests antiguos fuera de la ventana
    const windowStart = now.getTime() - this.windowMs
    entry.requests = entry.requests.filter(time => time > windowStart)

    // Calcular requests restantes
    const remaining = Math.max(0, this.maxRequests - entry.requests.length)

    // Verificar si excede el límite
    if (entry.requests.length >= this.maxRequests) {
      // Bloquear
      entry.blocked = true
      entry.blockedUntil = new Date(now.getTime() + this.blockDuration)
      this.entries.set(identifier, entry)

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockedUntil,
        retryAfter: Math.ceil(this.blockDuration / 1000),
        isBlocked: true
      }
    }

    // Agregar la request actual (si no se debe omitir)
    if (!this.skipFirstRequest) {
      entry.requests.push(now.getTime())
    }
    this.entries.set(identifier, entry)

    const resetTime = new Date(now.getTime() + this.windowMs)
    return {
      allowed: true,
      remaining: remaining - (this.skipFirstRequest ? 0 : 1),
      resetTime,
      isBlocked: false
    }
  }

  /**
   * Registra una petición (para uso manual)
   */
  recordRequest(identifier: string): void {
    const now = new Date()
    const entry = this.entries.get(identifier) || {
      requests: [],
      blocked: false
    }
    entry.requests.push(now.getTime())
    this.entries.set(identifier, entry)
  }

  /**
   * Resetea el contador para una IP
   */
  reset(identifier: string): void {
    this.entries.delete(identifier)
  }

  /**
   * Bloquea manualmente una IP
   */
  block(identifier: string, durationMs?: number): void {
    const entry = this.entries.get(identifier) || {
      requests: [],
      blocked: false
    }
    entry.blocked = true
    entry.blockedUntil = new Date(Date.now() + (durationMs || this.blockDuration))
    this.entries.set(identifier, entry)
  }

  /**
   * Desbloquea una IP
   */
  unblock(identifier: string): void {
    const entry = this.entries.get(identifier)
    if (entry) {
      entry.blocked = false
      entry.blockedUntil = undefined
      this.entries.set(identifier, entry)
    }
  }

  /**
   * Verifica si una IP está bloqueada
   */
  isBlocked(identifier: string): boolean {
    const entry = this.entries.get(identifier)
    if (!entry) return false
    if (!entry.blocked || !entry.blockedUntil) return false
    if (new Date() >= entry.blockedUntil) {
      this.unblock(identifier)
      return false
    }
    return true
  }

  /**
   * Obtiene estadísticas de uso
   */
  getStats(identifier: string): {
    requestCount: number
    remaining: number
    isBlocked: boolean
    blockedUntil?: Date
  } {
    const now = new Date()
    const entry = this.entries.get(identifier)
    
    if (!entry) {
      return {
        requestCount: 0,
        remaining: this.maxRequests,
        isBlocked: false
      }
    }

    // Filtrar requests antiguos
    const windowStart = now.getTime() - this.windowMs
    const validRequests = entry.requests.filter(time => time > windowStart)

    return {
      requestCount: validRequests.length,
      remaining: Math.max(0, this.maxRequests - validRequests.length),
      isBlocked: entry.blocked && entry.blockedUntil ? now < entry.blockedUntil : false,
      blockedUntil: entry.blockedUntil
    }
  }

  /**
   * Limpia entradas antiguas
   */
  private cleanup(): void {
    const now = new Date()
    const maxAge = Math.max(this.windowMs, this.blockDuration) + (60 * 60 * 1000) // 1 hora extra

    for (const [key, entry] of this.entries.entries()) {
      // Eliminar si está bloqueado pero el bloqueo expiró hace más de una hora
      if (entry.blockedUntil && now.getTime() - entry.blockedUntil.getTime() > 60 * 60 * 1000) {
        this.entries.delete(key)
        continue
      }

      // Eliminar si no hay requests recientes
      if (entry.requests.length === 0) {
        this.entries.delete(key)
        continue
      }

      // Eliminar requests antiguos
      const windowStart = now.getTime() - maxAge
      entry.requests = entry.requests.filter(time => time > windowStart)
      
      if (entry.requests.length === 0 && !entry.blocked) {
        this.entries.delete(key)
      }
    }
  }

  /**
   * Destruye el rate limiter y limpia recursos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.entries.clear()
  }
}

// ==================== INSTANCIAS PREDEFINIDAS ====================

/**
 * Rate limiter para intentos de login
 * 5 intentos cada 15 minutos, bloqueo de 30 minutos
 */
export const loginRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  maxRequests: 5,
  blockDuration: 30 * 60 * 1000,  // 30 minutos
  message: 'Demasiados intentos de login. Intente nuevamente más tarde.'
})

/**
 * Rate limiter para API general
 * 100 requests por minuto, bloqueo de 5 minutos
 */
export const apiRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,  // 1 minuto
  maxRequests: 100,
  blockDuration: 5 * 60 * 1000,  // 5 minutos
  message: 'Demasiadas peticiones. Espere un momento.'
})

/**
 * Rate limiter para operaciones sensibles (cambio de contraseña, etc.)
 * 3 intentos cada hora, bloqueo de 1 hora
 */
export const sensitiveRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hora
  maxRequests: 3,
  blockDuration: 60 * 60 * 1000,  // 1 hora
  message: 'Demasiados intentos. Por seguridad, debe esperar antes de intentar nuevamente.'
})

// ==================== FUNCIÓN HELPER PARA API ROUTES ====================

/**
 * Función helper para usar en API routes
 * Retorna un Response si está bloqueado, null si está permitido
 */
export function checkRateLimit(
  limiter: RateLimiter,
  identifier: string
): Response | null {
  const result = limiter.check(identifier)
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: result.isBlocked 
          ? 'IP bloqueada por exceso de peticiones' 
          : 'Límite de peticiones excedido',
        retryAfter: result.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(result.retryAfter || 60),
          'X-RateLimit-Limit': String(limiter['maxRequests']),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': result.resetTime.toISOString()
        }
      }
    )
  }
  
  return null
}
