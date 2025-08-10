import  redis
import pandas as pd

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

#1
redis_client.delete("exercise:session:542")

#all
# for key in redis_client.scan_iter("exercise:session*"):
#     redis_client.delete(key)