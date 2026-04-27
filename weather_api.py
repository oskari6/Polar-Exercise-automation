import requests
from datetime import datetime
import pytz

def fetch_weather(lat, lon, start):
    try:
        lat = float(lat)
        lon = float(lon)

        timezone = pytz.timezone("Europe/Helsinki")
        start_dt = datetime.fromisoformat(start)
        start_dt = timezone.localize(start_dt)

        date_str = start_dt.strftime("%Y-%m-%d")
        hour_str = start_dt.strftime("%H:00")

        url = "https://api.open-meteo.com/v1/forecast"

        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "temperature_2m,windspeed_10m",
            "start_date": date_str,
            "end_date": date_str,
            "timezone": "Europe/Helsinki",
            "windspeed_unit": "ms"
        }

        res = requests.get(url, params=params)
        data = res.json()

        times = data["hourly"]["time"]

        if hour_str not in [t[-5:] for t in times]:
            return None

        index = next(i for i, t in enumerate(times) if t.endswith(hour_str))

        return {
            "temperature": data["hourly"]["temperature_2m"][index],
            "wind_speed": data["hourly"]["windspeed_10m"][index],
        }

    except Exception as e:
        print(f"Error fetching weather: {e}")
        return None