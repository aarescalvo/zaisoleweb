---
Task ID: 2
Agent: main
Task: Fix pesaje de camiones module and add configuration tabs

Work Log:
- Fixed API de pesaje-camion with correct field mapping
- Added configuration tabs for Transportistas and Clientes
- Created QuickAddDialog component
- Improved TipoAnimalCounterGrid with +/- buttons

Stage Summary:
- Pesaje de Camiones API working correctly
- Can create INGRESO_HACIENDA with tropa creation
- Configuration module complete with all tabs

---
Task ID: 3
Agent: main
Task: Fix "compiling" freeze when finishing pesaje

Work Log:
- Fixed Next.js 16 params Promise issue
- Improved async/await handling in all save operations

---
Task ID: 4
Agent: main
Task: Modularize large component files

Work Log:
- Created /src/components/pesaje-camiones/ directory structure
- Extracted types, constants, and components

---
Task ID: 5
Agent: main
Task: Fix 4 user-reported issues

Work Log:
- Fixed permission validation in multiple files
- Fixed DTE confirmation not saving
- Fixed Turbopack cache issue

---
Task ID: 6
Agent: main
Task: Sistema de permisos granular por módulo

Work Log:
- Agregado modelo PermisoModulo al schema Prisma
- 3 niveles de acceso: NINGUNO, OPERADOR, SUPERVISOR
- 13 módulos configurables por operador
- Creado componente PINDialog para autenticación rápida

---
Task ID: 7
Agent: main
Task: Corregir errores de servidor

Work Log:
- Fix: PermisoModulo relation
- Fix: @default(cuid()) en todos los modelos
- Fix: Nombres de relaciones Prisma correctos

---
Task ID: 8
Agent: main
Task: Agrandar logo en login y sidebar

Work Log:
- Logo login: 256x256px (4x más grande)
- Logo sidebar: 80x80px

---
Task ID: 9
Agent: main
Task: Fix error de conexión al crear cámaras

Work Log:
- Creada API completa en /src/app/api/camaras/route.ts (GET, POST, PUT, DELETE)

---
Task ID: 10
Agent: main
Task: Configurar corrales y cámaras según especificaciones reales

Work Log:
- Creados 12 corrales: D1-D10 (20 c/u), Observación (20), Aislamiento (10)
- Creadas 14 cámaras según especificaciones del frigorífico

📍 CORRALES (12 total):
   Descanso (10): D1-D10 - 20 animales c/u = 200 animales
   Observación (1): 20 animales
   Aislamiento (1): 10 animales

📍 CÁMARAS (14 total):
   FAENA (3): Cámara 1 (90 animales), Cámara 2 (77), Cámara 3 (30)
   DESPOSTADA (2): Cámara 4-5 (75 animales)
   DEPÓSITO (9): Cámara 7 (6 pallets), Depósitos (60 pallets c/u), Túneles (8 c/u), Contenedores (19 c/u)

---
Task ID: 11
Agent: main
Task: Habilitar módulos Stock Cámaras y Reportes

Work Log:
- Importado StockCamarasModule (ya existía en /src/components/stock-camaras/index.tsx)
- Creado ReportesModule en /src/components/reportes/index.tsx
- Creada API /src/app/api/reportes/route.ts
- Actualizado page.tsx para usar módulos reales en lugar de placeholders

Stage Summary:
MÓDULOS OPERATIVOS:
1. Dashboard - Funcional
2. Pesaje Camiones - Funcional
3. Pesaje Individual - Funcional
4. Movimiento Hacienda - Funcional
5. Lista de Faena - Funcional
6. Romaneo - Funcional
7. Ingreso a Cajón - Funcional
8. Menudencias - Funcional
9. Stock Cámaras - Funcional (nuevo)
10. Reportes - Funcional (nuevo)
11. Configuración - Funcional

Files Created:
- /src/components/reportes/index.tsx
- /src/app/api/reportes/route.ts

Files Modified:
- /src/app/page.tsx (imports y switch)

PENDING MODULES:
- Facturación - No implementado
- CCIR - No implementado
- Declaración Jurada - No implementado

---
Task ID: 13
Agent: main
Task: Cargar datos históricos de DataFaena desde GitHub

Work Log:
- Clonado repositorio https://github.com/aarescalvo/datafaena
- Analizados 93 archivos PDF y 4 archivos Excel
- Extraídos datos de 57 tropas con 904 animales de PDFs
- Extraídos datos de 4 archivos Excel adicionales
- Creado script de seed en /scripts/seed-datafaena.ts
- Cargados datos en la base de datos

