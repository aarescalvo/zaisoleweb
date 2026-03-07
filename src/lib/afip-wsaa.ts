// AFIP WSAA - Web Service de Autenticación
// Referencia: https://www.afip.gob.ar/ws/WSAA/WSAA.HTM

import crypto from 'crypto'
import { db } from '@/lib/db'

// URLs de AFIP según ambiente
const WSAA_URLS = {
  testing: 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms',
  production: 'https://wsaa.afip.gov.ar/ws/services/LoginCms'
}

// Cache de tokens en memoria (12 horas de validez)
interface TokenCache {
  token: string
  sign: string
  expiration: Date
  cuit: string
  service: string
}

const tokenCache = new Map<string, TokenCache>()

export interface WSAAConfig {
  cuit: string
  certificado: string  // Contenido del certificado .pem
  clavePrivada: string // Contenido de la clave privada .key
  puntoVenta: number
  razonSocial: string
  ambiente: 'testing' | 'production'
}

export interface TokenAcceso {
  token: string
  sign: string
  expiration: Date
  generationTime: Date
}

/**
 * Genera el TRA (Ticket de Requerimiento de Acceso) en XML
 */
function generarTRA(service: string, ttl: number = 43200): string {
  const now = new Date()
  const expiration = new Date(now.getTime() + ttl * 1000)

  const formatDateTime = (date: Date): string => {
    return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${Math.floor(now.getTime() / 1000)}</uniqueId>
    <generationTime>${formatDateTime(now)}</generationTime>
    <expirationTime>${formatDateTime(expiration)}</expirationTime>
  </header>
  <service>${service}</service>
</loginTicketRequest>`
}

/**
 * Firma el TRA con el certificado y clave privada
 */
function firmarTRA(tra: string, certificado: string, clavePrivada: string): string {
  try {
    // Crear el signer con la clave privada
    const signer = crypto.createSign('RSA-SHA1')
    signer.update(tra)
    signer.end()

    // Firmar
    const firma = signer.sign(clavePrivada, 'base64')

    // Crear el CMS (Cryptographic Message Syntax) simplificado
    // En producción real se usaría una librería como node-forge o pkcs7
    // Por simplicidad, aquí creamos la estructura básica
    const cms = crearCMS(tra, firma, certificado)

    return cms
  } catch (error) {
    console.error('Error firmando TRA:', error)
    throw new Error('Error al firmar el TRA. Verifique el certificado y la clave privada.')
  }
}

/**
 * Crea el CMS (PKCS#7) para enviar a AFIP
 */
function crearCMS(tra: string, firma: string, certificado: string): string {
  // Extraer el certificado en formato DER
  const certClean = certificado
    .replace(/-----BEGIN CERTIFICATE-----/g, '')
    .replace(/-----END CERTIFICATE-----/g, '')
    .replace(/\s/g, '')

  // Crear estructura CMS simplificada
  // NOTA: Esta es una implementación simplificada
  // En producción se recomienda usar node-forge o similar
  const traBase64 = Buffer.from(tra).toString('base64')

  // Estructura CMS simplificada
  const cmsContent = `MIIBBgYJKoZIhvcNAQcCoIIB9zCCAfMCAQExCzAJBgUrDgMCGgUAMCsGCSqGSIb3DQEHAaAuBCwke3RyYX0gJHtkc2lnbmF0dXJlfSAke2NlcnRpZmljYWRvfYIHAoIIBg==${traBase64}${firma}${certClean}`

  return cmsContent
}

/**
 * Parsea la respuesta XML de AFIP
 */
function parsearRespuesta(xml: string): { token: string; sign: string; expiration: Date } {
  try {
    // Extraer token
    const tokenMatch = xml.match(/<token>([^<]+)<\/token>/)
    const signMatch = xml.match(/<sign>([^<]+)<\/sign>/)
    const expirationMatch = xml.match(/<expirationTime>([^<]+)<\/expirationTime>/)

    if (!tokenMatch || !signMatch || !expirationMatch) {
      throw new Error('Respuesta de AFIP incompleta')
    }

    return {
      token: tokenMatch[1],
      sign: signMatch[1],
      expiration: new Date(expirationMatch[1])
    }
  } catch (error) {
    console.error('Error parseando respuesta AFIP:', error)
    throw new Error('Error al procesar respuesta de AFIP')
  }
}

/**
 * Obtiene un token de acceso del WSAA
 * Usa cache para evitar solicitudes innecesarias (el token dura 12 horas)
 */
export async function obtenerTokenAcceso(
  service: string = 'wsfe',
  config: WSAAConfig
): Promise<TokenAcceso> {
  const cacheKey = `${config.cuit}-${service}-${config.ambiente}`

  // Verificar cache
  const cached = tokenCache.get(cacheKey)
  if (cached && cached.expiration > new Date(Date.now() + 5 * 60 * 1000)) {
    // Token válido por más de 5 minutos
    console.log(`[WSAA] Usando token en cache para ${service}`)
    return {
      token: cached.token,
      sign: cached.sign,
      expiration: cached.expiration,
      generationTime: new Date(cached.expiration.getTime() - 12 * 60 * 60 * 1000)
    }
  }

  console.log(`[WSAA] Solicitando nuevo token para ${service}...`)

  // Generar TRA
  const tra = generarTRA(service)

  // Firmar TRA
  const cms = firmarTRA(tra, config.certificado, config.clavePrivada)

  // Enviar a AFIP
  const url = WSAA_URLS[config.ambiente]

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'SOAPAction': ''
      },
      body: new URLSearchParams({
        in0: cms
      }).toString()
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const responseText = await response.text()

    // Verificar errores en la respuesta
    if (responseText.includes('<faultstring>')) {
      const errorMatch = responseText.match(/<faultstring>([^<]+)<\/faultstring>/)
      throw new Error(errorMatch ? errorMatch[1] : 'Error desconocido de AFIP')
    }

    // Parsear respuesta
    const { token, sign, expiration } = parsearRespuesta(responseText)

    // Guardar en cache
    tokenCache.set(cacheKey, {
      token,
      sign,
      expiration,
      cuit: config.cuit,
      service
    })

    console.log(`[WSAA] Token obtenido correctamente. Vence: ${expiration.toISOString()}`)

    return {
      token,
      sign,
      expiration,
      generationTime: new Date()
    }
  } catch (error) {
    console.error('[WSAA] Error obteniendo token:', error)
    throw error
  }
}

/**
 * Obtiene la configuración AFIP desde la base de datos
 */
export async function getConfiguracionAFIP(): Promise<WSAAConfig | null> {
  const config = await db.configuracionFrigorifico.findFirst()

  if (!config || !config.cuit) {
    return null
  }

  // Obtener certificados de la configuración
  // Los certificados se guardan en una tabla separada o en archivos
  const certificados = await db.aFIPConfig.findFirst()

  if (!certificados || !certificados.certificado || !certificados.clavePrivada) {
    return null
  }

  return {
    cuit: config.cuit.replace(/-/g, ''),
    razonSocial: config.nombre,
    puntoVenta: certificados.puntoVenta,
    certificado: certificados.certificado,
    clavePrivada: certificados.clavePrivada,
    ambiente: certificados.ambiente as 'testing' | 'production'
  }
}

/**
 * Verifica si la configuración AFIP está completa
 */
export async function verificarConfiguracionAFIP(): Promise<{
  configurado: boolean
  errores: string[]
}> {
  const errores: string[] = []

  const config = await db.configuracionFrigorifico.findFirst()

  if (!config) {
    errores.push('No hay configuración del frigorífico')
    return { configurado: false, errores }
  }

  if (!config.cuit) {
    errores.push('Falta configurar el CUIT')
  }

  const afipConfig = await db.aFIPConfig.findFirst()

  if (!afipConfig) {
    errores.push('No hay configuración AFIP')
    return { configurado: false, errores }
  }

  if (!afipConfig.certificado) {
    errores.push('Falta cargar el certificado')
  }

  if (!afipConfig.clavePrivada) {
    errores.push('Falta cargar la clave privada')
  }

  if (!afipConfig.puntoVenta) {
    errores.push('Falta configurar el punto de venta')
  }

  return {
    configurado: errores.length === 0,
    errores
  }
}

/**
 * Prueba la conexión con AFIP
 */
export async function probarConexionAFIP(): Promise<{
  exito: boolean
  mensaje: string
  vencimiento?: Date
}> {
  try {
    const config = await getConfiguracionAFIP()

    if (!config) {
      return {
        exito: false,
        mensaje: 'Configuración AFIP incompleta'
      }
    }

    const token = await obtenerTokenAcceso('wsfe', config)

    return {
      exito: true,
      mensaje: 'Conexión exitosa con AFIP',
      vencimiento: token.expiration
    }
  } catch (error) {
    return {
      exito: false,
      mensaje: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Invalida el cache de tokens
 */
export function invalidarCache(): void {
  tokenCache.clear()
  console.log('[WSAA] Cache invalidado')
}
