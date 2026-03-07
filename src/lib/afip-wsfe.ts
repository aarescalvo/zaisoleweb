// AFIP WSFE - Web Service de Facturación Electrónica
// Referencia: https://www.afip.gob.ar/ws/WSFEV1/WSFEV1.HTM

import { obtenerTokenAcceso, getConfiguracionAFIP, WSAAConfig } from './afip-wsaa'
import { TIPOS_COMPROBANTE, TIPOS_DOCUMENTO } from './afip'

// URLs de AFIP según ambiente
const WSFE_URLS = {
  testing: 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx',
  production: 'https://servicios1.afip.gov.ar/wsfev1/service.asmx'
}

// Tipos de comprobante AFIP
export const TIPO_COMPROBANTE = {
  FACTURA_A: 1,
  NOTA_DEBITO_A: 2,
  NOTA_CREDITO_A: 3,
  FACTURA_B: 6,
  NOTA_DEBITO_B: 7,
  NOTA_CREDITO_B: 8,
  FACTURA_C: 11,
  NOTA_DEBITO_C: 12,
  NOTA_CREDITO_C: 13,
  FACTURA_M: 51,
  NOTA_DEBITO_M: 52,
  NOTA_CREDITO_M: 53,
} as const

// Tipos de documento
export const TIPO_DOCUMENTO = {
  CUIT: 80,
  CUIL: 86,
  DNI: 96,
  PASAPORTE: 94,
  CI: 1,
  LE: 2,
  LC: 3,
  SIN_IDENTIFICAR: 99,
} as const

// Monedas
export const MONEDA = {
  PESOS: 'PES',
  DOLAR: 'DOL',
  EURO: 'EUR',
} as const

// Alicuotas IVA
export const ALICUOTA_IVA = {
  CERO: 0,      // 0%
  DIEZ_CINCO: 4, // 10.5%
  VEINTIUNO: 5,  // 21%
  VEINTISIETE: 6, // 27%
  CERO_EXENTO: 1, // Exento
  NO_GRAVADO: 2,  // No gravado
} as const

export interface FEHeader {
  cuit: string
  puntoVenta: number
}

export interface FECompTotXReq {
  tipoComprobante: number
  puntoVenta: number
}

export interface FERequest {
  tipoComprobante: number
  puntoVenta: number
  numeroComprobante: number
  fecha: string // Formato: YYYYMMDD
  concepto: number // 1=Productos, 2=Servicios, 3=Productos y Servicios
  tipoDocumento: number
  numeroDocumento: string
  razonSocial?: string
  domicilio?: string
  
  // Importes
  importeTotal: number
  importeGravado: number
  importeNoGravado: number
  importeExento: number
  importeIVA: number
  
  // Fechas de servicio (si concepto = 2 o 3)
  fechaServicioDesde?: string
  fechaServicioHasta?: string
  fechaVencimientoPago?: string
  
  // Moneda
  codigoMoneda: string
  cotizacionMoneda: number
  
  // IVA
  ivas: {
    id: number      // ID de alícuota
    baseImp: number // Base imponible
    importe: number // Importe de IVA
  }[]
  
  // Tributos
  tributos?: {
    id: number
    desc: string
    baseImp: number
    alic: number
    importe: number
  }[]
  
  // Opcionales
  opcionales?: {
    id: number
    valor: string
  }[]
  
  // Comprobantes asociados (para notas de crédito/débito)
  comprobantesAsociados?: {
    tipo: number
    ptoVta: number
    nro: number
  }[]
}

export interface FEResponse {
  success: boolean
  cae: string
  caeVencimiento: Date
  numeroComprobante: number
  errores: FEErr[]
 observaciones: FEObs[]
}

export interface FEErr {
  code: number
  msg: string
}

export interface FEObs {
  code: number
  msg: string
}

/**
 * Crea el XML SOAP para llamar a WSFE
 */
