'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, Warehouse, UserCheck, Package, Users, Truck, Scale, Printer, Leaf, Layers, ShoppingBag } from 'lucide-react'
import { ConfigFrigorifico } from './config-frigorifico'
import { Corrales } from './corrales'
import { Camaras } from './camaras'
import { Tipificadores } from './tipificadores'
import { Productos } from './productos'
import { Subproductos } from './subproductos'
import { Usuarios } from './usuarios'
import { Productores } from './productores'
import { Proveedores } from './proveedores'
import { Transportistas } from './transportistas'
import { Balanzas } from './balanzas'
import { Impresoras } from './impresoras'
import { Operadores } from './operadores'

interface Operador {
  id: string
  nombre: string
  nivel: string
}

export function ConfiguracionModule({ operador }: { operador: Operador }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-800">Configuración</h1>
          <p className="text-stone-500">Gestión del sistema Solemar Alimentaria</p>
        </div>

        <Tabs defaultValue="frigorifico" className="space-y-6">
          <TabsList className="flex flex-wrap w-full gap-1 h-auto">
            <TabsTrigger value="frigorifico" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Frigorífico</span>
            </TabsTrigger>
            <TabsTrigger value="corrales" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Warehouse className="w-4 h-4" />
              <span className="hidden sm:inline">Corrales</span>
            </TabsTrigger>
            <TabsTrigger value="camaras" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Warehouse className="w-4 h-4" />
              <span className="hidden sm:inline">Cámaras</span>
            </TabsTrigger>
            <TabsTrigger value="tipificadores" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Tipific.</span>
            </TabsTrigger>
            <TabsTrigger value="productos" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="subproductos" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Subproductos</span>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            <TabsTrigger value="productores" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Leaf className="w-4 h-4" />
              <span className="hidden sm:inline">Productores</span>
            </TabsTrigger>
            <TabsTrigger value="proveedores" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Proveedores</span>
            </TabsTrigger>
            <TabsTrigger value="transportistas" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Transp.</span>
            </TabsTrigger>
            <TabsTrigger value="balanzas" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Scale className="w-4 h-4" />
              <span className="hidden sm:inline">Balanzas</span>
            </TabsTrigger>
            <TabsTrigger value="impresoras" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Impres.</span>
            </TabsTrigger>
            <TabsTrigger value="operadores" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Operadores</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="frigorifico">
            <ConfigFrigorifico operador={operador} />
          </TabsContent>
          <TabsContent value="corrales">
            <Corrales operador={operador} />
          </TabsContent>
          <TabsContent value="camaras">
            <Camaras operador={operador} />
          </TabsContent>
          <TabsContent value="tipificadores">
            <Tipificadores operador={operador} />
          </TabsContent>
          <TabsContent value="productos">
            <Productos operador={operador} />
          </TabsContent>
          <TabsContent value="subproductos">
            <Subproductos operador={operador} />
          </TabsContent>
          <TabsContent value="usuarios">
            <Usuarios operador={operador} />
          </TabsContent>
          <TabsContent value="productores">
            <Productores operador={operador} />
          </TabsContent>
          <TabsContent value="proveedores">
            <Proveedores operador={operador} />
          </TabsContent>
          <TabsContent value="transportistas">
            <Transportistas operador={operador} />
          </TabsContent>
          <TabsContent value="balanzas">
            <Balanzas operador={operador} />
          </TabsContent>
          <TabsContent value="impresoras">
            <Impresoras operador={operador} />
          </TabsContent>
          <TabsContent value="operadores">
            <Operadores operador={operador} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ConfiguracionModule
