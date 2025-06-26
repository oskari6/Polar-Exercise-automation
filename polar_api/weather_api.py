from meteostat import Hourly, Stations
import pytz
import pandas as pd
from datetime import datetime

def log(msg):
    print(f"{datetime.now():%a %d-%m-%Y %H:%M:%S} {msg}")

def fetch_weather(lat, lon, start):
    try:
        lat = float(lat)
        lon = float(lon)

        timezone = pytz.timezone("Europe/Helsinki")
        start = pd.to_datetime(start).tz_localize(timezone).tz_convert(None)

        stations = Stations()
        stations = stations.nearby(lat, lon)
        station = stations.fetch(1)

        data = Hourly(station, start, start)
        data = data.fetch()

        if not data.empty and "temp" in data.columns:
            celsius = data["temp"].iloc[0]
            return celsius
    except Exception as e:
        log(f"Error fetching weather data: {e}")
    return None
