import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Listar tipificadores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activo = searchParams.get('activo')

    const where: any = {}
    
    if (activo !== null) {
      where.activo = activo === 'true'
    }

    const tipificadores = await db.tipificador.findMany({
      where,
      orderBy: [
        { apellido: 'asc' },
        { nombre: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: tipificadores
    })
  } catch (error) {
    console.error('Error fetching tipificadores:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al obtener tipificadores'
    }, { status: 500 })
  }
}

// POST - Crear tipificador
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const tipificador = await db.tipificador.create({
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        numero: data.numero,
        matricula: data.matricula,
        activo: data.activo ?? true
      }
    })

    return NextResponse.json({
      success: true,
      data: tipificador
    })
  } catch (error) {
    console.error('Error creating tipificador:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al crear tipificador'
    }, { status: 500 })
  }
}
