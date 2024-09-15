@echo off
set logFile=C:\Temp\Excel\logs\training_data.log

cd /d C:\Temp\Excel\.venv\Scripts
call activate

cd /d C:\Temp\Excel\polar api
python training_data.py >> "%logFile%" 2>&1

echo %date% %time% >> "%logFile%"
echo. >> "%logFile%"