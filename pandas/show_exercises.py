import redis
from datetime import datetime

r = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True)

exercise_keys = r.keys('exercise:session:*')
sessions = []

for key in exercise_keys:
    exercise_data = r.hgetall(key)
    if not exercise_data:
        continue
    
    try:
        exercise_date = datetime.strptime(exercise_data.get('date', ''), '%Y-%m-%d')
    except ValueError:
        continue
    
    exercise_id = exercise_data.get('exercise_id', '')
    
    sessions.append({
        'date': exercise_date,
        'exercise_id': exercise_id
    })

sessions.sort(key=lambda x: x['date'])

for session in sessions:
    print(f"{session['date'].strftime('%Y-%m-%d')} {session['exercise_id']}")
