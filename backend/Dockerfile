# Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for confluent-kafka and other libs
RUN apt-get update && apt-get install -y \
    build-essential \
    librdkafka-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port (Render will use $PORT, but 10000 is the default)
EXPOSE 10000

# Run the server via python script to ensure it correctly picks up the PORT env var
CMD ["python", "api_server.py"]
