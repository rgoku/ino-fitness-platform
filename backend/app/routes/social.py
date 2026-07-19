"""Social leaderboard, derived from real activity (no fabricated numbers)."""
from collections import defaultdict
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.infrastructure.database import get_db
from app.infrastructure.database.models import User, WorkoutSession

# Cap the board so a large roster can never fan out into an unbounded scan.
LEADERBOARD_MAX_USERS = 200

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
    users = db.query(User).filter(User.role != "coach").limit(LEADERBOARD_MAX_USERS).all()
    today = datetime.utcnow().date()
    window_start = today - timedelta(days=14)

    # Fetch every relevant session in ONE query, then aggregate in memory —
    # avoids the previous N+1 (one query per user).
    user_ids = [u.id for u in users]
    days_by_user: dict = defaultdict(set)
    volume_by_user: dict = defaultdict(int)
    if user_ids:
        sess_rows = (
            db.query(WorkoutSession.user_id, WorkoutSession.date, WorkoutSession.is_completed)
            .filter(WorkoutSession.user_id.in_(user_ids))
            .all()
        )
        for uid, sdate, completed in sess_rows:
            if sdate:
                days_by_user[uid].add(sdate.date())
            if completed:
                volume_by_user[uid] += 1

    rows = []
    for u in users:
        days = days_by_user.get(u.id, set())
        volume = volume_by_user.get(u.id, 0)
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
