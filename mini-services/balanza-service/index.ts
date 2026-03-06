/**
 * MINI-SERVICIO BALANZA - Puerto 3030
 * 
 * Conecta a balanzas seriales/USB y transmite peso por WebSocket
 * 
 * PROTOCOLOS SOPORTADOS:
 * - CONTINUO: Envía peso continuamente
 * - DEMANDA: Envía peso cuando se solicita
 * - TOLEDO: Protocolo Toledo 8210/8142
 * - METTLER: Protocolo Mettler Toledo
 * 
 * CONEXIÓN:
 * - Serial/USB: /dev/ttyUSB0, COM1, etc.
 * - TCP/IP: Para balanzas en red
 */

import { Server } from 'socket.io'
import { createServer } from 'http'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

const PORT = 3030

// Interfaces
interface BalanzaConfig {
  tipo: 'SERIAL' | 'TCP'
  puerto?: string
  baudRate?: number
  ip?: string
  puertoTcp?: number
  protocolo: 'CONTINUO' | 'DEMANDA' | 'TOLEDO' | 'METTLER'
}

interface PesoLectura {
  valor: number
  estable: boolean
  unidad: string
  timestamp: Date
  raw: string
}

// Estado del servicio
let io: Server
let serialPort: SerialPort | null = null
let ultimaLectura: PesoLectura | null = null
let conectado = false
let config: BalanzaConfig = {
  tipo: 'SERIAL',
  puerto: '/dev/ttyUSB0',
  baudRate: 9600,
  protocolo: 'CONTINUO'
}

// Cola de lecturas offline
const colaOffline: Array<{ peso: PesoLectura; garron?: number }> = []

// ==================== SERVIDOR HTTP + SOCKET.IO ====================

const httpServer = createServer()
io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

io.on('connection', (socket) => {
  console.log(`[BALANZA] Cliente conectado: ${socket.id}`)
  
  // Enviar estado actual
  socket.emit('estado', {
    conectado,
    config,
    ultimaLectura
  })
  
  // Recibir configuración
  socket.on('configurar', (nuevaConfig: BalanzaConfig) => {
    console.log('[BALANZA] Nueva configuración:', nuevaConfig)
    config = nuevaConfig
    
    // Reconectar si ya estaba conectado
    if (conectado) {
      desconectarBalanza()
      conectarBalanza()
    }
  })
  
  // Solicitar conexión
  socket.on('conectar', async () => {
    console.log('[BALANZA] Solicitud de conexión')
    await conectarBalanza()
  })
  
  // Solicitar desconexión
  socket.on('desconectar', () => {
    console.log('[BALANZA] Solicitud de desconexión')
    desconectarBalanza()
  })
  
  // Solicitar peso actual
  socket.on('solicitarPeso', () => {
    if (ultimaLectura) {
      socket.emit('peso', ultimaLectura)
    }
  })
  
  // Registrar peso con garrón (para modo offline)
  socket.on('registrarPeso', (data: { peso: PesoLectura; garron: number }) => {
    colaOffline.push(data)
    console.log('[BALANZA] Peso registrado offline:', data)
    
    // Intentar sincronizar
    sincronizarOffline()
  })
  
  // Simular peso (para demo/testing)
  socket.on('simularPeso', (peso: number) => {
    const lecturaSimulada: PesoLectura = {
      valor: peso,
      estable: true,
      unidad: 'kg',
      timestamp: new Date(),
      raw: `SIM:${peso}`
    }
    ultimaLectura = lecturaSimulada
    io.emit('peso', lecturaSimulada)
  })
  
  socket.on('disconnect', () => {
    console.log(`[BALANZA] Cliente desconectado: ${socket.id}`)
  })
})

// ==================== CONEXIÓN A BALANZA ====================

async function conectarBalanza() {
  if (conectado) {
    console.log('[BALANZA] Ya está conectado')
    return
  }
  
  try {
    if (config.tipo === 'SERIAL' && config.puerto) {
      console.log(`[BALANZA] Conectando a ${config.puerto} @ ${config.baudRate} baud`)
      
      serialPort = new SerialPort({
        path: config.puerto,
        baudRate: config.baudRate || 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1
      })
      
      const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }))
      
      parser.on('data', (line: string) => {
        const lectura = procesarLectura(line)
        if (lectura) {
          ultimaLectura = lectura
          io.emit('peso', lectura)
        }
      })
      
      serialPort.on('error', (err) => {
        console.error('[BALANZA] Error:', err.message)
        io.emit('error', err.message)
        conectado = false
        io.emit('estado', { conectado: false, error: err.message })
      })
      
      serialPort.on('close', () => {
        console.log('[BALANZA] Puerto cerrado')
        conectado = false
        io.emit('estado', { conectado: false })
      })
      
      conectado = true
      io.emit('estado', { conectado: true, config })
      console.log('[BALANZA] Conectado exitosamente')
      
    } else if (config.tipo === 'TCP' && config.ip) {
      // TODO: Implementar conexión TCP
      console.log('[BALANZA] Conexión TCP no implementada aún')
      io.emit('error', 'Conexión TCP no implementada')
    }
    
  } catch (error: any) {
    console.error('[BALANZA] Error al conectar:', error.message)
    conectado = false
    io.emit('estado', { conectado: false, error: error.message })
    
    // Iniciar modo simulación para demo
    iniciarSimulacion()
  }
}

