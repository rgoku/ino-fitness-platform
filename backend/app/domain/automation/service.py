"""Daily automation engine — birthday greetings, missed workout alerts, habit reminders."""
import logging
import uuid
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app.infrastructure.database.models import (
    CheckIn,
    CoachClient,
    HabitLog,
    Message,
    Reminder,
    TrainingWorkout,
    User,
)

logger = logging.getLogger(__name__)


def process_birthday_greetings(db: Session) -> int:
    """Send birthday messages to users whose birthday is today."""
    today = date.today()
    users = db.query(User).filter(
        User.birthday.isnot(None),
    ).all()

    count = 0
    for user in users:
        if user.birthday.month == today.month and user.birthday.day == today.day:
            # Check if already sent today
            existing = (
                db.query(Message)
                .filter(
                    Message.user_id == user.id,
                    Message.message_type == "birthday",
                    Message.created_at >= datetime(today.year, today.month, today.day),
                )
                .first()
            )
            if existing:
                continue

            msg = Message(
                id=str(uuid.uuid4()),
                user_id=user.id,
                sender_type="system",
                content=f"Happy Birthday, {user.name}! 🎉 Here's to another year of crushing your goals. Keep going — you're stronger than you think.",
                message_type="birthday",
                created_at=datetime.utcnow(),
            )
            db.add(msg)
            count += 1
            logger.info("Birthday greeting sent to user %s", user.id)

    if count:
        db.commit()
    return count


def process_missed_workout_alerts(db: Session, inactive_days: int = 3) -> int:
    """Flag users who haven't worked out in N days and notify their coach."""
    cutoff = datetime.utcnow() - timedelta(days=inactive_days)
    count = 0

    coach_links = db.query(CoachClient).filter(CoachClient.status == "active").all()

    for link in coach_links:
        last_workout = (
            db.query(TrainingWorkout)
            .filter(
                TrainingWorkout.user_id == link.client_id,
                TrainingWorkout.date >= cutoff,
            )
            .first()
        )
        if last_workout:
            continue

        client = db.query(User).filter(User.id == link.client_id).first()
        if not client:
            continue

        # Check if alert already sent recently
        recent_alert = (
            db.query(Message)
            .filter(
                Message.user_id == link.coach_id,
                Message.message_type == "inactivity_alert",
                Message.created_at >= cutoff,
                Message.content.contains(client.name),
            )
            .first()
        )
        if recent_alert:
            continue

        msg = Message(
            id=str(uuid.uuid4()),
            user_id=link.coach_id,
            sender_type="system",
            content=f"⚠️ {client.name} hasn't logged a workout in {inactive_days}+ days. Consider sending a check-in.",
            message_type="inactivity_alert",
            created_at=datetime.utcnow(),
        )
        db.add(msg)
        count += 1

    if count:
        db.commit()
    return count


def process_daily_habit_reminders(db: Session) -> int:
    """Send reminders for habits that haven't been logged today."""
    today = date.today()
    count = 0

    # Find users with active reminders of type 'habit'
    reminders = (
        db.query(Reminder)
        .filter(
            Reminder.channel == "in-app",
            Reminder.sent.is_(False),
            Reminder.remind_at <= datetime.utcnow(),
        )
        .limit(100)
        .all()
    )

    for r in reminders:
        msg = Message(
            id=str(uuid.uuid4()),
            user_id=r.user_id,
            sender_type="system",
            content=r.message or r.title,
            message_type="reminder",
            created_at=datetime.utcnow(),
        )
        db.add(msg)
        r.sent = True
        count += 1

    if count:
        db.commit()
    return count


def run_daily_automation(db: Session) -> dict:
    """Run all daily automation tasks. Called by Celery beat."""
    results = {
        "birthdays": process_birthday_greetings(db),
        "missed_workouts": process_missed_workout_alerts(db),
        "habit_reminders": process_daily_habit_reminders(db),
        "timestamp": datetime.utcnow().isoformat(),
    }
    logger.info("Daily automation complete: %s", results)
    return results
