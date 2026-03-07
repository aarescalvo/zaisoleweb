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
import { Printer, Plus, Pencil, Trash2, Power, Star } from 'lucide-react'

interface Impresora {
  id: string
  nombre: string
  descripcion?: string
  tipo: string
  modelo?: string
  direccion?: string
  anchoEtiqueta: number
  altoEtiqueta: number
  margenSuperior: number
  margenIzquierdo: number
  margenDerecho: number
  margenInferior: number
  dpi: number
  velocidad: number
  densidad: number
  uso: string
  activa: boolean
  porDefecto: boolean
}

interface Props {
  operador: { id: string; nombre: string; nivel: string }
}

const TIPOS_IMPRESORA = [
  { value: 'TERMICA', label: 'Térmica (Etiquetas)' },
  { value: 'TERMICA_TICKET', label: 'Térmica (Tickets)' },
  { value: 'INYECTON', label: 'Inyección de Tinta' },
  { value: 'LASER', label: 'Láser' },
  { value: 'MATRICIAL', label: 'Matricial' },
]

const USOS_IMPRESORA = [
  { value: 'ROTULOS', label: 'Rótulos de Medias Res' },
  { value: 'TICKETS', label: 'Tickets de Pesaje' },
  { value: 'FACTURAS', label: 'Facturas y Remitos' },
  { value: 'REPORTES', label: 'Reportes Generales' },
]