function desconectarBalanza() {
  if (serialPort && serialPort.isOpen) {
    serialPort.close()
  }
  serialPort = null
  conectado = false
  io.emit('estado', { conectado: false })
  console.log('[BALANZA] Desconectado')
}

// ==================== PROCESAMIENTO DE LECTURAS ====================

function procesarLectura(raw: string): PesoLectura | null {
  try {
    // Limpiar caracteres no deseados
    const linea = raw.trim()
    
    // Diferentes formatos según protocolo
    
    // Formato 1: Solo número "  150.5 kg"
    const match1 = linea.match(/[\s]*([\d.]+)[\s]*(kg|Kg|KG)?/)
    if (match1) {
      return {
        valor: parseFloat(match1[1]),
        estable: !linea.includes(' ') || linea.includes('ST'),
        unidad: 'kg',
        timestamp: new Date(),
        raw: linea
      }
    }
    
    // Formato Toledo: ST,GS,+  150.5 kg
    const matchToledo = linea.match(/(ST|US),GS,[\s]*([+-]?)([\d.]+)[\s]*(kg)?/)
    if (matchToledo) {
      const signo = matchToledo[2] === '-' ? -1 : 1
      return {
        valor: signo * parseFloat(matchToledo[3]),
        estable: matchToledo[1] === 'ST',
        unidad: 'kg',
        timestamp: new Date(),
        raw: linea
      }
    }
    
    // Formato Mettler: S S    150.50 kg
    const matchMettler = linea.match(/([S])[\s]+([\d.]+)[\s]*(kg)?/)
    if (matchMettler) {
      return {
        valor: parseFloat(matchMettler[2]),
        estable: matchMettler[1] === 'S',
        unidad: 'kg',
        timestamp: new Date(),
        raw: linea
      }
    }
    
    // Si no coincide con ningún formato conocido
    console.log('[BALANZA] Formato no reconocido:', linea)
    return null
    
  } catch (error) {
    console.error('[BALANZA] Error procesando lectura:', error)
    return null
  }
}

// ==================== MODO SIMULACIÓN (DEMO) ====================

let intervaloSimulacion: Timer | null = null

function iniciarSimulacion() {
  console.log('[BALANZA] Iniciando modo simulación')
  
  if (intervaloSimulacion) {
    clearInterval(intervaloSimulacion)
  }
  
  let pesoBase = 80
  let estableCounter = 0
  
  intervaloSimulacion = setInterval(() => {
    // Simular fluctuaciones
    const fluctuacion = (Math.random() - 0.5) * 0.5
    const nuevoPeso = pesoBase + fluctuacion
    
    // Cambiar peso base aleatoriamente cada cierto tiempo
    if (Math.random() > 0.95) {
      pesoBase = 70 + Math.random() * 30
    }
    
    // Simular estabilidad
    estableCounter++
    const estable = estableCounter % 10 < 6 // 60% del tiempo estable
    
    const lectura: PesoLectura = {
      valor: parseFloat(nuevoPeso.toFixed(1)),
      estable,
      unidad: 'kg',
      timestamp: new Date(),
      raw: `SIM:${nuevoPeso.toFixed(1)}kg`
    }
    
    ultimaLectura = lectura
    io.emit('peso', lectura)
    
  }, 200)
  
  conectado = true
  io.emit('estado', { conectado: true, modoSimulacion: true })
}

function detenerSimulacion() {
  if (intervaloSimulacion) {
    clearInterval(intervaloSimulacion)
    intervaloSimulacion = null
  }
}

// ==================== SINCRONIZACIÓN OFFLINE ====================

async function sincronizarOffline() {
  if (colaOffline.length === 0) return
  
  console.log(`[BALANZA] Sincronizando ${colaOffline.length} lecturas offline`)
  
  // Aquí se enviarían los datos al servidor principal
  // Por ahora solo los guardamos en memoria
  
  // Marcar como sincronizados
  while (colaOffline.length > 0) {
    const item = colaOffline.shift()
    if (item) {
      console.log('[BALANZA] Sincronizado:', item)
    }
  }
}

// ==================== LISTAR PUERTOS DISPONIBLES ====================

async function listarPuertos() {
  try {
    const puertos = await SerialPort.list()
    console.log('[BALANZA] Puertos disponibles:', puertos)
    io.emit('puertos', puertos)
    return puertos
  } catch (error) {
    console.error('[BALANZA] Error listando puertos:', error)
    return []
  }
}

// ==================== INICIAR SERVICIO ====================

httpServer.listen(PORT, () => {
  console.log(`[BALANZA] Servicio iniciado en puerto ${PORT}`)
  console.log(`[BALANZA] WebSocket: ws://localhost:${PORT}`)
  
  // Listar puertos disponibles al inicio
  listarPuertos()
  
  // Iniciar en modo simulación para demo
  iniciarSimulacion()
})

// Manejar cierre graceful
process.on('SIGINT', () => {
  console.log('[BALANZA] Cerrando servicio...')
  detenerSimulacion()
  desconectarBalanza()
  io.close()
  httpServer.close()
  process.exit(0)
})

export { io, conectarBalanza, desconectarBalanza, listarPuertos }
