import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Emitir factura electrónica
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { facturaId } = data

    // Validar que existe la factura
    if (!facturaId) {
      return NextResponse.json(
        { success: false, error: 'ID de factura requerido' },
        { status: 400 }
      )
    }

    const factura = await db.factura.findUnique({
      where: { id: facturaId },
      include: {
        cliente: true,
        detalles: true
      }
    })

    if (!factura) {
      return NextResponse.json(
        { success: false, error: 'Factura no encontrada' },
        { status: 404 }
      )
    }

    if (factura.cae) {
      return NextResponse.json(
        { success: false, error: 'La factura ya tiene CAE asignado' },
        { status: 400 }
      )
    }

    // Obtener configuración AFIP
    const config = await db.configuracionFrigorifico.findFirst()
    
    if (!config?.cuit) {
      return NextResponse.json(
        { success: false, error: 'Falta configuración AFIP (CUIT)' },
        { status: 400 }
      )
    }

    // Simular solicitud de CAE a AFIP
    // En producción, aquí se conectaría con el web service de AFIP
    const caeSimulado = generarCAESimulado()
    const vencimientoCAE = calcularVencimientoCAE()

    // Actualizar factura con CAE
    const facturaActualizada = await db.factura.update({
      where: { id: facturaId },
      data: {
        cae: caeSimulado,
        caeVencimiento: vencimientoCAE,
        estado: 'EMITIDA',
        fechaEmision: new Date()
      }
    })

    // Registrar en auditoría
    await db.auditoria.create({
      data: {
        modulo: 'AFIP',
        accion: 'CREATE',
        entidad: 'Factura',
        entidadId: facturaId,
        descripcion: `Factura ${factura.numero} emitida con CAE ${caeSimulado}`,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        cae: caeSimulado,
        vencimiento: vencimientoCAE.toISOString().split('T')[0],
        factura: facturaActualizada
      }
    })
  } catch (error) {
    console.error('Error al emitir factura AFIP:', error)
    return NextResponse.json(
      { success: false, error: 'Error al emitir factura electrónica' },
      { status: 500 }
    )
  }
}

// Función auxiliar para generar CAE simulado
function generarCAESimulado(): string {
  // CAE tiene 14 dígitos
  const timestamp = Date.now().toString().slice(-10)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return timestamp + random
}

// Función auxiliar para calcular vencimiento de CAE (10 días hábiles)
function calcularVencimientoCAE(): Date {
  const fecha = new Date()
  let diasAgregados = 0
  while (diasAgregados < 10) {
    fecha.setDate(fecha.getDate() + 1)
    // Contar solo días hábiles (lunes a viernes)
    if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
      diasAgregados++
    }
  }
  return fecha
}