function crearSOAPEnvelope(method: string, params: Record<string, unknown>): string {
  let paramsXML = ''

  function objectToXML(obj: unknown, indent: string = ''): string {
    if (obj === null || obj === undefined) return ''

    if (Array.isArray(obj)) {
      return obj.map(item => objectToXML(item, indent)).join('\n')
    }

    if (typeof obj === 'object') {
      const entries = Object.entries(obj as Record<string, unknown>)
      return entries.map(([key, value]) => {
        if (key.startsWith('@')) return ''
        if (typeof value === 'object' && value !== null) {
          return `${indent}<${key}>\n${objectToXML(value, indent + '  ')}${indent}</${key}>`
        }
        return `${indent}<${key}>${value}</${key}>`
      }).join('\n')
    }

    return `${indent}${obj}`
  }

  paramsXML = objectToXML(params, '        ')

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:wsfe="http://ar.gov.afip.dif.FEV1/">
  <soapenv:Header/>
  <soapenv:Body>
    <wsfe:${method}>
${paramsXML}
    </wsfe:${method}>
  </soapenv:Body>
</soapenv:Envelope>`
}

/**
 * Parsea la respuesta XML de AFIP
 */
function parsearRespuestaXML(xml: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  // Función recursiva para extraer valores
  function extractValue(match: RegExpMatchArray | null): string | null {
    return match ? match[1] : null
  }

  // Extraer errores
  const errores: FEErr[] = []
  const errRegex = /<Err>\s*<Code>(\d+)<\/Code>\s*<Msg>([^<]*)<\/Msg>\s*<\/Err>/g
  let match
  while ((match = errRegex.exec(xml)) !== null) {
    errores.push({ code: parseInt(match[1]), msg: match[2] })
  }
  if (errores.length > 0) result.errores = errores

  // Extraer observaciones
  const observaciones: FEObs[] = []
  const obsRegex = /<Obs>\s*<Code>(\d+)<\/Code>\s*<Msg>([^<]*)<\/Msg>\s*<\/Obs>/g
  while ((match = obsRegex.exec(xml)) !== null) {
    observaciones.push({ code: parseInt(match[1]), msg: match[2] })
  }
  if (observaciones.length > 0) result.observaciones = observaciones

  // Extraer CAE
  const caeMatch = xml.match(/<CAE>([^<]+)<\/CAE>/)
  if (caeMatch) result.cae = caeMatch[1]

  // Extraer fecha vencimiento CAE
  const caeVencMatch = xml.match(/<CAEFchVto>([^<]+)<\/CAEFchVto>/)
  if (caeVencMatch) {
    // Convertir formato YYYYMMDD a Date
    const fecha = caeVencMatch[1]
    result.caeVencimiento = new Date(
      parseInt(fecha.substring(0, 4)),
      parseInt(fecha.substring(4, 6)) - 1,
      parseInt(fecha.substring(6, 8))
    )
  }

  // Extraer número de comprobante
  const nroCbteMatch = xml.match(/<CbteDesde>(\d+)<\/CbteDesde>/)
  if (nroCbteMatch) result.numeroComprobante = parseInt(nroCbteMatch[1])

  // Extraer cotización
  const cotizMatch = xml.match(/<MonCotiz>([^<]+)<\/MonCotiz>/)
  if (cotizMatch) result.cotizacion = parseFloat(cotizMatch[1])

  // Extraer último número
  const ultNroMatch = xml.match(/<CbteNro>(\d+)<\/CbteNro>/)
  if (ultNroMatch) result.ultimoNumero = parseInt(ultNroMatch[1])

  return result
}

/**
 * Realiza una llamada al WSFE
 */
async function llamarWSFE(
  method: string,
  params: Record<string, unknown>,
  config: WSAAConfig
): Promise<Record<string, unknown>> {
  const url = WSFE_URLS[config.ambiente]

  // Obtener token de acceso
  const token = await obtenerTokenAcceso('wsfe', config)

  // Agregar credenciales a los parámetros
  const paramsWithAuth = {
    Auth: {
      Token: token.token,
      Sign: token.sign,
      Cuit: config.cuit
    },
    ...params
  }

  // Crear envelope SOAP
  const envelope = crearSOAPEnvelope(method, paramsWithAuth)

  console.log(`[WSFE] Llamando a ${method}...`)

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': `http://ar.gov.afip.dif.FEV1/${method}`
      },
      body: envelope
    })

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const responseText = await response.text()

    // Verificar fault
    if (responseText.includes('<faultstring>')) {
      const faultMatch = responseText.match(/<faultstring>([^<]+)<\/faultstring>/)
      throw new Error(faultMatch ? faultMatch[1] : 'Error SOAP de AFIP')
    }

    return parsearRespuestaXML(responseText)
  } catch (error) {
    console.error(`[WSFE] Error en ${method}:`, error)
    throw error
  }
}