Stage Summary:
DATOS CARGADOS:
- 84 tropas totales (76 nuevas + 8 previas)
- 1920 animales totales
- 39 clientes (31 productores + usuarios de faena)
- Tropas desde N° 18 hasta N° 188
- Fechas desde Diciembre 2025 hasta Marzo 2026
- Estados: FAENADO (listos para romaneo)

Files Created:
- /scripts/seed-datafaena.ts

Productores principales:
- YAMINUHE SRL (200 animales)
- KREITZ JUAN EDUARDO (118 animales)
- LOGINPET SRL (196 animales)
- BOSQUE AMADO S.R.L (72 animales)
- LA TAPERITAS S.A. (200 animales)
- SCHINDLER MARTIN (134 animales)
- ARANEDA MARIO ALEJANDRO (65 animales)
- Y 24 productores más...

---
Task ID: 14
Agent: main
Task: Diseñar y desarrollar módulo de Romaneo mejorado

Work Log:
- Analizados archivos subidos por usuario:
  - ROMANEO VACUNO T61 06022026.pdf.xlsx: Estructura de romaneo real
  - CODIGO.xlsx: Tabla de códigos EAN-128
  - Planilla 01 - Bovino.xlsx: Formulario oficial de ingreso
  - SERVICIO FAENA BOVINO 2026.xlsx: Datos de faena
  - WhatsApp Image: Interfaz de rótulos
- Investigada tipificación argentina (JPG - Juzgado Permanente de Ganadería)
- Analizada estructura de código EAN-128 para rótulos

Stage Summary:
ANÁLISIS DE ROMANEO ARGENTINO:

1. ESTRUCTURA DEL ROMANEO (según archivos):
   - Encabezado: Establecimiento, Matrícula (300), Nº SENASA (3986)
   - Datos de tropa: Número, cantidad cabezas, kg vivo, kg 1/2 res, rinde, promedio
   - Por animal: Garrón, Nº Animal, Raza (CA/HE), Tipo (2D-MEJ, 2D-VQ), Caravana, KG Entrada, KG 1/2 A, KG 1/2 B, Total KG, Rinde Faena
   - Resumen por cuartos: VQ, NT, NO, TO, VA, MEJ

2. TIPIFICACIÓN ARGENTINA (Normativa SENASA):
   - DENTICIÓN: 0D, 2D, 4D, 6D, 8D
   - CATEGORÍAS: TO (Toro), VA (Vaca), VQ (Vaquillona), MEJ (Torito), NO (Novillo), NT (Novillito)
   - TIPIFICACIÓN: M (Macho), A (Astrado), S (Sobre), I (Intermedia), N (Normal), etc.
   - GRASA COBERTURA: Escasa, Light, Mediana, Abundante, Excesiva
   - CONFORMACIÓN: Buena, Regular, Mala
   - COLOR GRASA: Blanco, Blanco Cremoso, Amarillento

3. CÓDIGO EAN-128 PARA RÓTULOS:
   [ESPECIE][ARTÍCULO][TIPIFICACIÓN][TIPO TRABAJO][TRANSPORTE][DESTINO]
   Ejemplo: 2001.03001 = Bovino + Media Res + Astrado + Sin trabajo + No definido + Italia

4. ARQUITECTURA OFFLINE PROPUESTA:
   - Mini-servicio WebSocket (Puerto 3030) para conexión a balanza
   - Cola de sincronización para operaciones offline
   - Service Worker para PWA
   - Impresión automática de rótulos

5. SCHEMA PRISMA ACTUALIZADO:
   - Agregados enums: CategoriaBovino, TipificacionRes, GrasaCobertura, Conformacion, ColorGrasa
   - Modelo Romaneo expandido con todos los campos de tipificación
   - Modelo MediaRes con datos de rótulo y código de barras
   - Nuevos modelos: ConfiguracionBalanza, ConfiguracionImpresora, PlantillaRotulo
   - Cola de impresión y sincronización offline

Files Modified:
- /prisma/schema.prisma (agregados ~200 líneas de nuevas definiciones)

NEXT STEPS:
- Crear servicio mini-servicio para balanza (WebSocket)
- Implementar interfaz offline del romaneo (PWA)
- Crear sistema de impresión de rótulos con código de barras
- Actualizar componente RomaneoModule con nueva tipificación

---
Task ID: 15
Agent: main
Task: Implementar módulo de Romaneo con tipificación argentina completa

Work Log:
- Creado módulo RomaneoModule completamente rediseñado
- Implementadas todas las constantes de tipificación argentina:
  - DENTICIONES: 0, 2, 4, 6, 8 dientes
  - CATEGORIAS_BOVINO: VQ, NT, NO, VA, TO, MEJ
  - TIPIFICACIONES_RES: A, M, S, I, N, AG, AS, L, IN
  - GRASAS_COBERTURA: Escasa, Light, Mediana, Abundante, Excesiva
  - CONFORMACIONES: Buena, Regular, Mala
  - COLORES_GRASA: Blanco, Blanco Cremoso, Amarillento
