'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Scale, Plus, Pencil, Trash2, Power } from 'lucide-react'

interface Balanza {
  id: string
  nombre: string
  descripcion?: string
  puerto: string
  baudios: number
  dataBits: number
  stopBits: number
  paridad: string
  protocolo: string
  comandoPeso?: string
  formatoTrama?: string
  tiempoEstabilidad: number
  decimales: number
  uso: string
  activa: boolean
}

interface Props {
  operador: { id: string; nombre: string; nivel: string }
}

const USOS_BALANZA = [
  { value: 'CAMIONES', label: 'Balanza de Camiones' },
  { value: 'ROMANEO', label: 'Romaneo/Playa' },
  { value: 'INDIVIDUAL', label: 'Pesaje Individual' },
  { value: 'MENUDENCIAS', label: 'Menudencias' },
]

const PROTOCOLOS = [
  { value: 'CONTINUO', label: 'Continuo' },
  { value: 'BAJO_DEMANDA', label: 'Bajo Demanda' },
]

const PARIDADES = [
  { value: 'none', label: 'Ninguna' },
  { value: 'even', label: 'Par' },
  { value: 'odd', label: 'Impar' },
]

export function Balanzas({ operador }: Props) {
  const [balanzas, setBalanzas] = useState<Balanza[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBalanza, setEditingBalanza] = useState<Balanza | null>(null)
  const [formData, setFormData] = useState<Partial<Balanza>>({
    nombre: '',
    descripcion: '',
    puerto: 'COM1',
    baudios: 9600,
    dataBits: 8,
    stopBits: 1,
    paridad: 'none',
    protocolo: 'CONTINUO',
    tiempoEstabilidad: 2000,
    decimales: 1,
    uso: 'CAMIONES',
    activa: true,
  })

  useEffect(() => {
    fetchBalanzas()
  }, [])

  const fetchBalanzas = async () => {
    try {
      const res = await fetch('/api/balanzas')
      if (res.ok) {
        const data = await res.json()
        setBalanzas(data)
      }
    } catch (error) {
      console.error('Error al cargar balanzas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const url = '/api/balanzas'
      const method = editingBalanza ? 'PUT' : 'POST'
      const body = editingBalanza
        ? { ...formData, id: editingBalanza.id }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        fetchBalanzas()
        setDialogOpen(false)
        setEditingBalanza(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error al guardar balanza:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta balanza?')) return

    try {
      const res = await fetch(`/api/balanzas?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchBalanzas()
      }
    } catch (error) {
      console.error('Error al eliminar balanza:', error)
    }
  }

  const handleEdit = (balanza: Balanza) => {
    setEditingBalanza(balanza)
    setFormData(balanza)
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      puerto: 'COM1',
      baudios: 9600,
      dataBits: 8,
      stopBits: 1,
      paridad: 'none',
      protocolo: 'CONTINUO',
      tiempoEstabilidad: 2000,
      decimales: 1,
      uso: 'CAMIONES',
      activa: true,
    })
  }

  const handleNew = () => {
    setEditingBalanza(null)
    resetForm()
    setDialogOpen(true)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Scale className="w-5 h-5" />
          Balanzas
        </CardTitle>
        <Button onClick={handleNew} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nueva Balanza
        </Button>
      </CardHeader>
      <CardContent>
        {balanzas.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            No hay balanzas configuradas
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Puerto</TableHead>
                <TableHead>Baudios</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {balanzas.map((balanza) => (
                <TableRow key={balanza.id}>
                  <TableCell className="font-medium">{balanza.nombre}</TableCell>
                  <TableCell>{balanza.puerto}</TableCell>
                  <TableCell>{balanza.baudios}</TableCell>
                  <TableCell>
                    {USOS_BALANZA.find(u => u.value === balanza.uso)?.label || balanza.uso}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      balanza.activa
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <Power className="w-3 h-3" />
                      {balanza.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(balanza)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(balanza.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Dialog para crear/editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBalanza ? 'Editar Balanza' : 'Nueva Balanza'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Balanza Camiones Principal"
              />
            </div>

            <div className="col-span-2">
              <Label>Descripción</Label>
              <Input
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción opcional"
              />
            </div>

            <div>
              <Label>Puerto COM *</Label>
              <Input
                value={formData.puerto || ''}
                onChange={(e) => setFormData({ ...formData, puerto: e.target.value })}
                placeholder="COM1, COM3, /dev/ttyUSB0"
              />
            </div>

            <div>
              <Label>Uso *</Label>
              <Select
                value={formData.uso || 'CAMIONES'}
                onValueChange={(value) => setFormData({ ...formData, uso: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USOS_BALANZA.map((uso) => (
                    <SelectItem key={uso.value} value={uso.value}>
                      {uso.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Baudios</Label>
              <Select
                value={String(formData.baudios || 9600)}
                onValueChange={(value) => setFormData({ ...formData, baudios: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1200">1200</SelectItem>
                  <SelectItem value="2400">2400</SelectItem>
                  <SelectItem value="4800">4800</SelectItem>
                  <SelectItem value="9600">9600</SelectItem>
                  <SelectItem value="19200">19200</SelectItem>
                  <SelectItem value="38400">38400</SelectItem>
                  <SelectItem value="57600">57600</SelectItem>
                  <SelectItem value="115200">115200</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Data Bits</Label>
              <Select
                value={String(formData.dataBits || 8)}
                onValueChange={(value) => setFormData({ ...formData, dataBits: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Stop Bits</Label>
              <Select
                value={String(formData.stopBits || 1)}
                onValueChange={(value) => setFormData({ ...formData, stopBits: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Paridad</Label>
              <Select
                value={formData.paridad || 'none'}
                onValueChange={(value) => setFormData({ ...formData, paridad: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARIDADES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Protocolo</Label>
              <Select
                value={formData.protocolo || 'CONTINUO'}
                onValueChange={(value) => setFormData({ ...formData, protocolo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROTOCOLOS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Comando Peso</Label>
              <Input
                value={formData.comandoPeso || ''}
                onChange={(e) => setFormData({ ...formData, comandoPeso: e.target.value })}
                placeholder="Ej: P\r\n (solo para bajo demanda)"
              />
            </div>

            <div>
              <Label>Tiempo Estabilidad (ms)</Label>
              <Input
                type="number"
                value={formData.tiempoEstabilidad || 2000}
                onChange={(e) => setFormData({ ...formData, tiempoEstabilidad: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Decimales</Label>
              <Input
                type="number"
                value={formData.decimales || 1}
                onChange={(e) => setFormData({ ...formData, decimales: parseInt(e.target.value) })}
                min={0}
                max={3}
              />
            </div>

            <div className="col-span-2">
              <Label>Formato de Trama</Label>
              <Input
                value={formData.formatoTrama || ''}
                onChange={(e) => setFormData({ ...formData, formatoTrama: e.target.value })}
                placeholder="Ej: STX + peso + ETX (regex para extraer peso)"
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <Switch
                checked={formData.activa ?? true}
                onCheckedChange={(checked) => setFormData({ ...formData, activa: checked })}
              />
              <Label>Activa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.nombre || !formData.puerto}>
              {editingBalanza ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default Balanzas
