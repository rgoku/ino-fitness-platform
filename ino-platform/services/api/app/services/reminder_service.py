"""
Reminder service — finds clients who need reminders, generates AI text, delivers.

Consolidates logic previously scattered across:
  - notification_tasks.send_checkin_reminders (periodic beat task)
  - ai_tasks.generate_reminder (on-demand AI generation)

Usage:
    from app.services.reminder_service import reminder_service

    # Periodic: evaluate all coaches' clients and send due reminders
    stats = await reminder_service.process_due_reminders()

    # On-demand: generate + deliver a single reminder
    result = await reminder_service.send_one(user_id, coach_id, context)
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session
from app.models import AutomationRule, AutomationLog, CheckIn, Client, Coach, User

logger = logging.getLogger(__name__)


@dataclass
class ReminderResult:
    """Outcome of a single reminder attempt."""
    user_id: str
    coach_id: str
    reminder_type: str
    ai_text: str = ""
    delivered_via: list[str] = field(default_factory=list)
    skipped: bool = False
    skip_reason: str = ""
    error: str = ""


@dataclass
class BatchStats:
    """Aggregate stats from a process_due_reminders run."""
    coaches_checked: int = 0
    clients_evaluated: int = 0
    reminders_sent: int = 0
    reminders_skipped: int = 0
    errors: int = 0


class ReminderService:
    """Evaluates reminder triggers and delivers AI-generated messages."""

    # ── Thresholds ────────────────────────────────────────────

    # Clients who haven't checked in for this many hours get a nudge
    READINESS_STALE_HOURS = 24
    # Don't send more than one reminder per client per window
    COOLDOWN_HOURS = 12

    # ── Public API ────────────────────────────────────────────

    async def process_due_reminders(self) -> BatchStats:
        """Periodic entry-point: scan all active clients, send reminders where due.

        Called by the Celery beat task `send_checkin_reminders` every 30 min.
        """
        stats = BatchStats()

        async with async_session() as db:
            coaches = (await db.execute(select(Coach))).scalars().all()
            stats.coaches_checked = len(coaches)

            for coach in coaches:
                clients = await self._get_active_clients(db, coach.id)
                for client in clients:
                    stats.clients_evaluated += 1
                    result = await self._evaluate_and_send(db, coach, client)
                    if result.skipped:
                        stats.reminders_skipped += 1
                    elif result.error:
                        stats.errors += 1
                    else:
                        stats.reminders_sent += 1

            await db.commit()

        logger.info("process_due_reminders completed", extra={
            "coaches": stats.coaches_checked,
            "evaluated": stats.clients_evaluated,
            "sent": stats.reminders_sent,
            "skipped": stats.reminders_skipped,
            "errors": stats.errors,
        })
        return stats

    async def send_one(
        self,
        user_id: str,
        coach_id: str = "",
        context: dict[str, Any] | None = None,
    ) -> ReminderResult:
        """On-demand entry-point: generate and deliver a single reminder.

        Called by the Celery task `generate_reminder` or directly from an API.
        """
        ctx = context or {}
        reminder_type = ctx.get("type", "general")

        ai_text = await self._generate_ai_text(
            user_id=user_id,
            coach_id=coach_id,
            title=ctx.get("title", ""),
            goal=ctx.get("goal", ""),
            reminder_type=reminder_type,
        )

        if not ai_text:
            return ReminderResult(
                user_id=user_id, coach_id=coach_id,
                reminder_type=reminder_type, error="AI generation returned empty",
            )

        channels = await self._deliver(user_id, ai_text, reminder_type)

        return ReminderResult(
            user_id=user_id,
            coach_id=coach_id,
            reminder_type=reminder_type,
            ai_text=ai_text,
            delivered_via=channels,
        )

    # ── Internal: evaluation ──────────────────────────────────

    async def _get_active_clients(self, db: AsyncSession, coach_id) -> list[Client]:
        """Return clients in active/at_risk status for a coach."""
        result = await db.execute(
            select(Client).where(
                Client.coach_id == coach_id,
                Client.status.in_(["active", "at_risk"]),
            )
        )
        return list(result.scalars().all())

    async def _evaluate_and_send(
        self, db: AsyncSession, coach: Coach, client: Client,
    ) -> ReminderResult:
        """Decide if this client needs a reminder, generate + deliver if so."""
        user_id = str(client.user_id)
        coach_id = str(coach.id)
        now = datetime.now(timezone.utc)

        # 1. Check cooldown — don't spam
        if await self._was_reminded_recently(db, client.id):
            return ReminderResult(
                user_id=user_id, coach_id=coach_id,
                reminder_type="checkin", skipped=True,
                skip_reason="cooldown_active",
            )

        # 2. Check if client has a recent readiness check-in
        last_checkin = await self._last_readiness_checkin(db, client.id)
        stale_cutoff = now - timedelta(hours=self.READINESS_STALE_HOURS)

        if last_checkin and last_checkin.submitted_at >= stale_cutoff:
            return ReminderResult(
                user_id=user_id, coach_id=coach_id,
                reminder_type="checkin", skipped=True,
                skip_reason="recent_checkin_exists",
            )

        # 3. Check coach-defined automation rules for checkin_reminder
        rule = await self._find_reminder_rule(db, coach.id)

        # 4. Generate + deliver
        try:
            goal = (client.goals[0] if client.goals else "")
            ai_text = await self._generate_ai_text(
                user_id=user_id,
                coach_id=coach_id,
                title="Daily check-in",
                goal=goal,
                reminder_type="checkin",
            )
            if not ai_text:
                return ReminderResult(
                    user_id=user_id, coach_id=coach_id,
                    reminder_type="checkin", error="empty_ai_response",
                )

            channels = await self._deliver(user_id, ai_text, "checkin")

            # 5. Log automation execution if rule exists
            if rule:
                db.add(AutomationLog(
                    rule_id=rule.id,
                    client_id=client.id,
                    actions_taken=[{"type": "send_reminder", "channels": channels}],
                    status="success",
                ))
                rule.last_triggered_at = now
                rule.trigger_count = (rule.trigger_count or 0) + 1

            return ReminderResult(
                user_id=user_id, coach_id=coach_id,
                reminder_type="checkin", ai_text=ai_text,
                delivered_via=channels,
            )

        except Exception as exc:
            logger.error("reminder_send_failed", extra={
                "user_id": user_id, "coach_id": coach_id, "error": str(exc),
            })
            if rule:
                db.add(AutomationLog(
                    rule_id=rule.id,
                    client_id=client.id,
                    actions_taken=[{"type": "send_reminder"}],
                    status="failed",
                    error=str(exc),
                ))
            return ReminderResult(
                user_id=user_id, coach_id=coach_id,
                reminder_type="checkin", error=str(exc),
            )

    # ── Internal: queries ─────────────────────────────────────

    async def _last_readiness_checkin(self, db: AsyncSession, client_id) -> CheckIn | None:
        result = await db.execute(
            select(CheckIn)
            .where(CheckIn.client_id == client_id, CheckIn.type == "daily_readiness")
            .order_by(CheckIn.submitted_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def _was_reminded_recently(self, db: AsyncSession, client_id) -> bool:
        """Check if a reminder was logged for this client within the cooldown window."""
        cutoff = datetime.now(timezone.utc) - timedelta(hours=self.COOLDOWN_HOURS)
        result = await db.execute(
            select(func.count()).select_from(AutomationLog).where(
                AutomationLog.client_id == client_id,
                AutomationLog.executed_at >= cutoff,
                AutomationLog.status == "success",
            )
        )
        count = result.scalar() or 0
        return count > 0

    async def _find_reminder_rule(self, db: AsyncSession, coach_id) -> AutomationRule | None:
        """Find an enabled checkin_reminder automation rule for this coach."""
        result = await db.execute(
            select(AutomationRule).where(
                AutomationRule.coach_id == coach_id,
                AutomationRule.enabled.is_(True),
            )
        )
        for rule in result.scalars().all():
            trigger = rule.trigger or {}
            if trigger.get("type") == "checkin_reminder":
                return rule
        return None

    # ── Internal: AI generation ───────────────────────────────

    async def _generate_ai_text(
        self,
        user_id: str,
        coach_id: str,
        title: str,
        goal: str,
        reminder_type: str,
    ) -> str:
        """Call the AI pipeline to produce a short reminder message."""
        from app.services.ai_client import ai_client

        response = await ai_client.execute(
            prompt_name="reminder",
            coach_id=coach_id,
            user_id=user_id,
            plan_tier=self._get_plan_tier(coach_id),
            title=title,
            goal=goal,
            reminder_type=reminder_type,
        )

        if response.data and isinstance(response.data, str):
            return response.data
        return response.raw.strip() if response.raw else ""

    # ── Internal: delivery ────────────────────────────────────

    async def _deliver(self, user_id: str, text: str, reminder_type: str) -> list[str]:
        """Dispatch the reminder through available channels. Returns list of channels used."""
        from app.tasks.notification_tasks import send_push, send_in_app

        channels: list[str] = []

        # Always create an in-app notification
        send_in_app.delay(user_id, "Reminder", text, notification_type="reminder")
        channels.append("in_app")

        # Push notification for mobile clients
        send_push.delay(
            user_id,
            title="Check-in Reminder",
            body=text,
            data={"type": reminder_type},
        )
        channels.append("push")

        return channels

    # ── Internal: helpers ─────────────────────────────────────

    @staticmethod
    def _get_plan_tier(coach_id: str) -> str:
        """Look up coach plan tier from Redis cache."""
        try:
            import redis as redis_lib
            from app.core.config import settings
            r = redis_lib.from_url(
                f"{settings.REDIS_URL.rsplit('/', 1)[0]}/3",
                decode_responses=True,
            )
            tier = r.get(f"coach_tier:{coach_id}")
            return tier if tier in ("trial", "starter", "pro", "scale") else "starter"
        except Exception:
            return "starter"


# Singleton
reminder_service = ReminderService()
