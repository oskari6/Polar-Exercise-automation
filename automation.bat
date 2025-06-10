@echo off
setlocal
set workDir=C:\Temp\Python\training-diary
set logFile=C:\Temp\Python\training-diary\logs\training_data.log
set excelDir=C:\Users\OskariSulkakoski\OneDrive - Intragen\excel\exercise_data.xlsm
set containerName=redis-server

:: Clear log before run
echo ============================== > %logFile%
echo %date% %time% Starting run >> %logFile%
echo ============================== >> %logFile%
echo. >> %logFile%

echo %date% %time% Starting Docker... >> %logFile%
docker info >nul 2>&1
if errorlevel 1 (
    start "" /min "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    :waitloop
    docker info >nul 2>&1
    if errorlevel 1 (
        timeout /t 2 >nul
        goto waitloop
    )
)

echo %date% %time% Starting Redis... >> %logFile%
docker-compose up -d >> %logFile% 2>&1
timeout /t 5 >nul
docker exec -it redis-server redis-cli ping >> %logFile% 2>&1
if %errorlevel% neq 0 (
    echo Redis failed to start. >> %logFile%
    echo Redis failed to start
    pause
    exit /b
)

echo %date% %time% Fetching data... >> %logFile%
cd /d %workDir%\polar_api
call "C:\Temp\Python\training-diary\.venv\Scripts\python.exe" fetch_data.py >> %logFile% 2>&1

if %errorlevel% neq 0 (
    echo %date% %time% Fetching failed. >> %logFile%
    echo %date% %time% Fetching failed.
    pause
    exit /b
)

echo %date% %time% Inserting data... >> %logFile%
cd /d %workDir%
call "C:\Temp\Python\training-diary\.redis-env\Scripts\python.exe" load_to_excel.py >> %logFile% 2>&1

echo %date% %time% Creating backup... >> %logFile%
docker exec -it redis-server redis-cli BGSAVE >> %logFile% 2>&1

echo %date% %time% Stopping Redis... >> %logFile%
docker stop %containerName% >> %logFile% 2>&1
taskkill /IM "Docker Desktop.exe" /F >> %logFile% 2>&1
taskkill /IM "com.docker.backend.exe" /F >> %logFile% 2>&1

echo %date% %time% Creating backup... >> %logFile%
copy /Y "%excelDir%" %workDir%\backups >> %logFile% 2>&1
if %errorlevel% neq 0 (
    echo %date% %time% Failed to backup file. >> %logFile%
    echo Failed to backup file.
    pause
    exit /b
)

echo %date% %time% OK >> %logFile%
echo. >> %logFile%

echo Opening Excel...
start "" %excelDir%