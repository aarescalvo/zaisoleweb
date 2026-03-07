@echo off
chcp 65001 >nul
title SOLEMAR ALIMENTARIA - Backup en la Nube
color 0E

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║        SOLEMAR ALIMENTARIA - BACKUP EN LA NUBE (OPCIONAL)      ║
echo ╚════════════════════════════════════════════════════════════════╝
echo.

set "CONFIG_DIR=C:\SolemarAlimentaria"
set "CONFIG_FILE=%CONFIG_DIR%\cloud-backup.json"
set "BACKUP_DIR=%CONFIG_DIR%\backups"

:: Crear directorios si no existen
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Este asistente configurará el backup automático en la nube.
echo.
echo ════════════════════════════════════════════════════════════════
echo   SERVICIOS DE NUBE COMPATIBLES
echo ════════════════════════════════════════════════════════════════
echo.
echo   1. Google Drive     (Requiere carpeta sincronizada)
echo   2. OneDrive         (Requiere carpeta sincronizada)
echo   3. Dropbox          (Requiere carpeta sincronizada)
echo   4. Carpeta de Red   (NAS, servidor compartido)
echo   5. FTP              (Servidor FTP externo)
echo.
echo   NOTA: Para opciones 1-3, debe tener el cliente de escritorio
echo   instalado y sincronizando una carpeta.
echo.
set /p SERVICIO="Seleccione el servicio (1-5): "

:: Configurar según servicio
if "%SERVICIO%"=="1" goto :google_drive
if "%SERVICIO%"=="2" goto :onedrive
if "%SERVICIO%"=="3" goto :dropbox
if "%SERVICIO%"=="4" goto :network_folder
if "%SERVICIO%"=="5" goto :ftp_config
echo [ERROR] Opción inválida
pause
exit /b 1

:google_drive
set "SERVICIO_NOMBRE=Google Drive"
set "CLOUD_DEFAULT=%USERPROFILE%\Google Drive"
set "CLOUD_DEFAULT2=%USERPROFILE%\My Drive"
goto :config_folder

:onedrive
set "SERVICIO_NOMBRE=OneDrive"
set "CLOUD_DEFAULT=%USERPROFILE%\OneDrive"
set "CLOUD_DEFAULT2=%USERPROFILE%\OneDrive - Personal"
goto :config_folder

:dropbox
set "SERVICIO_NOMBRE=Dropbox"
set "CLOUD_DEFAULT=%USERPROFILE%\Dropbox"
set "CLOUD_DEFAULT2="
goto :config_folder

:network_folder
set "SERVICIO_NOMBRE=Carpeta de Red"
set "CLOUD_DEFAULT=\\SERVIDOR\backups"
set "CLOUD_DEFAULT2="
goto :config_folder

:ftp_config
set "SERVICIO_NOMBRE=FTP"
echo.
echo ════════════════════════════════════════════════════════════════
echo   CONFIGURACIÓN FTP
echo ════════════════════════════════════════════════════════════════
echo.
set /p FTP_SERVER="Servidor FTP (ej: ftp.miservidor.com): "
set /p FTP_USER="Usuario FTP: "
set /p FTP_PASS="Contraseña FTP: "
set /p FTP_FOLDER="Carpeta remota (ej: /backups/solemar): "
set "CLOUD_FOLDER=FTP://%FTP_SERVER%%FTP_FOLDER%"
goto :save_config

:config_folder
echo.
echo ════════════════════════════════════════════════════════════════
echo   CARPETA DE DESTINO
echo ════════════════════════════════════════════════════════════════
echo.

:: Detectar carpeta automática
if exist "%CLOUD_DEFAULT%" (
    echo [INFO] Carpeta detectada: %CLOUD_DEFAULT%
    set "CLOUD_FOLDER=%CLOUD_DEFAULT%\SolemarAlimentaria"
    echo Se creará subcarpeta: SolemarAlimentaria
) else if exist "%CLOUD_DEFAULT2%" (
    echo [INFO] Carpeta detectada: %CLOUD_DEFAULT2%
    set "CLOUD_FOLDER=%CLOUD_DEFAULT2%\SolemarAlimentaria"
    echo Se creará subcarpeta: SolemarAlimentaria
) else (
    echo No se detectó la carpeta de %SERVICIO_NOMBRE% automáticamente.
    set /p CLOUD_FOLDER="Ingrese la ruta completa de la carpeta: "
)

if "%CLOUD_FOLDER%"=="" (
    echo [ERROR] Debe especificar una carpeta de destino
    pause
    exit /b 1
)

