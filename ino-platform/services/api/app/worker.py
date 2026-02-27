"""
INÖ Platform — Celery Worker Configuration

Usage (production — run each process separately):
  AI:      celery -A app.worker worker -l info -c 8  -Q ai              -n ai@%h
  Notify:  celery -A app.worker worker -l info -c 4  -Q notifications   -n notify@%h
  Video:   celery -A app.worker worker -l info -c 2  -Q video           -n video@%h
  Default: celery -A app.worker worker -l info -c 4  -Q default         -n default@%h
  Beat:    celery -A app.worker beat -l info --scheduler celery.beat:PersistentScheduler

  Total: 18 concurrent workers across 4 dedicated processes.

Development (single process):
  celery -A app.worker worker -l info -c 4 -Q default,ai,video,notifications
"""
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "ino",
    broker=settings.REDIS_URL,
    backend=f"{settings.REDIS_URL.rsplit('/', 1)[0]}/1",
)

celery_app.conf.update(
    # Serialization
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,

    # Routing — tasks routed to specialized queues
    task_routes={
        "app.tasks.ai_tasks.*":            {"queue": "ai"},
        "app.tasks.video_tasks.*":         {"queue": "video"},
        "app.tasks.notification_tasks.*":  {"queue": "notifications"},
        "app.tasks.*":                     {"queue": "default"},
    },

    # Reliability
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_reject_on_worker_lost=True,

    # Timeouts
    task_soft_time_limit=300,
    task_time_limit=600,

    # Memory management
    worker_max_tasks_per_child=200,
    worker_max_memory_per_child=512_000,  # 512 MB

    # Concurrency defaults (overridden by -c flag per worker process)
    worker_concurrency=8,

    # Result backend
    result_expires=3600,
    result_backend_transport_options={
        "global_keyprefix": "ino:celery:",
    },

    # Periodic tasks (beat schedule)
    beat_schedule={
        "evaluate-automation-rules": {
            "task": "app.tasks.automation_tasks.evaluate_automation_rules",
            "schedule": 300.0,  # every 5 minutes
        },
        "compute-client-risk-flags": {
            "task": "app.tasks.automation_tasks.compute_client_risk_flags",
            "schedule": 900.0,  # every 15 minutes
        },
        "aggregate-daily-analytics": {
            "task": "app.tasks.analytics_tasks.aggregate_daily_analytics",
            "schedule": crontab(hour=3, minute=0),  # 3:00 UTC daily
        },
        "cleanup-expired-videos": {
            "task": "app.tasks.video_tasks.cleanup_expired_videos",
            "schedule": crontab(hour=4, minute=0),  # 4:00 UTC daily
        },
        "sync-stripe-subscriptions": {
            "task": "app.tasks.billing_tasks.sync_stripe_subscriptions",
            "schedule": crontab(minute=0, hour="*/6"),  # every 6 hours
        },
        "send-checkin-reminders": {
            "task": "app.tasks.notification_tasks.send_checkin_reminders",
            "schedule": 1800.0,  # every 30 minutes
        },
    },
)

# Auto-discover tasks in app.tasks package
celery_app.autodiscover_tasks(["app.tasks"])
