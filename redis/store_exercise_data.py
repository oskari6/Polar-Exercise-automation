import redis
import pandas as pd

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

csv_file = "Pandas/final.csv"
df = pd.read_csv(csv_file)
df["date"] = pd.to_datetime(df["date"], format="%Y-%m-%d")
df["year"] = df["date"].dt.year

pipeline = redis_client.pipeline()

for _, row in df.iterrows():
    session_key = f"exercise:session:{row['session_id']}"
    pipeline.hset(session_key, mapping=row.dropna().astype(str).to_dict())
    year = row["year"]
    pipeline.rpush(f"exercise:{year}", row["session_id"])

pipeline.execute()
print("imported")