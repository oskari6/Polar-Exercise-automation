@echo off
set logFile=C:\Temp\Excel_script\logs\training_data.log

cd /d C:\Temp\Excel_script\.venv\Scripts
call activate

cd /d C:\Temp\Excel_script\polar api\accesslink-example-python
python training_data.py >> "%logFile%" 2>&1

echo %date% %time% >> "%logFile%"
echo. >> "%logFile%"