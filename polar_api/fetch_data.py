import os
import sys
from datetime import datetime
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, message=".*parse_dates.*")
# debug
os.chdir("C:\\Temp\\training-diary\\polar_api")

import re
from genericpath import exists

from utils import load_config
from accesslink import AccessLink
import requests
import xml.etree.ElementTree as ET

from weather_api import fetch_weather
import redis

from concurrent.futures import ThreadPoolExecutor
from threading import Lock

import pandas as pd
from openpyxl import load_workbook

CONFIG_FILENAME = "config.yml"
TOKEN_FILENAME = "usertokens.yml"

config = load_config(CONFIG_FILENAME)

accesslink = AccessLink(client_id=config['client_id'],
                        client_secret=config['client_secret'],
                        redirect_url="http://localhost")

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def log(msg):
    now = datetime.now()
    print(f"{now:%a %m/%d/%Y %H:%M:%S}.{now.microsecond // 1000:01d} {msg}")

def get_access_token():
    usertokens = None
    if exists(TOKEN_FILENAME):
        usertokens = load_config(TOKEN_FILENAME)
    if usertokens is None:
        usertokens = {"tokens": []}
    return usertokens["tokens"][0]['access_token']

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
            log(f"ET Parse Error: {e}")
    else:
        log(f"Failed to fetch GPX data: HTTP {response.status_code} - {response.reason}")
    return None, None

def process_exercise(exercise, training_data, access_token):
    sport = exercise.get("sport", "unknown")
    detailed_sport = exercise.get("detailed_sport_info", "unknown")
    is_treadmill = False
    # only running exercises tracked 
    if "RUNNING" in sport:
        exercise_id = exercise.get("id")
        # if already fetched, skip
        start_time = exercise.get('start_time')
        dt = datetime.strptime(start_time, "%Y-%m-%dT%H:%M:%S")
        if redis_client.lpos(f"exercise:{dt.year}",exercise_id) is not None:
            return
        duration_iso = exercise.get('duration')
        duration_seconds = parse_iso8601_duration(duration_iso)
        # not shorter than 5min exercises
        if duration_seconds < 300:
            return
        # treadmill exercise format
        if detailed_sport == "TREADMILL_RUNNING":
            is_treadmill = True
            temperature = None
        # outside exercises
        else:
            weather_time = dt.strftime("%Y-%m-%dT%H")
            # latitude and longitude for weather fetch
            lat, lon = fetch_location_samples(exercise_id, access_token)
            distance_meters = exercise.get('distance')
            distance = f"{distance_meters / 1000:.2f}" if distance_meters is not None else "0.00"
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
            "temperature": round(temperature + 0.5) if temperature is not None else None,
            "timestamp": start_time,
            "exercise_id": exercise_id,
            "treadmill": is_treadmill
        })

def save_to_redis(training_data):
    keys = list(redis_client.scan_iter(match="exercise:session:*", count=1))
    if not keys:
        raise ValueError("No session keys found in Redis.")
    last_key = sorted(keys, key=lambda k: int(k.split(":")[-1]))[-1]
    session_id = int(last_key.split(":")[-1]) + 1

    pipeline = redis_client.pipeline()
    rows = 0
    for data in training_data:
        rows += 1
        year = datetime.strptime(data['start_time'], "%Y-%m-%d").year
        distance = data.get("distance")
        start_time = data.get("start_time")
        if data.get("treadmill"):
            while True:
                try:
                    distance = float(input(f"Enter distance for {start_time}: "))
                    break  # Exit loop when valid input is entered
                except ValueError:
                    log("Invalid input. Please enter a valid number.")
        redis_data = {
            "session_id": session_id,
            "exercise_id": data.get("exercise_id"),
            "timestamp": data.get("timestamp"),
            "date": start_time,
            "duration": data.get("duration"),
            "distance": distance,
            "hr_avg": data["hr_avg"] if data["hr_avg"] is not None else "",
            "hr_max": data["hr_max"] if data["hr_max"] is not None else "",
            "temperature": data["temperature"] if data["temperature"] is not None else "",
        }
        pipeline.hset(f"exercise:session:{session_id}", mapping=redis_data)
        pipeline.rpush(f"exercise:{year}", data['exercise_id'])
        session_id += 1
    pipeline.execute()
    log(f"{rows} row(s) inserted to redis.")

def parallel_process(exercises, access_token):
    training_data = []
    lock = Lock()

    def wrapped_process(exercise):
        local_data = []
        process_exercise(exercise, local_data, access_token)
        if local_data:
            with lock:
                training_data.extend(local_data)

    with ThreadPoolExecutor(max_workers=16) as executor:
        executor.map(wrapped_process, exercises)

    return training_data

def insert_data():
    year = datetime.now().year
    xlsm_file = "C:\\Users\\OskariSulkakoski\\OneDrive - Intragen\\excel\\exercise_data.xlsm"
    book = load_workbook(xlsm_file, keep_vba=True)
    sheet = book[str(year)]

    #Collect all existing exercise_ids from the workbook
    workbook_session_ids = set()
    workbook_session_ids.update(row[1] for row in sheet.iter_rows(min_row=2, values_only=True) if row[1])

    #Fetch data from Redis, excluding existing session_ids
    data = []
    exercise_ids = redis_client.lrange(f"exercise:{year}", 0, -1)
    session_keys = sorted(redis_client.scan_iter("exercise:session:*"), key=lambda k: int(k.split(":")[-1]), reverse=True)

    for exercise_id in exercise_ids:
        if exercise_id not in workbook_session_ids:
            for session_key in session_keys:
                session_data = redis_client.hgetall(session_key)
                if session_data.get("exercise_id") == exercise_id:
                    data.append(session_data)
                    break

    #Convert the filtered data to a DataFrame
    df = pd.DataFrame(data)
    if df.empty:
        log("No new data to append.")
        exit(2)

    df = df[["session_id","exercise_id","timestamp","date", "duration", "distance", "hr_avg", "hr_max","temperature"]]
    df["distance"] = pd.to_numeric(df["distance"],errors="coerce")
    df["temperature"] = pd.to_numeric(df["temperature"],errors="coerce")
    df["date"] = pd.to_datetime(df["date"]).dt.strftime('%d-%b')

    last_row = max((i for i, row in enumerate(sheet.iter_rows(values_only=True), 1) if any(row[:3])), default=1)

    #Append the filtered data
    for i, row in enumerate(df.itertuples(index=False), start=last_row+1):
        for col, value in enumerate(row, start=1):  # Start from column 1 (A)
            sheet.cell(row=i, column=col, value=value)
    book.save(xlsm_file)

# main fetch
def fetch_data():
    training_data = []
    access_token = get_access_token()
    exercises = accesslink.get_exercises(access_token=access_token)
    training_data = parallel_process(exercises, access_token)
    if training_data:
        save_to_redis(training_data)
        log("Inserting data...")
        insert_data()
        log("Data successfully written to the workbook!")
        return sys.exit(0)
    return sys.exit(2)

if __name__ == "__main__":
    log("Fetching data...")
    fetch_data()
