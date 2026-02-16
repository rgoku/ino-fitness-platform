FROM python:3.12-slim

WORKDIR /app

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Python deps
COPY services/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App code
COPY services/api/ .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
