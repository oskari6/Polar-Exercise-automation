@echo on
setlocal
set workDir=C:\Temp\Python\training-diary
set logFile=C:\Temp\Python\training-diary\logs\training_data.log
set excelDir=C:\Users\OskariSulkakoski\OneDrive - Intragen\excel\exercise_data.xlsm
set containerName=redis-server
set distro=Ubuntu

echo ============================== >> %logFile%
echo %date% %time% Starting Docker... >> %logFile%
wsl -d %distro% -- bash -c "sudo /usr/sbin/service docker start" >> %logFile% 2>&1

echo %date% %time% Starting Redis... >> %logFile%
wsl -d %distro% -- bash -c "cd /mnt/c/Temp/Python/training-diary && docker-compose up -d" >> %logFile% 2>&1

echo %date% %time% Waiting for Redis to be ready... >> %logFile%
set attempts=0
:waitForRedis
wsl -d %distro% -- bash -c "docker exec redis-server redis-cli ping" | find "PONG" >nul
if %errorlevel% neq 0 (
    set /a attempts+=1
    if %attempts% GEQ 10 (
        echo %date% %time% Redis failed to respond after 10 attempts. >> %logFile%
        echo Redis failed to start.
        exit /b
    )
    timeout /t 2 >nul
    goto waitForRedis
)
echo %date% %time% Redis is ready! >> %logFile%

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
wsl -d %distro% -- bash -c "docker exec -it redis-server redis-cli BGSAVE" >> %logFile% 2>&1

echo %date% %time% Stopping Redis... >> %logFile%
wsl -d %distro% -- bash -c "docker stop redis-server" >> %logFile% 2>&1

echo %date% %time% Shutting down WSL... >> %logFile%
wsl --shutdown >> %logFile% 2>&1

echo %date% %time% Creating backup... >> %logFile%
copy /Y "%excelDir%" %workDir%\backups >> %logFile% 2>&1

start "" "%excelDir%"
echo %date% %time% OK >> %logFile%
