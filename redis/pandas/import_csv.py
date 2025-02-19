import  redis
import pandas as pd

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

csv_file ="Pandas/2023_eid.csv"
df = pd.read_csv(csv_file)

for index, row in df.iterrows():
    row_id = f"excel:row:{index}"
    redis_client.hset(row_id, mapping=row.to_dict())

print("loaded to redis")