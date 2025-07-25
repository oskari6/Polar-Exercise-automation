@echo off
set logFile=C:\Temp\training-diary\logs\training_data.log

cd /d C:\Temp\training-diary\polar_api
"C:\Temp\training-diary\.venv\Scripts\python.exe" training_data.py

if %errorlevel% neq 0 (
    echo Python script execution failed. >> %logFile%
    echo Python script execution failed.
    pause
    exit /b
)

echo %date% %time% OK >> %logFile%
echo. >> %logFile%
pause