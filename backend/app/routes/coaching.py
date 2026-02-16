from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import User, Message, Coach
from app.database import get_db
from app.auth import get_current_user

router = APIRouter()

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
