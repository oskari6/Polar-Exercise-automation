@echo on
setlocal
set workDir=C:\Temp\Python\training-diary
set logFile=C:\Temp\Python\training-diary\logs\training_data.log
set excelDir=C:\Users\OskariSulkakoski\OneDrive - Intragen\excel\exercise_data.xlsm
set containerName=redis-server
set distro=Ubuntu
set python=C:\Temp\Python\training-diary\.venv\Scripts\python.exe
set startTime=%TIME%

echo ===================================================================== >> %logFile%
<nul set /p="%date% %time% Starting Docker... " >> %logFile%
wsl -d %distro% -- bash -c "sudo /usr/sbin/service docker start" >> %logFile% 2>&1
echo. >> %logFile%

set docker_attempts=0
:waitForDocker
set /a docker_attempts+=1
timeout /t 2 >nul
wsl -d %distro% -- bash -c "docker info" >nul 2>&1
if %errorlevel% neq 0 (
    if %docker_attempts% GEQ 10 (
        echo %date% %time% Docker failed to start. >> %logFile%
        exit /b
    )
    goto waitForDocker
)
echo %date% %time% Docker is ready! >> %logFile%

echo %date% %time% Starting Redis... >> %logFile%
wsl -d %distro% -- bash -c "cd /mnt/c/Temp/Python/training-diary && docker-compose up -d" >> %logFile% 2>&1

set attempts=0
:waitForRedis
set /a attempts+=1
timeout /t 2 >nul

call %python% connect_redis.py
if %errorlevel% neq 0 (
    if %attempts% GEQ 10 (
        <nul set /p="%date% %time% Redis failed to start." >> %logFile%
        echo. >> %logFile%
        exit /b
    )
    goto waitForRedis
)
echo %date% %time% Redis is ready! >> %logFile%

echo %date% %time% Fetching data... >> %logFile%
call %python% polar_api/fetch_data.py >> %logFile% 2>&1
set fetch_error=%errorlevel%

if %fetch_error% equ 1 (
    echo %date% %time% Fetching failed. >> %logFile%
) else if %fetch_error% equ 2 (
    echo %date% %time% No data to insert. >> %logFile%
) else (
    echo %date% %time% Inserting data... >> %logFile%
    call %python% insert_data.py >> %logFile% 2>&1

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
