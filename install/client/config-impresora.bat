@echo off
chcp 65001 >nul
title SOLEMAR ALIMENTARIA - Configuración de Impresoras
color 0B

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║        SOLEMAR ALIMENTARIA - CONFIGURACIÓN DE IMPRESORAS       ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set "CONFIG_DIR=C:\SolemarAlimentaria"
set "CONFIG_FILE=%CONFIG_DIR%\impresoras.json"

:: Crear directorio si no existe
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

echo Este asistente configurará las impresoras para este puesto.
echo.
echo ════════════════════════════════════════════════════════════════
echo   PUESTOS CON IMPRESORAS
echo ════════════════════════════════════════════════════════════════
echo.
echo   1. Balanza de Camiones    → Tickets de pesaje
echo   2. Romaneo / Playa        → Rótulos de medias res
echo   3. Oficina (Facturación)  → Facturas y remitos
echo   4. Oficina (Reportes)     → Reportes generales
echo.
set /p PUESTO="Seleccione el número de puesto: "

:: Mapear puesto a uso
if "%PUESTO%"=="1" set "USO=TICKETS" & set "PUESTO_NOMBRE=Balanza de Camiones" & set "TIPO_DEF=TERMICA_TICKET"
if "%PUESTO%"=="2" set "USO=ROTULOS" & set "PUESTO_NOMBRE=Romaneo / Playa" & set "TIPO_DEF=TERMICA"
if "%PUESTO%"=="3" set "USO=FACTURAS" & set "PUESTO_NOMBRE=Oficina Facturación" & set "TIPO_DEF=LASER"
if "%PUESTO%"=="4" set "USO=REPORTES" & set "PUESTO_NOMBRE=Oficina Reportes" & set "TIPO_DEF=LASER"

if "%USO%"=="" (
    echo [ERROR] Opción inválida
    pause
    exit /b 1
)

echo.
echo [INFO] Configurando impresora para: %PUESTO_NOMBRE%
echo.

:: Listar impresoras disponibles
echo ════════════════════════════════════════════════════════════════
echo   IMPRESORAS DISPONIBLES EN WINDOWS
echo ════════════════════════════════════════════════════════════════
echo.
wmic printer get name,default
echo.

