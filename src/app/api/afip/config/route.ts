import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener configuración AFIP
export async function GET() {
  try {
    const config = await db.configuracionFrigorifico.findFirst()
    
    return NextResponse.json({
      success: true,
      data: {
        cuit: config?.cuit || '',
        razonSocial: config?.nombre || '',
        domicilio: config?.direccion || '',
        puntoVenta: 1, // Por defecto, debería configurarse
        inicioActividades: '', // Pendiente de agregar al modelo
        certificadoConfigurado: false, // Pendiente de implementar
        clavePrivadaConfigurada: false // Pendiente de implementar
      }
    })
  } catch (error) {
    console.error('Error al obtener configuración AFIP:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// POST - Actualizar configuración AFIP
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      cuit, 
      razonSocial, 
      domicilio, 
      puntoVenta,
      inicioActividades 
    } = body

    // Validar CUIT
    if (cuit && !validarCUIT(cuit)) {
      return NextResponse.json(
        { success: false, error: 'CUIT inválido' },
        { status: 400 }
      )
    }

    // Buscar o crear configuración
    let config = await db.configuracionFrigorifico.findFirst()
    
    if (config) {
      config = await db.configuracionFrigorifico.update({
        where: { id: config.id },
        data: {
          cuit: cuit || null,
          nombre: razonSocial || config.nombre,
          direccion: domicilio || null
        }
      })
    } else {
      config = await db.configuracionFrigorifico.create({
        data: {
          cuit: cuit || null,
          nombre: razonSocial || 'Solemar Alimentaria',
          direccion: domicilio || null
        }
      })
    }

    // Registrar en auditoría
    await db.auditoria.create({
      data: {
        modulo: 'AFIP',
        accion: 'UPDATE',
        entidad: 'ConfiguracionAFIP',
        descripcion: 'Configuración AFIP actualizada',
      }
    })

    return NextResponse.json({
      success: true,
      data: config
    })
  } catch (error) {
    console.error('Error al actualizar configuración AFIP:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración' },
      { status: 500 }
    )
  }
}

// POST /test-connection - Probar conexión con AFIP
export async function PUT(request: NextRequest) {
  try {
    const config = await db.configuracionFrigorifico.findFirst()
    
    if (!config?.cuit) {
      return NextResponse.json({
        success: false,
        error: 'Falta configurar CUIT'
      })
    }

    // Simular prueba de conexión
    // En producción, aquí se conectaría con el WSAA de AFIP
    const resultadoConexion = await probarConexionAFIP(config.cuit)
    
    return NextResponse.json({
      success: resultadoConexion.ok,
      message: resultadoConexion.mensaje,
      serverTime: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error al probar conexión AFIP:', error)
    return NextResponse.json({
      success: false,
      error: 'Error de conexión con AFIP'
    })
  }
}

// Función auxiliar para validar CUIT
function validarCUIT(cuit: string): boolean {
  // Remover guiones y espacios
  const cuitLimpio = cuit.replace(/[-\s]/g, '')
  
  // Debe tener 11 dígitos
  if (!/^\d{11}$/.test(cuitLimpio)) {
    return false
  }

  // Validar dígito verificador
  const multiplicadores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
  let suma = 0
  
  for (let i = 0; i < 10; i++) {
    suma += parseInt(cuitLimpio[i]) * multiplicadores[i]
  }
  
  const resto = suma % 11
  const digitoVerificador = resto === 0 ? 0 : resto === 1 ? 9 : 11 - resto
  
  return parseInt(cuitLimpio[10]) === digitoVerificador
}

// Función auxiliar para simular prueba de conexión
async function probarConexionAFIP(cuit: string): Promise<{ ok: boolean; mensaje: string }> {
  // Simulación de prueba de conexión
  // En producción, esto llamaría al WSAA
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simular respuesta exitosa
  if (validarCUIT(cuit)) {
    return {
      ok: true,
      mensaje: 'Conexión exitosa con AFIP. Web Service disponible.'
    }
  } else {
    return {
      ok: false,
      mensaje: 'CUIT no válido para el servicio'
    }
  }
}
