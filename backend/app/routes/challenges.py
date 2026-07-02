"""Challenges: time-bound fitness challenges users can join."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.infrastructure.database import get_db
from app.infrastructure.database.models import Challenge, ChallengeParticipant, User

router = APIRouter()


class ProgressUpdate(BaseModel):
    progress: float = Field(..., ge=0)


def _status(c: Challenge) -> str:
    now = datetime.utcnow()
    if c.starts_at and now < c.starts_at:
        return "upcoming"
    if c.ends_at and now > c.ends_at:
        return "past"
    return "active"


def _dto(db: Session, c: Challenge, user_id: str) -> dict:
    parts = sorted(c.participants, key=lambda p: p.progress, reverse=True)
    mine = next((p for p in parts if p.user_id == user_id), None)
    my_rank = (parts.index(mine) + 1) if mine else None
    days_left = None
    if c.ends_at:
        days_left = max(0, (c.ends_at - datetime.utcnow()).days)
    return {
        "id": c.id,
        "name": c.name,
        "description": c.description,
        "metric": c.metric,
        "goal": c.goal,
        "entry_fee": c.entry_fee,
        "prize_pool": c.prize_pool,
        "starts_at": c.starts_at.isoformat() if c.starts_at else None,
        "ends_at": c.ends_at.isoformat() if c.ends_at else None,
        "status": _status(c),
        "days_left": days_left,
        "participant_count": len(parts),
        "joined": mine is not None,
        "my_progress": mine.progress if mine else 0,
        "my_rank": my_rank,
    }


@router.get("")
def list_challenges(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(Challenge).order_by(Challenge.starts_at.desc().nullslast()).all()
    return [_dto(db, c, current_user.id) for c in items]


@router.post("/{challenge_id}/join", status_code=status.HTTP_201_CREATED)
def join_challenge(challenge_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    c = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Challenge not found")
    existing = db.query(ChallengeParticipant).filter(
        ChallengeParticipant.challenge_id == challenge_id,
        ChallengeParticipant.user_id == current_user.id,
    ).first()
    if not existing:
        db.add(ChallengeParticipant(challenge_id=challenge_id, user_id=current_user.id, progress=0))
        db.commit()
        db.refresh(c)
    return _dto(db, c, current_user.id)


@router.post("/{challenge_id}/progress")
def update_progress(challenge_id: str, body: ProgressUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(ChallengeParticipant).filter(
        ChallengeParticipant.challenge_id == challenge_id,
        ChallengeParticipant.user_id == current_user.id,
    ).first()
    if not p:
        raise HTTPException(status_code=404, detail="Join the challenge first")
    p.progress = body.progress
    db.commit()
    c = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    return _dto(db, c, current_user.id)