/**
 * Obtiene la cotización de una moneda
 */
export async function FEParamGetCotizacion(
  codigoMoneda: string = 'PES',
  config?: WSAAConfig
): Promise<number> {
  const cfg = config || await getConfiguracionAFIP()
  if (!cfg) throw new Error('Configuración AFIP no disponible')

  const result = await llamarWSFE('FEParamGetCotizacion', {
    MonId: codigoMoneda
  }, cfg)

  return result.cotizacion as number || 1
}

/**
 * Consulta el último número de comprobante autorizado
 */
export async function FECompUltimoAutorizado(
  tipoComprobante: number,
  puntoVenta: number,
  config?: WSAAConfig
): Promise<number> {
  const cfg = config || await getConfiguracionAFIP()
  if (!cfg) throw new Error('Configuración AFIP no disponible')

  const result = await llamarWSFE('FECompUltimoAutorizado', {
    PtoVta: puntoVenta,
    CbteTipo: tipoComprobante
  }, cfg)

  return result.ultimoNumero as number || 0
}

/**
 * Solicita CAE para un comprobante
 */
export async function FECAESolicitar(
  request: FERequest,
  config?: WSAAConfig
): Promise<FEResponse> {
  const cfg = config || await getConfiguracionAFIP()
  if (!cfg) throw new Error('Configuración AFIP no disponible')

  // Obtener próximo número de comprobante
  const ultimoNumero = await FECompUltimoAutorizado(
    request.tipoComprobante,
    request.puntoVenta,
    cfg
  )
  const proximoNumero = ultimoNumero + 1

  // Construir estructura de comprobante
  const params = {
    FeCAEReq: {
      FeCabReq: {
        CantReg: 1,
        PtoVta: request.puntoVenta,
        CbteTipo: request.tipoComprobante
      },
      FeDetReq: {
        FECAEDetRequest: {
          Concepto: request.concepto,
          DocTipo: request.tipoDocumento,
          DocNro: request.numeroDocumento,
          CbteDesde: proximoNumero,
          CbteHasta: proximoNumero,
          CbteFch: request.fecha,
          FchServDesde: request.fechaServicioDesde || undefined,
          FchServHasta: request.fechaServicioHasta || undefined,
          FchVtoPago: request.fechaVencimientoPago || undefined,
          ImpTotal: request.importeTotal.toFixed(2),
          ImpTotConc: request.importeNoGravado.toFixed(2),
          ImpNeto: request.importeGravado.toFixed(2),
          ImpOpEx: request.importeExento.toFixed(2),
          ImpIVA: request.importeIVA.toFixed(2),
          ImpTrib: (request.tributos?.reduce((sum, t) => sum + t.importe, 0) || 0).toFixed(2),
          MonId: request.codigoMoneda,
          MonCotiz: request.cotizacionMoneda.toFixed(6),
          // IVA
          Iva: request.ivas.length > 0 ? {
            AlicIva: request.ivas.map(iva => ({
              Id: iva.id,
              BaseImp: iva.baseImp.toFixed(2),
              Importe: iva.importe.toFixed(2)
            }))
          } : undefined,
          // Tributos
          Tributos: request.tributos && request.tributos.length > 0 ? {
            Tributo: request.tributos.map(t => ({
              Id: t.id,
              Desc: t.desc,
              BaseImp: t.baseImp.toFixed(2),
              Alic: t.alic.toFixed(2),
              Importe: t.importe.toFixed(2)
            }))
          } : undefined,
          // Opcionales
          Opcionales: request.opcionales && request.opcionales.length > 0 ? {
            Opcional: request.opcionales.map(o => ({
              Id: o.id.toString(),
              Valor: o.valor
            }))
          } : undefined,
          // Comprobantes asociados
          CbtesAsoc: request.comprobantesAsociados && request.comprobantesAsociados.length > 0 ? {
            CbteAsoc: request.comprobantesAsociados.map(c => ({
              Tipo: c.tipo,
              PtoVta: c.ptoVta,
              Nro: c.nro
            }))
          } : undefined
        }
      }
    }
  }

  const result = await llamarWSFE('FECAESolicitar', params, cfg)

  // Procesar respuesta
  const errores = result.errores as FEErr[] || []
  const observaciones = result.observaciones as FEObs[] || []

  return {
    success: !!result.cae,
    cae: result.cae as string || '',
    caeVencimiento: result.caeVencimiento as Date || new Date(),
    numeroComprobante: proximoNumero,
    errores,
    observaciones
  }
}

