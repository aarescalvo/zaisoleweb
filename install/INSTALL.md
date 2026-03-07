# 📖 GUÍA DE INSTALACIÓN - SOLEMAR ALIMENTARIA

## Sistema de Gestión Frigorífica

---

## 📋 REQUISITOS DEL SISTEMA

### Servidor
| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| Sistema Operativo | Windows 10 | Windows 10/11 Pro |
| Procesador | Intel i3 / AMD Ryzen 3 | Intel i5 / AMD Ryzen 5 |
| Memoria RAM | 4 GB | 8 GB |
| Disco Duro | 20 GB | 50 GB SSD |
| Red | Tarjeta de red 100Mbps | Gigabit Ethernet |

### Clientes
| Requisito | Mínimo |
|-----------|--------|
| Sistema Operativo | Windows 10/11 |
| Navegador | Chrome, Edge, Firefox |
| Red | Conexión a LAN |

---

## 🌐 ARQUITECTURA DE RED

```
┌─────────────────────────────────────────────────────────────────┐
│                         SWITCH DE RED                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   SERVIDOR    │    │  PUESTOS LAN  │    │  PUESTOS LAN  │
│ 192.168.1.100 │    │  .101 - .108  │    │   (futuros)   │
│  Puerto 3000  │    │               │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 🚀 INSTALACIÓN DEL SERVIDOR

### Paso 1: Preparar el Servidor

1. **Configurar IP fija**:
   - Panel de Control → Red e Internet → Centro de redes y recursos compartidos
   - Cambiar configuración del adaptador → Propiedades → IPv4
   - Configurar:
     ```
     IP: 192.168.1.100
     Máscara: 255.255.255.0
     Gateway: 192.168.1.1
     DNS: 8.8.8.8
     ```

2. **Desactivar suspensión**:
   - Panel de Control → Opciones de energía
   - Configurar: "Nunca suspender"

### Paso 2: Ejecutar el Instalador

1. Copie la carpeta `install` al servidor
2. Ejecutar como **Administrador**: `install-server.bat`
3. Seguir las instrucciones en pantalla

### Paso 3: Copiar la Aplicación

1. Copie toda la carpeta del proyecto a:
   ```
   C:\SolemarAlimentaria\app\
   ```

2. La estructura debe ser:
   ```
   C:\SolemarAlimentaria\
   ├── app\                    ← Código de la aplicación
   │   ├── src\
   │   ├── prisma\
   │   ├── db\
   │   │   └── custom.db       ← Base de datos
   │   └── package.json
   ├── backups\                ← Backups automáticos
   ├── logs\                   ← Logs del servidor
   ├── config.json             ← Configuración
   ├── start-server.bat        ← Iniciar servidor
   ├── stop-server.bat         ← Detener servidor
   └── backup.bat              ← Backup manual
   ```

### Paso 4: Iniciar el Servidor

1. Doble clic en **"Solemar Servidor"** en el escritorio
2. O ejecutar: `C:\SolemarAlimentaria\start-server.bat`

---

## 💻 CONFIGURACIÓN DE PUESTOS CLIENTE

### Para cada puesto de trabajo:

1. Copiar `install/client/install-client.bat` a la PC
2. Ejecutar el script
3. Ingresar la IP del servidor: `192.168.1.100`
4. Se creará un acceso directo en el escritorio

### Acceso desde el navegador:
```
http://192.168.1.100:3000
```

---

## 🔄 RESPALDOS (BACKUPS)

### Automáticos
- Se ejecutan todos los días a las **23:00 hs**
- Se guardan en: `C:\SolemarAlimentaria\backups\`
- Se conservan los últimos **30 días**

### Manual
- Ejecutar: `C:\SolemarAlimentaria\backup.bat`
- O usar el acceso directo "Solemar Backup Manual"

### Restaurar un Backup
1. Detener el servidor
2. Copiar el archivo de backup a:
   ```
   C:\SolemarAlimentaria\app\db\custom.db
   ```
3. Iniciar el servidor

---

## 📝 PUESTOS DE TRABAJO CONFIGURADOS

| Puesto | Ubicación | Módulos Principales | Hardware |
|--------|-----------|---------------------|----------|
| **Puesto 1** | Balanza Camiones | Pesaje Camiones | Balanza + Impresora |
| **Puesto 2** | Pesaje Individual | Pesaje Individual | Balanza |
| **Puesto 3** | Ingreso Cajón | Ingreso a Cajón | - |
| **Puesto 4** | Romaneo | Romaneo | Balanza + Impresora rótulos |
| **Puesto 5** | Oficina | Facturación | Impresora |
| **Puesto 6** | Oficina | Configuración | - |
| **Puesto 7** | Oficina | Supervisión | - |
| **Puesto 8** | Oficina | Reportes | - |

---

## ⚙️ CONFIGURACIÓN DE BALANZAS

### En el Sistema (Configuración → Balanzas)

| Puesto | Puerto COM | Baudios | Uso |
|--------|------------|---------|-----|
| Balanza Camiones | COM1 | 9600 | CAMIONES |
| Pesaje Individual | COM2 | 9600 | INDIVIDUAL |
| Romaneo | COM3 | 9600 | ROMANEO |

### Verificar puertos COM en Windows:
1. Administrador de dispositivos → Puertos (COM y LPT)
2. Conectar la balanza y verificar qué puerto aparece

---

## 🖨️ CONFIGURACIÓN DE IMPRESORAS

### En el Sistema (Configuración → Impresoras)

| Puesto | Tipo | Uso | Etiqueta |
|--------|------|-----|----------|
| Balanza Camiones | Térmica Ticket | TICKETS | 80x50mm |
| Romaneo | Térmica Etiquetas | ROTULOS | 100x50mm |
| Oficina | Laser/Inyección | FACTURAS | A4 |

---

## 🔧 MANTENIMIENTO

### Diario
- [ ] Verificar que el servidor esté funcionando
- [ ] Revisar que los backups se generaron

### Semanal
- [ ] Verificar espacio en disco del servidor
- [ ] Revisar logs de errores

### Mensual
- [ ] Limpiar backups antiguos (automático)
- [ ] Verificar integridad de base de datos
- [ ] Actualizar sistema si hay nuevas versiones

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### El servidor no inicia
1. Verificar que el puerto 3000 no esté ocupado
2. Revisar logs en: `C:\SolemarAlimentaria\logs\`
3. Verificar que existe: `C:\SolemarAlimentaria\app\package.json`

### Los clientes no pueden conectar
1. Verificar IP del servidor: `ipconfig`
2. Verificar firewall: permitir puerto 3000
3. Probar ping: `ping 192.168.1.100`

### La balanza no lee peso
1. Verificar conexión del cable RS232
2. Verificar puerto COM en Administrador de dispositivos
3. Verificar configuración de baudios

### La base de datos está corrupta
1. Detener el servidor
2. Restaurar backup más reciente
3. Iniciar el servidor

---

## 📞 SOPORTE TÉCNICO

**Sistema desarrollado por:** Z.ai Code
**Documentación:** `/install/INSTALL.md`
**Repositorio:** https://github.com/aarescalvo/zaisoleweb

---

*Última actualización: Marzo 2026*
