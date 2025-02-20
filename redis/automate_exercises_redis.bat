@echo off
set logFile=C:\Temp\Python\training-diary\logs\training_data.log
set backupDir=C:\Temp\Python\training-diary\redis\backups
set containerName=redis-server

echo Checking if Docker is running...
tasklist | findstr /I "com.docker.service" >nul
if %errorlevel% neq 0 (
    echo Starting Docker Desktop...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    timeout /t 10 >nul
)

echo Docker is running.

echo Starting Docker Container...
docker start %containerName%

echo Waiting for Redis server to start...
timeout /t 5 >nul
ping -n 1 localhost >nul

docker exec -it redis-server redis-cli ping
if %errorlevel% neq 0 (
    echo Redis server failed to start. >> %logFile%
    echo Redis server failed to start
    pause
    exit /b
)

echo Activating Python virtual environment...
cd /d C:\Temp\Python\training-diary\polar api
call "C:\Temp\Python\training-diary\.venv\Scripts\python.exe" training_data_redis.py

if %errorlevel% neq 0 (
    echo Python script execution failed. >> %logFile%
    echo Python script execution failed.
    pause
    exit /b
)

echo Starting redis environment...
cd /d C:\Temp\Python\training-diary\redis
call activate_env redis

echo running excel data insert script...
python load_to_excel.py

echo Creating Redis backup...
docker exec -it redis-server redis-cli BGSAVE

echo Stopping Docker container...
docker stop %containerName%

echo Copying exercise_data.xlsm to OneDrive...
copy /Y "C:\Temp\Python\training-diary\redis\exercise_data.xlsm" "C:\Users\Oskari\OneDrive - Kouvolan Ammattiopisto Oy, Eduko\Excel\exercise_data.xlsm"

if %errorlevel% neq 0 (
    echo Failed to copy Excel file to OneDrive. >> %logFile%
    echo Failed to copy Excel file to OneDrive.
    pause
    exit /b
)

echo Stopping Docker desktop...
taskkill /IM "Docker Desktop.exe" /F

echo %date% %time% OK >> %logFile%
echo. >> %logFile%
pause