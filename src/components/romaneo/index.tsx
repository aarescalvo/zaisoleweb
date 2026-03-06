'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  TrendingUp, Scale, Printer, Save, CheckCircle, 
  Beef, Award, RefreshCw, Wifi, WifiOff,
  Bluetooth, ChevronLeft, ChevronRight, Play, Pause,
  Tag, Check, X, AlertCircle, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'

// ==================== CONSTANTES TIPIFICACIÓN ARGENTINA ====================

const DENTICIONES = [
  { value: '0', label: '0D - Ternero', color: 'bg-green-100 text-green-700' },
  { value: '2', label: '2D - Joven', color: 'bg-lime-100 text-lime-700' },
  { value: '4', label: '4D', color: 'bg-yellow-100 text-yellow-700' },
  { value: '6', label: '6D', color: 'bg-orange-100 text-orange-700' },
  { value: '8', label: '8D - Adulto', color: 'bg-red-100 text-red-700' },
]

const CATEGORIAS_BOVINO = [
  { value: 'VQ', label: 'Vaquillona', description: 'Hembra 2-3 años' },
  { value: 'NT', label: 'Novillito', description: 'Macho < 2 años' },
  { value: 'NO', label: 'Novillo', description: 'Macho 2-4 años' },
  { value: 'VA', label: 'Vaca', description: 'Hembra adulta' },
  { value: 'TO', label: 'Toro', description: 'Macho entero' },
  { value: 'MEJ', label: 'Torito/Mej', description: 'Macho joven' },
]

const TIPIFICACIONES_RES = [
  { value: 'A', label: 'Astrado', color: 'bg-blue-100 text-blue-700' },
  { value: 'M', label: 'Macho', color: 'bg-red-100 text-red-700' },
  { value: 'S', label: 'Sobre', color: 'bg-purple-100 text-purple-700' },
  { value: 'I', label: 'Intermedia', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'N', label: 'Normal', color: 'bg-gray-100 text-gray-700' },
  { value: 'AG', label: 'Apto Global', color: 'bg-green-100 text-green-700' },
  { value: 'AS', label: 'Apto Superior', color: 'bg-emerald-100 text-emerald-700' },
]

const GRASAS_COBERTURA = [
  { value: 'ESCASA', label: '1 - Escasa' },
  { value: 'LIGHT', label: '2 - Light' },
  { value: 'MEDIANA', label: '3 - Mediana' },
  { value: 'ABUNDANTE', label: '4 - Abundante' },
  { value: 'EXCESIVA', label: '5 - Excesiva' },
]

const CONFORMACIONES = [
  { value: 'BUENA', label: 'Buena', color: 'bg-green-100 text-green-700' },
  { value: 'REGULAR', label: 'Regular', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'MALA', label: 'Mala', color: 'bg-red-100 text-red-700' },
]

const SIGLAS_MEDIA = [
  { value: 'A', label: 'Asado', description: 'Media completa' },
  { value: 'T', label: 'Trasero', description: 'Cuarto trasero' },
  { value: 'D', label: 'Delantero', description: 'Cuarto delantero' },
]

// ==================== INTERFACES ====================

interface RomaneoItem {
  id: string
  garron: number
  tropaCodigo?: string
  tropaId?: string
  numeroAnimal?: number
  tipoAnimal?: string
  categoria?: string
  raza?: string
  caravana?: string
  pesoVivo?: number
  denticion?: number
  tipificacion?: string
  grasaCobertura?: string
  conformacion?: string
  colorGrasa?: string
  tipificadorId?: string
  tipificador?: { nombre: string; apellido: string; matricula: string }
  pesoMediaIzq?: number
  pesoMediaDer?: number
  pesoTotal?: number
  rinde?: number
  codigoEAN128?: string
  destinoId?: string
  transporteId?: string
  estado: string
  fecha: string
  observaciones?: string
}

interface Tipificador {
  id: string
  nombre: string
  apellido: string
  matricula: string
}

interface BalanzaStatus {
  conectada: boolean
  peso: number
  estable: boolean
  ultimaLectura: Date | null
}

interface Operador {
  id: string
  nombre: string
  nivel: string
}

// ==================== COMPONENTE PRINCIPAL ====================

