'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'
import { 
  RefreshCw, Calendar, TrendingUp, Warehouse, DollarSign, 
  FileText, ClipboardList, Truck, BoxSelect, Beef, Scale,
  ArrowRight, Clock, Users
} from 'lucide-react'
import { KPICards } from './kpi-cards'
import { GraficosProduccion } from './graficos-produccion'
import { AlertasPanel } from './alertas-panel'

interface Operador {
  id: string
  nombre: string
  usuario: string
  rol: string
  permisos: Record<string, boolean>
}

interface DashboardData {
  // KPIs
  animalesFaenadosHoy: number
  animalesFaenadosAyer: number
  rindePromedio: number
  rindeSemaforo: 'verde' | 'amarillo' | 'rojo'
  pesoTotalFaenado: number
  ingresosDia: number
  cobranzasDia: number
  stockCritico: number
  chequesAVencer: number
  
  // Gráficos
  produccion30Dias: { fecha: string; cantidad: number; peso: number }[]
  rindePorDia: { fecha: string; rinde: number; objetivo: number }[]
  produccionMensual: { mes: string; animales: number; peso: number }[]
  distribucionEspecie: { especie: string; cantidad: number; porcentaje: number; color: string }[]
  
  // Alertas
  alertas: {
    id: string
    tipo: 'stock_bajo' | 'cheque_vencer' | 'arqueo_pendiente' | 'factura_vencida' | 'orden_atrasada'
    titulo: string
    descripcion: string
    prioridad: 'alta' | 'media' | 'baja'
    fecha?: string
    monto?: number
    detalle?: string
  }[]
  
  // Estado de cajas
  cajas: {
    id: string
    nombre: string
    saldoActual: number
    estado: 'abierta' | 'cerrada'
  }[]
  
  // Últimas facturas
  ultimasFacturas: {
    id: string
    numero: string
    cliente: string
    total: number
    estado: string
    fecha: string
  }[]
  
  // Tropas activas
  tropasActivas: {
    id: string
    codigo: string
    productor: string
    cantidad: number
    especie: string
    estado: string
  }[]
  
  // Estadísticas adicionales
  tropasActivasCount: number
  enPesaje: number
  pesajesHoy: number
  enCamara: number
}

interface DashboardEjecutivoProps {
  operador: Operador
  onNavigate?: (page: string) => void
}

