@echo on
setlocal
set workDir=C:\Temp\training-diary
cd /d %workDir%
set logFile=C:\Temp\training-diary\logs\training_data.log
set excelDir=C:\Users\OskariSulkakoski\OneDrive - Intragen\excel\exercise_data.xlsm
set containerName=redis-server
set distro=Ubuntu
set python=C:\Temp\training-diary\.venv\Scripts\python.exe
set startTime=%TIME%

echo ===================================================================== >> %logFile%
<nul set /p="%date% %time% Starting Docker... " >> %logFile%
wsl -d %distro% -- bash -c "sudo /usr/sbin/service docker start" >> %logFile% 2>&1
echo. >> %logFile%

echo %date% %time% Starting Redis... >> %logFile%
wsl -d %distro% -- bash -c "cd /mnt/c/Temp/training-diary && docker-compose up -d" >> %logFile% 2>&1

<nul set /p="%date% %time% Waiting for Redis to be ready... " >> %logFile%
echo. >> %logFile%
:wait_redis
wsl -d %distro% -- bash -c "docker exec %containerName% redis-cli ping" | findstr /C:"PONG" >nul
if errorlevel 1 (
    timeout /t 1 >nul
    goto wait_redis
)
<nul set /p="%date% %time%  Redis is ready." >> %logFile%
echo. >> %logFile%

%python% polar_api/fetch_data.py >> %logFile% 2>&1
set fetch_error=%ERRORLEVEL%

if %fetch_error% equ 1 (
    echo %date% %time% Fetching failed. >> %logFile%
) else if %fetch_error% equ 2 (
    echo %date% %time% No data to insert. >> %logFile%
) else (
    <nul set /p="%date% %time% Creating redis backup... " >> %logFile%
    wsl -d %distro% -- bash -c "docker exec -it redis-server redis-cli BGSAVE" >> %logFile% 2>&1

    <nul set /p="%date% %time% Creating excel backup... " >> %logFile%
    copy /Y "%excelDir%" %workDir%\backups >> %logFile% 2>&1
)

<nul set /p="%date% %time% Stopping Redis... " >> %logFile%
wsl -d %distro% -- bash -c "docker stop redis-server" >> %logFile% 2>&1

<nul set /p="%date% %time% Shutting down WSL... " >> %logFile%
wsl --shutdown >> %logFile% 2>&1
echo. >> %logFile%

set endTime=%TIME%
for /f %%t in ('powershell -Command "([datetime]::Parse('%endTime%') - [datetime]::Parse('%startTime%')).TotalSeconds"') do set duration=%%t
echo %date% %time% Finished in %duration% seconds. >> %logFile%
start "" "%excelDir%"