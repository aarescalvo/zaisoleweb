@echo off
chcp 65001 >nul
title SOLEMAR ALIMENTARIA - Configuración Completa de Puesto
color 0A

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║      SOLEMAR ALIMENTARIA - CONFIGURACIÓN DE PUESTO COMPLETA   ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set "CONFIG_DIR=C:\SolemarAlimentaria"
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

echo Este asistente configurará COMPLETAMENTE el puesto de trabajo.
echo.

:: Seleccionar puesto
echo ════════════════════════════════════════════════════════════════
echo   SELECCIONE EL PUESTO DE TRABAJO
echo ════════════════════════════════════════════════════════════════
echo.
echo   ZONA PLANTA:
echo   ───────────────────────────────────────────────────────────────
echo   1. Balanza de Camiones     → Pesaje de ingresos/egresos
echo   2. Pesaje Individual       → Pesaje animal por animal
echo   3. Ingreso a Cajón         → Registro de medias en cámaras
echo   4. Romaneo / Playa         → Pesaje y clasificación de medias
echo.
echo   ZONA OFICINA:
echo   ───────────────────────────────────────────────────────────────
echo   5. Facturación             → Emisión de facturas
echo   6. Configuración           → Administración del sistema
echo   7. Supervisión             → Control y auditoría
echo   8. Reportes                → Generación de informes
echo.
set /p PUESTO="Número de puesto (1-8): "

:: Configurar según puesto
if "%PUESTO%"=="1" goto :puesto1
if "%PUESTO%"=="2" goto :puesto2
if "%PUESTO%"=="3" goto :puesto3
if "%PUESTO%"=="4" goto :puesto4
if "%PUESTO%"=="5" goto :puesto5
if "%PUESTO%"=="6" goto :puesto6
if "%PUESTO%"=="7" goto :puesto7
if "%PUESTO%"=="8" goto :puesto8

echo [ERROR] Opción inválida
pause
exit /b 1

:puesto1
set "PUESTO_NOMBRE=Balanza de Camiones"
set "MODULOS=pesajeCamiones"
set "NECESITA_BALANZA=S"
set "TIPO_BALANZA=CAMIONES"
set "NECESITA_IMPRESORA=S"
set "TIPO_IMPRESORA=TICKETS"
goto :configurar

:puesto2
set "PUESTO_NOMBRE=Pesaje Individual"
set "MODULOS=pesajeIndividual"
set "NECESITA_BALANZA=S"
set "TIPO_BALANZA=INDIVIDUAL"
set "NECESITA_IMPRESORA=N"
goto :configurar

:puesto3
set "PUESTO_NOMBRE=Ingreso a Cajón"
set "MODULOS=ingresoCajon"
set "NECESITA_BALANZA=N"
set "NECESITA_IMPRESORA=N"
goto :configurar

:puesto4
set "PUESTO_NOMBRE=Romaneo / Playa"
set "MODULOS=romaneo"
set "NECESITA_BALANZA=S"
set "TIPO_BALANZA=ROMANEO"
set "NECESITA_IMPRESORA=S"
set "TIPO_IMPRESORA=ROTULOS"
goto :configurar

:puesto5
set "PUESTO_NOMBRE=Facturación"
set "MODULOS=facturacion"
set "NECESITA_BALANZA=N"
set "NECESITA_IMPRESORA=S"
set "TIPO_IMPRESORA=FACTURAS"
goto :configurar

:puesto6
set "PUESTO_NOMBRE=Configuración"
set "MODULOS=configuracion"
set "NECESITA_BALANZA=N"
set "NECESITA_IMPRESORA=N"
goto :configurar

:puesto7
set "PUESTO_NOMBRE=Supervisión"
set "MODULOS=dashboard,reportes,auditoria"
set "NECESITA_BALANZA=N"
set "NECESITA_IMPRESORA=N"
goto :configurar

:puesto8
set "PUESTO_NOMBRE=Reportes"
set "MODULOS=reportes"
set "NECESITA_BALANZA=N"
set "NECESITA_IMPRESORA=S"
set "TIPO_IMPRESORA=REPORTES"
goto :configurar

:configurar
echo.
echo ════════════════════════════════════════════════════════════════
echo   CONFIGURANDO: %PUESTO_NOMBRE%
echo ════════════════════════════════════════════════════════════════
echo.

:: Paso 1: Servidor
echo [1/4] Configurando acceso al servidor...
echo.
set /p SERVER_IP="IP del servidor (ej: 192.168.1.100): "

if "%SERVER_IP%"=="" (
    echo [ERROR] Debe ingresar la IP del servidor
    pause
    exit /b 1
)

:: Crear configuración de servidor
echo {"serverIp":"%SERVER_IP%","port":3000} > "%CONFIG_DIR%\config.json"

:: Crear acceso directo
set "DESKTOP=%USERPROFILE%\Desktop"
echo Set WshShell = WScript.CreateObject("WScript.Shell") > "%TEMP%\shortcut.vbs"
echo Set oUrlLink = WshShell.CreateShortcut("%DESKTOP%\Solemar Alimentaria.lnk") >> "%TEMP%\shortcut.vbs"
echo oUrlLink.TargetPath = "http://%SERVER_IP%:3000" >> "%TEMP%\shortcut.vbs"
echo oUrlLink.IconLocation = "shell32.dll,14" >> "%TEMP%\shortcut.vbs"
echo oUrlLink.Description = "%PUESTO_NOMBRE%" >> "%TEMP%\shortcut.vbs"
echo oUrlLink.Save >> "%TEMP%\shortcut.vbs"
cscript //nologo "%TEMP%\shortcut.vbs"
del "%TEMP%\shortcut.vbs"

