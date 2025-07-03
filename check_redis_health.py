import redis
import sys
import time

MAX_RETRIES = 30
DELAY_SECONDS = 2

for attempt in range(1, MAX_RETRIES + 1):
    try:
        r = redis.Redis(host="localhost", port=6379, decode_responses=True)
        r.ping()
        sys.exit(0)
    except redis.exceptions.ConnectionError:
        time.sleep(DELAY_SECONDS)

print("Redis failed to start after waiting.")
sys.exit(1)