import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Fetch clientes (usuarios con rol de productor o usuarioFaena)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    
    let where: any = {}
    if (tipo === 'productor') {
      where.esProductor = true
    } else if (tipo === 'usuarioFaena') {
      where.esUsuarioFaena = true
    }
    
    const clientes = await db.usuario.findMany({
      where,
      orderBy: { nombre: 'asc' }
    })
    
    return NextResponse.json({
      success: true,
      data: clientes
    })
  } catch (error) {
    console.error('Error fetching clientes:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener clientes' },
      { status: 500 }
    )
  }
}

// POST - Create new cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nombre, cuit, direccion, telefono, email, esProductor, esUsuarioFaena } = body
    
    if (!nombre) {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido' },
        { status: 400 }
      )
    }
    
    const cliente = await db.usuario.create({
      data: {
        nombre,
        cuit: cuit || null,
        direccion: direccion || null,
        telefono: telefono || null,
        email: email || null,
        esProductor: esProductor || false,
        esUsuarioFaena: esUsuarioFaena || false
      }
    })
    
    return NextResponse.json({
      success: true,
      data: cliente
    })
  } catch (error) {
    console.error('Error creating cliente:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}

// PUT - Update cliente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, nombre, cuit, direccion, telefono, email, esProductor, esUsuarioFaena } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }
    
    const cliente = await db.usuario.update({
      where: { id },
      data: {
        nombre,
        cuit: cuit || null,
        direccion: direccion || null,
        telefono: telefono || null,
        email: email || null,
        esProductor: esProductor || false,
        esUsuarioFaena: esUsuarioFaena || false
      }
    })
    
    return NextResponse.json({
      success: true,
      data: cliente
    })
  } catch (error) {
    console.error('Error updating cliente:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar cliente' },
      { status: 500 }
    )
  }
}

// DELETE - Delete cliente
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID es requerido' },
        { status: 400 }
      )
    }
    
    await db.usuario.delete({
      where: { id }
    })
    
    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting cliente:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar cliente' },
      { status: 500 }
    )
  }
}
