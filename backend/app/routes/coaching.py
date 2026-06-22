from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.models import User, Message, Coach, WorkoutSession, WorkoutPlan
from app.database import get_db
from app.auth import get_current_user
from app.core.security import require_coach

router = APIRouter()


def _client_to_dto(u: User, sessions_by_user: dict, plans_by_user: dict) -> dict:
    """Shape a User row into the MockClient interface the trainer dashboard expects."""
    sessions = sessions_by_user.get(u.id, [])
    completed = [s for s in sessions if s.is_completed]
    plan_count = plans_by_user.get(u.id, 0)
    last_session = max((s.date for s in sessions if s.date), default=None)
    last_active = last_session.isoformat() if last_session else (u.created_at.isoformat() if u.created_at else "")
    # Crude status: active in last 7d, at-risk 7-21d, inactive >21d
    if last_session:
        delta_days = (datetime.utcnow() - last_session).days
        status = "active" if delta_days <= 7 else ("at-risk" if delta_days <= 21 else "inactive")
    else:
        status = "inactive"
    compliance = round((len(completed) / plan_count) * 100) if plan_count else 0
    return {
        "id": u.id,
        "trainer_id": "",
        "name": u.name or u.email or "Client",
        "email": u.email,
        "avatar_url": u.profile_picture_url,
        "status": status,
        "compliance": min(compliance, 100),
        "lastActive": last_active,
        "joinedAt": u.created_at.isoformat() if u.created_at else "",
        "workoutsAssigned": plan_count,
        "workoutsCompleted": len(completed),
        "currentStreak": 0,
        "flags": [],
    }


@router.get("/clients")
async def list_clients(
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    """List clients assigned to the authenticated coach.
    Falls back to all non-coach users if no coach_id assignment exists yet
    (early-platform behavior; tighten when assignment workflow ships).
    """
    owned = db.query(User).filter(User.coach_id == current_user.id).all()
    if owned:
        users = owned
    else:
        # Fallback during seeding: show all clients (role != 'coach')
        users = (
            db.query(User)
            .filter(User.id != current_user.id, User.role != "coach")
            .all()
        )
    sessions = db.query(WorkoutSession).all()
    plans = db.query(WorkoutPlan.user_id, func.count(WorkoutPlan.id)).group_by(WorkoutPlan.user_id).all()
    plans_by_user = {uid: cnt for uid, cnt in plans}
    sessions_by_user: dict = {}
    for s in sessions:
        sessions_by_user.setdefault(s.user_id, []).append(s)
    return [_client_to_dto(u, sessions_by_user, plans_by_user) for u in users]


@router.get("/clients/{client_id}")
async def get_client(
    client_id: str,
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    """Get a single client by id."""
    user = db.query(User).filter(User.id == client_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Client not found")
    sessions = db.query(WorkoutSession).filter(WorkoutSession.user_id == client_id).all()
    plan_count = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == client_id).count()
    return _client_to_dto(user, {client_id: sessions}, {client_id: plan_count})


@router.get("/alerts")
async def coach_alerts(
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    """Risk signals across the coach's roster (weight stall, low adherence,
    skipped workouts, nutrition miss). Coach-only per spec."""
    from app.domain.alerts import alert_service
    alerts = alert_service.compute_for_coach(db, current_user)
    return [a.to_dict() for a in alerts]


@router.get("/alerts/summary")
async def coach_alerts_summary(
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    """Per-severity alert counts for dashboard badges."""
    from app.domain.alerts import alert_service
    return alert_service.summary_for_coach(db, current_user)


@router.get("/analytics")
async def coaching_analytics(
    current_user: User = Depends(require_coach),
    db: Session = Depends(get_db),
):
    """Aggregate stats for the coach dashboard."""
    total_clients = db.query(User).filter(User.id != current_user.id).count()
    cutoff = datetime.utcnow() - timedelta(days=7)
    active_clients = (
        db.query(WorkoutSession.user_id)
        .filter(WorkoutSession.date >= cutoff)
        .distinct()
        .count()
    )
    total_plans = db.query(WorkoutPlan).count()
    completed_sessions = db.query(WorkoutSession).filter(WorkoutSession.is_completed == True).count()
    return {
        "total_clients": total_clients,
        "active_clients": active_clients,
        "at_risk_clients": max(total_clients - active_clients, 0),
        "total_workout_plans": total_plans,
        "completed_sessions": completed_sessions,
    }


@router.get("/coaches")
async def get_available_coaches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of available coaches"""
    coaches = db.query(Coach).all()
    return coaches

@router.get("/coaches/{coach_id}")
async def get_coach_profile(
    coach_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get coach profile"""
    coach = db.query(Coach).filter(Coach.id == coach_id).first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    return coach

@router.post("/hire")
async def hire_coach(
    coach_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Hire a coach"""
    coach = db.query(Coach).filter(Coach.id == coach_id).first()
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    
    # Add user to coach's clients
    return {"status": "coach_hired", "coach_id": coach_id}

@router.post("/messages")
async def send_message(
    recipient_id: str,
    content: str,
    message_type: str = "text",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send message to coach"""
    message = Message(
        user_id=current_user.id,
        coach_id=recipient_id,
        sender_type="user",
        content=content,
        message_type=message_type
    )
    db.add(message)
    db.commit()
    return {"message_id": message.id}

@router.get("/conversations/{coach_id}")
async def get_conversation(
    coach_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get conversation with coach"""
    messages = db.query(Message).filter(
        Message.user_id == current_user.id,
        Message.coach_id == coach_id
    ).order_by(Message.created_at.desc()).offset(offset).limit(limit).all()
    
    return messages[::-1]  # Reverse to get chronological order

@router.post("/conversations/{coach_id}/read")
async def mark_conversation_as_read(
    coach_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark conversation as read"""
    db.query(Message).filter(
        Message.user_id == current_user.id,
        Message.coach_id == coach_id,
        Message.read == False
    ).update({"read": True})
    db.commit()
    return {"status": "marked_read"}

@router.post("/schedule")
async def schedule_session(
    coach_id: str,
    start_time: str,
    duration: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Schedule coaching session"""
    return {
        "session_id": "session_123",
        "coach_id": coach_id,
        "start_time": start_time,
        "duration": duration,
        "status": "scheduled"
    }

@router.get("/sessions/upcoming")
async def get_upcoming_sessions(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get upcoming coaching sessions"""
    return []

@router.post("/form-check-requests")
async def send_form_check_request(
    coach_id: str,
    image_uris: list,
    exercise_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send form check request to coach"""
    return {
        "request_id": "fcr_123",
        "coach_id": coach_id,
        "exercise": exercise_name,
        "status": "pending"
    }
