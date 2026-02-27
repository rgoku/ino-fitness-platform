"""
Celery application: Redis broker, result backend, timezone, and Beat schedule.
Run worker: celery -A app.infrastructure.celery_app worker -l info
Run beat:   celery -A app.infrastructure.celery_app beat -l info
"""
from celery import Celery
from celery.schedules import crontab
from app.core.config import (
    get_celery_broker_url,
    get_celery_result_backend,
    get_celery_task_serializer,
    get_celery_result_serializer,
)

broker = get_celery_broker_url()
backend = get_celery_result_backend()

celery_app = Celery(
    "ino_fitness",
    broker=broker,
    backend=backend,
    include=["app.domain.reminders.tasks"],
)

celery_app.conf.update(
    task_serializer=get_celery_task_serializer(),
    result_serializer=get_celery_result_serializer(),
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=120,
    task_soft_time_limit=90,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    result_expires=3600,
)

# Beat: run reminder task every 60 seconds (same as legacy in-process polling)
celery_app.conf.beat_schedule = {
    "process-due-reminders": {
        "task": "app.domain.reminders.tasks.process_due_reminders_task",
        "schedule": 60.0,
        "options": {"queue": "reminders"},
    },
}
celery_app.conf.task_routes = {
    "app.domain.reminders.tasks.process_due_reminders_task": {"queue": "reminders"},
}
