// Configuración AFIP para Facturación Electrónica
// Referencia: https://www.afip.gob.ar/ws/WSAA/WSAA.HTM

export interface AFIPConfig {
  cuit: string           // CUIT del emisor
  razonSocial: string    // Razón social
  domicilio: string      // Domicilio comercial
  puntoVenta: number     // Punto de venta
  inicioActividades: string // Fecha inicio actividades
  certificado: string    // Ruta al certificado .pem
  clavePrivada: string   // Ruta a la clave privada .key
}

export interface FacturaElectronica {
  tipoComprobante: number  // 1=FA, 6=FB, 11=FC, etc.
  puntoVenta: number
  numeroComprobante: number
  fecha: string
  tipoDocumento: number    // 80=CUIT, 96=DNI
  numeroDocumento: string
  razonSocial: string
  importeTotal: number
  // ... más campos según AFIP
}

// Service para interactuar con AFIP
export class AFIPService {
  private config: AFIPConfig

  constructor(config: AFIPConfig) {
    this.config = config
  }

  // Obtener Token de Acceso (TA) del WSAA
  async obtenerTokenAcceso(): Promise<string> {
    // TODO: Implementar llamada a WSAA
    throw new Error('Implementar conexión con WSAA')
  }

  // Emitir factura electrónica
  async emitirFactura(factura: FacturaElectronica): Promise<{ cae: string; vencimiento: string }> {
    // TODO: Implementar llamada a WSFE
    throw new Error('Implementar conexión con WSFE')
  }

  // Consultar último número de comprobante
  async consultarUltimoNumero(tipoComprobante: number, puntoVenta: number): Promise<number> {
    // TODO: Implementar
    throw new Error('Implementar consulta')
  }
}

// Tipos de comprobante AFIP
export const TIPOS_COMPROBANTE = {
  FACTURA_A: 1,
  FACTURA_B: 6,
  FACTURA_C: 11,
  NOTA_DEBITO_A: 2,
  NOTA_DEBITO_B: 7,
  NOTA_CREDITO_A: 3,
  NOTA_CREDITO_B: 8,
} as const

// Tipos de documento
export const TIPOS_DOCUMENTO = {
  DNI: 96,
  CUIT: 80,
  CUIL: 86,
} as const
