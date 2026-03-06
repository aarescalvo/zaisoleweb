import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar romaneos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fecha = searchParams.get('fecha')
    const estado = searchParams.get('estado')
    const garron = searchParams.get('garron')

    const where: any = {}
    
    if (fecha) {
      const fechaInicio = new Date(fecha)
      fechaInicio.setHours(0, 0, 0, 0)
      const fechaFin = new Date(fecha)
      fechaFin.setHours(23, 59, 59, 999)
      where.fecha = { gte: fechaInicio, lte: fechaFin }
    }
    
    if (estado) {
      where.estado = estado
    }
    
    if (garron) {
      where.garron = parseInt(garron)
    }

    const romaneos = await db.romaneo.findMany({
      where,
      include: {
        tipificador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            matricula: true
          }
        }
      },
      orderBy: [
        { garron: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: romaneos
    })
  } catch (error) {
    console.error('Error fetching romaneos:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener romaneos'
    }, { status: 500 })
  }
}

// POST - Crear nuevo romaneo
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const romaneo = await db.romaneo.create({
      data: {
        garron: data.garron,
        tropaCodigo: data.tropaCodigo,
        tropaId: data.tropaId,
        numeroAnimal: data.numeroAnimal,
        tipoAnimal: data.tipoAnimal,
        raza: data.raza,
        caravana: data.caravana,
        pesoVivo: data.pesoVivo,
        denticion: data.denticion,
        categoria: data.categoria,
        tipificacion: data.tipificacion,
        grasaCobertura: data.grasaCobertura,
        conformacion: data.conformacion,
        colorGrasa: data.colorGrasa,
        tipificadorId: data.tipificadorId,
        pesoMediaIzq: data.pesoMediaIzq,
        pesoMediaDer: data.pesoMediaDer,
        pesoTotal: data.pesoTotal,
        rinde: data.rinde,
        destinoId: data.destinoId,
        transporteId: data.transporteId,
        tipoTrabajoId: data.tipoTrabajoId,
        codigoEAN128: data.codigoEAN128,
        estado: data.estado || 'PENDIENTE',
        operadorId: data.operadorId,
        observaciones: data.observaciones
      },
      include: {
        tipificador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            matricula: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: romaneo
    })
  } catch (error) {
    console.error('Error creating romaneo:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al crear romaneo'
    }, { status: 500 })
  }
}

// PUT - Actualizar romaneo
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.id) {
      return NextResponse.json({
        success: false,
        error: 'ID de romaneo requerido'
      }, { status: 400 })
    }

    // Calcular código EAN-128 si tenemos los datos
    let codigoEAN128 = data.codigoEAN128
    if (data.pesoTotal) {
      const especie = '1' // Bovino
      const articulo = '001' // Media res
      const tipif = data.tipificacion || 'N'
      codigoEAN128 = `${especie}${articulo}${tipif}${data.garron.toString().padStart(4, '0')}`
    }

    const romaneo = await db.romaneo.update({
      where: { id: data.id },
      data: {
        pesoMediaIzq: data.pesoMediaIzq,
        pesoMediaDer: data.pesoMediaDer,
        pesoTotal: data.pesoTotal,
        rinde: data.rinde,
        denticion: data.denticion,
        categoria: data.categoria,
        tipificacion: data.tipificacion,
        grasaCobertura: data.grasaCobertura,
        conformacion: data.conformacion,
        colorGrasa: data.colorGrasa,
        tipificadorId: data.tipificadorId,
        destinoId: data.destinoId,
        transporteId: data.transporteId,
        tipoTrabajoId: data.tipoTrabajoId,
        codigoEAN128,
        estado: 'CONFIRMADO',
        fechaConfirmacion: new Date(),
        operadorId: data.operadorId,
        observaciones: data.observaciones,
        updatedAt: new Date()
      },
      include: {
        tipificador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            matricula: true
          }
        }
      }
    })

    // Crear medias res si no existen
    if (data.pesoMediaIzq && data.pesoMediaDer) {
      // Media izquierda
      await db.mediaRes.upsert({
        where: {
          romaneoId_lado_sigla: {
            romaneoId: romaneo.id,
            lado: 'IZQUIERDA',
            sigla: 'A'
          }
        },
        create: {
          romaneoId: romaneo.id,
          lado: 'IZQUIERDA',
          peso: data.pesoMediaIzq,
          sigla: 'A',
          codigo: `${romaneo.garron}-I`,
          estado: 'EN_CAMARA'
        },
        update: {
          peso: data.pesoMediaIzq
        }
      })

      // Media derecha
      await db.mediaRes.upsert({
        where: {
          romaneoId_lado_sigla: {
            romaneoId: romaneo.id,
            lado: 'DERECHA',
            sigla: 'A'
          }
        },
        create: {
          romaneoId: romaneo.id,
          lado: 'DERECHA',
          peso: data.pesoMediaDer,
          sigla: 'A',
          codigo: `${romaneo.garron}-D`,
          estado: 'EN_CAMARA'
        },
        update: {
          peso: data.pesoMediaDer
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: romaneo
    })
  } catch (error) {
    console.error('Error updating romaneo:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al actualizar romaneo'
    }, { status: 500 })
  }
}
