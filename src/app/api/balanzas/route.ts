import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar balanzas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activas = searchParams.get('activas');

    const where: Record<string, unknown> = {};
    if (activas === 'true') {
      where.activa = true;
    }

    const balanzas = await db.balanza.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(balanzas);
  } catch (error) {
    console.error('Error al obtener balanzas:', error);
    return NextResponse.json({ error: 'Error al obtener balanzas' }, { status: 500 });
  }
}

// POST - Crear balanza
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const balanza = await db.balanza.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        puerto: data.puerto,
        baudios: data.baudios || 9600,
        dataBits: data.dataBits || 8,
        stopBits: data.stopBits || 1,
        paridad: data.paridad || 'none',
        protocolo: data.protocolo || 'CONTINUO',
        comandoPeso: data.comandoPeso,
        formatoTrama: data.formatoTrama,
        tiempoEstabilidad: data.tiempoEstabilidad || 2000,
        decimales: data.decimales || 1,
        uso: data.uso || 'CAMIONES',
        activa: data.activa ?? true,
      }
    });

    return NextResponse.json(balanza);
  } catch (error) {
    console.error('Error al crear balanza:', error);
    return NextResponse.json({ error: 'Error al crear balanza' }, { status: 500 });
  }
}

// PUT - Actualizar balanza
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    const balanza = await db.balanza.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        puerto: data.puerto,
        baudios: data.baudios,
        dataBits: data.dataBits,
        stopBits: data.stopBits,
        paridad: data.paridad,
        protocolo: data.protocolo,
        comandoPeso: data.comandoPeso,
        formatoTrama: data.formatoTrama,
        tiempoEstabilidad: data.tiempoEstabilidad,
        decimales: data.decimales,
        uso: data.uso,
        activa: data.activa,
      }
    });

    return NextResponse.json(balanza);
  } catch (error) {
    console.error('Error al actualizar balanza:', error);
    return NextResponse.json({ error: 'Error al actualizar balanza' }, { status: 500 });
  }
}

// DELETE - Eliminar balanza
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await db.balanza.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar balanza:', error);
    return NextResponse.json({ error: 'Error al eliminar balanza' }, { status: 500 });
  }
}
