import os
import sys
import json
import redis
from datetime import datetime

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

def remove_exercise(exercise_id, year):
    redis_key = f"exercise:{year}"
    if not redis_client.exists(redis_key):
        log(f"No Redis list found for {year}")
        return

    entries = redis_client.lrange(redis_key, 0, -1)

    for raw in entries:
        try:
            entry = json.loads(raw)
        except json.JSONDecodeError:
            continue

        if entry.get("exercise_id") == exercise_id:
            redis_client.lrem(redis_key, 1, raw)  # remove first matching occurrence

if __name__ == "__main__":
    remove_exercise("PdZYBNMZ", 2026)