echo [OK] Acceso al servidor configurado

:: Paso 2: Balanza (si corresponde)
echo.
if "%NECESITA_BALANZA%"=="S" (
    echo [2/4] Configurando balanza (%TIPO_BALANZA%)...
    echo.
    echo Puertos COM disponibles:
    mode | findstr "COM"
    echo.
    set /p BALANZA_PUERTO="Puerto COM de la balanza: "
    set /p BALANZA_BAUDIOS="Baudios [9600]: "
    if "!BALANZA_BAUDIOS!"=="" set "BALANZA_BAUDIOS=9600"
    
    echo { > "%CONFIG_DIR%\balanza.json"
    echo   "puesto": "%PUESTO_NOMBRE%", >> "%CONFIG_DIR%\balanza.json"
    echo   "tipo": "%TIPO_BALANZA%", >> "%CONFIG_DIR%\balanza.json"
    echo   "puerto": "!BALANZA_PUERTO!", >> "%CONFIG_DIR%\balanza.json"
    echo   "baudios": !BALANZA_BAUDIOS! >> "%CONFIG_DIR%\balanza.json"
    echo } >> "%CONFIG_DIR%\balanza.json"
    
    echo [OK] Balanza configurada: !BALANZA_PUERTO! a !BALANZA_BAUDIOS! baudios
) else (
    echo [2/4] Este puesto no requiere balanza - Omitiendo
)

:: Paso 3: Impresora (si corresponde)
echo.
if "%NECESITA_IMPRESORA%"=="S" (
    echo [3/4] Configurando impresora (%TIPO_IMPRESORA%)...
    echo.
    echo Impresoras disponibles:
    wmic printer get name,default
    echo.
    set /p IMPRESORA_NOMBRE="Nombre de la impresora: "
    
    echo { > "%CONFIG_DIR%\impresora.json"
    echo   "puesto": "%PUESTO_NOMBRE%", >> "%CONFIG_DIR%\impresora.json"
    echo   "tipo": "%TIPO_IMPRESORA%", >> "%CONFIG_DIR%\impresora.json"
    echo   "nombre": "!IMPRESORA_NOMBRE!" >> "%CONFIG_DIR%\impresora.json"
    echo } >> "%CONFIG_DIR%\impresora.json"
    
    echo [OK] Impresora configurada: !IMPRESORA_NOMBRE!
) else (
    echo [3/4] Este puesto no requiere impresora - Omitiendo
)

:: Paso 4: Guardar configuración del puesto
echo.
echo [4/4] Guardando configuración del puesto...

echo { > "%CONFIG_DIR%\puesto.json"
echo   "numero": %PUESTO%, >> "%CONFIG_DIR%\puesto.json"
echo   "nombre": "%PUESTO_NOMBRE%", >> "%CONFIG_DIR%\puesto.json"
echo   "modulos": "%MODULOS%", >> "%CONFIG_DIR%\puesto.json"
echo   "necesitaBalanza": "%NECESITA_BALANZA%", >> "%CONFIG_DIR%\puesto.json"
echo   "necesitaImpresora": "%NECESITA_IMPRESORA%", >> "%CONFIG_DIR%\puesto.json"
echo   "servidorIp": "%SERVER_IP%", >> "%CONFIG_DIR%\puesto.json"
echo   "fechaConfiguracion": "%date% %time%" >> "%CONFIG_DIR%\puesto.json"
echo } >> "%CONFIG_DIR%\puesto.json"

echo [OK] Configuración guardada

:: Resumen final
echo.
echo ════════════════════════════════════════════════════════════════
echo   CONFIGURACIÓN COMPLETADA
echo ════════════════════════════════════════════════════════════════
echo.
echo   Puesto:           %PUESTO_NOMBRE%
echo   Servidor:         http://%SERVER_IP%:3000
echo   Módulos:          %MODULOS%
if "%NECESITA_BALANZA%"=="S" (
    echo   Balanza:          !BALANZA_PUERTO! (!TIPO_BALANZA!)
)
if "%NECESITA_IMPRESORA%"=="S" (
    echo   Impresora:        !IMPRESORA_NOMBRE! (!TIPO_IMPRESORA!)
)
echo.
echo   Archivos de configuración guardados en:
echo   %CONFIG_DIR%
echo.

:: Probar conexión
set /p TEST_CONN="¿Desea abrir el sistema ahora? (S/N): "
if /i "%TEST_CONN%"=="S" (
    start http://%SERVER_IP%:3000
)

echo.
echo ════════════════════════════════════════════════════════════════
echo   PRÓXIMOS PASOS
echo ════════════════════════════════════════════════════════════════
echo.
echo   1. Verifique que el sistema se abre correctamente
echo   2. Inicie sesión con su usuario y contraseña
echo   3. Si tiene balanza, configure en el sistema:
echo      Configuración → Balanzas → Crear con estos datos
echo   4. Si tiene impresora, configure en el sistema:
echo      Configuración → Impresoras → Crear con estos datos
echo.
pause
