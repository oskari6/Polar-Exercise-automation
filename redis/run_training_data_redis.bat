@echo off
set logFile=C:\Temp\Python\training-diary\logs\training_data.log
set backupDir=C:\Temp\Python\training-diary\redis\backups
set containerName=redis-server

echo Starting Python redis virtual environment
activate_env Redis

echo Starting Docker
net start com.docker.service

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

echo Creating Redis backup...
docker exec -it redis-server redis-cli BGSAVE

timeout /t 5 >nul
if not exist "%backupDir%\dump.rdb" (
    echo Backup failed: dump.rdb not found. >> %logFile%
    echo Backup failed: dump.rdb not found.
    pause
    exit /b
)

for %%F in ("%backupDir%\dump.rdb") do set "lastModified=%%~tF"
for /f "tokens=2 delims=:" %%T in ('docker exec -it redis-server redis-cli INFO persistence ^| find "rdb_last_save_time"') do set "redisSaveTime=%%T"
set "redisSaveTime=%redisSaveTime:~0,10%"

if "%lastModified%" LSS "%redisSaveTime%" (
    echo Backup failed: dump.rdb was not updated. >> %logFile%
    echo Backup failed: dump.rdb was not updated.
    pause
    exit /b
)

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

echo %date% %time% OK >> %logFile%
echo. >> %logFile%
pause