export function RomaneoModule({ operador }: { operador: Operador }) {
  // Estado principal
  const [romaneosPendientes, setRomaneosPendientes] = useState<RomaneoItem[]>([])
  const [romaneosCompletados, setRomaneosCompletados] = useState<RomaneoItem[]>([])
  const [tipificadores, setTipificadores] = useState<Tipificador[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Índice actual
  const [indiceActual, setIndiceActual] = useState(0)
  const [romaneoActual, setRomaneoActual] = useState<RomaneoItem | null>(null)
  
  // Estado de balanza
  const [balanza, setBalanza] = useState<BalanzaStatus>({
    conectada: false,
    peso: 0,
    estable: false,
    ultimaLectura: null
  })
  
  // Form - Pesos
  const [pesoIzq, setPesoIzq] = useState('')
  const [pesoDer, setPesoDer] = useState('')
  const [mediaActual, setMediaActual] = useState<'izq' | 'der'>('izq')
  
  // Form - Tipificación
  const [denticion, setDenticion] = useState('')
  const [categoria, setCategoria] = useState('')
  const [tipificacion, setTipificacion] = useState('')
  const [grasaCobertura, setGrasaCobertura] = useState('')
  const [conformacion, setConformacion] = useState('')
  const [tipificadorId, setTipificadorId] = useState('')
  
  // Auto-avance
  const [autoAvance, setAutoAvance] = useState(true)
  const [sonidoHabilitado, setSonidoHabilitado] = useState(true)
  
  // Audio para confirmación
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Dialog
  const [confirmarOpen, setConfirmarOpen] = useState(false)

  // Cargar datos iniciales
  useEffect(() => {
    fetchData()
    
    // Simular conexión a balanza (demo)
    const interval = setInterval(() => {
      if (balanza.conectada) {
        setBalanza(prev => ({
          ...prev,
          peso: 80 + Math.random() * 20,
          estable: Math.random() > 0.3
        }))
      }
    }, 500)
    
    return () => clearInterval(interval)
  }, [])
  
  // Actualizar romaneo actual cuando cambia el índice
  useEffect(() => {
    if (romaneosPendientes.length > 0 && indiceActual >= 0 && indiceActual < romaneosPendientes.length) {
      const romaneo = romaneosPendientes[indiceActual]
      setRomaneoActual(romaneo)
      cargarDatosRomaneo(romaneo)
    } else {
      setRomaneoActual(null)
      limpiarFormulario()
    }
  }, [indiceActual, romaneosPendientes])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [romaneosRes, tipificadoresRes] = await Promise.all([
        fetch('/api/romaneo'),
        fetch('/api/tipificadores')
      ])
      
      const romaneosData = await romaneosRes.json()
      const tipificadoresData = await tipificadoresRes.json()
      
      if (romaneosData.success) {
        const pendientes = romaneosData.data.filter((r: RomaneoItem) => r.estado === 'PENDIENTE')
        const completados = romaneosData.data.filter((r: RomaneoItem) => r.estado === 'CONFIRMADO')
        
        // Ordenar por garrón
        pendientes.sort((a: RomaneoItem, b: RomaneoItem) => a.garron - b.garron)
        completados.sort((a: RomaneoItem, b: RomaneoItem) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        
        setRomaneosPendientes(pendientes)
        setRomaneosCompletados(completados)
        
        // Si es la primera carga, ir al primer pendiente
        if (romaneosPendientes.length === 0 && pendientes.length > 0) {
          setIndiceActual(0)
        }
      }
      
      if (tipificadoresData.success) {
        setTipificadores(tipificadoresData.data.filter((t: Tipificador) => t.activo))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const cargarDatosRomaneo = (romaneo: RomaneoItem) => {
    setPesoIzq(romaneo.pesoMediaIzq?.toString() || '')
    setPesoDer(romaneo.pesoMediaDer?.toString() || '')
    setDenticion(romaneo.denticion?.toString() || '')
    setCategoria(romaneo.categoria || romaneo.tipoAnimal || '')
    setTipificacion(romaneo.tipificacion || '')
    setGrasaCobertura(romaneo.grasaCobertura || '')
    setConformacion(romaneo.conformacion || '')
    setTipificadorId(romaneo.tipificadorId || '')
    setMediaActual('izq')
  }

  const limpiarFormulario = () => {
    setPesoIzq('')
    setPesoDer('')
    setDenticion('')
    setCategoria('')
    setTipificacion('')
    setGrasaCobertura('')
    setConformacion('')
    setTipificadorId('')
    setMediaActual('izq')
  }

  // Conectar/desconectar balanza
  const toggleBalanza = () => {
    setBalanza(prev => ({
      ...prev,
      conectada: !prev.conectada,
      peso: prev.conectada ? 0 : 80 + Math.random() * 20,
      ultimaLectura: prev.conectada ? null : new Date()
    }))
  }

  // Capturar peso de balanza
  const capturarPeso = (lado: 'izq' | 'der') => {
    if (balanza.conectada && balanza.estable) {
      if (lado === 'izq') {
        setPesoIzq(balanza.peso.toFixed(1))
        setMediaActual('der')
        toast.success(`Media IZQ: ${balanza.peso.toFixed(1)} kg`)
      } else {
        setPesoDer(balanza.peso.toFixed(1))
        toast.success(`Media DER: ${balanza.peso.toFixed(1)} kg`)
      }
      reproducirSonido('beep')
    } else if (!balanza.conectada) {
      toast.error('Balanza no conectada')
    } else {
      toast.warning('Espere a que el peso se estabilice')
    }
  }

  // Capturar peso automáticamente cuando se estabiliza
  useEffect(() => {
    if (balanza.conectada && balanza.estable && autoAvance) {
      // Solo capturar si no hay peso en la media actual
      if (mediaActual === 'izq' && !pesoIzq) {
        // Esperar un momento antes de capturar automáticamente
      } else if (mediaActual === 'der' && pesoIzq && !pesoDer) {
        // Esperar un momento antes de capturar automáticamente
      }
    }
  }, [balanza.estable, mediaActual, pesoIzq, pesoDer, autoAvance])

  // Navegación
  const irAnterior = () => {
    if (indiceActual > 0) {
      setIndiceActual(prev => prev - 1)
    }
  }

  const irSiguiente = () => {
    if (indiceActual < romaneosPendientes.length - 1) {
      setIndiceActual(prev => prev + 1)
    }
  }

  const irAPendiente = (index: number) => {
    setIndiceActual(index)
  }

  // Guardar y avanzar
  const handleGuardarYAvanzar = async () => {
    if (!romaneoActual) return
    
    if (!pesoIzq || !pesoDer) {
      toast.error('Complete los pesos de ambas medias')
      return
    }

    const pesoTotal = parseFloat(pesoIzq) + parseFloat(pesoDer)
    const rinde = romaneoActual.pesoVivo ? (pesoTotal / romaneoActual.pesoVivo) * 100 : 0

    setSaving(true)
    try {
      const res = await fetch('/api/romaneo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: romaneoActual.id,
          pesoMediaIzq: parseFloat(pesoIzq),
          pesoMediaDer: parseFloat(pesoDer),
          pesoTotal,
          rinde,
          denticion: denticion ? parseInt(denticion) : null,
          categoria,
          tipificacion,
          grasaCobertura,
          conformacion,
          tipificadorId: tipificadorId || null,
          operadorId: operador.id
        })
      })

      const data = await res.json()
      if (data.success) {
        // Imprimir rótulos
        handleImprimirRotulos(data.data)
        reproducirSonido('success')
        
        // Actualizar lista local
        setRomaneosPendientes(prev => prev.filter(r => r.id !== romaneoActual.id))
        setRomaneosCompletados(prev => [data.data, ...prev])
        
        // Avanzar al siguiente
        if (autoAvance && indiceActual < romaneosPendientes.length - 1) {
          setIndiceActual(prev => prev + 1)
        } else if (romaneosPendientes.length === 1) {
          setIndiceActual(0)
        }
        
        toast.success(`Garrón ${romaneoActual.garron} guardado ✓`)
      } else {
        toast.error(data.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  // Imprimir rótulos
  const handleImprimirRotulos = (romaneo: RomaneoItem) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rótulos Garrón ${romaneo.garron}</title>
          <style>
            @page { size: 100mm 150mm; margin: 0; }
            body { font-family: Arial, sans-serif; padding: 0; margin: 0; }
            .rotulo { 
              border: 2px solid black; 
              padding: 8px; 
              margin: 10px;
              width: 90mm;
              height: 140mm;
              page-break-after: always;
              background: white;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid black; 
              padding: 8px; 
              margin: -8px -8px 8px -8px;
              background: #1e3a5f;
              color: white;
            }
            .empresa { font-size: 14px; font-weight: bold; }
            .campo { 
              display: flex; 
              justify-content: space-between; 
              padding: 3px 0; 
              font-size: 11px;
              border-bottom: 1px dashed #ccc;
            }
            .sigla { 
              font-size: 32px; 
              font-weight: bold; 
              text-align: center; 
              background: #f8f8f8; 
              padding: 10px; 
              margin: 10px 0;
            }
            .barcode { 
              font-family: 'Libre Barcode 39', cursive; 
              font-size: 28px; 
              text-align: center; 
            }
          </style>
        </head>
        <body>
          ${SIGLAS_MEDIA.map(sigla => `
            <div class="rotulo">
              <div class="header">
                <div class="empresa">SOLEMAR ALIMENTARIA S.A.</div>
                <div style="font-size: 10px;">Mat. 300 | SENASA N° 3986</div>
              </div>
              <div class="campo"><span>Garrón:</span><span style="font-weight:bold;">${romaneo.garron}</span></div>
              <div class="campo"><span>Tropa:</span><span>${romaneo.tropaCodigo || '-'}</span></div>
              <div class="campo"><span>Animal:</span><span>${romaneo.numeroAnimal || '-'}</span></div>
              <div class="campo"><span>Caravana:</span><span>${romaneo.caravana || '-'}</span></div>
              <div class="campo"><span>Tipificación:</span><span>${romaneo.denticion || '-'}D | ${romaneo.categoria || '-'} | ${romaneo.tipificacion || '-'}</span></div>
              <div class="sigla">${sigla.value}</div>
              <div style="text-align:center;">${sigla.label}</div>
              <div class="campo"><span>Peso:</span><span style="font-weight:bold;">${romaneo.pesoTotal?.toFixed(1) || '-'} kg</span></div>
              <div class="campo"><span>Fecha:</span><span>${new Date().toLocaleDateString('es-AR')}</span></div>
              <div class="barcode">*${romaneo.garron}-${sigla.value}*</div>
            </div>
          `).join('')}
          <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); } }</script>
        </body>
        </html>
      `)
      printWindow.document.close()
    }
  }

  // Sonidos
  const reproducirSonido = (tipo: 'beep' | 'success' | 'error') => {
    if (!sonidoHabilitado) return
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      if (tipo === 'beep') {
        oscillator.frequency.value = 800
        oscillator.type = 'sine'
        gainNode.gain.value = 0.1
        oscillator.start()
        oscillator.stop(audioContext.currentTime + 0.1)
      } else if (tipo === 'success') {
        oscillator.frequency.value = 1000
        oscillator.type = 'sine'
        gainNode.gain.value = 0.1
        oscillator.start()
        setTimeout(() => {
          oscillator.frequency.value = 1200
        }, 100)
        oscillator.stop(audioContext.currentTime + 0.2)
      }
    } catch (e) {
      // Ignore audio errors
    }
  }

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <Scale className="w-12 h-12 animate-pulse text-amber-500 mx-auto mb-4" />
          <p className="text-stone-500">Cargando romaneo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* HEADER CON GARRÓN AUTOMÁTICO */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Balanza */}
            <Button
              variant={balanza.conectada ? "default" : "outline"}
              size="lg"
              onClick={toggleBalanza}
              className={balanza.conectada ? "bg-green-600 hover:bg-green-700 h-14" : "h-14"}
            >
              {balanza.conectada ? <Bluetooth className="w-5 h-5 mr-2" /> : <WifiOff className="w-5 h-5 mr-2" />}
              {balanza.conectada ? 'Balanza OK' : 'Sin Balanza'}
            </Button>
            
            {/* Peso actual */}
            {balanza.conectada && (
              <div className={`text-3xl font-bold px-6 py-2 rounded-lg ${balanza.estable ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {balanza.peso.toFixed(1)} kg
                {balanza.estable && <span className="ml-2 text-green-600">●</span>}
              </div>
            )}
            
            {/* Controles */}
            <div className="flex items-center gap-2">
              <Button
                variant={autoAvance ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoAvance(!autoAvance)}
                className={autoAvance ? "bg-amber-500 hover:bg-amber-600" : ""}
              >
                {autoAvance ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                Auto
              </Button>
            </div>
          </div>
          
          {/* Progreso */}
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2 bg-amber-50 border-amber-200">
              {romaneosPendientes.length} pendientes
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2 bg-green-50 border-green-200">
              {romaneosCompletados.length} completados
            </Badge>
          </div>
        </div>

        {/* GARRÓN ACTUAL - GRANDE Y DESTACADO */}
        {romaneoActual ? (
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={irAnterior}
                    disabled={indiceActual === 0}
                    className="text-white hover:bg-amber-600"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </Button>
                  
                  <div className="text-center">
                    <div className="text-sm opacity-80">Garrón</div>
                    <div className="text-6xl font-bold">{romaneoActual.garron}</div>
                    <div className="text-sm opacity-80">
                      {indiceActual + 1} de {romaneosPendientes.length}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={irSiguiente}
                    disabled={indiceActual >= romaneosPendientes.length - 1}
                    className="text-white hover:bg-amber-600"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </Button>
                </div>
                
                {/* Datos del animal */}
                <div className="grid grid-cols-4 gap-6 text-right">
                  <div>
                    <div className="text-xs opacity-70">Tropa</div>
                    <div className="text-xl font-bold">{romaneoActual.tropaCodigo}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Animal</div>
                    <div className="text-xl font-bold">{romaneoActual.numeroAnimal}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Caravana</div>
                    <div className="text-xl font-bold">{romaneoActual.caravana || '-'}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-70">Peso Vivo</div>
                    <div className="text-xl font-bold">{romaneoActual.pesoVivo?.toLocaleString()} kg</div>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* PESAJE */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-500" />
                    Pesaje de Medias
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Media Izquierda */}
                    <div className={`p-4 rounded-lg border-2 ${mediaActual === 'izq' ? 'border-amber-500 bg-amber-50' : 'border-stone-200'}`}>
                      <Label className="text-sm text-stone-500">Media Izquierda</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="number"
                          value={pesoIzq}
                          onChange={(e) => setPesoIzq(e.target.value)}
                          className="text-2xl font-bold h-14 text-center"
                          placeholder="0.0"
                        />
                        {balanza.conectada && (
                          <Button
                            variant="outline"
                            onClick={() => capturarPeso('izq')}
                            disabled={!balanza.estable}
                            className="h-14 px-4"
                          >
                            <Scale className="w-6 h-6" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Media Derecha */}
                    <div className={`p-4 rounded-lg border-2 ${mediaActual === 'der' ? 'border-amber-500 bg-amber-50' : 'border-stone-200'}`}>
                      <Label className="text-sm text-stone-500">Media Derecha</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          type="number"
                          value={pesoDer}
                          onChange={(e) => setPesoDer(e.target.value)}
                          className="text-2xl font-bold h-14 text-center"
                          placeholder="0.0"
                        />
                        {balanza.conectada && (
                          <Button
                            variant="outline"
                            onClick={() => capturarPeso('der')}
                            disabled={!balanza.estable}
                            className="h-14 px-4"
                          >
                            <Scale className="w-6 h-6" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Totales */}
                    {pesoIzq && pesoDer && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-xs text-green-600">Total</div>
                            <div className="text-2xl font-bold text-green-700">
                              {(parseFloat(pesoIzq) + parseFloat(pesoDer)).toFixed(1)} kg
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-green-600">Rinde</div>
                            <div className="text-2xl font-bold text-green-700">
                              {romaneoActual.pesoVivo 
                                ? (((parseFloat(pesoIzq) + parseFloat(pesoDer)) / romaneoActual.pesoVivo) * 100).toFixed(1)
                                : '-'}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-green-600">Dif.</div>
                            <div className="text-2xl font-bold">
                              {Math.abs(parseFloat(pesoIzq) - parseFloat(pesoDer)).toFixed(1)} kg
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* TIPIFICACIÓN */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    Tipificación
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Dentición */}
                    <div>
                      <Label className="text-xs text-stone-500">Dentición</Label>
                      <Select value={denticion} onValueChange={setDenticion}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Dientes" />
                        </SelectTrigger>
                        <SelectContent>
                          {DENTICIONES.map((d) => (
                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Categoría */}
                    <div>
                      <Label className="text-xs text-stone-500">Categoría</Label>
                      <Select value={categoria} onValueChange={setCategoria}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS_BOVINO.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.value} - {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Tipificación */}
                    <div>
                      <Label className="text-xs text-stone-500">Tipificación</Label>
                      <Select value={tipificacion} onValueChange={setTipificacion}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Clase" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPIFICACIONES_RES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.value} - {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Grasa */}
                    <div>
                      <Label className="text-xs text-stone-500">Grasa</Label>
                      <Select value={grasaCobertura} onValueChange={setGrasaCobertura}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Cobertura" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRASAS_COBERTURA.map((g) => (
                            <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Conformación */}
                    <div className="col-span-2">
                      <Label className="text-xs text-stone-500">Conformación</Label>
                      <div className="flex gap-2 mt-1">
                        {CONFORMACIONES.map((c) => (
                          <Button
                            key={c.value}
                            variant={conformacion === c.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setConformacion(c.value)}
                            className={`flex-1 ${conformacion === c.value ? c.color : ''}`}
                          >
                            {c.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Tipificador */}
                    <div className="col-span-2">
                      <Label className="text-xs text-stone-500">Tipificador</Label>
                      <Select value={tipificadorId} onValueChange={setTipificadorId}>
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                          {tipificadores.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.nombre} {t.apellido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Acciones
                  </h3>
                  
                  {/* Botón principal */}
                  <Button
                    onClick={handleGuardarYAvanzar}
                    disabled={saving || !pesoIzq || !pesoDer}
                    className="w-full h-16 text-xl bg-green-600 hover:bg-green-700"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="w-6 h-6 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="w-6 h-6 mr-2" />
                        GUARDAR Y SIGUIENTE
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => romaneoActual && handleImprimirRotulos(romaneoActual)}
                    className="w-full h-12"
                  >
                    <Printer className="w-5 h-5 mr-2" />
                    Solo Imprimir Rótulos
                  </Button>
                  
                  {/* Checklist */}
                  <div className="p-3 bg-stone-50 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {pesoIzq ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}
                      <span>Peso media izquierda</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {pesoDer ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-red-400" />}
                      <span>Peso media derecha</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {denticion ? <Check className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-400" />}
                      <span className={!denticion ? 'text-yellow-600' : ''}>Dentición</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tipificacion ? <Check className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-yellow-400" />}
                      <span className={!tipificacion ? 'text-yellow-600' : ''}>Tipificación</span>
                    </div>
                  </div>
                  
                  {/* Progreso del día */}
                  <div className="p-3 bg-stone-50 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progreso del día</span>
                      <span>{romaneosCompletados.length}/{romaneosCompletados.length + romaneosPendientes.length}</span>
                    </div>
                    <Progress 
                      value={romaneosCompletados.length / (romaneosCompletados.length + romaneosPendientes.length) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold text-stone-700">¡Romaneo Completo!</h2>
              <p className="text-stone-500 mt-2">No hay más garrones pendientes para procesar</p>
              <Button onClick={fetchData} className="mt-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* LISTA RÁPIDA DE GARRONES */}
        <Card className="border-0 shadow-md">
          <CardHeader className="py-3 px-4 bg-stone-50">
            <CardTitle className="text-sm font-medium">Garrones Pendientes</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
              {romaneosPendientes.map((r, idx) => (
                <Button
                  key={r.id}
                  variant={idx === indiceActual ? "default" : "outline"}
                  size="sm"
                  onClick={() => irAPendiente(idx)}
                  className={`min-w-[60px] ${idx === indiceActual ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                >
                  {r.garron}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RomaneoModule
