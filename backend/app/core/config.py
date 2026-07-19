"""Application configuration from environment."""
from dotenv import load_dotenv
import os

load_dotenv()


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", "postgresql://ino:ino@localhost:5432/ino_fitness")


def get_secret_key() -> str:
    """Active JWT signing/verification key used by app.core.security.

    Accepts SECRET_KEY (primary) or JWT_SECRET (legacy/ops alias) so a deploy
    that provisions either name is secure. Fails closed in production rather
    than silently signing every token with the public default 'change-me'
    (which would allow anyone to forge a token for any user/coach)."""
    key = os.getenv("SECRET_KEY") or os.getenv("JWT_SECRET")
    if key and key != "change-me":
        return key
    if os.getenv("ENVIRONMENT") == "production":
        raise RuntimeError(
            "SECRET_KEY (or JWT_SECRET) must be set to a secure, non-default "
            "value in production. Refusing to start with an insecure signing key."
        )
    return "change-me"


def get_cors_origins() -> list[str]:
    """Allowed CORS origins. Reads CORS_ORIGINS (comma-separated). Never
    defaults to "*", which is invalid alongside allow_credentials=True."""
    raw = os.getenv("CORS_ORIGINS", "").strip()
    if raw:
        return [o.strip() for o in raw.split(",") if o.strip()]
    # Safe local-development defaults (dashboard + landing dev servers).
    return [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]


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
