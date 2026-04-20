"""Celery tasks for daily automation."""
import logging

from app.infrastructure.celery_app import celery_app
from app.infrastructure.database.session import SessionLocal

logger = logging.getLogger(__name__)


@celery_app.task(name="app.domain.automation.tasks.daily_automation_task", bind=True, max_retries=2)
def daily_automation_task(self):
    """Run all daily automation: birthdays, missed workout alerts, habit reminders."""
    from app.domain.automation.service import run_daily_automation

    db = SessionLocal()
    try:
        results = run_daily_automation(db)
        logger.info("Daily automation results: %s", results)
        return results
    except Exception as exc:
        logger.exception("Daily automation failed: %s", exc)
        if db:
            db.rollback()
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()
