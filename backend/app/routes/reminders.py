import asyncio
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.infrastructure.database import SessionLocal
from app.auth import get_current_user
from app.models import User
from app.domain.reminders.service import reminder_service

router = APIRouter()


@router.post("/reminders")
async def create_reminder(
    title: str,
    remind_at: str,
    message: Optional[str] = None,
    repeat: Optional[str] = None,
    channel: Optional[str] = "in-app",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a reminder for the current user."""
    try:
        remind_dt = datetime.fromisoformat(remind_at)
    except Exception:
        raise HTTPException(status_code=400, detail="remind_at must be ISO datetime string")

    try:
        result = await reminder_service.create(
            db=db,
            user_id=current_user.id,
            title=title,
            remind_at=remind_dt,
            message=message,
            repeat=repeat,
            channel=channel or "in-app",
        )
        return {"success": True, "reminder_id": result.reminder_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/reminders")
async def list_reminders(
    current_user: User = Depends(get_current_user),
):
    """List reminders for the current user. DB query runs in thread pool to avoid blocking."""

    def _blocking():
        db = SessionLocal()
        try:
            return reminder_service.list_for_user(db, current_user.id)
        finally:
            db.close()

    return await asyncio.get_event_loop().run_in_executor(None, _blocking)


@router.post("/reminders/{reminder_id}/send")
async def send_reminder_now(
    reminder_id: str,
    channel: Optional[str] = "in-app",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trigger sending the reminder immediately via specified channel."""
    try:
        result = await reminder_service.send_now(
            db=db,
            user_id=current_user.id,
            reminder_id=reminder_id,
            channel=channel,
        )
        return {
            "success": True,
            "message_id": result.message_id,
            "notification": result.notification,
        }
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/reminders/{reminder_id}")
async def delete_reminder(
    reminder_id: str,
    current_user: User = Depends(get_current_user),
):
    """Delete a reminder. DB operation runs in thread pool to avoid blocking."""

    def _blocking():
        db = SessionLocal()
        try:
            reminder_service.delete(db, current_user.id, reminder_id)
        finally:
            db.close()

    try:
        await asyncio.get_event_loop().run_in_executor(None, _blocking)
        return {"success": True}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
