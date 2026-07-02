"""Social leaderboard, derived from real activity (no fabricated numbers)."""
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.infrastructure.database import get_db
from app.infrastructure.database.models import User, WorkoutSession

router = APIRouter()


def _streak(session_days: set, today) -> int:
    streak = 0
    d = today
    for i in range(0, 90):
        if d in session_days:
            streak += 1
        elif i > 0:
            break
        d = d - timedelta(days=1)
    return streak


@router.get("/leaderboard")
def leaderboard(metric: str = "streaks", current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Rank client users by a real metric: streaks, volume (completed sessions),
    or compliance (% of the last 14 days with a workout)."""
    if metric not in {"streaks", "volume", "compliance"}:
        metric = "streaks"
    users = db.query(User).filter(User.role != "coach").all()
    today = datetime.utcnow().date()
    window_start = today - timedelta(days=14)

    rows = []
    for u in users:
        sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == u.id).all()
        days = {s.date.date() for s in sessions if s.date}
        volume = sum(1 for s in sessions if s.is_completed)
        streak = _streak(days, today)
        active_days = len([d for d in days if d >= window_start])
        compliance = round(100 * active_days / 14)
        rows.append({
            "id": u.id,
            "name": "You" if u.id == current_user.id else (u.name or "Member"),
            "compliance": compliance,
            "streak": streak,
            "volume": volume,
            "is_current_user": u.id == current_user.id,
        })

    rows.sort(key=lambda r: r[metric], reverse=True)
    for i, r in enumerate(rows):
        r["rank"] = i + 1
    return {"metric": metric, "entries": rows}
