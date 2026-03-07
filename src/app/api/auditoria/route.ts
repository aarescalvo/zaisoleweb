import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, logAudit } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // Parsear fechas si vienen como strings
  let fechaDesde: Date | undefined;
  let fechaHasta: Date | undefined;
  
  if (searchParams.get('fechaDesde')) {
    fechaDesde = new Date(searchParams.get('fechaDesde')!);
  }
  if (searchParams.get('fechaHasta')) {
    fechaHasta = new Date(searchParams.get('fechaHasta')!);
    // Incluir todo el día final
    fechaHasta.setHours(23, 59, 59, 999);
  }
  
  const logs = await getAuditLogs({
    modulo: searchParams.get('modulo') || undefined,
    accion: searchParams.get('accion') || undefined,
    operadorId: searchParams.get('operadorId') || undefined,
    fechaDesde,
    fechaHasta,
    limit: parseInt(searchParams.get('limit') || '50'),
    offset: parseInt(searchParams.get('offset') || '0')
  });
  
  return NextResponse.json({ success: true, data: logs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    await logAudit({
      modulo: body.modulo,
      accion: body.accion,
      entidad: body.entidad,
      entidadId: body.entidadId,
      descripcion: body.descripcion,
      datosAntes: body.datosAntes,
      datosDespues: body.datosDespues,
      operadorId: body.operadorId,
      ip: body.ip
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear registro de auditoría' },
      { status: 500 }
    );
  }
}
