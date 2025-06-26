import redis
import sys

try:
    r = redis.Redis(host="localhost", port=6379)
    r.ping()
    sys.exit(0)  # Success
except redis.exceptions.ConnectionError:
    sys.exit(1)  # Not ready yet