import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar impresoras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activas = searchParams.get('activas');
    const uso = searchParams.get('uso');

    const where: Record<string, unknown> = {};
    if (activas === 'true') {
      where.activa = true;
    }
    if (uso) {
      where.uso = uso;
    }

    const impresoras = await db.impresora.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(impresoras);
  } catch (error) {
    console.error('Error al obtener impresoras:', error);
    return NextResponse.json({ error: 'Error al obtener impresoras' }, { status: 500 });
  }
}

// POST - Crear impresora
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Si es la impresora por defecto, quitar el flag de las otras
    if (data.porDefecto) {
      await db.impresora.updateMany({
        where: { porDefecto: true },
        data: { porDefecto: false }
      });
    }

    const impresora = await db.impresora.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo || 'TERMICA',
        modelo: data.modelo,
        direccion: data.direccion,
        anchoEtiqueta: data.anchoEtiqueta || 100,
        altoEtiqueta: data.altoEtiqueta || 50,
        margenSuperior: data.margenSuperior || 2,
        margenIzquierdo: data.margenIzquierdo || 2,
        margenDerecho: data.margenDerecho || 2,
        margenInferior: data.margenInferior || 2,
        dpi: data.dpi || 203,
        velocidad: data.velocidad || 2,
        densidad: data.densidad || 8,
        uso: data.uso || 'ROTULOS',
        activa: data.activa ?? true,
        porDefecto: data.porDefecto ?? false,
      }
    });

    return NextResponse.json(impresora);
  } catch (error) {
    console.error('Error al crear impresora:', error);
    return NextResponse.json({ error: 'Error al crear impresora' }, { status: 500 });
  }
}

// PUT - Actualizar impresora
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Si es la impresora por defecto, quitar el flag de las otras
    if (data.porDefecto) {
      await db.impresora.updateMany({
        where: { porDefecto: true, id: { not: data.id } },
        data: { porDefecto: false }
      });
    }

    const impresora = await db.impresora.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        modelo: data.modelo,
        direccion: data.direccion,
        anchoEtiqueta: data.anchoEtiqueta,
        altoEtiqueta: data.altoEtiqueta,
        margenSuperior: data.margenSuperior,
        margenIzquierdo: data.margenIzquierdo,
        margenDerecho: data.margenDerecho,
        margenInferior: data.margenInferior,
        dpi: data.dpi,
        velocidad: data.velocidad,
        densidad: data.densidad,
        uso: data.uso,
        activa: data.activa,
        porDefecto: data.porDefecto,
      }
    });

    return NextResponse.json(impresora);
  } catch (error) {
    console.error('Error al actualizar impresora:', error);
    return NextResponse.json({ error: 'Error al actualizar impresora' }, { status: 500 });
  }
}

// DELETE - Eliminar impresora
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    await db.impresora.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar impresora:', error);
    return NextResponse.json({ error: 'Error al eliminar impresora' }, { status: 500 });
  }
}