- Agregados DESTINOS y TRANSPORTES para código EAN-128
- Implementada función generarCodigoEAN128() para rótulos
- Agregado estado de balanza simulada (preparado para WebSocket real)
- Interfaz para capturar peso de balanza automáticamente
- Rótulos mejorados con toda la información de tipificación
- Campos para destino, transporte y observaciones

Stage Summary:
MÓDULO ROMANEO MEJORADO:

1. TIPIFICACIÓN COMPLETA:
   - Selección de dentición (0-8 dientes)
   - Categoría del animal (Vaquillona, Novillo, etc.)
   - Tipificación de res (Astrado, Macho, Sobre, etc.)
   - Grasa de cobertura (1-5)
   - Conformación (Buena/Regular/Mala)
   - Color de grasa

2. CÓDIGO EAN-128:
   - Generación automática basada en tipificación
   - Formato: [Especie][Artículo][Tipificación][Trabajo][Transporte][Destino]

3. CONEXIÓN BALANZA:
   - Botón para conectar/desconectar balanza
   - Visualización de peso en tiempo real
   - Indicador de estabilidad
   - Botones para capturar peso en cada media

4. RÓTULOS MEJORADOS:
   - Header con datos del establecimiento (Mat. 300, SENASA 3986)
   - Todos los datos de tipificación
   - Código de barras CODE128
   - Código EAN-128 visible
   - Fecha de faena

Files Modified:
- /src/components/romaneo/index.tsx (~700 líneas, completamente reescrito)

PENDIENTE:
- Crear mini-servicio WebSocket para balanza real
- Implementar PWA con Service Worker para offline
- Sistema de impresión térmica con ZPL

---
Task ID: 16
Agent: main
Task: Garrón automático y flujo optimizado del romaneo

Work Log:
- Rediseñado flujo de trabajo: garrón aparece automáticamente
- El sistema carga automáticamente el primer garrón pendiente
- Navegación con botones Anterior/Siguiente
- Botón "GUARDAR Y SIGUIENTE" - guarda y avanza automáticamente
- Modo "Auto" para avance automático habilitado/deshabilitado
- Lista rápida de garrones pendientes para navegación directa
- Progreso visual del día (barra de progreso)
- Checklist de campos completados
- Captura de peso desde balanza con un solo botón
- Sonidos de confirmación configurables
- Diseño responsive optimizado para tablets

Stage Summary:
FLUJO DE TRABAJO OPTIMIZADO:

1. GARRÓN AUTOMÁTICO:
   - Se carga el primer garrón pendiente automáticamente
   - No hay necesidad de buscar manualmente
   - Navegación con flechas o lista rápida

2. CAPTURA DE PESO:
   - Un botón captura peso de cada media
   - Indicador visual de estabilidad
   - Sonido de confirmación

3. GUARDADO RÁPIDO:
   - Botón único "GUARDAR Y SIGUIENTE"
   - Imprime rótulos automáticamente
   - Avanza al siguiente garrón

4. VISUALIZACIÓN:
   - Garrón destacado en grande (6xl)
   - Datos del animal visibles
   - Checklist de progreso
   - Barra de avance del día

Files Modified:
- /src/components/romaneo/index.tsx (flujo automático completo)

---
Task ID: 17
Agent: main
Task: Crear mini-servicio WebSocket para balanza

Work Log:
- Creado mini-servicio en /mini-services/balanza-service/
- Puerto 3030 con Socket.IO
- Soporte para protocolos: CONTINUO, DEMANDA, TOLEDO, METTLER
- Conexión Serial/USB y TCP/IP
- Modo simulación automático para demo
- Cola de sincronización offline
- API de eventos:
  - conectar/desconectar
  - solicitarPeso
  - simularPeso
  - configurar
  - registrarPeso (offline)

Stage Summary:
MINI-SERVICIO BALANZA:

PUERTO: 3030
PROTOCOL: WebSocket (Socket.IO)

EVENTOS:
- conectar: Inicia conexión a balanza real
- desconectar: Cierra conexión
- peso: Recibe lecturas en tiempo real
- estado: Estado de conexión
- puertos: Lista de puertos seriales disponibles
- simularPeso: Para testing/demo

MODO SIMULACIÓN:
- Se activa automáticamente si no hay balanza
- Peso fluctúa entre 70-110 kg
- Indicador de estabilidad simulado
- Actualiza cada 200ms

ARCHIVOS:
- /mini-services/balanza-service/index.ts (~360 líneas)
- /mini-services/balanza-service/package.json

PRÓXIMO:
- Conectar frontend al mini-servicio
- Implementar Service Worker para PWA offline

