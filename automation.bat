@echo off
setlocal
mode con: cols=60 lines=15

echo Starting Docker...
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

set workDir=C:\Temp\Python\training-diary\polar api
set logFile=C:\Temp\Python\training-diary\logs\training_data.log
set backupDir=C:\Temp\Python\training-diary\backups
set containerName=redis-server
set excelDir=C:\Users\Oskari\OneDrive - Intragen\excel\exercise_data.xlsm

echo Starting Redis...
docker-compose up -d >nul 2>&1
timeout /t 5 >nul
docker exec -it redis-server redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo Redis failed to start. >> %logFile%
    echo Redis failed to start
    pause
    exit /b
)

echo Fetching data...
cd /d %workDir%
call "C:\Temp\Python\training-diary\.venv\Scripts\python.exe" fetch_data.py >nul 2>&1

if %errorlevel% neq 0 (
    echo Fetching failed. >> %logFile%
    echo Fetching failed.
    pause
    exit /b
)

echo Inserting data...
cd /d C:\Temp\Python\training-diary
call activate_env redis
python load_to_excel.py

echo Creating backup...
docker exec -it redis-server redis-cli BGSAVE >nul 2>&1

echo Stopping Redis...
docker stop %containerName% >nul 2>&1
taskkill /IM "Docker Desktop.exe" /F >nul 2>&1
taskkill /IM "com.docker.backend.exe" /F >nul 2>&1

echo Copying to OneDrive...
copy /Y %excelDir% "C:\Temp\Python\training-diary\backups" >nul 2>&1
if %errorlevel% neq 0 (
    echo Failed to copy to OneDrive. >> %logFile%
    echo Failed to copy to OneDrive.
    pause
    exit /b
)

echo %date% %time% OK >> %logFile%
echo. >> %logFile%

echo Opening Excel...
start "" %excelDir%