/**
 * Consulta un comprobante por CAE
 */
export async function FECompConsultar(
  tipoComprobante: number,
  puntoVenta: number,
  numeroComprobante: number,
  config?: WSAAConfig
): Promise<{
  existe: boolean
  cae: string
  caeVencimiento: Date
  importeTotal: number
}> {
  const cfg = config || await getConfiguracionAFIP()
  if (!cfg) throw new Error('Configuración AFIP no disponible')

  const result = await llamarWSFE('FECompConsultar', {
    FeCompConsReq: {
      CbteTipo: tipoComprobante,
      PtoVta: puntoVenta,
      CbteNro: numeroComprobante
    }
  }, cfg)

  return {
    existe: !!result.cae,
    cae: result.cae as string || '',
    caeVencimiento: result.caeVencimiento as Date || new Date(),
    importeTotal: 0 // Se extraería de la respuesta completa
  }
}

/**
 * Obtiene los puntos de venta habilitados
 */
export async function FEParamGetPtosVenta(
  config?: WSAAConfig
): Promise<{ numero: number; bloqueado: boolean; baja: boolean }[]> {
  const cfg = config || await getConfiguracionAFIP()
  if (!cfg) throw new Error('Configuración AFIP no disponible')

  const result = await llamarWSFE('FEParamGetPtosVenta', {}, cfg)

  // Parsear puntos de venta de la respuesta
  // Esta es una implementación simplificada
  return []
}

/**
 * Obtiene los tipos de comprobante disponibles
 */
export async function FEParamGetTiposCbte(
  config?: WSAAConfig
): Promise<{ id: number; descripcion: string }[]> {
  const cfg = config || await getConfiguracionAFIP()
  if (!cfg) throw new Error('Configuración AFIP no disponible')

  // Llamar a FEParamGetTiposCbte
  // Esta es una implementación simplificada
  return [
    { id: 1, descripcion: 'Factura A' },
    { id: 2, descripcion: 'Nota de Débito A' },
    { id: 3, descripcion: 'Nota de Crédito A' },
    { id: 6, descripcion: 'Factura B' },
    { id: 7, descripcion: 'Nota de Débito B' },
    { id: 8, descripcion: 'Nota de Crédito B' },
    { id: 11, descripcion: 'Factura C' },
    { id: 12, descripcion: 'Nota de Débito C' },
    { id: 13, descripcion: 'Nota de Crédito C' },
  ]
}

/**
 * Determina el tipo de comprobante según el cliente
 */
export function determinarTipoComprobante(
  cuitCliente: string | null,
  esResponsableInscripto: boolean = true
): number {
  // Si no tiene CUIT o es consumidor final
  if (!cuitCliente || cuitCliente.length < 11) {
    return TIPO_COMPROBANTE.FACTURA_B // Factura B para consumidor final
  }

  // Si el cliente tiene CUIT, depende de la responsabilidad
  if (esResponsableInscripto) {
    return TIPO_COMPROBANTE.FACTURA_A // Factura A para RI
  }

  return TIPO_COMPROBANTE.FACTURA_B // Factura B para monotributista/exento
}

/**
 * Formatea una fecha para AFIP (YYYYMMDD)
 */
export function formatearFechaAFIP(fecha: Date): string {
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  const day = String(fecha.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

/**
 * Calcula el IVA según alícuota
 */
export function calcularIVA(baseImponible: number, alicuotaId: number): number {
  const alicuotas: Record<number, number> = {
    [ALICUOTA_IVA.DIEZ_CINCO]: 10.5,
    [ALICUOTA_IVA.VEINTIUNO]: 21,
    [ALICUOTA_IVA.VEINTISIETE]: 27,
  }

  const tasa = alicuotas[alicuotaId] || 0
  return Math.round(baseImponible * tasa / 100 * 100) / 100
}