---
Task ID: 18
Agent: main
Task: Crear API endpoints para romaneo y seed de simulación

Work Log:
- Creada API /api/romaneo/route.ts (GET, POST, PUT)
- Creada API /api/tipificadores/route.ts (GET, POST)
- Creada API /api/seed-simulacion/route.ts (POST) para generar datos de prueba
- Script de seed directo en /prisma/seed-simulacion.ts
- Ejecutado seed con éxito: 7 tropas en diferentes estados, romaneos pendientes y completados

Stage Summary:
DATOS DE SIMULACIÓN CREADOS:

TROPAS (7 en diferentes estados):
1. B 2026 0100 - RECIBIDO (10 animales)
2. B 2026 0101 - EN_CORRAL (10 animales)
3. B 2026 0102 - EN_PESAJE (10 animales)
4. B 2026 0103 - PESADO (10 animales)
5. B 2026 0104 - LISTO_FAENA (10 animales)
6. B 2026 0105 - EN_FAENA (10 animales) → Romaneos PENDIENTES
7. B 2026 0106 - FAENADO (10 animales) → Romaneos CONFIRMADOS

ROMANEOS:
- 34 romaneos PENDIENTES (tropa en faena)
- 24 romaneos CONFIRMADOS (tropa faenada)

OTROS DATOS:
- 3 tipificadores (JPG-001, JPG-002, JPG-003)
- 6 corrales
- 2 clientes (productor + usuario faena)

FILES CREATED:
- /src/app/api/romaneo/route.ts
- /src/app/api/tipificadores/route.ts
- /src/app/api/seed-simulacion/route.ts
- /prisma/seed-simulacion.ts

NOTA: El servidor de desarrollo quedó en estado inconsistente después de limpiar el cache .next
Es necesario reiniciar el servidor para que los cambios surtan efecto.

---
Task ID: 19
Agent: main
Task: Arreglar servidor, conectar WebSocket y mejorar módulos

Work Log:
- Re-creados archivos de API con permisos correctos:
  - /src/app/api/romaneo/route.ts
  - /src/app/api/tipificadores/route.ts
  - /src/app/api/seed-simulacion/route.ts
- Instalado socket.io-client para conexión WebSocket
- Actualizado componente RomaneoModule para conectar al WebSocket real:
  - Conexión a ws://localhost:3030 vía caddy (XTransformPort)
  - Recepción de eventos de peso en tiempo real
  - Manejo de estados de conexión/desconexión
  - Integración con eventos 'peso', 'estado', 'connect'
- Verificados módulos CCIR y Declaración Jurada (ya completos)
- Verificado módulo Facturación (ya implementado)

Stage Summary:
MEJORAS REALIZADAS:

1. ROMANEO - CONEXIÓN WEBSOCKET REAL:
   - Socket.io-client instalado
   - Conexión automática al mini-servicio (puerto 3030)
   - Eventos: connect, disconnect, peso, estado
   - Simulación automática si no hay balanza real
   - Indicador de estado de conexión WebSocket

2. MÓDULOS VERIFICADOS (Ya completos):
   - CCIR: Crear, ver, imprimir, anular certificados
   - Declaración Jurada: Gestión completa con productores
   - Facturación: Módulo base funcional

3. ARCHIVOS RECREADOS:
   - APIs con permisos correctos (root -> z)

FILES MODIFIED:
- /src/components/romaneo/index.tsx (WebSocket real)
- /src/app/api/romaneo/route.ts
- /src/app/api/tipificadores/route.ts
- /src/app/api/seed-simulacion/route.ts

DEPENDENCIES ADDED:
- socket.io-client@4.8.3

ISSUES:
- Servidor de desarrollo con cache corrupto
- Necesita reinicio manual para que surta efecto

---
Task ID: 20
Agent: main
Task: Análisis completo de archivos de datos reales del cliente

Work Log:
- Leídos y analizados todos los archivos subidos:
  1. CODIGO.xlsx - Tabla de composición de códigos EAN-128
  2. ROMANEO VACUNO T88.pdf - Reporte de romaneo real
  3. ROMANEO VACUNO T61 06022026.pdf.xlsx - Romaneo exportado a Excel
  4. PRESENTACION ROTULOS DEFINITIVO.pdf - Diseño de rótulos (imágenes)
  5. CUIT DE USUARIOS + DATOS.xlsx - Clientes/usuarios del sistema
  6. Planilla 01 - Bovino.xlsx - Formulario oficial de ingreso de hacienda
  7. SERVICIO FAENA BOVINO 2026.xlsx - Datos de facturación y servicios
  8. WhatsApp Image - Interfaz del software actual de productos
  9. RINDE FAENA BOVINO - copia.xlsx - Detalle de rinde por tropa

