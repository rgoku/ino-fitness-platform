"""ReminderService — all reminder business logic lives here.

Routes delegate to this class; Celery tasks call process_due().
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.infrastructure.database.models import Reminder, Message

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass
class CreateResult:
    reminder_id: str
    ai_generated: bool = False


@dataclass
class SendResult:
    message_id: str
    notification: dict = field(default_factory=dict)


# ---------------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------------

class ReminderService:
    """Encapsulates reminder CRUD, on-demand send, and batch processing."""

    def __init__(self, ai_service=None, notification_service=None):
        # Lazy imports so the module can be imported without side-effects
        if ai_service is None:
            from app.domain.ai import AIService
            ai_service = AIService()
        if notification_service is None:
            from app.domain.notifications import notification_service as _ns
            notification_service = _ns
        self._ai = ai_service
        self._notify = notification_service

    # -- Create -------------------------------------------------------------

    async def create(
        self,
        db: Session,
        user_id: str,
        title: str,
        remind_at: datetime,
        message: Optional[str] = None,
        repeat: Optional[str] = None,
        channel: str = "in-app",
    ) -> CreateResult:
        """Create a reminder. Generates AI text when *message* is not provided."""
        ai_generated = False

        if not message:
            raw = await self._ai.generate_reminder_message(
                user_id, {"title": title}
            )
            message = raw.get("text") if isinstance(raw, dict) else str(raw)
            ai_generated = True

        reminder = Reminder(
            user_id=user_id,
            title=title,
            message=message,
            remind_at=remind_at,
            repeat=repeat,
            channel=channel,
            sent=False,
        )
        db.add(reminder)
        db.commit()
        return CreateResult(reminder_id=reminder.id, ai_generated=ai_generated)

    # -- Read ---------------------------------------------------------------

    def list_for_user(self, db: Session, user_id: str) -> list[Reminder]:
        """Return all reminders belonging to *user_id*."""
        return (
            db.query(Reminder)
            .filter(Reminder.user_id == user_id)
            .all()
        )

    # -- Send now -----------------------------------------------------------

    async def send_now(
        self,
        db: Session,
        user_id: str,
        reminder_id: str,
        channel: Optional[str] = None,
    ) -> SendResult:
        """Deliver a reminder immediately and mark it sent.

        Raises ValueError if the reminder is not found or not owned by the user.
        """
        reminder = (
            db.query(Reminder)
            .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
            .first()
        )
        if not reminder:
            raise ValueError("Reminder not found")

        effective_channel = channel or reminder.channel or "in-app"

        notify_result = await self._notify.send(
            channel=effective_channel,
            user_id=user_id,
            title=reminder.title,
            message=reminder.message,
        )

        # Always persist an in-app message as a backup record
        msg = Message(
            user_id=user_id,
            coach_id=None,
            sender_type="ai",
            content=reminder.message,
            message_type="reminder",
            read=False,
        )
        db.add(msg)
        reminder.sent = True
        db.commit()

        return SendResult(message_id=msg.id, notification=notify_result)

    # -- Delete -------------------------------------------------------------

    def delete(self, db: Session, user_id: str, reminder_id: str) -> None:
        """Delete a reminder. Raises ValueError if not found / not owned."""
        reminder = (
            db.query(Reminder)
            .filter(Reminder.id == reminder_id, Reminder.user_id == user_id)
            .first()
        )
        if not reminder:
            raise ValueError("Reminder not found")
        db.delete(reminder)
        db.commit()

    # -- Batch processing (called by Celery task) ---------------------------

    def process_due(self, db: Session) -> int:
        """Find reminders that are due, create in-app messages, mark sent.

        Returns the number of reminders processed.
        """
        now = datetime.utcnow()
        due = (
            db.query(Reminder)
            .filter(Reminder.remind_at <= now, Reminder.sent == False)  # noqa: E712
            .all()
        )
        for r in due:
            msg = Message(
                user_id=r.user_id,
                coach_id=None,
                sender_type="ai",
                content=r.message,
                message_type="reminder",
                read=False,
            )
            db.add(msg)
            r.sent = True
        db.commit()

        if due:
            logger.info("processed_due_reminders", extra={"count": len(due)})
        return len(due)


# Module-level singleton for convenience
reminder_service = ReminderService()
