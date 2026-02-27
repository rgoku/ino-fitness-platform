"""
Celery task for processing due reminders: idempotent, retries, Redis lock, logging.
Run alongside the existing in-process worker until the new system is verified.
"""
import logging
import uuid
from contextlib import contextmanager

from redis import Redis
from sqlalchemy.orm import Session

from app.infrastructure.celery_app import celery_app

from app.core.config import (
    get_redis_url,
    get_celery_reminder_lock_ttl_seconds,
    get_celery_reminder_retry_max,
    get_celery_reminder_retry_delay_seconds,
)
from app.infrastructure.database import SessionLocal
from app.domain.reminders.service import reminder_service

logger = logging.getLogger(__name__)

REMINDER_LOCK_KEY = "ino:reminders:process_lock"


def _get_redis():
    """Redis client from REDIS_URL (used for lock only)."""
    url = get_redis_url()
    return Redis.from_url(url, decode_responses=True)


@contextmanager
def redis_lock(key: str, ttl_seconds: int):
    """
    Acquire a Redis lock; yield True if acquired, False otherwise.
    Lock is released when exiting the block (or on TTL expiry).
    """
    redis = _get_redis()
    lock_value = str(uuid.uuid4())
    acquired = redis.set(key, lock_value, nx=True, ex=ttl_seconds)
    try:
        yield bool(acquired)
    finally:
        try:
            if acquired and redis.get(key) == lock_value:
                redis.delete(key)
        except Exception as e:
            logger.warning("Failed to release reminder lock %s: %s", key, e)


@celery_app.task(
    name="app.domain.reminders.tasks.process_due_reminders_task",
    bind=True,
)
def process_due_reminders_task(self):
    """
    Process due reminders: create in-app messages and mark sent.
    Idempotent: only one runner at a time (Redis lock). Retries on transient errors.
    """
    lock_ttl = get_celery_reminder_lock_ttl_seconds()
    max_retries = get_celery_reminder_retry_max()
    retry_delay = get_celery_reminder_retry_delay_seconds()

    with redis_lock(REMINDER_LOCK_KEY, lock_ttl) as acquired:
        if not acquired:
            logger.info(
                "reminder_task_skipped",
                extra={"reason": "lock_not_acquired", "lock_key": REMINDER_LOCK_KEY},
            )
            return {"skipped": True, "reason": "lock_not_acquired"}

        logger.info("reminder_task_start", extra={"lock_ttl": lock_ttl})
        db: Session = None
        try:
            db = SessionLocal()
            count = reminder_service.process_due(db)
            logger.info("reminder_task_success", extra={"processed": count})
            return {"ok": True, "processed": count}
        except Exception as e:
            logger.exception(
                "reminder_task_error",
                extra={"error": str(e), "task_id": self.request.id},
            )
            if self.request.retries < max_retries:
                raise self.retry(countdown=retry_delay, exc=e)
            raise
        finally:
            if db:
                try:
                    db.close()
                except Exception as e:
                    logger.warning("reminder_task_db_close_error: %s", e)