Stage Summary:
================================================================================
ANÁLISIS COMPLETO DE ARCHIVOS - SOLEMAR ALIMENTARIA S.A.
================================================================================

1. COMPRENDO PERFECTAMENTE:
================================================================================

A. CÓDIGO EAN-128 (CODIGO.xlsx):
   - Estructura: [ARTÍCULO][ESPECIE][TIPIFICACIÓN][TIPO TRABAJO][TRANSPORTE][DESTINO]
   - Datos Fijos (10 dígitos): Artículo(3) + Especie(1) + Tipif(2) + TipoTrabajo(1) + Transporte(1) + Destino(2)
   - Datos Variables: Fecha Producción(6) + Lote(6) + Unidades(2) + PesoNeto(5) + NumeradorCaja(4) + PesoBruto(5)
   
   TABLAS:
   - ARTÍCULOS: .000 total, .001 lomo, .002 bife angosto, .003 cuadril, etc. (108 productos)
   - ESPECIES: 0 todas, 1 equino, 2 caballo, 3 potro, 4 burro, 5 equino LAND L
   - TIPIFICACIÓN: .00 todas, .01 no tipificada, .02 M, .03 A, .04 S, .05 I, .06 N, .07 AG, .08 AS, etc.
   - TIPO TRABAJO: 0 Ninguna, 1 descarte, 2 T/lama, 3 T/MR, 4 T/jaslo, 5 T/square, 6 T/checo
   - TRANSPORTE: 0 no definido, 1-2 BARCO (enfriado/congelado/salado), 4-5 AVION, 6-7 CAMION, 8 INTERNO
   - DESTINO: .01 Italia, .02 Francia, .03 España, .04 Bélgica, .05 Rusia, .06 Suiza, etc.

B. ROMANEO VACUNO (PDFs):
   Estructura del reporte:
   - Establecimiento: Solemar Alimentaria S.A. (Mat. 300, SENASA 3986)
   - Usuario/Matarife + Productor + Nº DTE + Nº Guía
   - Fecha Faena + Nº Tropa + Cantidad Cabezas
   - Kg Vivo Entrada + Kg 1/2 Res + Rinde % + Promedio
   
   POR ANIMAL:
   - Nº Garrón (1-8 o más)
   - Nº Animal (secuencial)
   - Raza: HE (Hereford), CA (Careta), AA (Aberdeen Angus), HO (Holando), BN (Brahman), BS (Brangus), BD (Braford)
   - Tipo Animal + Dentición: 2D-VQ (2 dientes - Vaquillona), 2D-MEJ, 2D-NT, etc.
   - Nº Caravana (identificación del animal)
   - KG Entrada (peso vivo)
   - KG 1/2 A (media res A - izquierda)
   - KG 1/2 B (media res B - derecha)
   - Total KG
   - Rinde Faena %
   
   RESUMEN POR CUARTOS:
   - VQ (Vaquillona), NT (Novillito), NO (Novillo), TO (Toro), VA (Vaca), MEJ (Torito)

C. CUIT DE USUARIOS + DATOS:
   17 CLIENTES ACTUALES:
   - DOS DE FIERRO SA (30715475533)
   - FERREYRA MARTIN RUBEN (23335321359)
   - MUCA SAS (30716490323)
   - FERREYRA RUBEN ALBERTO (20136718216)
   - PENROZ CINDY MARIA FERNANDA (23345458654)
   - MORAGA MAXIMILIANO IVAN (20396498627)
   - FRIGORIFICO DE LA PATAGONIA SRL (30718653467)
   - GANADERA NORTE NEUQUINO SAS (30716426757)
   - BOSQUE AMADO S.R.L (30707770690)
   - DISTRIBUIDORA DE LA PATAGONIA SRL (30709507849)
   - JORGE ALBERTO LASAGNO (20250067861)
   - MAIZALES DE LA PATAGONIA S.R.L (30716325276)
   - TRIAUD SA (30715935100)
   - VIENTOS DEL VALLE SRL (30712143483)
   - ROSA JOSE ANIBAL (20246268062)
   - EVASIO MARMETTO SA (30537620893)
   - NECORUTA (30710798946)
   
   Campos: TITULAR, CUIT, MAIL, NOMBRE Y APELLIDO, CELULAR
   Nota: Algunos tienen "RETIRO EN PLANTA" como tipo de operación

