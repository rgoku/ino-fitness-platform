"""Bookings: scheduled sessions between clients and coaches."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.infrastructure.database import get_db
from app.infrastructure.database.models import Booking, User

router = APIRouter()


class BookingCreate(BaseModel):
    session_type: str = Field(..., min_length=1, max_length=120)
    scheduled_at: str  # ISO-8601
    coach_id: Optional[str] = None
    duration_min: int = Field(30, ge=5, le=480)
    mode: str = "video"
    notes: Optional[str] = None


class StatusUpdate(BaseModel):
    status: str


def _name(db: Session, user_id: Optional[str]) -> Optional[str]:
    if not user_id:
        return None
    u = db.query(User).filter(User.id == user_id).first()
    return u.name if u else None


def _dto(db: Session, b: Booking) -> dict:
    return {
        "id": b.id,
        "session_type": b.session_type,
        "coach_id": b.coach_id,
        "coach_name": _name(db, b.coach_id),
        "client_id": b.client_id,
        "client_name": _name(db, b.client_id),
        "scheduled_at": b.scheduled_at.isoformat() if b.scheduled_at else None,
        "duration_min": b.duration_min,
        "mode": b.mode,
        "status": b.status,
        "notes": b.notes,
    }


@router.get("")
def list_bookings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Bookings for the current user (as client or as coach), soonest first."""
    q = db.query(Booking).filter(
        (Booking.client_id == current_user.id) | (Booking.coach_id == current_user.id)
    ).order_by(Booking.scheduled_at.asc())
    return [_dto(db, b) for b in q.all()]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_booking(body: BookingCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        when = datetime.fromisoformat(body.scheduled_at.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail="scheduled_at must be ISO-8601")
    coach_id = body.coach_id or getattr(current_user, "coach_id", None)
    booking = Booking(
        client_id=current_user.id,
        coach_id=coach_id,
        session_type=body.session_type,
        scheduled_at=when,
        duration_min=body.duration_min,
        mode=body.mode,
        notes=body.notes,
        status="pending",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _dto(db, booking)


@router.patch("/{booking_id}/status")
def update_status(booking_id: str, body: StatusUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    allowed = {"pending", "confirmed", "cancelled", "completed"}
    if body.status not in allowed:
        raise HTTPException(status_code=422, detail=f"status must be one of {sorted(allowed)}")
    b = db.query(Booking).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.id not in (b.client_id, b.coach_id):
        raise HTTPException(status_code=403, detail="Not your booking")
    b.status = body.status
    db.commit()
    db.refresh(b)
    return _dto(db, b)
