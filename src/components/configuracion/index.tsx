'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, Warehouse, UserCheck, Package, Users, Truck, Scale, Printer, 
  Leaf, Layers, ShoppingBag, Tags, PackageOpen, ArrowRightLeft, CreditCard, 
  Wallet, Receipt, Calculator, Building, Banknote, FileKey 
} from 'lucide-react'
import { ConfigFrigorifico } from './config-frigorifico'
import { Corrales } from './corrales'
import { Camaras } from './camaras'
import { Tipificadores } from './tipificadores'
import { Productos } from './productos'
import { Subproductos } from './subproductos'
import { CategoriasInsumos } from './categorias-insumos'
import { Insumos } from './insumos'
import { Depositos } from './depositos'
import { StockInsumos } from './stock-insumos'
import { MovimientosInsumos } from './movimientos-insumos'
import { Usuarios } from './usuarios'
import { Productores } from './productores'
import { Proveedores } from './proveedores'
import { Transportistas } from './transportistas'
import { FormasPago } from './formas-pago'
import { Cajas } from './cajas'
import { MovimientosCaja } from './movimientos-caja'
import { ArqueosCaja } from './arqueos-caja'
import { CuentasBancarias } from './cuentas-bancarias'
import { Cheques } from './cheques'
import { Balanzas } from './balanzas'
import { Impresoras } from './impresoras'
import { Operadores } from './operadores'
import { AFIPConfig } from './afip-config'

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
            {/* GRUPO: Empresa */}
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

            {/* Separador visual */}
            <div className="w-px h-6 bg-stone-300 mx-1 self-center hidden sm:block" />

            {/* GRUPO: Productos */}
            <TabsTrigger value="productos" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Productos</span>
            </TabsTrigger>
            <TabsTrigger value="subproductos" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline">Subproductos</span>
            </TabsTrigger>

            {/* Separador visual */}
            <div className="w-px h-6 bg-stone-300 mx-1 self-center hidden sm:block" />

            {/* GRUPO: Insumos */}
            <TabsTrigger value="categorias-insumos" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Tags className="w-4 h-4" />
              <span className="hidden sm:inline">Categorías</span>
            </TabsTrigger>
            <TabsTrigger value="insumos" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Insumos</span>
            </TabsTrigger>
            <TabsTrigger value="depositos" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Warehouse className="w-4 h-4" />
              <span className="hidden sm:inline">Depósitos</span>
            </TabsTrigger>
            <TabsTrigger value="stock-insumos" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <PackageOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Stock</span>
            </TabsTrigger>
            <TabsTrigger value="movimientos-insumos" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Movimientos</span>
            </TabsTrigger>

            {/* Separador visual */}
            <div className="w-px h-6 bg-stone-300 mx-1 self-center hidden sm:block" />

            {/* GRUPO: Personas/Contactos */}
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

            {/* Separador visual */}
            <div className="w-px h-6 bg-stone-300 mx-1 self-center hidden sm:block" />

            {/* GRUPO: Finanzas */}
            <TabsTrigger value="formas-pago" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Formas Pago</span>
            </TabsTrigger>
            <TabsTrigger value="cajas" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Cajas</span>
            </TabsTrigger>
            <TabsTrigger value="movimientos-caja" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Mov. Caja</span>
            </TabsTrigger>
            <TabsTrigger value="arqueos-caja" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Arqueos</span>
            </TabsTrigger>
            <TabsTrigger value="cuentas-bancarias" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Cuentas Banc.</span>
            </TabsTrigger>
            <TabsTrigger value="cheques" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <Banknote className="w-4 h-4" />
              <span className="hidden sm:inline">Cheques</span>
            </TabsTrigger>

            {/* Separador visual */}
            <div className="w-px h-6 bg-stone-300 mx-1 self-center hidden sm:block" />

            {/* GRUPO: Equipos */}
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

            {/* Separador visual */}
            <div className="w-px h-6 bg-stone-300 mx-1 self-center hidden sm:block" />

            {/* GRUPO: AFIP */}
            <TabsTrigger value="afip" className="flex items-center gap-1 text-xs md:text-sm px-2 md:px-3">
              <FileKey className="w-4 h-4" />
              <span className="hidden sm:inline">AFIP</span>
            </TabsTrigger>
          </TabsList>

          {/* GRUPO: Empresa */}
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

          {/* GRUPO: Productos */}
          <TabsContent value="productos">
            <Productos operador={operador} />
          </TabsContent>
          <TabsContent value="subproductos">
            <Subproductos operador={operador} />
          </TabsContent>

          {/* GRUPO: Insumos */}
          <TabsContent value="categorias-insumos">
            <CategoriasInsumos operador={operador} />
          </TabsContent>
          <TabsContent value="insumos">
            <Insumos operador={operador} />
          </TabsContent>
          <TabsContent value="depositos">
            <Depositos operador={operador} />
          </TabsContent>
          <TabsContent value="stock-insumos">
            <StockInsumos operador={operador} />
          </TabsContent>
          <TabsContent value="movimientos-insumos">
            <MovimientosInsumos operador={operador} />
          </TabsContent>

          {/* GRUPO: Personas/Contactos */}
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

          {/* GRUPO: Finanzas */}
          <TabsContent value="formas-pago">
            <FormasPago operador={operador} />
          </TabsContent>
          <TabsContent value="cajas">
            <Cajas operador={operador} />
          </TabsContent>
          <TabsContent value="movimientos-caja">
            <MovimientosCaja operador={operador} />
          </TabsContent>
          <TabsContent value="arqueos-caja">
            <ArqueosCaja operador={operador} />
          </TabsContent>
          <TabsContent value="cuentas-bancarias">
            <CuentasBancarias operador={operador} />
          </TabsContent>
          <TabsContent value="cheques">
            <Cheques operador={operador} />
          </TabsContent>

          {/* GRUPO: Equipos */}
          <TabsContent value="balanzas">
            <Balanzas operador={operador} />
          </TabsContent>
          <TabsContent value="impresoras">
            <Impresoras operador={operador} />
          </TabsContent>
          <TabsContent value="operadores">
            <Operadores operador={operador} />
          </TabsContent>

          {/* GRUPO: AFIP */}
          <TabsContent value="afip">
            <AFIPConfig operador={operador} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ConfiguracionModule
