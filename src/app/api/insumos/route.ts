import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar insumos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activos = searchParams.get('activos');
    const categoriaId = searchParams.get('categoriaId');
    const proveedorId = searchParams.get('proveedorId');
    const busqueda = searchParams.get('busqueda');

    const where: Record<string, unknown> = {};
    if (activos === 'true') {
      where.activo = true;
    }
    if (categoriaId) {
      where.categoriaId = categoriaId;
    }
    if (proveedorId) {
      where.proveedorId = proveedorId;
    }
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda } },
        { codigo: { contains: busqueda } },
        { descripcion: { contains: busqueda } }
      ];
    }

    const insumos = await db.insumo.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        categoria: true,
        proveedor: true,
        stockPorDeposito: {
          include: {
            deposito: true
          }
        }
      }
    });

    return NextResponse.json(insumos);
  } catch (error) {
    console.error('Error al obtener insumos:', error);
    return NextResponse.json({ error: 'Error al obtener insumos' }, { status: 500 });
  }
}

// POST - Crear insumo
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Verificar si ya existe el código
    const existente = await db.insumo.findUnique({
      where: { codigo: data.codigo }
    });

    if (existente) {
      return NextResponse.json({ error: 'Ya existe un insumo con ese código' }, { status: 400 });
    }

    const insumo = await db.insumo.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: data.categoriaId || null,
        unidadMedida: data.unidadMedida || 'UN',
        marca: data.marca,
        modelo: data.modelo,
        precioUnitario: data.precioUnitario ? parseFloat(data.precioUnitario) : null,
        costoUnitario: data.costoUnitario ? parseFloat(data.costoUnitario) : null,
        stockMinimo: data.stockMinimo ? parseFloat(data.stockMinimo) : null,
        stockMaximo: data.stockMaximo ? parseFloat(data.stockMaximo) : null,
        puntoReposicion: data.puntoReposicion ? parseFloat(data.puntoReposicion) : null,
        proveedorId: data.proveedorId || null,
        codigoProveedor: data.codigoProveedor,
        requiereLote: data.requiereLote ?? false,
        requiereVencimiento: data.requiereVencimiento ?? false,
        activo: data.activo ?? true,
      },
      include: {
        categoria: true,
        proveedor: true
      }
    });

    return NextResponse.json(insumo);
  } catch (error) {
    console.error('Error al crear insumo:', error);
    return NextResponse.json({ error: 'Error al crear insumo' }, { status: 500 });
  }
}

// PUT - Actualizar insumo
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Verificar si el código ya existe en otro insumo
    if (data.codigo) {
      const existente = await db.insumo.findFirst({
        where: { 
          codigo: data.codigo,
          NOT: { id: data.id }
        }
      });

      if (existente) {
        return NextResponse.json({ error: 'Ya existe otro insumo con ese código' }, { status: 400 });
      }
    }

    const insumo = await db.insumo.update({
      where: { id: data.id },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: data.categoriaId || null,
        unidadMedida: data.unidadMedida,
        marca: data.marca,
        modelo: data.modelo,
        precioUnitario: data.precioUnitario ? parseFloat(data.precioUnitario) : null,
        costoUnitario: data.costoUnitario ? parseFloat(data.costoUnitario) : null,
        stockMinimo: data.stockMinimo ? parseFloat(data.stockMinimo) : null,
        stockMaximo: data.stockMaximo ? parseFloat(data.stockMaximo) : null,
        puntoReposicion: data.puntoReposicion ? parseFloat(data.puntoReposicion) : null,
        proveedorId: data.proveedorId || null,
        codigoProveedor: data.codigoProveedor,
        requiereLote: data.requiereLote,
        requiereVencimiento: data.requiereVencimiento,
        activo: data.activo,
      },
      include: {
        categoria: true,
        proveedor: true
      }
    });

    return NextResponse.json(insumo);
  } catch (error) {
    console.error('Error al actualizar insumo:', error);
    return NextResponse.json({ error: 'Error al actualizar insumo' }, { status: 500 });
  }
}

// DELETE - Eliminar insumo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Verificar si tiene movimientos asociados
    const movimientosAsociados = await db.movimientoInsumo.count({
      where: { insumoId: id }
    });

    if (movimientosAsociados > 0) {
      return NextResponse.json({ 
        error: 'No se puede eliminar el insumo porque tiene movimientos asociados. Desactívelo en su lugar.' 
      }, { status: 400 });
    }

    // Eliminar stock asociado primero
    await db.stockInsumo.deleteMany({
      where: { insumoId: id }
    });

    await db.insumo.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar insumo:', error);
    return NextResponse.json({ error: 'Error al eliminar insumo' }, { status: 500 });
  }
}
