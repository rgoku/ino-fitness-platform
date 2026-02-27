FROM python:3.12-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN groupadd -r ino && useradd -r -g ino -d /app -s /sbin/nologin ino

WORKDIR /app

# Python deps (cached layer)
COPY services/api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir structlog

# App code
COPY services/api/ .

RUN chown -R ino:ino /app
USER ino

# No EXPOSE — workers don't serve HTTP
# No HEALTHCHECK — Celery handles its own heartbeat

# Default: Celery worker consuming all queues.
# Override with beat command for scheduler.
CMD ["celery", "-A", "app.worker", "worker", \
     "-l", "info", \
     "-c", "4", \
     "-Q", "default,ai,video,notifications", \
     "--without-heartbeat"]
