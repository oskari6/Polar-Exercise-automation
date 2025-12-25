import redis, json
import os

r = redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)
redis_key = "exercise:2026"

entries = r.lrange(redis_key, 0, -1)

exercise_id_seen = set()
duplicates = 0

for raw in entries:
    try:
        entry = json.loads(raw)
    except json.JSONDecodeError:
        continue

    exercise_id = entry.get("exercise_id")
    if not exercise_id:
        continue

    if exercise_id in exercise_id_seen:
        # remove duplicate entry from list
        r.lrem(redis_key, 1, raw)   # remove first occurrence of this exact JSON
        duplicates += 1
        print(f"Deleted duplicate exercise {exercise_id}")
    else:
        exercise_id_seen.add(exercise_id)

print(f"Total duplicates deleted: {duplicates}")