set /p IMPRESORA_NOMBRE="Nombre exacto de la impresora: "
if "%IMPRESORA_NOMBRE%"=="" (
    echo [ERROR] Debe ingresar el nombre de la impresora
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo   TIPO DE IMPRESORA
echo ════════════════════════════════════════════════════════════════
echo.
echo   1. Térmica de Etiquetas   (Zebra, Datamax, Sato...)
echo   2. Térmica de Tickets     (Epson, Star...)
echo   3. Inyección de Tinta     (HP, Canon, Epson...)
echo   4. Láser                  (HP, Brother, Samsung...)
echo   5. Matricial              (Epson FX/LX...)
echo.
set /p TIPO_NUM="Seleccione el tipo (1-5): "

if "%TIPO_NUM%"=="1" set "TIPO=TERMICA"
if "%TIPO_NUM%"=="2" set "TIPO=TERMICA_TICKET"
if "%TIPO_NUM%"=="3" set "TIPO=INYECCION"
if "%TIPO_NUM%"=="4" set "TIPO=LASER"
if "%TIPO_NUM%"=="5" set "TIPO=MATRICIAL"

if "%TIPO%"=="" set "TIPO=%TIPO_DEF%"

echo.
echo ════════════════════════════════════════════════════════════════
echo   CONFIGURACIÓN DE ETIQUETA (para térmicas)
echo ════════════════════════════════════════════════════════════════
echo.

set "ANCHO=100"
set "ALTO=50"
set "DPI=203"
set "MARGEN_SUP=2"
set "MARGEN_IZQ=2"
set "VELOCIDAD=2"
set "DENSIDAD=8"

if "%TIPO%"=="TERMICA" (
    echo Configuración de etiqueta para rótulos:
    set "ANCHO=100"
    set "ALTO=50"
    set /p ANCHO="Ancho de etiqueta en mm [100]: "
    set /p ALTO="Alto de etiqueta en mm [50]: "
    echo.
    echo DPI disponibles: 203, 300, 600
    set /p DPI="DPI de la impresora [203]: "
    set /p MARGEN_SUP="Margen superior mm [2]: "
    set /p MARGEN_IZQ="Margen izquierdo mm [2]: "
    set /p VELOCIDAD="Velocidad pulg/seg [2]: "
    set /p DENSIDAD="Densidad/oscuridad [8]: "
)

if "%TIPO%"=="TERMICA_TICKET" (
    echo Configuración para tickets:
    set "ANCHO=80"
    set "ALTO=0"
    set /p ANCHO="Ancho de ticket en mm [80]: "
)

:: Establecer como impresora por defecto para este uso
set "POR_DEFECTO=true"
set /p SET_DEFAULT="¿Establecer como impresora por defecto para este uso? (S/N) [S]: "
if /i "%SET_DEFAULT%"=="N" set "POR_DEFECTO=false"

:: Crear archivo de configuración JSON
echo { > "%CONFIG_FILE%"
echo   "puesto": "%PUESTO_NOMBRE%", >> "%CONFIG_FILE%"
echo   "uso": "%USO%", >> "%CONFIG_FILE%"
echo   "nombreImpresora": "%IMPRESORA_NOMBRE%", >> "%CONFIG_FILE%"
echo   "tipo": "%TIPO%", >> "%CONFIG_FILE%"
echo   "anchoEtiqueta": %ANCHO%, >> "%CONFIG_FILE%"
echo   "altoEtiqueta": %ALTO%, >> "%CONFIG_FILE%"
echo   "dpi": %DPI%, >> "%CONFIG_FILE%"
echo   "margenSuperior": %MARGEN_SUP%, >> "%CONFIG_FILE%"
echo   "margenIzquierdo": %MARGEN_IZQ%, >> "%CONFIG_FILE%"
echo   "velocidad": %VELOCIDAD%, >> "%CONFIG_FILE%"
echo   "densidad": %DENSIDAD%, >> "%CONFIG_FILE%"
echo   "porDefecto": %POR_DEFECTO%, >> "%CONFIG_FILE%"
echo   "fechaConfiguracion": "%date% %time%" >> "%CONFIG_FILE%"
echo } >> "%CONFIG_FILE%"

echo.
echo ════════════════════════════════════════════════════════════════
echo   CONFIGURACIÓN GUARDADA
echo ════════════════════════════════════════════════════════════════
echo.
echo   Puesto:           %PUESTO_NOMBRE%
echo   Impresora:        %IMPRESORA_NOMBRE%
echo   Tipo:             %TIPO%
echo   Uso:              %USO%
if "%TIPO%"=="TERMICA" (
    echo   Etiqueta:         %ANCHO% x %ALTO% mm
    echo   DPI:              %DPI%
    echo   Margen Sup:       %MARGEN_SUP% mm
    echo   Margen Izq:       %MARGEN_IZQ% mm
)
echo   Por defecto:      %POR_DEFECTO%
echo.
echo   Archivo: %CONFIG_FILE%
echo.

:: Preguntar si desea imprimir prueba
set /p TEST_PRINT="¿Desea imprimir una página de prueba? (S/N): "
if /i "%TEST_PRINT%"=="S" (
    echo.
    echo [INFO] Enviando página de prueba a %IMPRESORA_NOMBRE%...
    rundll32 printui.dll,PrintUIEntry /k /n "%IMPRESORA_NOMBRE%"
)

echo.
echo ════════════════════════════════════════════════════════════════
echo   PRÓXIMOS PASOS
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. Esta configuración se guardó localmente
echo 2. Al acceder al sistema web, vaya a:
echo    Configuración → Impresoras
echo 3. Cree una nueva impresora con estos datos
echo.
pause
