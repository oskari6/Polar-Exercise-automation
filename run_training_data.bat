@echo off
set logFile=C:\Temp\Excel\logs\training_data.log

cd /d C:\Temp\Excel\polar api
"C:\Temp\Excel\.venv\Scripts\python.exe" training_data.py

if %errorlevel% neq 0 (
    echo Python script execution failed. >> %logFile%
    echo Python script execution failed.
    pause
    exit /b
)

echo %date% %time% OK >> %logFile%
echo. >> %logFile%
pause