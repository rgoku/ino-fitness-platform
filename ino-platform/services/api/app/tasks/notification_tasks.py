"""Notification Celery tasks — push, email, in-app, reminders."""
import asyncio
import logging

from app.worker import celery_app

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Run an async coroutine from a sync Celery task."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                return pool.submit(asyncio.run, coro).result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


@celery_app.task(
    bind=True,
    name="app.tasks.notification_tasks.send_push",
    max_retries=3,
    default_retry_delay=10,
    soft_time_limit=30,
    time_limit=60,
)
def send_push(self, user_id: str, title: str, body: str, data: dict | None = None):
    """Send a push notification via Firebase Cloud Messaging."""
    try:
        logger.info("send_push", extra={"user_id": user_id, "title": title})
        # Placeholder: retrieve FCM token from DB, send via firebase-admin
        return {"sent": True, "user_id": user_id}
    except Exception as exc:
        logger.warning("send_push failed", extra={"user_id": user_id, "error": str(exc)})
        raise self.retry(exc=exc)


@celery_app.task(
    bind=True,
    name="app.tasks.notification_tasks.send_email",
    max_retries=3,
    default_retry_delay=30,
    soft_time_limit=60,
    time_limit=120,
)
def send_email(self, to_email: str, subject: str, html_body: str):
    """Send an email via SMTP."""
    try:
        logger.info("send_email", extra={"to": to_email, "subject": subject})
        # Placeholder: SMTP send via smtplib or SES
        return {"sent": True, "to": to_email}
    except Exception as exc:
        logger.error("send_email failed", extra={"to": to_email, "error": str(exc)})
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.tasks.notification_tasks.send_in_app",
    soft_time_limit=10,
    time_limit=30,
)
def send_in_app(user_id: str, title: str, body: str, notification_type: str = "info"):
    """Create an in-app notification record."""
    logger.info("send_in_app", extra={"user_id": user_id, "type": notification_type})
    # Placeholder: insert into notifications table
    return {"created": True, "user_id": user_id}


@celery_app.task(
    name="app.tasks.notification_tasks.send_checkin_reminders",
    soft_time_limit=300,
    time_limit=600,
)
def send_checkin_reminders():
    """Evaluate pending reminders and fire notifications via ReminderService."""
    from app.services.reminder_service import reminder_service

    stats = _run_async(reminder_service.process_due_reminders())
    return {
        "coaches_checked": stats.coaches_checked,
        "clients_evaluated": stats.clients_evaluated,
        "sent": stats.reminders_sent,
        "skipped": stats.reminders_skipped,
        "errors": stats.errors,
    }
