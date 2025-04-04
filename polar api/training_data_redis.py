import os
import sys

# debugging purposes
os.chdir("C:\\Temp\\Python\\training-diary\\polar api")

import platform
import re
if platform.system() == 'Windows':
    from asyncio.windows_events import NULL
from genericpath import exists

from utils import load_config
from accesslink import AccessLink
from datetime import datetime
import requests
import xml.etree.ElementTree as ET

from weather_api import fetch_weather
import redis

CONFIG_FILENAME = "config.yml"
TOKEN_FILENAME = "usertokens.yml"

db_path = "C:\\Temp\\Data\\training-data-db\\training_db.db"

config = load_config(CONFIG_FILENAME)

accesslink = AccessLink(client_id=config['client_id'],
                        client_secret=config['client_secret'],
                        redirect_url="http://localhost")

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def token_db():
    usertokens = None
    if exists(TOKEN_FILENAME):
        usertokens = load_config(TOKEN_FILENAME)
    if usertokens is None:
        usertokens = {"tokens": []}
    return usertokens

def parse_iso8601_duration(duration):
    """Convert ISO 8601 duration (PT3766S) to total seconds."""
    match = re.match(r'PT(\d+)(?:\.\d+)?S', duration)
    return int(match.group(1)) if match else 0

def format_duration(seconds):
    """Convert total seconds to h:mm:ss format."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    seconds = seconds % 60
    return f"{hours}:{minutes:02}:{seconds:02}"

def format_distance(meters):
    return f"{meters / 1000:.2f}" if meters is not None else "0.00"

def custom_round(number):
    return round(number + 0.5)

# get coordinates with gpx endpoint
def fetch_location_samples(exercise_id, access_token):
    url = f"https://www.polaraccesslink.com/v3/exercises/{exercise_id}/gpx"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/gpx+xml"
    }
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        try:
            root = ET.fromstring(response.text)
            namespace = {'gpx': 'http://www.topografix.com/GPX/1/1'}
            
            trkseg = root.find('.//gpx:trkseg', namespace)
            if trkseg is not None:
                trkpt = trkseg.find('gpx:trkpt', namespace)
                if trkpt is not None:
                    lat = trkpt.attrib.get('lat')
                    lon = trkpt.attrib.get('lon')
                    if lat and lon:
                        lat = format(float(lat), ".4f")
                        lon = format(float(lon), ".4f")
                        return lat, lon
        except ET.ParseError as e:
            print(f"ET Parse Error: {e}")
    else:
        print(f"Failed to fetch GPX data: HTTP {response.status_code} - {response.reason}")

    return None, None

def is_exercise_in_redis(exercise_id, year):
    return redis_client.lpos(f"exercise:{year}",exercise_id) is not None

def process_exercise(exercise, training_data, access_token):
    sport = exercise.get("sport", "unknown")
    detailed_sport = exercise.get("detailed_sport_info", "unknown")
    # only running exercises tracked 
    if "RUNNING" in sport:
        exercise_id = exercise.get("id") 
        # if already fetched, skip
        start_time = exercise.get('start_time')
        dt = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S")
        if is_exercise_in_redis(exercise_id,dt.year):
            return
        duration_iso = exercise.get('duration')
        duration_seconds = parse_iso8601_duration(duration_iso)
        # not shorter than 5min exercises
        if duration_seconds < 300:
            return
        # treadmill exercise format
        if detailed_sport == "TREADMILL_RUNNING":
            while True:
                try:
                    distance = float(input(f"Enter distance for {dt.strftime("%m/%d")}: "))
                    break  # Exit loop when valid input is entered
                except ValueError:
                    print("Invalid input. Please enter a valid number.")
            temperature = None
        # outside exercises
        else:
            weather_time = dt.strftime("%Y-%m-%dT%H")
            # latitude and longitude for weather fetch
            lat, lon = fetch_location_samples(exercise_id, access_token)
            distance_meters = exercise.get('distance')
            distance = format_distance(distance_meters)
            temperature = fetch_weather(lat, lon, weather_time) if lat and lon else None

        heart_rate = exercise.get('heart_rate', {})
        avg_hr = heart_rate.get('average', None)
        max_hr = heart_rate.get('maximum', None)
        
        
        training_data.append({
            "start_time": dt.strftime("%Y-%m-%d"),
            "duration": format_duration(duration_seconds),
            "distance": distance,
            "hr_avg": avg_hr if avg_hr is not None else None,
            "hr_max": max_hr if max_hr is not None else None,
            "temperature": custom_round(temperature) if temperature is not None else None,
            "timestamp": start_time,
            "exercise_id": exercise_id
        })

def save_to_redis(training_data):
    last_key = redis_client.scan_iter(match="exercise:session:*", count=1)
    last_key = sorted(last_key, key=lambda k: int(k.split(":")[-1]))[-1]
    session_id = int(last_key.split(":")[-1]) + 1

    pipeline = redis_client.pipeline()
    rows = 0
    for data in training_data:
        rows += 1
        year = datetime.strptime(data['start_time'], "%Y-%m-%d").year
        redis_data = {
            "session_id": session_id,
            "exercise_id": data.get("exercise_id"),
            "timestamp": data.get("timestamp"),
            "date": data.get("start_time"),
            "duration": data.get("duration"),
            "distance": data.get("distance"),
            "hr_avg": data["hr_avg"] if data["hr_avg"] is not None else "",
            "hr_max": data["hr_max"] if data["hr_max"] is not None else "",
            "temperature": data["temperature"] if data["temperature"] is not None else "",
        }
        pipeline.hset(f"exercise:session:{session_id}", mapping=redis_data)
        pipeline.rpush(f"exercise:{year}", data['exercise_id'])
        session_id += 1
    pipeline.execute()
    print(f"{rows} row(s) inserted to redis.")

# main fetch
def fetch_data():
    tokens = token_db()
    training_data = []

    for item in tokens["tokens"]:
        if item is None:
            continue
        
        access_token = item["access_token"]
        exercises = accesslink.get_exercises(access_token=access_token)
        for exercise in exercises:
            process_exercise(exercise, training_data, access_token)
    if training_data:
        save_to_redis(training_data)
        return False
    else: return True

def main():
    print("Fetching training data...")
    no_rows = fetch_data()
    return no_rows

if __name__ == "__main__":
    no_rows = main()
    if no_rows: sys.exit(1)
    else: sys.exit(0)