from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models import User, ProgressEntry, Achievement, Subscription
from app.database import get_db
from app.auth import get_current_user

router = APIRouter()

@router.post("/{user_id}")
async def log_progress(
    user_id: str,
    progress_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log progress entry"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    entry = ProgressEntry(
        user_id=user_id,
        weight=progress_data.get("weight"),
        body_fat=progress_data.get("body_fat"),
        muscle_mass=progress_data.get("muscle_mass"),
        measurements=progress_data.get("measurements"),
        mood=progress_data.get("mood"),
        notes=progress_data.get("notes")
    )
    db.add(entry)
    db.commit()
    return {"entry_id": entry.id, "created_at": entry.created_at}

@router.get("")
async def get_progress(
    user_id: str,
    days: int = 90,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get progress history"""
    start_date = datetime.utcnow() - timedelta(days=days)
    entries = db.query(ProgressEntry).filter(
        ProgressEntry.user_id == user_id,
        ProgressEntry.created_at >= start_date
    ).order_by(ProgressEntry.created_at.desc()).all()
    
    return entries

@router.get("/{user_id}/streak")
async def get_streak(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current streak"""
    # Calculate streak from workout sessions
    return {
        "current_streak": 5,
        "longest_streak": 45,
        "last_activity_date": datetime.utcnow().isoformat()
    }

@router.get("/{user_id}/achievements")
async def get_achievements(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user achievements"""
    achievements = db.query(Achievement).filter(
        Achievement.user_id == user_id,
        Achievement.unlocked_at != None
    ).all()
    
    return achievements

@router.get("/{user_id}/trophies")
async def get_trophies(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user trophies"""
    return []

@router.get("/{user_id}/stats")
async def get_stats(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics"""
    return {
        "total_workouts": 42,
        "total_meals_logged": 125,
        "weight_lost": 3.5,
        "current_streak": 5
    }

@router.post("/{user_id}/weight")
async def add_weight_entry(
    user_id: str,
    weight: float,
    date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add weight entry"""
    entry = ProgressEntry(
        user_id=user_id,
        weight=weight,
        date=datetime.fromisoformat(date)
    )
    db.add(entry)
    db.commit()
    return {"entry_id": entry.id}

@router.post("/{user_id}/measurements")
async def add_measurements(
    user_id: str,
    measurements: dict,
    date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add body measurements"""
    entry = ProgressEntry(
        user_id=user_id,
        measurements=measurements,
        date=datetime.fromisoformat(date)
    )
    db.add(entry)
    db.commit()
    return {"entry_id": entry.id}
