"""Application configuration from environment."""
from dotenv import load_dotenv
import os

load_dotenv()


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", "postgresql://ino:ino@localhost:5432/ino_fitness")


def get_secret_key() -> str:
    return os.getenv("SECRET_KEY", "change-me")


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "*")
    return [o.strip() for o in raw.split(",")]


def get_jwt_expiration_hours() -> int:
    return int(os.getenv("JWT_EXPIRATION_HOURS", "24"))


def get_debug() -> bool:
    return os.getenv("DEBUG", "False").lower() == "true"


def get_redis_url() -> str:
    """Redis URL for Celery broker and backend (e.g. redis://localhost:6379/0)."""
    return os.getenv("REDIS_URL", "redis://localhost:6379/0")


def get_celery_broker_url() -> str:
    """Celery broker URL (Redis)."""
    return os.getenv("CELERY_BROKER_URL") or get_redis_url()


def get_celery_result_backend() -> str:
    """Celery result backend URL (Redis)."""
    return os.getenv("CELERY_RESULT_BACKEND") or get_redis_url()


def get_celery_task_serializer() -> str:
    return os.getenv("CELERY_TASK_SERIALIZER", "json")


def get_celery_result_serializer() -> str:
    return os.getenv("CELERY_RESULT_SERIALIZER", "json")


def get_celery_reminder_lock_ttl_seconds() -> int:
    """TTL for the reminder process lock (idempotency). Should be < beat interval."""
    return int(os.getenv("CELERY_REMINDER_LOCK_TTL", "55"))


def get_celery_reminder_retry_max() -> int:
    """Max retries for process_due_reminders task."""
    return int(os.getenv("CELERY_REMINDER_RETRY_MAX", "3"))


def get_celery_reminder_retry_delay_seconds() -> int:
    """Seconds to wait before retrying the reminder task."""
    return int(os.getenv("CELERY_REMINDER_RETRY_DELAY", "30"))