D. PLANILLA 01 - BOVINO (Formulario Oficial):
   DATOS DE CABECERA:
   - Fecha de Planilla Entrada
   - Nº Registro Entrada Solemar
   - Nombre Romaneo (Solemar Alimentaria S.A.)
   - Nº Semana
   - Tropa Nº
   - Hora Ingreso
   
   EMPRESA TRANSPORTADORA:
   - Patente Chasis + Patente Remolque
   - RENSPA Nº
   - Lugar Emisión Guía
   - Guía Nº + DTA Nº
   - Nº Precinto
   
   CONSIGNATARIO/ACOPIADOR:
   - Nombre Remitente
   - CUIT Proveedor/Acopiador
   
   DETALLE POR ANIMAL (40 animales por planilla):
   - Nº Pro.
   - Nota por Faena
   - Tipo Animal
   - Sexo
   - Color
   - Peso Entrada
   - Desba. %
   - Tipificación
   - Estado Carne
   - Corral Nº
   - Nota Animal
   
   REFERENCIAS DE TIPO:
   - NT = Novillito
   - Vq = Vaquillona
   - No = Novillo
   - Va = Vaca
   - To = Toro
   - MEJ = Macho con más de 2 dientes incisivos

E. SERVICIO FAENA BOVINO 2026 (Múltiples hojas):
   
   RESUMEN 2026:
   - ENERO: 1021 cabezas, $375.8/kg, $84.059.288 servicio
   - FEBRERO: 815 cabezas, $420/kg, $76.018.824 servicio
   - TOTAL: 1836 cabezas, $160.078.112.5
   
   DETALLE POR TROPA (448 registros):
   - MES, TROPA, USUARIO, CANTIDAD ANIMALES
   - $/kg SERVICIO S/RECUPERO
   - KG GANCHO (peso faena)
   - SERVICIO FAENA + SERVICIO DESPOSTADA
   - TOTAL OPERACIÓN $
   - FACTURA COMPRA/VENTA MENUDENCIA
   - VENTA LAVADITO
   - $ HUESO, DESPERDICIO, GRASA, CUERO, GRASA DREASING
   
   SERVICIO FAENA (716 registros):
   - Nº TROPA, USUARIO, CANTIDAD ANIMALES, KG PIE
   - FECHA FAENA, KG GANCHO, RINDE %
   - PRECIO SERVICIO (con/sin recupero)
   - TOTAL CON IVA
   - TASA INSP. VET. + ARANCEL IPCVA
   - Nº FACTURA, FECHA FACTURA, FECHA PAGO
   - MONTO DEPOSITADO, ESTADO PAGO, OBSERVACIONES
   
   SERVICIO DESPOSTE (892 registros):
   - Similar a faena pero con desposte
   
   MENUDENCIAS (353 registros):
   - KG ACHURAS, KG ACHURAS DECOMISADAS
   - KG LAVADITO
   - VALOR POR KG/UNIDAD
   - ÁREA COMPRAS/VENTA
   - CLIENTE, Nº FACTURA, ESTADO
   
   RENDERING (301 registros):
   - KG DESPERDICIO, HUESO, GRASA
   - PRECIOS POR CLIENTE (MARMETTO, TRIAUD)
   - FACTURA, MONTO TOTAL, ESTADO
   
   CUEROS (784 registros):
   - UNIDADES, BUENOS, CORTADO
   - SALIDA CORTADO/BUENO, STOCK
   - KG TOTAL, PRECIO POR UNIDAD/KG
   
   GRASA DREASING (22 registros):
   - KG TOTAL, PRECIO, FACTURA
   
   MERCADO INTERNO (342 registros):
   - Artículos comercializados
   - Lavadito (Chinchulin)
   - FACTURA, TITULAR, MONTO

F. RINDE FAENA BOVINO (Por Tropa):
   CABECERA:
   - SOBRE kg vivo de: (total)
   - SOBRE 1/2 res de: (total)
   - RINDE % (general)
   - FECHA DE FAENA
   - TROPA Nº
   - CANTIDAD ANIMALES
   - PROMEDIO (peso promedio)
   - MATARIFE
   - Nº DTE
   
   DETALLE POR ANIMAL:
   - Nº GARRON, Nº ANIMAL, RAZA
   - TIPO DE ANIMAL (con dentición)
   - Nº CARAVANA
   - KG ENTRADA, KG 1/2 A, KG 1/2 B
   - TOTAL KG
   - RINDE FAENA
   
   REFERENCIAS RAZA:
   - HE = Hereford
   - CA = Careta
   - AA = Aberdeen Angus
   - HO = Holando
   - BN = Brahman
   - BS = Brangus
   - BD = Braford

