# 📖 GUÍA COMPLETA DE INSTALACIÓN - SOLEMAR ALIMENTARIA
## Sistema de Gestión Frigorífica

---

## 📋 TABLA DE CONTENIDOS

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Arquitectura de Red](#arquitectura-de-red)
3. [Instalación del Servidor](#instalación-del-servidor)
4. [Configuración de Puestos](#configuración-de-puestos)
5. [Configuración de Balanzas](#configuración-de-balanzas)
6. [Configuración de Impresoras](#configuración-de-impresoras)
7. [Backup en la Nube](#backup-en-la-nube)
8. [Mantenimiento](#mantenimiento)
9. [Solución de Problemas](#solución-de-problemas)

---

## 📋 REQUISITOS DEL SISTEMA

### Servidor
| Requisito | Mínimo | Recomendado |
|-----------|--------|-------------|
| Sistema Operativo | Windows 10 | Windows 10/11 Pro |
| Procesador | Intel i3 / AMD Ryzen 3 | Intel i5 / AMD Ryzen 5 |
| Memoria RAM | 4 GB | 8 GB |
| Disco Duro | 20 GB | 50 GB SSD |
| Red | 100 Mbps | Gigabit Ethernet |

### Clientes
| Requisito | Mínimo |
|-----------|--------|
| Sistema Operativo | Windows 10/11 |
| Navegador | Chrome, Edge, Firefox |
| Red | Conexión a LAN |

---

## 🌐 ARQUITECTURA DE RED

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SWITCH DE RED                                   │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   SERVIDOR    │    │  PUESTOS LAN  │    │  INTERNET     │
│ 192.168.1.100 │    │  .101 - .108  │    │  (Opcional)   │
│  Puerto 3000  │    │               │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Puestos de Trabajo

| # | Puesto | Ubicación | Módulos | Hardware |
|---|--------|-----------|---------|----------|
| 1 | Balanza Camiones | Planta | Pesaje Camiones | Balanza + Impresora |
| 2 | Pesaje Individual | Planta | Pesaje Individual | Balanza |
| 3 | Ingreso Cajón | Planta | Ingreso a Cajón | - |
| 4 | Romaneo | Planta | Romaneo | Balanza + Impresora |
| 5 | Facturación | Oficina | Facturación | Impresora |
| 6 | Configuración | Oficina | Configuración | - |
| 7 | Supervisión | Oficina | Dashboard + Reportes | - |
| 8 | Reportes | Oficina | Reportes | Impresora |

---

## 🚀 INSTALACIÓN DEL SERVIDOR

### Paso 1: Preparar el Servidor

1. **Configurar IP fija**:
   ```
   Panel de Control → Red → Cambiar configuración del adaptador
   IPv4: 192.168.1.100
   Máscara: 255.255.255.0
   Gateway: 192.168.1.1
   DNS: 8.8.8.8
   ```

2. **Desactivar suspensión**:
   ```
   Panel de Control → Opciones de energía → Nunca suspender
   ```

### Paso 2: Ejecutar el Instalador

1. Ejecutar como **Administrador**: `install\server\install-server.bat`
2. Seguir las instrucciones en pantalla
3. Configurar IP del servidor

### Paso 3: Copiar la Aplicación

Estructura final:
```
C:\SolemarAlimentaria\
├── app\                    ← Código de la aplicación
│   ├── src\
│   ├── prisma\
│   ├── db\custom.db        ← Base de datos
│   └── package.json
├── backups\                ← Backups locales
├── logs\                   ← Logs del servidor
├── config.json
├── start-server.bat        ← Iniciar servidor
├── stop-server.bat         ← Detener servidor
├── backup.bat              ← Backup manual
├── cloud-backup-setup.bat  ← Configurar backup nube
└── update.bat              ← Actualizar sistema
```

---

## 💻 CONFIGURACIÓN DE PUESTOS

### Configuración Automática (Recomendado)

Ejecutar en cada PC cliente:
```
install\client\config-puesto.bat
```

Este asistente configura:
- ✅ Acceso al servidor
- ✅ Balanza (si corresponde)
- ✅ Impresora (si corresponde)
- ✅ Módulos permitidos

### Configuración Manual (Solo acceso)

Si solo necesita acceso al sistema:
```
install\client\install-client.bat
```

---

## ⚖️ CONFIGURACIÓN DE BALANZAS

### Ejecutar Configurador
```
install\client\config-balanza.bat
```

### Datos Requeridos

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Puesto | Tipo de uso | Balanza Camiones |
| Puerto COM | Puerto serial | COM3 |
| Baudios | Velocidad | 9600 |
| Data Bits | Bits de datos | 8 |
| Stop Bits | Bits de parada | 1 |
| Paridad | Paridad | none |
| Protocolo | Modo de lectura | CONTINUO |
| Decimales | Decimales del peso | 1 |

### Verificar Puertos COM

```cmd
:: Listar puertos disponibles
mode | findstr "COM"

:: O en Administrador de Dispositivos
devmgmt.msc → Puertos (COM y LPT)
```

### Configuración en el Sistema Web

Después de configurar localmente, registrar en:
```
Configuración → Balanzas → Nueva Balanza
```

### Configuraciones Típicas

| Balanza | Puerto | Baudios | Protocolo |
|---------|--------|---------|-----------|
| Toledo 9091 | COM1 | 9600 | CONTINUO |
| Mettler Toledo | COM1 | 9600 | CONTINUO |
| Avery | COM1 | 4800 | CONTINUO |
| Dini Argeo | COM3 | 9600 | BAJO_DEMANDA |

---

## 🖨️ CONFIGURACIÓN DE IMPRESORAS

### Ejecutar Configurador
```
install\client\config-impresora.bat
```

### Tipos de Impresora

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| Térmica Etiquetas | Rótulos de medias | Zebra ZT410 |
| Térmica Tickets | Tickets de pesaje | Epson TM-T20 |
| Láser | Facturas/Reportes | HP LaserJet |
| Inyección | Reportes color | Canon PIXMA |

### Configuración de Etiquetas (Rótulos)

| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Ancho | 100 mm | Ancho de etiqueta |
| Alto | 50 mm | Alto de etiqueta |
| DPI | 203 | Resolución |
| Margen Sup | 2 mm | Margen superior |
| Margen Izq | 2 mm | Margen izquierdo |

### Configuración en el Sistema Web

```
Configuración → Impresoras → Nueva Impresora
```

---

## ☁️ BACKUP EN LA NUBE

### Servicios Soportados

| Servicio | Requisito | Carpeta por defecto |
|----------|-----------|---------------------|
| Google Drive | Cliente de escritorio | `%USERPROFILE%\Google Drive` |
| OneDrive | Cliente de escritorio | `%USERPROFILE%\OneDrive` |
| Dropbox | Cliente de escritorio | `%USERPROFILE%\Dropbox` |
| Carpeta de Red | NAS/Servidor | `\\SERVIDOR\backups` |
| FTP | Servidor FTP externo | Configurable |

### Configurar Backup en la Nube

```
install\server\cloud-backup-setup.bat
```

### Frecuencias Disponibles

- Cada hora
- Cada 4 horas
- Cada 12 horas
- Diario (recomendado)
- Semanal

### Estructura de Backup

```
[Carpeta de Nube]
└── SolemarAlimentaria/
    ├── solemar_20260307_230000.db
    ├── solemar_20260306_230000.db
    ├── solemar_20260305_230000.db
    └── ... (últimos 30 días)
```

---

## 🔄 RESPALDOS (BACKUPS)

### Backup Local Automático
- **Horario**: Todos los días a las 23:00
- **Ubicación**: `C:\SolemarAlimentaria\backups\`
- **Retención**: 30 días

### Backup Manual
```
C:\SolemarAlimentaria\backup.bat
```

### Restaurar un Backup

1. Detener el servidor
2. Copiar backup a:
   ```
   C:\SolemarAlimentaria\app\db\custom.db
   ```
3. Iniciar el servidor

---

## 🔧 MANTENIMIENTO

### Diario
- [ ] Verificar que el servidor esté funcionando
- [ ] Revisar que los backups se generaron

### Semanal
- [ ] Verificar espacio en disco
- [ ] Revisar logs de errores

### Mensual
- [ ] Limpiar backups antiguos
- [ ] Verificar integridad de base de datos
- [ ] Actualizar sistema si hay nuevas versiones

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### El servidor no inicia

```cmd
:: Verificar puerto 3000
netstat -ano | findstr :3000

:: Si está ocupado, matar proceso
taskkill /F /PID [numero_proceso]

:: Revisar logs
type C:\SolemarAlimentaria\logs\server.log
```

### Los clientes no pueden conectar

```cmd
:: Verificar IP del servidor
ipconfig

:: Probar conexión
ping 192.168.1.100

:: Verificar firewall
netsh advfirewall firewall show rule name="Solemar Alimentaria - Puerto 3000"
```

### La balanza no lee peso

```cmd
:: Verificar puerto COM
mode COM3:

:: Probar comunicación
mode COM3: BAUD=9600 PARITY=N DATA=8 STOP=1
```

### La impresora no imprime

```cmd
:: Listar impresoras
wmic printer get name,default

:: Imprimir prueba
rundll32 printui.dll,PrintUIEntry /k /n "Nombre de impresora"
```

### La base de datos está corrupta

1. Detener el servidor
2. Restaurar backup más reciente
3. Si no hay backup, contactar soporte

---

## 📞 SOPORTE TÉCNICO

**Sistema:** Solemar Alimentaria - Sistema de Gestión Frigorífica  
**Repositorio:** https://github.com/aarescalvo/zaisoleweb

---

*Última actualización: Marzo 2026*
