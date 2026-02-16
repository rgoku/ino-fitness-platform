from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.auth import get_current_user
from app.models import User, Reminder, Message
from app.ai_service import AIService
from app.notification_service import notification_service

router = APIRouter()
ai_service = AIService()

@router.post("/reminders")
async def create_reminder(
    title: str,
    remind_at: str,
    message: Optional[str] = None,
    repeat: Optional[str] = None,
    channel: Optional[str] = "in-app",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a reminder for the current user. `remind_at` must be ISO datetime string."""
    try:
        remind_dt = datetime.fromisoformat(remind_at)
    except Exception as e:
        raise HTTPException(status_code=400, detail="remind_at must be ISO datetime string")

    try:
        if not message:
            # Ask AIService to generate a personalized reminder message
            msg = await ai_service.generate_reminder_message(current_user.id, {"title": title})
            message = msg.get("text") if isinstance(msg, dict) else str(msg)

        reminder = Reminder(
            user_id=current_user.id,
            title=title,
            message=message,
            remind_at=remind_dt,
            repeat=repeat,
            channel=channel,
            sent=False
        )
        db.add(reminder)
        db.commit()
        return {"success": True, "reminder_id": reminder.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reminders")
async def list_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reminders = db.query(Reminder).filter(Reminder.user_id == current_user.id).all()
    return reminders

@router.post("/reminders/{reminder_id}/send")
async def send_reminder_now(
    reminder_id: str,
    channel: Optional[str] = "in-app",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Trigger sending the reminder immediately via specified channel."""
    try:
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id).first()
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found")

        # Use notification service to send via specified channel
        notify_result = await notification_service.send(
            channel=channel or reminder.channel,
            user_id=current_user.id,
            title=reminder.title,
            message=reminder.message
        )
        
        # Always create in-app message as backup
        msg = Message(
            user_id=current_user.id,
            coach_id=None,
            sender_type="ai",
            content=reminder.message,
            message_type="reminder",
            read=False
        )
        db.add(msg)
        reminder.sent = True
        db.commit()
        
        return {
            "success": True,
            "message_id": msg.id,
            "notification": notify_result
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/reminders/{reminder_id}")
async def delete_reminder(
    reminder_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        reminder = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id).first()
        if not reminder:
            raise HTTPException(status_code=404, detail="Reminder not found")
        db.delete(reminder)
        db.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