G. INTERFAZ ACTUAL (WhatsApp Image):
   Formulario de PRODUCTOS con campos:
   - Código, Nombre, TARA, VTO, Nº SENASA, UNIDAD
   - CANT ETI, TIENE TIPIFICACIÓN (Sí/No)
   - TIPIFICACIÓN, TIPO, TIPO GRAL.
   - DESCRIP. CIRCULAR
   - P.DOLAR, P.EURO
   - PRODUCIDO PARA CLIENTE, PRODUCIDO DE PIEZA
   - Tipo de Trabajo: LAMA, MR, Ninguno
   - Idioma de Etiqueta: Inglés, Italiano, Otro
   - Temperatura y Transporte: Congelada, Enf. Buque, Enf. Avión
   - Tipo de Consumo: Humano, No Humano
   - Empresa: Propia, Otra
   - Jaslo: Sí, No
   - FORMATO ETIQ. + Botón "Armar"
   - TEXTOS EN MÚLTIPLES IDIOMAS

================================================================================
2. DUDAS Y PREGUNTAS DETALLADAS:
================================================================================

A. SOBRE TIPIFICACIÓN:
   ❓ ¿Qué significa "D" en la dentición? (ej: 2D, 4D) - Asumo que es "Dientes"
   ❓ ¿Cómo se determina la tipificación M, A, S, I, N? ¿Es manual por el inspector?
   ❓ ¿AG y AS son "Astrado Good" y "Astrado Superior"? ¿O significa otra cosa?
   ❓ ¿Qué es "IN" en tipificación?
   ❓ ¿El rinde se calcula siempre como (Kg 1/2 Res / Kg Vivo) × 100?

B. SOBRE CÓDIGOS Y RÓTULOS:
   ❓ ¿El código EAN-128 va impreso en el rótulo? ¿En código de barras o texto?
   ❓ ¿Qué significa "LAND L" en especie 5?
   ❓ ¿Los destinos .01-.10 son países de exportación? ¿Cuál es el destino para mercado interno?
   ❓ ¿Qué es "Jaslo"? ¿Un tipo de corte o preparación?
   ❓ ¿Qué diferencia hay entre T/lama, T/MR, T/jaslo, T/square, T/checo?

C. SOBRE EL FLUJO DE TRABAJO:
   ❓ ¿El Nº de Garrón se asigna en la faena o viene predefinido?
   ❓ ¿La relación entre Nº Animal y Nº Garrón es siempre 1:1?
   ❓ ¿Qué pasa con animales decomisados? ¿Se registran de forma diferente?
   ❓ ¿El peso de entrada (Kg Vivo) se registra en el pesaje de camiones o individual?

D. SOBRE FACTURACIÓN:
   ❓ ¿El "Servicio Faena" incluye menudencias o es aparte?
   ❓ ¿Qué es el "recupero" en el precio del servicio?
   ❓ ¿Cómo se calcula la "Tasa Inspec. Vet." y "Arancel IPCVA"?
   ❓ ¿El precio por kg de servicio varía por cliente o es fijo?

E. SOBRE PRODUCTOS Y DESPOSTE:
   ❓ ¿Cómo se relacionan los artículos (.001 lomo, .002 bife, etc.) con las medias res?
   ❓ ¿El desposte se hace en el mismo frigorífico o se envía a otro lado?
   ❓ ¿Qué es "TARA" en el formulario de productos?

F. SOBRE DATOS FALTANTES:
   ❓ ¿Tienen un listado de razas completo? (faltan algunas abreviaturas)
   ❓ ¿El Nº SENASA 3986 es del establecimiento o del productor?
   ❓ ¿La Matrícula 300 es de Solemar o es un código de SENASA?

================================================================================
3. PROPUESTAS DE MEJORA:
================================================================================

A. CAPTURA DE DATOS:
   ✅ Migrar los 17 clientes del Excel a la base de datos
   ✅ Crear tabla de artículos con códigos EAN-128
   ✅ Importar historial de tropas 2026 (ya hay 88+ tropas)
   ✅ Crear tabla de razas con abreviaturas
   ✅ Precios de servicio por cliente/fecha

B. REPORTES:
   ✅ Generar "Planilla 01 - Bovino" automáticamente desde el sistema
   ✅ Reporte de romaneo con el formato del PDF (T88)
   ✅ Reporte de rinde por tropa
   ✅ Resumen mensual de faena (como en SERVICIO FAENA 2026)
   ✅ Reporte de facturación pendiente

C. MÓDULOS NUEVOS:
   ✅ Módulo de Rótulos/Etiquetas:
      - Generar código EAN-128 automáticamente
      - Imprimir en formatos definidos
      - Multi-idioma (Español, Inglés, Italiano)
      - Vista previa antes de imprimir
   
   ✅ Módulo de Rendering:
      - Control de desperdicios
      - Venta de hueso, grasa, cueros
      - Facturación automática
   
   ✅ Módulo de Menudencias:
      - Compra/venta de achuras
      - Control de decomisos
      - Lavadito

D. INTEGRACIONES:
   ✅ Exportación a AFIP (facturación electrónica)
   ✅ Exportación a SENASA (trazabilidad)
   ✅ Integración con balanza (ya implementado WebSocket)
   ✅ Impresión térmica de rótulos (ZPL)