export function Impresoras({ operador }: Props) {
  const [impresoras, setImpresoras] = useState<Impresora[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingImpresora, setEditingImpresora] = useState<Impresora | null>(null)
  const [formData, setFormData] = useState<Partial<Impresora>>({
    nombre: '',
    descripcion: '',
    tipo: 'TERMICA',
    modelo: '',
    direccion: '',
    anchoEtiqueta: 100,
    altoEtiqueta: 50,
    margenSuperior: 2,
    margenIzquierdo: 2,
    margenDerecho: 2,
    margenInferior: 2,
    dpi: 203,
    velocidad: 2,
    densidad: 8,
    uso: 'ROTULOS',
    activa: true,
    porDefecto: false,
  })

  useEffect(() => {
    fetchImpresoras()
  }, [])

  const fetchImpresoras = async () => {
    try {
      const res = await fetch('/api/impresoras')
      if (res.ok) {
        const data = await res.json()
        setImpresoras(data)
      }
    } catch (error) {
      console.error('Error al cargar impresoras:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const url = '/api/impresoras'
      const method = editingImpresora ? 'PUT' : 'POST'
      const body = editingImpresora
        ? { ...formData, id: editingImpresora.id }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        fetchImpresoras()
        setDialogOpen(false)
        setEditingImpresora(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error al guardar impresora:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta impresora?')) return

    try {
      const res = await fetch(`/api/impresoras?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchImpresoras()
      }
    } catch (error) {
      console.error('Error al eliminar impresora:', error)
    }
  }

  const handleEdit = (impresora: Impresora) => {
    setEditingImpresora(impresora)
    setFormData(impresora)
    setDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'TERMICA',
      modelo: '',
      direccion: '',
      anchoEtiqueta: 100,
      altoEtiqueta: 50,
      margenSuperior: 2,
      margenIzquierdo: 2,
      margenDerecho: 2,
      margenInferior: 2,
      dpi: 203,
      velocidad: 2,
      densidad: 8,
      uso: 'ROTULOS',
      activa: true,
      porDefecto: false,
    })
  }

  const handleNew = () => {
    setEditingImpresora(null)
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
          <Printer className="w-5 h-5" />
          Impresoras
        </CardTitle>
        <Button onClick={handleNew} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nueva Impresora
        </Button>
      </CardHeader>
      <CardContent>
        {impresoras.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            No hay impresoras configuradas
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Etiqueta (mm)</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {impresoras.map((impresora) => (
                <TableRow key={impresora.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {impresora.nombre}
                      {impresora.porDefecto && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {TIPOS_IMPRESORA.find(t => t.value === impresora.tipo)?.label || impresora.tipo}
                  </TableCell>
                  <TableCell>
                    {USOS_IMPRESORA.find(u => u.value === impresora.uso)?.label || impresora.uso}
                  </TableCell>
                  <TableCell>
                    {impresora.anchoEtiqueta} x {impresora.altoEtiqueta}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      impresora.activa
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <Power className="w-3 h-3" />
                      {impresora.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(impresora)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(impresora.id)}
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
              {editingImpresora ? 'Editar Impresora' : 'Nueva Impresora'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label>Nombre *</Label>
              <Input
                value={formData.nombre || ''}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Impresora Rótulos Principal"
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
              <Label>Tipo *</Label>
              <Select
                value={formData.tipo || 'TERMICA'}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_IMPRESORA.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Uso *</Label>
              <Select
                value={formData.uso || 'ROTULOS'}
                onValueChange={(value) => setFormData({ ...formData, uso: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USOS_IMPRESORA.map((uso) => (
                    <SelectItem key={uso.value} value={uso.value}>
                      {uso.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Modelo</Label>
              <Input
                value={formData.modelo || ''}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                placeholder="Ej: Zebra ZT410"
              />
            </div>

            <div>
              <Label>Dirección / Puerto</Label>
              <Input
                value={formData.direccion || ''}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Ej: 192.168.1.100:9100 o Zebra01"
              />
            </div>

            <div className="col-span-2 border-t pt-4 mt-2">
              <Label className="text-base font-semibold">Dimensiones de Etiqueta (mm)</Label>
            </div>

            <div>
              <Label>Ancho</Label>
              <Input
                type="number"
                value={formData.anchoEtiqueta || 100}
                onChange={(e) => setFormData({ ...formData, anchoEtiqueta: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Alto</Label>
              <Input
                type="number"
                value={formData.altoEtiqueta || 50}
                onChange={(e) => setFormData({ ...formData, altoEtiqueta: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Margen Superior</Label>
              <Input
                type="number"
                value={formData.margenSuperior || 2}
                onChange={(e) => setFormData({ ...formData, margenSuperior: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Margen Inferior</Label>
              <Input
                type="number"
                value={formData.margenInferior || 2}
                onChange={(e) => setFormData({ ...formData, margenInferior: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Margen Izquierdo</Label>
              <Input
                type="number"
                value={formData.margenIzquierdo || 2}
                onChange={(e) => setFormData({ ...formData, margenIzquierdo: parseInt(e.target.value) })}
              />
            </div>

            <div>
              <Label>Margen Derecho</Label>
              <Input
                type="number"
                value={formData.margenDerecho || 2}
                onChange={(e) => setFormData({ ...formData, margenDerecho: parseInt(e.target.value) })}
              />
            </div>

            <div className="col-span-2 border-t pt-4 mt-2">
              <Label className="text-base font-semibold">Configuración de Impresión</Label>
            </div>

            <div>
              <Label>DPI</Label>
              <Select
                value={String(formData.dpi || 203)}
                onValueChange={(value) => setFormData({ ...formData, dpi: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="203">203 dpi</SelectItem>
                  <SelectItem value="300">300 dpi</SelectItem>
                  <SelectItem value="600">600 dpi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Velocidad (pulg/seg)</Label>
              <Select
                value={String(formData.velocidad || 2)}
                onValueChange={(value) => setFormData({ ...formData, velocidad: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Densidad (oscuridad)</Label>
              <Input
                type="number"
                value={formData.densidad || 8}
                onChange={(e) => setFormData({ ...formData, densidad: parseInt(e.target.value) })}
                min={0}
                max={15}
              />
            </div>

            <div className="col-span-2 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.activa ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, activa: checked })}
                />
                <Label>Activa</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.porDefecto ?? false}
                  onCheckedChange={(checked) => setFormData({ ...formData, porDefecto: checked })}
                />
                <Label>Por defecto</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!formData.nombre}>
              {editingImpresora ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default Impresoras