export function DashboardEjecutivo({ operador, onNavigate }: DashboardEjecutivoProps) {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  
  useEffect(() => {
    fetchDashboard()
  }, [])
  
  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard')
      const result = await res.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        toast.error('Error al cargar dashboard')
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }
  
  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboard()
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
  
  // Datos de ejemplo mientras no hay datos reales
  const kpiData = data ? {
    animalesFaenadosHoy: data.animalesFaenadosHoy || 0,
    animalesFaenadosAyer: data.animalesFaenadosAyer || 0,
    rindePromedio: data.rindePromedio || 0,
    rindeSemaforo: data.rindeSemaforo || 'amarillo',
    pesoTotalFaenado: data.pesoTotalFaenado || 0,
    ingresosDia: data.ingresosDia || 0,
    cobranzasDia: data.cobranzasDia || 0,
    stockCritico: data.stockCritico || 0,
    chequesAVencer: data.chequesAVencer || 0
  } : {
    animalesFaenadosHoy: 0,
    animalesFaenadosAyer: 0,
    rindePromedio: 0,
    rindeSemaforo: 'amarillo' as const,
    pesoTotalFaenado: 0,
    ingresosDia: 0,
    cobranzasDia: 0,
    stockCritico: 0,
    chequesAVencer: 0
  }
  
  const graficosData = data ? {
    produccion30Dias: data.produccion30Dias || [],
    rindePorDia: data.rindePorDia || [],
    produccionMensual: data.produccionMensual || [],
    distribucionEspecie: data.distribucionEspecie || []
  } : {
    produccion30Dias: [],
    rindePorDia: [],
    produccionMensual: [],
    distribucionEspecie: []
  }
  
  const alertasData = data?.alertas || []
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">
              Dashboard Ejecutivo
            </h1>
            <p className="text-stone-500 flex items-center gap-2 mt-1">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('es-AR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <Users className="w-4 h-4" />
              <span>{operador.nombre}</span>
              <Badge variant="outline" className="text-xs">{operador.rol}</Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>
        
        {/* KPIs */}
        <KPICards data={kpiData} loading={loading} />
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráficos de producción - ocupa 2 columnas */}
          <div className="lg:col-span-2">
            <GraficosProduccion data={graficosData} loading={loading} />
          </div>
          
          {/* Panel de alertas */}
          <div>
            <AlertasPanel alertas={alertasData} loading={loading} />
          </div>
        </div>
        
        {/* Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Estado de Cajas */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-stone-50 rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Estado de Cajas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex justify-between items-center">
                      <div className="h-4 bg-stone-200 rounded w-1/3" />
                      <div className="h-4 bg-stone-200 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : !data?.cajas?.length ? (
                <div className="p-8 text-center text-stone-400">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay cajas configuradas</p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="divide-y">
                    {data.cajas.map((caja) => (
                      <div key={caja.id} className="flex items-center justify-between p-3 hover:bg-stone-50">
                        <div>
                          <p className="font-medium text-stone-800">{caja.nombre}</p>
                          <Badge variant="outline" className={`text-xs ${caja.estado === 'abierta' ? 'border-green-300 text-green-600' : 'border-stone-300 text-stone-500'}`}>
                            {caja.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
                          </Badge>
                        </div>
                        <p className="font-bold text-lg text-stone-800">
                          {formatCurrency(caja.saldoActual)}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
          
          {/* Últimas Facturas */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-stone-50 rounded-t-lg flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Últimas Facturas
              </CardTitle>
              {onNavigate && (
                <Button variant="ghost" size="sm" onClick={() => onNavigate('facturacion')}>
                  Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex justify-between items-center">
                      <div className="h-4 bg-stone-200 rounded w-1/2" />
                      <div className="h-4 bg-stone-200 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : !data?.ultimasFacturas?.length ? (
                <div className="p-8 text-center text-stone-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay facturas recientes</p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="divide-y">
                    {data.ultimasFacturas.map((factura) => (
                      <div key={factura.id} className="p-3 hover:bg-stone-50">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-mono text-sm font-medium text-stone-800">{factura.numero}</p>
                          <Badge variant="outline" className={`text-xs ${
                            factura.estado === 'PAGADA' ? 'border-green-300 text-green-600' :
                            factura.estado === 'PENDIENTE' ? 'border-amber-300 text-amber-600' :
                            'border-stone-300 text-stone-500'
                          }`}>
                            {factura.estado}
                          </Badge>
                        </div>
                        <p className="text-xs text-stone-500 truncate">{factura.cliente}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm font-bold text-stone-700">{formatCurrency(factura.total)}</p>
                          <p className="text-xs text-stone-400">{new Date(factura.fecha).toLocaleDateString('es-AR')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
          
          {/* Tropas Activas */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-stone-50 rounded-t-lg flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Beef className="w-5 h-5 text-amber-500" />
                Tropas Activas
              </CardTitle>
              {onNavigate && (
                <Button variant="ghost" size="sm" onClick={() => onNavigate('movimientoHacienda')}>
                  Ver todas <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex justify-between items-center">
                      <div className="h-4 bg-stone-200 rounded w-1/2" />
                      <div className="h-4 bg-stone-200 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : !data?.tropasActivas?.length ? (
                <div className="p-8 text-center text-stone-400">
                  <Beef className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay tropas activas</p>
                </div>
              ) : (
                <ScrollArea className="h-48">
                  <div className="divide-y">
                    {data.tropasActivas.map((tropa) => (
                      <div key={tropa.id} className="p-3 hover:bg-stone-50">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-mono font-bold text-stone-800">{tropa.codigo}</p>
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-600">
                            {tropa.estado}
                          </Badge>
                        </div>
                        <p className="text-xs text-stone-500 truncate">{tropa.productor}</p>
                        <div className="flex gap-3 mt-1 text-xs text-stone-400">
                          <span>{tropa.cantidad} cabezas</span>
                          <span>•</span>
                          <span>{tropa.especie}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Accesos Directos */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-stone-50 rounded-t-lg">
            <CardTitle className="text-lg">Accesos Directos</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[
                { id: 'pesajeCamiones', label: 'Pesaje Camiones', icon: Truck, color: 'bg-blue-500' },
                { id: 'pesajeIndividual', label: 'Pesaje Individual', icon: Scale, color: 'bg-emerald-500' },
                { id: 'listaFaena', label: 'Lista de Faena', icon: ClipboardList, color: 'bg-amber-500' },
                { id: 'romaneo', label: 'Romaneo', icon: TrendingUp, color: 'bg-purple-500' },
                { id: 'stock', label: 'Stock Cámaras', icon: Warehouse, color: 'bg-cyan-500' },
                { id: 'reportes', label: 'Reportes', icon: FileText, color: 'bg-rose-500' },
              ].map((item) => {
                const hasPermiso = !item.id || operador.permisos?.[`puede${item.id.charAt(0).toUpperCase() + item.id.slice(1)}` as keyof typeof operador.permisos] !== false
                
                return (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => onNavigate?.(item.id)}
                    disabled={!hasPermiso}
                  >
                    <div className={`p-2 rounded-lg ${item.color}`}>
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs">{item.label}</span>
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardEjecutivo
