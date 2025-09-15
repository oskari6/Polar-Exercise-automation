from meteostat import Hourly, Stations
import pytz
import pandas as pd
from datetime import datetime, timedelta

def log(msg):
    now = datetime.now()
    print(f"{now:%a %m/%d/%Y %H:%M:%S}.{now.microsecond // 1000:02d} {msg}")

def fetch_weather(lat, lon, start):
    try:
        lat = float(lat)
        lon = float(lon)

        timezone = pytz.timezone("Europe/Helsinki")
        start = pd.to_datetime(start).tz_localize(timezone).tz_convert(None)
        end = start + timedelta(hours=1)
        
        stations = Stations().nearby(lat, lon)
        station_df = stations.fetch(20)

        if station_df.empty:
            log("No stations with recent hourly data found.")
            return None
        
        for station_id in station_df.index:
            data = Hourly(station_id, start, end).fetch()
            if not data.empty:
                return {
                    "temperature": data["temp"].iloc[0] if "temp" in data.columns else "",
                    "wind_speed": float(data["wspd"].iloc[0]) if "wspd" in data.columns else "",
                }
        log("No usable weather data found in top 5 nearby stations.")
    except Exception as e:
        log(f"Error fetching weather data: {e}")
    return None
