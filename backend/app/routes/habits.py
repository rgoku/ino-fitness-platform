"""Habit tracking routes — log daily habits (water, sleep, steps, custom)."""
import uuid
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.infrastructure.database import get_db
from app.infrastructure.database.models import HabitLog, User

router = APIRouter()


_ALLOWED_HABITS = {"water", "sleep", "steps", "workout", "meditation", "custom"}


class HabitLogCreate(BaseModel):
    habit_type: str = Field(..., min_length=1, max_length=50, description="One of: water, sleep, steps, workout, meditation, custom")
    value: float = Field(..., ge=0)
    target: Optional[float] = Field(None, ge=0)
    unit: Optional[str] = None
    notes: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM-DD, defaults to today


class HabitLogResponse(BaseModel):
    id: str
    habit_type: str
    value: float
    target: Optional[float]
    unit: Optional[str]
    notes: Optional[str]
    date: str
    created_at: str

    class Config:
        from_attributes = True


class DailySummary(BaseModel):
    date: str
    habits: List[HabitLogResponse]
    completion_rate: float


@router.post("", response_model=HabitLogResponse)
def log_habit(
    body: HabitLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Log a daily habit entry."""
    if body.habit_type not in _ALLOWED_HABITS:
        raise HTTPException(status_code=422, detail=f"habit_type must be one of: {', '.join(sorted(_ALLOWED_HABITS))}")
    log_date = date.fromisoformat(body.date) if body.date else date.today()
    if log_date > date.today():
        raise HTTPException(status_code=422, detail="Cannot log habits for future dates")

    # Upsert: update if same habit+date exists
    existing = (
        db.query(HabitLog)
        .filter(
            HabitLog.user_id == user.id,
            HabitLog.date == log_date,
            HabitLog.habit_type == body.habit_type,
        )
        .first()
    )

    if existing:
        existing.value = body.value
        if body.target is not None:
            existing.target = body.target
        if body.unit is not None:
            existing.unit = body.unit
        if body.notes is not None:
            existing.notes = body.notes
        db.commit()
        db.refresh(existing)
        return _to_response(existing)

    entry = HabitLog(
        id=str(uuid.uuid4()),
        user_id=user.id,
        date=log_date,
        habit_type=body.habit_type,
        value=body.value,
        target=body.target,
        unit=body.unit,
        notes=body.notes,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _to_response(entry)


@router.get("/today", response_model=DailySummary)
def get_today_habits(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all habit logs for today."""
    today = date.today()
    logs = (
        db.query(HabitLog)
        .filter(HabitLog.user_id == user.id, HabitLog.date == today)
        .order_by(HabitLog.habit_type)
        .all()
    )
    habits = [_to_response(h) for h in logs]
    completed = sum(1 for h in logs if h.target and h.value >= h.target)
    total_with_target = sum(1 for h in logs if h.target)
    rate = completed / total_with_target if total_with_target else 0.0

    return DailySummary(date=today.isoformat(), habits=habits, completion_rate=round(rate, 2))


@router.get("/history")
def get_habit_history(
    days: int = 7,
    habit_type: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get habit history for the last N days."""
    from datetime import timedelta
    start = date.today() - timedelta(days=days)
    query = db.query(HabitLog).filter(
        HabitLog.user_id == user.id,
        HabitLog.date >= start,
    )
    if habit_type:
        query = query.filter(HabitLog.habit_type == habit_type)

    logs = query.order_by(HabitLog.date.desc(), HabitLog.habit_type).all()
    return [_to_response(h) for h in logs]


def _to_response(h: HabitLog) -> HabitLogResponse:
    return HabitLogResponse(
        id=h.id,
        habit_type=h.habit_type,
        value=h.value,
        target=h.target,
        unit=h.unit,
        notes=h.notes,
        date=h.date.isoformat() if h.date else "",
        created_at=h.created_at.isoformat() if h.created_at else "",
    )
