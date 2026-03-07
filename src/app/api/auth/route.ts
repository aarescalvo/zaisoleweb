import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { 
  getClientIp, 
  getUserAgent, 
  generateSessionToken,
  parseUserAgent,
  isOutOfAllowedHours
} from '@/lib/security'
import { loginRateLimiter } from '@/lib/rate-limiter'
import { auditLogin, auditLogout } from '@/lib/audit-middleware'

// POST - Login con usuario/password o PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuario, password, pin } = body
    
    // Obtener información del cliente
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    const { browser, os, device } = parseUserAgent(userAgent)

    // Verificar rate limiting
    const rateLimitResult = loginRateLimiter.check(ip)
    if (!rateLimitResult.allowed) {
      // Registrar intento fallido por rate limit
      await db.intentoLogin.create({
        data: {
          ip,
          usuario: usuario || null,
          exitoso: false,
          motivo: 'RATE_LIMITED',
          userAgent
        }
      })

      return NextResponse.json(
        { 
          success: false, 
          error: 'Demasiados intentos de login. Intente más tarde.',
          retryAfter: rateLimitResult.retryAfter,
          isBlocked: rateLimitResult.isBlocked
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter || 60)
          }
        }
      )
    }

    // Verificar si la IP está bloqueada
    const ipBloqueada = await db.ipBloqueada.findFirst({
      where: {
        ip,
        activo: true,
        OR: [
          { fechaExpiracion: null },
          { fechaExpiracion: { gt: new Date() } }
        ]
      }
    })

    if (ipBloqueada) {
      await db.intentoLogin.create({
        data: {
          ip,
          usuario: usuario || null,
          exitoso: false,
          motivo: 'IP_BLOCKED',
          userAgent
        }
      })

      return NextResponse.json(
        { success: false, error: 'Esta IP está bloqueada por seguridad' },
        { status: 403 }
      )
    }

    // Obtener configuración de seguridad
    let configSeguridad = await db.configuracionSeguridad.findFirst()
    if (!configSeguridad) {
      // Crear configuración por defecto
      configSeguridad = await db.configuracionSeguridad.create({
        data: {}
      })
    }

    // Verificar horario permitido
    if (configSeguridad.restrictedHoursEnabled) {
      if (isOutOfAllowedHours(configSeguridad.allowedHourStart, configSeguridad.allowedHourEnd)) {
        await db.intentoLogin.create({
          data: {
            ip,
            usuario: usuario || null,
            exitoso: false,
            motivo: 'OUT_OF_HOURS',
            userAgent
          }
        })

        return NextResponse.json(
          { success: false, error: 'Acceso no permitido en este horario' },
          { status: 403 }
        )
      }
    }

    // Login con usuario y password
    if (usuario && password) {
      const operador = await db.operador.findFirst({
        where: {
          usuario: String(usuario),
          activo: true
        }
      })
      
      if (!operador) {
        // Registrar intento fallido
        await db.intentoLogin.create({
          data: {
            ip,
            usuario: String(usuario),
            exitoso: false,
            motivo: 'USUARIO_NO_EXISTE',
            userAgent
          }
        })
        
        loginRateLimiter.recordFailedAttempt(ip)
        
        return NextResponse.json(
          { success: false, error: 'Usuario no encontrado o inactivo' },
          { status: 401 }
        )
      }
      
      const validPassword = await bcrypt.compare(password, operador.password)
      
      if (!validPassword) {
        // Registrar intento fallido
        await db.intentoLogin.create({
          data: {
            ip,
            usuario: String(usuario),
            operadorId: operador.id,
            exitoso: false,
            motivo: 'PASSWORD_INCORRECTO',
            userAgent
          }
        })

        loginRateLimiter.recordFailedAttempt(ip)

        // Verificar si debe bloquear la IP
        const remaining = loginRateLimiter.getRemainingAttempts(ip)
        
        // Registrar en auditoría
        await auditLogin({
          operadorId: operador.id,
          metodo: 'PASSWORD',
          ip,
          userAgent,
          exitoso: false,
          motivo: 'Contraseña incorrecta'
        })
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Contraseña incorrecta',
            remainingAttempts: remaining
          },
          { status: 401 }
        )
      }
      
      // Verificar sesiones concurrentes
      const sesionesActivas = await db.sesion.count({
        where: {
          operadorId: operador.id,
          activa: true,
          fechaExpiracion: { gt: new Date() }
        }
      })

      if (sesionesActivas >= configSeguridad.maxConcurrentSessions) {
        // Cerrar sesiones antiguas
        await db.sesion.updateMany({
          where: {
            operadorId: operador.id,
            activa: true
          },
          data: {
            activa: false,
            fechaCierre: new Date(),
            motivoCierre: 'NEW_SESSION'
          }
        })
      }

      // Crear sesión
      const sessionToken = generateSessionToken()
      const fechaExpiracion = new Date()
      fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + configSeguridad.sessionTimeout)

      const sesion = await db.sesion.create({
        data: {
          operadorId: operador.id,
          token: sessionToken,
          fechaExpiracion,
          ip,
          userAgent,
          dispositivo: `${browser} en ${os} (${device})`
        }
      })

      // Limpiar intentos fallidos
      loginRateLimiter.reset(ip)
      
      // Registrar login exitoso
      await db.intentoLogin.create({
        data: {
          ip,
          usuario: String(usuario),
          operadorId: operador.id,
          exitoso: true,
          userAgent
        }
      })

      // Registrar en auditoría
      await auditLogin({
        operadorId: operador.id,
        metodo: 'PASSWORD',
        ip,
        userAgent,
        exitoso: true
      })

      // Verificar si es una IP nueva para el usuario
      const ipsPrevias = await db.sesion.findFirst({
        where: {
          operadorId: operador.id,
          ip,
          activa: false
        }
      })

      const isNewIp = !ipsPrevias && configSeguridad.notifyNewIp
      
      return NextResponse.json({
        success: true,
        data: {
          id: operador.id,
          nombre: operador.nombre,
          usuario: operador.usuario,
          rol: operador.rol,
          nivel: operador.rol, // Nivel es igual al rol para compatibilidad
          email: operador.email,
          sessionToken,
          sessionId: sesion.id,
          sessionExpires: fechaExpiracion.toISOString(),
          isNewIp,
          permisos: {
            puedePesajeCamiones: operador.puedePesajeCamiones,
            puedePesajeIndividual: operador.puedePesajeIndividual,
            puedeMovimientoHacienda: operador.puedeMovimientoHacienda,
            puedeListaFaena: operador.puedeListaFaena,
            puedeRomaneo: operador.puedeRomaneo,
            puedeIngresoCajon: operador.puedeIngresoCajon,
            puedeMenudencias: operador.puedeMenudencias,
            puedeStock: operador.puedeStock,
            puedeReportes: operador.puedeReportes,
            puedeCCIR: operador.puedeCCIR,
            puedeFacturacion: operador.puedeFacturacion,
            puedeConfiguracion: operador.puedeConfiguracion
          }
        }
      })
    }
    
    // Login con PIN (alternativa rápida)
    if (pin) {
      const operador = await db.operador.findFirst({
        where: {
          pin: String(pin),
          activo: true
        }
      })
      
      if (!operador) {
        await db.intentoLogin.create({
          data: {
            ip,
            usuario: null,
            exitoso: false,
            motivo: 'PIN_INVALIDO',
            userAgent
          }
        })

        loginRateLimiter.recordFailedAttempt(ip)
        
        return NextResponse.json(
          { success: false, error: 'PIN inválido o operador inactivo' },
          { status: 401 }
        )
      }

      // Verificar sesiones concurrentes
      const sesionesActivas = await db.sesion.count({
        where: {
          operadorId: operador.id,
          activa: true,
          fechaExpiracion: { gt: new Date() }
        }
      })

      if (sesionesActivas >= configSeguridad.maxConcurrentSessions) {
        await db.sesion.updateMany({
          where: {
            operadorId: operador.id,
            activa: true
          },
          data: {
            activa: false,
            fechaCierre: new Date(),
            motivoCierre: 'NEW_SESSION'
          }
        })
      }

      // Crear sesión
      const sessionToken = generateSessionToken()
      const fechaExpiracion = new Date()
      fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + configSeguridad.sessionTimeout)

      const sesion = await db.sesion.create({
        data: {
          operadorId: operador.id,
          token: sessionToken,
          fechaExpiracion,
          ip,
          userAgent,
          dispositivo: `${browser} en ${os} (${device})`
        }
      })
      
      // Limpiar intentos fallidos
      loginRateLimiter.reset(ip)

      // Registrar login exitoso
      await db.intentoLogin.create({
        data: {
          ip,
          usuario: operador.usuario,
          operadorId: operador.id,
          exitoso: true,
          userAgent
        }
      })
      
      // Registrar en auditoría
      await auditLogin({
        operadorId: operador.id,
        metodo: 'PIN',
        ip,
        userAgent,
        exitoso: true
      })
      
      return NextResponse.json({
        success: true,
        data: {
          id: operador.id,
          nombre: operador.nombre,
          usuario: operador.usuario,
          rol: operador.rol,
          nivel: operador.rol, // Nivel es igual al rol para compatibilidad
          email: operador.email,
          sessionToken,
          sessionId: sesion.id,
          sessionExpires: fechaExpiracion.toISOString(),
          permisos: {
            puedePesajeCamiones: operador.puedePesajeCamiones,
            puedePesajeIndividual: operador.puedePesajeIndividual,
            puedeMovimientoHacienda: operador.puedeMovimientoHacienda,
            puedeListaFaena: operador.puedeListaFaena,
            puedeRomaneo: operador.puedeRomaneo,
            puedeIngresoCajon: operador.puedeIngresoCajon,
            puedeMenudencias: operador.puedeMenudencias,
            puedeStock: operador.puedeStock,
            puedeReportes: operador.puedeReportes,
            puedeCCIR: operador.puedeCCIR,
            puedeFacturacion: operador.puedeFacturacion,
            puedeConfiguracion: operador.puedeConfiguracion
          }
        }
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Debe proporcionar usuario/password o PIN' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { success: false, error: 'Error de servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Logout
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { operadorId, sessionId, sessionToken } = body
    
    const ip = getClientIp(request)
    const userAgent = getUserAgent(request)
    
    if (sessionToken || sessionId) {
      // Cerrar sesión específica
      const sesion = await db.sesion.findFirst({
        where: {
          OR: [
            { token: sessionToken },
            { id: sessionId }
          ],
          activa: true
        }
      })

      if (sesion) {
        await db.sesion.update({
          where: { id: sesion.id },
          data: {
            activa: false,
            fechaCierre: new Date(),
            motivoCierre: 'LOGOUT'
          }
        })

        // Registrar logout en auditoría
        await auditLogout({
          operadorId: sesion.operadorId,
          ip,
          userAgent,
          sessionId: sesion.id
        })
      }
    } else if (operadorId) {
      // Cerrar todas las sesiones del operador
      await db.sesion.updateMany({
        where: {
          operadorId,
          activa: true
        },
        data: {
          activa: false,
          fechaCierre: new Date(),
          motivoCierre: 'LOGOUT'
        }
      })

      // Registrar logout en auditoría
      await auditLogout({
        operadorId,
        ip,
        userAgent
      })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en logout:', error)
    return NextResponse.json({ success: true })
  }
}

// GET - Verificar sesión
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('token')

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Token requerido' },
        { status: 400 }
      )
    }

    const sesion = await db.sesion.findUnique({
      where: { token: sessionToken },
      include: {
        operador: {
          select: {
            id: true,
            nombre: true,
            usuario: true,
            rol: true,
            email: true,
            puedePesajeCamiones: true,
            puedePesajeIndividual: true,
            puedeMovimientoHacienda: true,
            puedeListaFaena: true,
            puedeRomaneo: true,
            puedeIngresoCajon: true,
            puedeMenudencias: true,
            puedeStock: true,
            puedeReportes: true,
            puedeCCIR: true,
            puedeFacturacion: true,
            puedeConfiguracion: true
          }
        }
      }
    })

    if (!sesion) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Sesión no encontrada'
      })
    }

    if (!sesion.activa) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Sesión cerrada',
        motivoCierre: sesion.motivoCierre
      })
    }

    if (sesion.fechaExpiracion < new Date()) {
      // Actualizar sesión como expirada
      await db.sesion.update({
        where: { id: sesion.id },
        data: {
          activa: false,
          fechaCierre: new Date(),
          motivoCierre: 'EXPIRED'
        }
      })

      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Sesión expirada'
      })
    }

    // Actualizar última actividad
    await db.sesion.update({
      where: { id: sesion.id },
      data: { ultimaActividad: new Date() }
    })

    return NextResponse.json({
      success: true,
      valid: true,
      data: {
        operador: sesion.operador,
        sessionId: sesion.id,
        expiresAt: sesion.fechaExpiracion,
        lastActivity: sesion.ultimaActividad
      }
    })
  } catch (error) {
    console.error('Error verificando sesión:', error)
    return NextResponse.json(
      { success: false, valid: false, error: 'Error de servidor' },
      { status: 500 }
    )
  }
}
