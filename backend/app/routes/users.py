from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import User
from app.database import get_db
from app.auth import get_current_user

router = APIRouter()

@router.get("/{user_id}")
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "age": user.age,
        "gender": user.gender,
        "weight": user.weight,
        "height": user.height,
        "fitness_goal": user.fitness_goal,
        "experience_level": user.experience_level,
        "subscription_tier": user.subscription_tier,
        "has_onboarded": user.has_onboarded
    }

@router.put("/{user_id}")
async def update_user_profile(
    user_id: str,
    updates: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    for key, value in updates.items():
        if hasattr(user, key):
            setattr(user, key, value)
    
    db.commit()
    return {"status": "updated"}

@router.post("/{user_id}/onboarding-complete")
async def complete_onboarding(
    user_id: str,
    biometrics: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark onboarding as complete"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    user = db.query(User).filter(User.id == user_id).first()
    user.has_onboarded = True
    user.age = biometrics.get("age")
    user.gender = biometrics.get("gender")
    user.weight = biometrics.get("weight")
    user.height = biometrics.get("height")
    user.fitness_goal = biometrics.get("fitness_goal")
    user.experience_level = biometrics.get("experience_level")
    user.biometrics_enabled = biometrics.get("biometrics_enabled", False)
    
    db.commit()
    return {"status": "onboarding_completed"}

@router.get("/{user_id}/current")
async def get_current_user_info(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user info"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "has_onboarded": current_user.has_onboarded
    }

@router.post("/{user_id}/preferences")
async def update_preferences(
    user_id: str,
    preferences: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user preferences"""
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    return {"status": "preferences_updated"}
