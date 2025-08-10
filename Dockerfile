FROM python:3.11

# Set workdir inside container
WORKDIR /app

# Copy all files into container
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Optional: if Redis config is custom and used by redis-server
# COPY redis.conf /usr/local/etc/redis/redis.conf

# Default command (can be overridden in docker-compose)
CMD ["python", "polar_api/fetch_data.py"]