:save_config
echo.
echo ════════════════════════════════════════════════════════════════
echo   FRECUENCIA DE BACKUP
echo ════════════════════════════════════════════════════════════════
echo.
echo   1. Cada hora
echo   2. Cada 4 horas
echo   3. Cada 12 horas
echo   4. Diario (recomendado)
echo   5. Semanal
echo.
set /p FREQ="Seleccione frecuencia (1-5): "

if "%FREQ%"=="1" set "FREQ_DESC=Cada hora" & set "TASK_TIME=HOURLY"
if "%FREQ%"=="2" set "FREQ_DESC=Cada 4 horas" & set "TASK_TIME=HOURLY /MO 4"
if "%FREQ%"=="3" set "FREQ_DESC=Cada 12 horas" & set "TASK_TIME=HOURLY /MO 12"
if "%FREQ%"=="4" set "FREQ_DESC=Diario" & set "TASK_TIME=DAILY /ST 23:00"
if "%FREQ%"=="5" set "FREQ_DESC=Semanal" & set "TASK_TIME=WEEKLY /D SUN /ST 23:00"

if "%TASK_TIME%"=="" (
    echo [ERROR] Opción inválida
    pause
    exit /b 1
)

:: Preguntar hora para backups diarios/semanales
if "%FREQ%"=="4" (
    set /p BACKUP_HOUR="Hora del backup (formato 24hs, ej: 23:00) [23:00]: "
    if not "%BACKUP_HOUR%"=="" set "TASK_TIME=DAILY /ST %BACKUP_HOUR%"
)

echo.
echo ════════════════════════════════════════════════════════════════
echo   RETENCIÓN
echo ════════════════════════════════════════════════════════════════
echo.
set "RETENTION=30"
set /p RETENTION="Días a conservar backups [30]: "
if "%RETENTION%"=="" set "RETENTION=30"

:: Crear carpeta de destino si no es FTP
if not "%SERVICIO%"=="5" (
    if not exist "%CLOUD_FOLDER%" mkdir "%CLOUD_FOLDER%"
)

:: Crear script de backup en la nube
set "CLOUD_BACKUP_SCRIPT=%CONFIG_DIR%\cloud-backup-run.bat"

echo @echo off > "%CLOUD_BACKUP_SCRIPT%"
echo chcp 65001 ^>nul >> "%CLOUD_BACKUP_SCRIPT%"
echo set "BACKUP_DIR=%BACKUP_DIR%" >> "%CLOUD_BACKUP_SCRIPT%"
echo set "CLOUD_FOLDER=%CLOUD_FOLDER%" >> "%CLOUD_BACKUP_SCRIPT%"
echo set "DB_FILE=C:\SolemarAlimentaria\app\db\custom.db" >> "%CLOUD_BACKUP_SCRIPT%"
echo set "DATE=%%date:~-4,4%%%%date:~-7,2%%%%date:~-10,2%%" >> "%CLOUD_BACKUP_SCRIPT%"
echo set "TIME=%%time:~0,2%%%%time:~3,2%%" >> "%CLOUD_BACKUP_SCRIPT%"
echo set "TIME=%%TIME: =0%%" >> "%CLOUD_BACKUP_SCRIPT%"
echo set "BACKUP_FILE=solemar_%%DATE%%_%%TIME%%.db" >> "%CLOUD_BACKUP_SCRIPT%"
echo. >> "%CLOUD_BACKUP_SCRIPT%"
echo :: Crear backup local primero >> "%CLOUD_BACKUP_SCRIPT%"
echo if exist "%%DB_FILE%%" ( >> "%CLOUD_BACKUP_SCRIPT%"
echo     copy "%%DB_FILE%%" "%%BACKUP_DIR%%\%%BACKUP_FILE%%" ^>nul >> "%CLOUD_BACKUP_SCRIPT%"
echo     echo [OK] Backup local creado >> "%CLOUD_BACKUP_SCRIPT%"
echo ) >> "%CLOUD_BACKUP_SCRIPT%"
echo. >> "%CLOUD_BACKUP_SCRIPT%"

