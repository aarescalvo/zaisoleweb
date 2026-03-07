import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

// GET - Fetch comprehensive dashboard data
export async function GET() {
  try {
    console.log('[Dashboard API] Fetching comprehensive data...')
    
    const hoy = new Date()
    const inicioHoy = startOfDay(hoy)
    const finHoy = endOfDay(hoy)
    const ayer = subDays(hoy, 1)
    const inicioAyer = startOfDay(ayer)
    const finAyer = endOfDay(ayer)
    const inicioMes = startOfMonth(hoy)
    const finMes = endOfMonth(hoy)
    const hace30Dias = subDays(hoy, 30)
    const hace6Meses = subMonths(hoy, 6)

    // ===== KPIs BÁSICOS =====
    
    // Tropas activas
    const tropasActivasCount = await db.tropa.count({
      where: {
        estado: { in: ['RECIBIDO', 'EN_CORRAL', 'EN_PESAJE', 'PESADO', 'LISTO_FAENA', 'EN_FAENA'] }
      }
    })
    
    // Pesajes de camiones hoy
    const pesajesHoy = await db.pesajeCamion.count({
      where: {
        fecha: { gte: inicioHoy, lte: finHoy }
      }
    })
    
    // Animales en cámara (stock)
    const enCamara = await db.stockMediaRes.aggregate({
      _sum: { cantidad: true }
    })
    
    // ===== FAENA DEL DÍA =====
    
    // Romaneos de hoy
    const romaneosHoy = await db.romaneo.findMany({
      where: {
        fecha: { gte: inicioHoy, lte: finHoy }
      },
      include: {
        mediasRes: true
      }
    })
    
    const animalesFaenadosHoy = romaneosHoy.length
    const pesoTotalHoy = romaneosHoy.reduce((acc, r) => acc + (r.pesoTotal || 0), 0)
    const pesoVivoHoy = romaneosHoy.reduce((acc, r) => acc + (r.pesoVivo || 0), 0)
    
    // Romaneos de ayer
    const romaneosAyer = await db.romaneo.findMany({
      where: {
        fecha: { gte: inicioAyer, lte: finAyer }
      }
    })
    const animalesFaenadosAyer = romaneosAyer.length
    
    // Rinde promedio del día
    const rindePromedio = pesoVivoHoy > 0 
      ? (pesoTotalHoy / pesoVivoHoy) * 100 
      : 0
    
    // Semáforo de rinde
    let rindeSemaforo: 'verde' | 'amarillo' | 'rojo' = 'amarillo'
    if (rindePromedio >= 55) rindeSemaforo = 'verde'
    else if (rindePromedio < 50) rindeSemaforo = 'rojo'
    
    // ===== PRODUCCIÓN ÚLTIMOS 30 DÍAS =====
    
    const romaneos30Dias = await db.romaneo.findMany({
      where: {
        fecha: { gte: hace30Dias, lte: finHoy }
      },
      orderBy: { fecha: 'asc' }
    })
    
    // Agrupar por fecha
    const produccionPorDia = romaneos30Dias.reduce((acc, r) => {
      const fechaKey = format(r.fecha, 'yyyy-MM-dd')
      if (!acc[fechaKey]) {
        acc[fechaKey] = { fecha: fechaKey, cantidad: 0, peso: 0 }
      }
      acc[fechaKey].cantidad += 1
      acc[fechaKey].peso += r.pesoTotal || 0
      return acc
    }, {} as Record<string, { fecha: string; cantidad: number; peso: number }>)
    
    const produccion30Dias = Object.values(produccionPorDia)
    
    // Rinde por día
    const rindePorDia = produccion30Dias.map(d => {
      const romaneosDia = romaneos30Dias.filter(r => 
        format(r.fecha, 'yyyy-MM-dd') === d.fecha
      )
      const pesoVivoDia = romaneosDia.reduce((acc, r) => acc + (r.pesoVivo || 0), 0)
      const pesoMediaDia = romaneosDia.reduce((acc, r) => acc + (r.pesoTotal || 0), 0)
      const rinde = pesoVivoDia > 0 ? (pesoMediaDia / pesoVivoDia) * 100 : 0
      
      return {
        fecha: d.fecha,
        rinde: parseFloat(rinde.toFixed(1)),
        objetivo: 55
      }
    })
    
    // ===== PRODUCCIÓN MENSUAL =====
    
    const balancesFaena = await db.balanceFaena.findMany({
      where: {
        fecha: { gte: hace6Meses, lte: finHoy }
      },
      orderBy: { fecha: 'asc' }
    })
    
    const produccionMensual = balancesFaena.reduce((acc, b) => {
      const mesKey = format(b.fecha, 'yyyy-MM')
      if (!acc[mesKey]) {
        acc[mesKey] = { mes: mesKey, animales: 0, peso: 0 }
      }
      acc[mesKey].animales += b.cantidadCabezas || 0
      acc[mesKey].peso += b.pesoFrioTotal || 0
      return acc
    }, {} as Record<string, { mes: string; animales: number; peso: number }>)
    
    const produccionMensualArray = Object.values(produccionMensual)
    
    // ===== DISTRIBUCIÓN POR ESPECIE =====
    
    const tropasPorEspecie = await db.tropa.groupBy({
      by: ['especie'],
      _count: { id: true },
      where: {
        estado: { in: ['RECIBIDO', 'EN_CORRAL', 'EN_PESAJE', 'PESADO', 'LISTO_FAENA', 'EN_FAENA'] }
      }
    })
    
    const totalTropas = tropasPorEspecie.reduce((acc, t) => acc + t._count.id, 0)
    
    const distribucionEspecie = tropasPorEspecie.map((t, i) => ({
      especie: t.especie || 'BOVINO',
      cantidad: t._count.id,
      porcentaje: totalTropas > 0 ? (t._count.id / totalTropas) * 100 : 0,
      color: i === 0 ? '#f59e0b' : '#3b82f6'
    }))
    
    // Si no hay datos, agregar valores por defecto
    if (distribucionEspecie.length === 0) {
      distribucionEspecie.push(
        { especie: 'BOVINO', cantidad: 0, porcentaje: 0, color: '#f59e0b' },
        { especie: 'EQUINO', cantidad: 0, porcentaje: 0, color: '#3b82f6' }
      )
    }
    
    // ===== STOCK CRÍTICO =====
    
    const stockCritico = await db.stockInsumo.count({
      where: {
        cantidad: { lte: db.stockInsumo.fields.cantidadMinima }
      }
    })
    
    // ===== CHEQUES A VENCER =====
    
    const en7Dias = subDays(hoy, -7)
    const chequesAVencer = await db.cheque.count({
      where: {
        estado: 'RECIBIDO',
        fechaVencimiento: { gte: hoy, lte: en7Dias }
      }
    })
    
    // ===== INGRESOS DEL DÍA =====
    
    // Facturas de hoy
    const facturasHoy = await db.factura.findMany({
      where: {
        fecha: { gte: inicioHoy, lte: finHoy },
        estado: { not: 'ANULADA' }
      }
    })
    
    const ingresosDia = facturasHoy.reduce((acc, f) => acc + (f.total || 0), 0)
    
    // Cobranzas del día (pagos)
    const cobranzasHoy = await db.pago.findMany({
      where: {
        fecha: { gte: inicioHoy, lte: finHoy }
      }
    })
    
    const cobranzasDia = cobranzasHoy.reduce((acc, p) => acc + (p.monto || 0), 0)
    
    // ===== ESTADO DE CAJAS =====
    
    const cajas = await db.caja.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        saldoActual: true
      }
    })
    
    // Buscar arqueos pendientes para determinar estado
    const arqueosPendientes = await db.arqueoCaja.findMany({
      where: { estado: 'PENDIENTE' }
    })
    
    const cajasConEstado = cajas.map(c => ({
      ...c,
      estado: arqueosPendientes.some(a => a.cajaId === c.id) ? 'abierta' as const : 'cerrada' as const
    }))
    
    // ===== ÚLTIMAS FACTURAS =====
    
    const ultimasFacturas = await db.factura.findMany({
      take: 5,
      orderBy: { fecha: 'desc' },
      include: {
        cliente: { select: { nombre: true } }
      }
    })
    
    const facturasFormateadas = ultimasFacturas.map(f => ({
      id: f.id,
      numero: f.numero,
      cliente: f.cliente?.nombre || 'N/A',
      total: f.total || 0,
      estado: f.estado,
      fecha: f.fecha.toISOString()
    }))
    
    // ===== TROPAS ACTIVAS =====
    
    const tropasActivas = await db.tropa.findMany({
      take: 5,
      where: {
        estado: { in: ['RECIBIDO', 'EN_CORRAL', 'EN_PESAJE', 'PESADO', 'LISTO_FAENA', 'EN_FAENA'] }
      },
      orderBy: { fechaRecepcion: 'desc' },
      include: {
        productor: { select: { nombre: true } }
      }
    })
    
    const tropasFormateadas = tropasActivas.map(t => ({
      id: t.id,
      codigo: t.codigo,
      productor: t.productor?.nombre || 'N/A',
      cantidad: t.cantidadCabezas,
      especie: t.especie,
      estado: t.estado
    }))
    
    // ===== ALERTAS =====
    
    const alertas: Array<{
      id: string;
      tipo: 'stock_bajo' | 'cheque_vencer' | 'arqueo_pendiente' | 'factura_vencida' | 'orden_atrasada';
      titulo: string;
      descripcion: string;
      prioridad: 'alta' | 'media' | 'baja';
      detalle?: string;
      fecha?: string;
      monto?: number;
    }> = []
    
    // Stock bajo
    const insumosStockBajo = await db.stockInsumo.findMany({
      where: {
        cantidad: { lte: db.stockInsumo.fields.cantidadMinima }
      },
      include: {
        insumo: { select: { nombre: true } }
      },
      take: 5
    })
    
    insumosStockBajo.forEach((s, i) => {
      alertas.push({
        id: `stock_${i}`,
        tipo: 'stock_bajo' as const,
        titulo: s.insumo?.nombre || 'Insumo',
        descripcion: `Stock actual: ${s.cantidad} unidades`,
        prioridad: 'alta' as const,
        detalle: 'Requiere reposición urgente'
      })
    })
    
    // Cheques a vencer
    const chequesProximos = await db.cheque.findMany({
      where: {
        estado: 'RECIBIDO',
        fechaVencimiento: { gte: hoy, lte: en7Dias }
      },
      take: 3
    })
    
    chequesProximos.forEach((c, i) => {
      alertas.push({
        id: `cheque_${i}`,
        tipo: 'cheque_vencer' as const,
        titulo: `Cheque ${c.numero}`,
        descripcion: 'Vence esta semana',
        prioridad: 'media' as const,
        fecha: c.fechaVencimiento?.toISOString(),
        monto: c.monto || 0
      })
    })
    
    // Arqueos pendientes
    const arqueosPend = await db.arqueoCaja.findMany({
      where: { estado: 'PENDIENTE' },
      include: { caja: { select: { nombre: true } } },
      take: 3
    })
    
    arqueosPend.forEach((a, i) => {
      alertas.push({
        id: `arqueo_${i}`,
        tipo: 'arqueo_pendiente' as const,
        titulo: `Arqueo ${a.caja?.nombre || 'Caja'}`,
        descripcion: 'Pendiente de aprobación',
        prioridad: 'media' as const,
        fecha: a.fecha.toISOString()
      })
    })
    
    // Facturas vencidas
    const facturasVencidas = await db.factura.findMany({
      where: {
        estado: 'EMITIDA',
        fecha: { lt: subDays(hoy, 30) }
      },
      include: { cliente: { select: { nombre: true } } },
      take: 3
    })
    
    facturasVencidas.forEach((f, i) => {
      alertas.push({
        id: `factura_${i}`,
        tipo: 'factura_vencida' as const,
        titulo: `Factura ${f.numero}`,
        descripcion: `Cliente: ${f.cliente?.nombre || 'N/A'}`,
        prioridad: 'alta' as const,
        fecha: f.fecha.toISOString(),
        monto: f.total || 0
      })
    })
    
    // Órdenes de compra atrasadas
    const ordenesAtrasadas = await db.ordenCompra.findMany({
      where: {
        estado: { in: ['PENDIENTE', 'APROBADA', 'ENVIADA'] },
        fechaEntrega: { lt: hoy }
      },
      take: 3
    })
    
    ordenesAtrasadas.forEach((o, i) => {
      alertas.push({
        id: `orden_${i}`,
        tipo: 'orden_atrasada' as const,
        titulo: `Orden #${o.numero}`,
        descripcion: 'Entrega atrasada',
        prioridad: 'media' as const,
        fecha: o.fechaEntrega?.toISOString()
      })
    })
    
    // ===== RESPUESTA =====
    
    return NextResponse.json({
      success: true,
      data: {
        // KPIs
        animalesFaenadosHoy,
        animalesFaenadosAyer,
        rindePromedio: parseFloat(rindePromedio.toFixed(1)),
        rindeSemaforo,
        pesoTotalFaenado: pesoTotalHoy,
        ingresosDia,
        cobranzasDia,
        stockCritico,
        chequesAVencer,
        
        // Gráficos
        produccion30Dias,
        rindePorDia,
        produccionMensual: produccionMensualArray,
        distribucionEspecie,
        
        // Alertas
        alertas,
        
        // Estado de cajas
        cajas: cajasConEstado,
        
        // Últimas facturas
        ultimasFacturas: facturasFormateadas,
        
        // Tropas activas
        tropasActivas: tropasFormateadas,
        
        // Stats adicionales
        tropasActivasCount,
        enPesaje: 0, // Se puede calcular con asignaciones de garrón
        pesajesHoy,
        enCamara: enCamara._sum.cantidad || 0
      }
    })
  } catch (error) {
    console.error('[Dashboard API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener datos del dashboard' },
      { status: 500 }
    )
  }
}
