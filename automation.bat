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

set logFile=C:\Temp\Python\training-diary\logs\training_data.log
set backupDir=C:\Temp\Python\training-diary\backups
set containerName=redis-server

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
cd /d C:\Temp\Python\training-diary\polar api
call "C:\Temp\Python\training-diary\.venv\Scripts\python.exe" training_data_redis.py >nul 2>&1

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
copy /Y "C:\Temp\Python\training-diary\exercise_data.xlsm" "C:\Users\Oskari\OneDrive - Intragen\backups\exercise_data.xlsm" >nul 2>&1
if %errorlevel% neq 0 (
    echo Failed to copy to OneDrive. >> %logFile%
    echo Failed to copy to OneDrive.
    pause
    exit /b
)

echo %date% %time% OK >> %logFile%
echo. >> %logFile%

echo Open Excel
start "" "C:\Users\Oskari\OneDrive - Intragen\backups\exercise_data.xlsm"