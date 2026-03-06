'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, TrendingUp, Package, Calendar, Download, Filter, Printer, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface FaenaDiaria {
  fecha: string
  totalAnimales: number
  totalMedias: number
  pesoTotal: number
}

interface Rendimiento {
  tropaCodigo: string
  productor?: { nombre: string }
  cantidad: number
  pesoVivoTotal: number
  pesoMediaTotal: number
  rinde: number
}

interface StockCamaras {
  camara: string
  tipo: string
  totalMedias: number
  pesoTotal: number
}

interface Operador {
  id: string
  nombre: string
  nivel: string
}

export function ReportesModule({ operador }: { operador: Operador }) {
  const [loading, setLoading] = useState(true)
  const [faenaDiaria, setFaenaDiaria] = useState<FaenaDiaria[]>([])
  const [rendimientos, setRendimientos] = useState<Rendimiento[]>([])
  const [stockCamaras, setStockCamaras] = useState<StockCamaras[]>([])
  
  const [fechaDesde, setFechaDesde] = useState<string>('')
  const [fechaHasta, setFechaHasta] = useState<string>('')
  const [filtroTipo, setFiltroTipo] = useState<string>('todos')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append('fechaDesde', fechaDesde)
      if (fechaHasta) params.append('fechaHasta', fechaHasta)
      if (filtroTipo !== 'todos') params.append('tipo', filtroTipo)

      const res = await fetch('/api/reportes?' + params.toString())
      const data = await res.json()

      if (data.success) {
        setFaenaDiaria(data.data.faenaDiaria || [])
        setRendimientos(data.data.rendimientos || [])
        setStockCamaras(data.data.stockCamaras || [])
      } else {
        toast.error('Error al cargar reportes')
      }
    } catch (error) {
      console.error('Error fetching reportes:', error)
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const exportarCSV = (tipo: string) => {
    let csvContent = ''
    
    if (tipo === 'faena') {
      csvContent = 'Fecha,Animales,Medias,Peso Total (kg)\n'
      faenaDiaria.forEach(d => {
        csvContent += `${new Date(d.fecha).toLocaleDateString('es-AR')},${d.totalAnimales},${d.totalMedias},${d.pesoTotal}\n`
      })
    } else if (tipo === 'rendimiento') {
      csvContent = 'Tropa,Productor,Cabezas,Peso Vivo (kg),Peso Media (kg),Rinde %\n'
      rendimientos.forEach(r => {
        csvContent += `${r.tropaCodigo},"${r.productor?.nombre || '-'}",${r.cantidad},${r.pesoVivoTotal},${r.pesoMediaTotal},${r.rinde.toFixed(1)}\n`
      })
    } else {
      csvContent = 'Cámara,Tipo,Medias,Peso (kg)\n'
      stockCamaras.forEach(s => {
        csvContent += `${s.camara},${s.tipo},${s.totalMedias},${s.pesoTotal}\n`
      })
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reporte_${tipo}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('CSV descargado')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <FileText className="w-8 h-8 animate-pulse text-amber-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Reportes</h1>
            <p className="text-stone-500">Informes y estadísticas</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Filtros */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label className="text-xs">Desde</Label>
                <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} />
              </div>
              <div className="flex-1">
                <Label className="text-xs">Hasta</Label>
                <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} />
              </div>
              <div className="w-full md:w-48">
                <Label className="text-xs">Especie</Label>
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="bovino">Bovinos</SelectItem>
                    <SelectItem value="equino">Equinos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="faena" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faena">Faena Diaria</TabsTrigger>
            <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
            <TabsTrigger value="stock">Stock Cámaras</TabsTrigger>
          </TabsList>

          {/* Tab: Faena Diaria */}
          <TabsContent value="faena">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-stone-50 rounded-t-lg flex flex-row items-center justify-between">
                <CardTitle>Reporte de Faena Diaria</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportarCSV('faena')}>
                  <Download className="w-4 h-4 mr-1" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {faenaDiaria.length === 0 ? (
                  <div className="p-8 text-center text-stone-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay datos de faena</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Animales</TableHead>
                        <TableHead className="text-right">Medias</TableHead>
                        <TableHead className="text-right">Peso Total (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faenaDiaria.map((dia, i) => (
                        <TableRow key={i}>
                          <TableCell>{new Date(dia.fecha).toLocaleDateString('es-AR')}</TableCell>
                          <TableCell className="text-right font-bold">{dia.totalAnimales}</TableCell>
                          <TableCell className="text-right">{dia.totalMedias}</TableCell>
                          <TableCell className="text-right">{dia.pesoTotal.toLocaleString('es-AR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Rendimiento */}
          <TabsContent value="rendimiento">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-stone-50 rounded-t-lg flex flex-row items-center justify-between">
                <CardTitle>Rendimiento por Tropa</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportarCSV('rendimiento')}>
                  <Download className="w-4 h-4 mr-1" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {rendimientos.length === 0 ? (
                  <div className="p-8 text-center text-stone-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay datos de rendimiento</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tropa</TableHead>
                        <TableHead>Productor</TableHead>
                        <TableHead className="text-right">Cabezas</TableHead>
                        <TableHead className="text-right">Peso Vivo (kg)</TableHead>
                        <TableHead className="text-right">Peso Media (kg)</TableHead>
                        <TableHead className="text-right">Rinde %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rendimientos.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono">{r.tropaCodigo}</TableCell>
                          <TableCell>{r.productor?.nombre || '-'}</TableCell>
                          <TableCell className="text-right">{r.cantidad}</TableCell>
                          <TableCell className="text-right">{r.pesoVivoTotal.toLocaleString('es-AR')}</TableCell>
                          <TableCell className="text-right">{r.pesoMediaTotal.toLocaleString('es-AR')}</TableCell>
                          <TableCell className="text-right">
                            <Badge className={r.rinde >= 55 ? 'bg-green-100 text-green-700' : r.rinde >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                              {r.rinde.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Stock Cámaras */}
          <TabsContent value="stock">
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-stone-50 rounded-t-lg flex flex-row items-center justify-between">
                <CardTitle>Stock por Cámara</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportarCSV('stock')}>
                  <Download className="w-4 h-4 mr-1" /> CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {stockCamaras.length === 0 ? (
                  <div className="p-8 text-center text-stone-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No hay datos de stock</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cámara</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Medias</TableHead>
                        <TableHead className="text-right">Peso (kg)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockCamaras.map((s, i) => (
                        <TableRow key={i}>
                          <TableCell>{s.camara}</TableCell>
                          <TableCell><Badge variant="outline">{s.tipo}</Badge></TableCell>
                          <TableCell className="text-right">{s.totalMedias}</TableCell>
                          <TableCell className="text-right">{s.pesoTotal.toLocaleString('es-AR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ReportesModule
