@echo off
chcp 65001 >nul
title SOLEMAR ALIMENTARIA - Configuración de Balanzas
color 0B

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║         SOLEMAR ALIMENTARIA - CONFIGURACIÓN DE BALANZAS        ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set "CONFIG_DIR=C:\SolemarAlimentaria"
set "CONFIG_FILE=%CONFIG_DIR%\balanzas.json"

:: Crear directorio si no existe
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"

echo Este asistente configurará las balanzas para este puesto.
echo.
echo ════════════════════════════════════════════════════════════════
echo   PUESTOS DE TRABAJO DISPONIBLES
echo ════════════════════════════════════════════════════════════════
echo.
echo   1. Balanza de Camiones    (Puesto 1)
echo   2. Pesaje Individual      (Puesto 2)
echo   3. Romaneo / Playa        (Puesto 4)
echo   4. Menudencias            (Puesto adicional)
echo.
set /p PUESTO="Seleccione el número de puesto: "

:: Mapear puesto a uso
if "%PUESTO%"=="1" set "USO=CAMIONES" & set "PUESTO_NOMBRE=Balanza de Camiones"
if "%PUESTO%"=="2" set "USO=INDIVIDUAL" & set "PUESTO_NOMBRE=Pesaje Individual"
if "%PUESTO%"=="3" set "USO=ROMANEO" & set "PUESTO_NOMBRE=Romaneo / Playa"
if "%PUESTO%"=="4" set "USO=MENUDENCIAS" & set "PUESTO_NOMBRE=Menudencias"

if "%USO%"=="" (
    echo [ERROR] Opción inválida
    pause
    exit /b 1
)

echo.
echo [INFO] Configurando balanza para: %PUESTO_NOMBRE%
echo.

:: Detectar puertos COM disponibles
echo ════════════════════════════════════════════════════════════════
echo   PUERTOS COM DISPONIBLES
echo ════════════════════════════════════════════════════════════════
echo.
mode | findstr "COM"
echo.

set /p PUERTO="Ingrese el puerto COM (ej: COM1, COM3): "
if "%PUERTO%"=="" (
    echo [ERROR] Debe ingresar un puerto COM
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════════
echo   CONFIGURACIÓN DE COMUNICACIÓN
echo ════════════════════════════════════════════════════════════════
echo.

:: Valores por defecto
set "BAUDIOS=9600"
set "DATABITS=8"
set "STOPBITS=1"
set "PARIDAD=none"
set "PROTOCOLO=CONTINUO"
set "DECIMALES=1"
set "ESTABILIDAD=2000"

echo Configuración estándar para la mayoría de balanzas:
echo   - Baudios: 9600
echo   - Data Bits: 8
echo   - Stop Bits: 1
echo   - Paridad: Ninguna
echo   - Protocolo: Continuo
echo.
set /p USE_DEFAULT="¿Usar configuración estándar? (S/N): "

if /i not "%USE_DEFAULT%"=="S" (
    echo.
    set /p BAUDIOS="Baudios (1200/2400/4800/9600/19200) [9600]: "
    set /p DATABITS="Data Bits (7/8) [8]: "
    set /p STOPBITS="Stop Bits (1/2) [1]: "
    echo.
    echo Paridad: none, even, odd
    set /p PARIDAD="Paridad [none]: "
    echo.
    echo Protocolo: CONTINUO, BAJO_DEMANDA
    set /p PROTOCOLO="Protocolo [CONTINUO]: "
    set /p DECIMALES="Decimales (0-3) [1]: "
    set /p ESTABILIDAD="Tiempo estabilidad ms [2000]: "
)

:: Asignar valores por defecto si están vacíos
if "%BAUDIOS%"=="" set "BAUDIOS=9600"
if "%DATABITS%"=="" set "DATABITS=8"
if "%STOPBITS%"=="" set "STOPBITS=1"
if "%PARIDAD%"=="" set "PARIDAD=none"
if "%PROTOCOLO%"=="" set "PROTOCOLO=CONTINUO"
if "%DECIMALES%"=="" set "DECIMALES=1"
if "%ESTABILIDAD%"=="" set "ESTABILIDAD=2000"

:: Crear archivo de configuración JSON
echo { > "%CONFIG_FILE%"
echo   "puesto": "%PUESTO_NOMBRE%", >> "%CONFIG_FILE%"
echo   "uso": "%USO%", >> "%CONFIG_FILE%"
echo   "puerto": "%PUERTO%", >> "%CONFIG_FILE%"
echo   "baudios": %BAUDIOS%, >> "%CONFIG_FILE%"
echo   "dataBits": %DATABITS%, >> "%CONFIG_FILE%"
echo   "stopBits": %STOPBITS%, >> "%CONFIG_FILE%"
echo   "paridad": "%PARIDAD%", >> "%CONFIG_FILE%"
echo   "protocolo": "%PROTOCOLO%", >> "%CONFIG_FILE%"
echo   "decimales": %DECIMALES%, >> "%CONFIG_FILE%"
echo   "tiempoEstabilidad": %ESTABILIDAD%, >> "%CONFIG_FILE%"
echo   "fechaConfiguracion": "%date% %time%" >> "%CONFIG_FILE%"
echo } >> "%CONFIG_FILE%"

echo.
echo ════════════════════════════════════════════════════════════════
echo   CONFIGURACIÓN GUARDADA
echo ════════════════════════════════════════════════════════════════
echo.
echo   Puesto:           %PUESTO_NOMBRE%
echo   Puerto:           %PUERTO%
echo   Baudios:          %BAUDIOS%
echo   Data Bits:        %DATABITS%
echo   Stop Bits:        %STOPBITS%
echo   Paridad:          %PARIDAD%
echo   Protocolo:        %PROTOCOLO%
echo   Decimales:        %DECIMALES%
echo   Estabilidad:      %ESTABILIDAD% ms
echo.
echo   Archivo: %CONFIG_FILE%
echo.

:: Preguntar si desea probar la conexión
set /p TEST_CONN="¿Desea probar la conexión con la balanza? (S/N): "
if /i "%TEST_CONN%"=="S" (
    echo.
    echo [INFO] Probando conexión con %PUERTO%...
    echo.
    mode %PUERTO%: BAUD=%BAUDIOS% PARITY=%PARIDAD% DATA=%DATABITS% STOP=%STOPBITS%
    if %errorLevel% neq 0 (
        echo [ERROR] No se pudo abrir el puerto %PUERTO%
        echo Verifique que:
        echo   1. La balanza esté conectada
        echo   2. El puerto COM sea correcto
        echo   3. No haya otra aplicación usando el puerto
    ) else (
        echo [OK] Puerto %PUERTO% configurado correctamente
    )
)

echo.
echo ════════════════════════════════════════════════════════════════
echo   PRÓXIMOS PASOS
echo ════════════════════════════════════════════════════════════════
echo.
echo 1. Esta configuración se guardó localmente
echo 2. Al acceder al sistema web, vaya a:
echo    Configuración → Balanzas
echo 3. Cree una nueva balanza con estos datos
echo.
pause
