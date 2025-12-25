#!/bin/bash

set -euo pipefail

LOG_FILE="./logs/training_data.log"
EXCEL_FILE="./host_excel/exercise_data.xlsm"     # Shared via volume from Windows host
BACKUP_DIR="./backups"
TMP_RESTORE="./backups/tmp_restore.rdb"
DUMP_FILE="redis-server:/data/dump.rdb"

: > "$LOG_FILE"
echo "$(date +"%F %T") Starting Docker Compose..." >> "$LOG_FILE"
docker compose up -d redis >> "$LOG_FILE" 2>&1

echo "$(date +"%F %T") Waiting for Redis to be ready..." >> "$LOG_FILE"
until docker exec redis-server redis-cli ping | grep -q PONG; do
  sleep 1
done
echo "$(date +"%F %T") Redis is ready." >> "$LOG_FILE"

# Snapshot current state before messing with data
if docker exec redis-server test -f /data/dump.rdb; then
  docker cp "$DUMP_FILE" "$TMP_RESTORE"
  echo "$(date +"%F %T") Backed up current dump to $TMP_RESTORE" >> "$LOG_FILE"
fi

set +e
echo "$(date +"%F %T") Running fetch script inside app container..." >> "$LOG_FILE"
docker compose run --rm app python fetch_data.py 2>&1 | tee -a "$LOG_FILE"
FETCH_ERROR=$?
set -e

if [ "$FETCH_ERROR" -eq 1 ]; then
    echo "$(date +"%F %T") Fetching failed." >> "$LOG_FILE"
    docker cp "$TMP_RESTORE" "$DUMP_FILE"
elif [ "$FETCH_ERROR" -eq 2 ]; then
    echo "$(date +"%F %T") No data to insert." >> "$LOG_FILE"
    docker cp "$TMP_RESTORE" "$DUMP_FILE"
else
    echo "$(date +"%F %T") Creating Redis dump..." >> "$LOG_FILE"
    docker exec redis-server redis-cli SAVE >> "$LOG_FILE" 2>&1
  
    echo "$(date +"%F %T") Creating Redis backup..." >> "$LOG_FILE"
    BACKUP_FILE="$BACKUP_DIR/dump_$(date +%F_%H-%M-%S).rdb"
    docker cp "$DUMP_FILE" "$BACKUP_FILE" >> "$LOG_FILE" 2>&1

    echo "$(date +"%F %T") Backing up Excel file..." >> "$LOG_FILE"
    cp "$EXCEL_FILE" "$BACKUP_DIR/" >> "$LOG_FILE" 2>&1
fi

echo "$(date +"%F %T") Stopping containers..." >> "$LOG_FILE"
docker compose down >> "$LOG_FILE" 2>&1

echo "$(date +"%F %T") Finished." >> "$LOG_FILE"

# Optionally open the Excel file in Windows (when running via WSL)
if grep -qi microsoft /proc/version; then
  cmd.exe /C start "" "C:\\Users\\OskariSulkakoski\\OneDrive - Intragen\\excel\\exercise_data.xlsm\""
fi