E. MEJORAS TÉCNICAS:
   ✅ PWA para funcionamiento offline
   ✅ Sincronización cuando hay conexión
   ✅ Backup automático de datos
   ✅ Auditoría de cambios (quién modificó qué y cuándo)

================================================================================
4. DATOS A CAPTURAR Y REPORTES A ARMAR:
================================================================================

DATOS A CAPTURAR (listos para implementar):
1. Clientes (17 registros) - CUIT, razón social, contacto
2. Artículos (108 productos) - códigos EAN, nombres, tipos
3. Tropas históricas - desde enero 2026
4. Servicios de faena - facturación por tropa
5. Rindes por tropa y por animal
6. Razas de ganado

REPORTES A GENERAR:
1. Planilla 01 - Ingreso de Hacienda (formato oficial)
2. Romaneo por tropa (formato PDF T88)
3. Rinde de faena por tropa
4. Facturación de servicio de faena
5. Resumen mensual de operaciones
6. Control de menudencias
7. Control de cueros
8. Rendering (desperdicios)
9. Mercado interno (ventas)
10. Códigos de rótulos EAN-128

================================================================================
FILES ANALYZED:
- upload/CODIGO.xlsx (108 artículos, códigos EAN-128)
- upload/ROMANEO VACUNO T88.pdf (reporte real)
- upload/ROMANEO VACUNO T61 06022026.pdf.xlsx (datos exportados)
- upload/PRESENTACION ROTULOS DEFINITIVO.pdf (diseño rótulos)
- upload/CUIT DE USUARIOS + DATOS.xlsx (17 clientes)
- upload/Planilla 01 - Bovino.xlsx (formulario oficial)
- upload/SERVICIO FAENA BOVINO 2026.xlsx (448+ registros)
- upload/WhatsApp Image (interfaz productos actual)
- upload/RINDE FAENA BOVINO - copia.xlsx (rindes por tropa)

---
Task ID: 21
Agent: main
Task: Cargar datos reales del cliente - clientes, códigos EAN-128, artículos

Work Log:
- Creado script seed-datos-reales.ts con datos extraídos de los archivos Excel
- Cargados 19 clientes reales del archivo CUIT DE USUARIOS + DATOS.xlsx
- Cargados 42 artículos/cortes del archivo CODIGO.xlsx
- Cargadas tablas de códigos EAN-128:
  - 6 códigos de especie
  - 9 códigos de transporte
  - 12 códigos de destino
  - 7 códigos de tipo trabajo
  - 24 códigos de tipificación
- Configuración del frigorífico: Matrícula 300, SENASA 3986

Stage Summary:
DATOS CARGADOS A LA BASE DE DATOS:

CLIENTES (19 reales):
- DOS DE FIERRO SA (30715475533)
- FERREYRA MARTIN RUBEN (23335321359)
- MUCA SAS (30716490323)
- FRIGORIFICO DE LA PATAGONIA SRL (30718653467)
- GANADERA NORTE NEUQUINO SAS (30716426757)
- BOSQUE AMADO S.R.L (30707770690)
- Y 13 más...

ARTÍCULOS/CORTES (42):
- 000: TOTAL
- 001: Lomo
- 002: Bife Angosto
- 003: Cuadril
- 004: Nalga de Adentro
- ... hasta 041: Cuarto Trasero

CÓDIGOS EAN-128:
- Especie: 0=Todas, 1=Equino, 2=Caballo, etc.
- Transporte: 0=No definido, 1=BARCO enfriado, etc.
- Destino: .00=Cualquiera, .01=Italia, .02=Francia, .16=Mercado Interno
- Tipo Trabajo: 0=Ninguna, 2=T/lama, 4=T/jaslo, etc.
- Tipificación: .02=M, .03=A, .04=S, .07=AG, .08=AS, etc.

ACLARACIONES RECIBIDAS:
- "D" en dentición = Dientes (0D, 2D, 4D, 6D, 8D)
- AG/AS = Tipificaciones específicas SOLO del equino
- IN = Tipificación I+N combinada para equino
- LAND L = Otro frigorífico, marca equinos de allí
- Código 16 = Mercado Interno
- Nº Garrón = Predefinido (1 a N) según lista de faena
- Animales decomisados = Se registran con kg 0 o parcial
- Recupero = Precio diferenciado del servicio

FILES CREATED:
- /prisma/seed-datos-reales.ts

PENDIENTE:
- Importar historial de tropas 2026 del Excel SERVICIO FAENA BOVINO 2026.xlsx
- Generar reportes: Planilla 01, Romaneo PDF, Rinde por tropa
- Módulo de Rótulos/Etiquetas con código de barras EAN-128
