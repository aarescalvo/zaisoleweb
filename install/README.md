# 📦 ARCHIVOS DE INSTALACIÓN - SOLEMAR ALIMENTARIA

## Estructura de Carpetas

```
install/
├── server/                    ← Archivos para el SERVIDOR
│   ├── install-server.bat     ← Instalador principal del servidor
│   ├── start-server.bat       ← Script de inicio del servidor
│   ├── stop-server.bat        ← Script para detener el servidor
│   ├── backup.bat             ← Script de backup manual
│   └── update.bat             ← Script de actualización
│
├── client/                    ← Archivos para PUESTOS CLIENTE
│   └── install-client.bat     ← Configurador de acceso cliente
│
├── INSTALL.md                 ← Guía completa de instalación
└── README.md                  ← Este archivo
```

---

## 🚀 Instalación Rápida

### SERVIDOR

1. **Ejecutar como Administrador:**
   ```
   server\install-server.bat
   ```

2. **Copiar la aplicación** a `C:\SolemarAlimentaria\app\`

3. **Iniciar el servidor:**
   ```
   C:\SolemarAlimentaria\start-server.bat
   ```

### CLIENTES

1. **Ejecutar en cada PC:**
   ```
   client\install-client.bat
   ```

2. **Ingresar IP del servidor:** `192.168.1.100`

---

## 📋 Checklist de Instalación

### Servidor
- [ ] Windows 10/11 configurado con IP fija
- [ ] Ejecutado `install-server.bat` como administrador
- [ ] Copiada la carpeta `app` con el código fuente
- [ ] Verificado acceso desde navegador: `http://localhost:3000`
- [ ] Configurado backup automático (verificar tarea programada)

### Clientes
- [ ] Conectados a la misma red que el servidor
- [ ] Ejecutado `install-client.bat` en cada puesto
- [ ] Verificado acceso: `http://192.168.1.100:3000`
- [ ] Configurado cada puesto según su función:
  - [ ] Puesto 1: Balanza Camiones
  - [ ] Puesto 2: Pesaje Individual
  - [ ] Puesto 3: Ingreso Cajón
  - [ ] Puesto 4: Romaneo
  - [ ] Puestos 5-8: Oficina

### Hardware
- [ ] Balanzas conectadas y configuradas (puertos COM)
- [ ] Impresoras configuradas en Windows
- [ ] Configuradas en el sistema (Configuración → Balanzas/Impresoras)

---

## 🔧 Comandos Útiles

### Verificar IP del servidor
```cmd
ipconfig
```

### Verificar puerto 3000
```cmd
netstat -ano | findstr :3000
```

### Ver tareas programadas
```cmd
schtasks /query /tn "SolemarAlimentaria"
schtasks /query /tn "SolemarAlimentaria_Backup"
```

### Restaurar backup
```cmd
copy C:\SolemarAlimentaria\backups\backup_xxxxx.db C:\SolemarAlimentaria\app\db\custom.db
```

---

## ⚠️ Importante

- **NO MODIFICAR** la carpeta `app` manualmente
- **USAR** `update.bat` para actualizaciones
- **RESPALDAR** antes de cualquier cambio importante
- **NO CERRAR** la ventana del servidor

---

*Para más detalles, consultar `INSTALL.md`*
