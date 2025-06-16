import redis

r = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True)
exercise_keys = r.keys('exercise:session:*')

exercise_id_seen = set()
keys_to_delete = []

# Go through all hashes
for key in exercise_keys:
    exercise_data = r.hgetall(key)
    if not exercise_data:
        continue
    
    exercise_id = exercise_data.get('exercise_id', '')
    if not exercise_id:
        continue
    
    if exercise_id in exercise_id_seen:
        keys_to_delete.append(key)
    else:
        exercise_id_seen.add(exercise_id)

for key in keys_to_delete:
    r.delete(key)
    print(f"Deleted duplicate: {key}")

print(f"Total duplicates deleted: {len(keys_to_delete)}")