if "%SERVICIO%"=="5" (
    :: FTP upload
    echo :: Subir por FTP >> "%CLOUD_BACKUP_SCRIPT%"
    echo echo user %FTP_USER% %FTP_PASS%^> %%TEMP%%\ftp_commands.txt ^>^> "%CLOUD_BACKUP_SCRIPT%"
    echo echo binary^>^> %%TEMP%%\ftp_commands.txt ^>^> "%CLOUD_BACKUP_SCRIPT%"
    echo echo cd %FTP_FOLDER%^>^> %%TEMP%%\ftp_commands.txt ^>^> "%CLOUD_BACKUP_SCRIPT%"
    echo echo put "%%BACKUP_DIR%%\%%BACKUP_FILE%%"^>^> %%TEMP%%\ftp_commands.txt ^>^> "%CLOUD_BACKUP_SCRIPT%"
    echo echo quit^>^> %%TEMP%%\ftp_commands.txt ^>^> "%CLOUD_BACKUP_SCRIPT%"
    echo ftp -n -s:%%TEMP%%\ftp_commands.txt %FTP_SERVER% ^>^> "%CLOUD_BACKUP_SCRIPT%"
    echo del %%TEMP%%\ftp_commands.txt ^>^> "%CLOUD_BACKUP_SCRIPT%"
) else (
    :: Copy to cloud folder
    echo :: Copiar a carpeta de nube >> "%CLOUD_BACKUP_SCRIPT%"
    echo if exist "%%BACKUP_DIR%%\%%BACKUP_FILE%%" ( >> "%CLOUD_BACKUP_SCRIPT%"
    echo     copy "%%BACKUP_DIR%%\%%BACKUP_FILE%%" "%%CLOUD_FOLDER%%\" ^>nul >> "%CLOUD_BACKUP_SCRIPT%"
    echo     echo [OK] Backup subido a %%CLOUD_FOLDER%% >> "%CLOUD_BACKUP_SCRIPT%"
    echo ) >> "%CLOUD_BACKUP_SCRIPT%"
)

echo. >> "%CLOUD_BACKUP_SCRIPT%"
echo :: Limpiar backups antiguos >> "%CLOUD_BACKUP_SCRIPT%"
echo forfiles /p "%%BACKUP_DIR%%" /m *.db /d -%RETENTION% /c "cmd /c del @path" 2^>nul >> "%CLOUD_BACKUP_SCRIPT%"
echo forfiles /p "%%CLOUD_FOLDER%%" /m *.db /d -%RETENTION% /c "cmd /c del @path" 2^>nul >> "%CLOUD_BACKUP_SCRIPT%"

:: Crear tarea programada
schtasks /create /tn "SolemarAlimentaria_CloudBackup" /tr "\"%CLOUD_BACKUP_SCRIPT%\"" /sc %TASK_TIME% /ru SYSTEM /f

:: Crear archivo de configuración JSON
echo { > "%CONFIG_FILE%"
echo   "servicio": "%SERVICIO_NOMBRE%", >> "%CONFIG_FILE%"
echo   "carpetaDestino": "%CLOUD_FOLDER:\=\\%", >> "%CONFIG_FILE%"
if "%SERVICIO%"=="5" (
    echo   "ftpServidor": "%FTP_SERVER%", >> "%CONFIG_FILE%"
    echo   "ftpUsuario": "%FTP_USER%", >> "%CONFIG_FILE%"
    echo   "ftpCarpeta": "%FTP_FOLDER%", >> "%CONFIG_FILE%"
)
echo   "frecuencia": "%FREQ_DESC%", >> "%CONFIG_FILE%"
echo   "retencionDias": %RETENTION%, >> "%CONFIG_FILE%"
echo   "activo": true, >> "%CONFIG_FILE%"
echo   "fechaConfiguracion": "%date% %time%" >> "%CONFIG_FILE%"
echo } >> "%CONFIG_FILE%"

echo.
echo ════════════════════════════════════════════════════════════════
echo   CONFIGURACIÓN GUARDADA
echo ════════════════════════════════════════════════════════════════
echo.
echo   Servicio:         %SERVICIO_NOMBRE%
echo   Destino:          %CLOUD_FOLDER%
echo   Frecuencia:       %FREQ_DESC%
echo   Retención:        %RETENTION% días
echo.
echo   Script:           %CLOUD_BACKUP_SCRIPT%
echo   Tarea programada: SolemarAlimentaria_CloudBackup
echo.

:: Preguntar si desea probar
set /p TEST_BACKUP="¿Desea ejecutar un backup de prueba ahora? (S/N): "
if /i "%TEST_BACKUP%"=="S" (
    echo.
    echo [INFO] Ejecutando backup de prueba...
    call "%CLOUD_BACKUP_SCRIPT%"
    echo.
    echo [OK] Backup de prueba completado
)

echo.
echo ════════════════════════════════════════════════════════════════
echo   NOTAS IMPORTANTES
echo ════════════════════════════════════════════════════════════════
echo.
echo   • El backup se ejecutará automáticamente según la frecuencia
echo   • Se creará también una copia local en %BACKUP_DIR%
echo   • Los backups antiguos se eliminarán automáticamente
echo   • Verifique que la carpeta de nube esté sincronizando
echo.
pause
