#!/bin/bash

set -euo pipefail

LOG_FILE="./logs/training_data.log"
EXCEL_FILE="./host_excel/exercise_data.xlsm"     # Shared via volume from Windows host
BACKUP_DIR="./backups"

echo "=====================================================================" >> "$LOG_FILE"
echo "$(date +"%F %T") Starting Docker Compose..." >> "$LOG_FILE"
docker compose up -d redis >> "$LOG_FILE" 2>&1

echo "$(date +"%F %T") Waiting for Redis to be ready..." >> "$LOG_FILE"
until docker exec redis-server redis-cli ping | grep -q PONG; do
  sleep 1
done
echo "$(date +"%F %T") Redis is ready." >> "$LOG_FILE"

set +e
echo "$(date +"%F %T") Running fetch script inside app container..." >> "$LOG_FILE"
docker compose run --rm app python polar_api/fetch_data.py >> "$LOG_FILE" 2>&1
FETCH_ERROR=$?
set -e

if [ "$FETCH_ERROR" -eq 1 ]; then
    echo "$(date +"%F %T") Fetching failed." >> "$LOG_FILE"
    docker exec redis-server redis-cli FLUSHDB
elif [ "$FETCH_ERROR" -eq 2 ]; then
    echo "$(date +"%F %T") No data to insert." >> "$LOG_FILE"
    docker exec redis-server redis-cli FLUSHDB
else
    echo "$(date +"%F %T") Creating Redis backup..." >> "$LOG_FILE"
    docker exec redis-server redis-cli BGSAVE >> "$LOG_FILE" 2>&1

    echo "$(date +"%F %T") Backing up Excel file..." >> "$LOG_FILE"
    cp "$EXCEL_FILE" "$BACKUP_DIR/" >> "$LOG_FILE" 2>&1
fi

echo "$(date +"%F %T") Stopping containers..." >> "$LOG_FILE"
docker compose down >> "$LOG_FILE" 2>&1

echo "$(date +"%F %T") Finished." >> "$LOG_FILE"

# Optionally open the Excel file in Windows (when running via WSL)
if grep -qi microsoft /proc/version; then
  cmd.exe /C start "" "C:\\Users\\OskariSulkakoski\\OneDrive - Intragen\\excel\\exercise_data.xlsm"
fi