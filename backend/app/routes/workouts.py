from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Query, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import json

from app.models import User, WorkoutPlan, Exercise, WorkoutSession
from app.schemas import WorkoutPlanCreate, ExerciseCreate
from app.database import get_db
from app.auth import get_current_user
from app.ai_service import AIService
from app.middleware.rate_limit import limiter

router = APIRouter()
router.state.limiter = limiter
ai_service = AIService()

@router.post("/plans/generate")
async def generate_workout_plan(
    biometrics: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an AI-powered workout plan based on user biometrics"""
    try:
        # Use AI service to generate personalized plan
        plan_data = await ai_service.generate_workout_plan(
            user_id=current_user.id,
            biometrics=biometrics
        )
        
        # Create and save plan
        workout_plan = WorkoutPlan(
            user_id=current_user.id,
            name=plan_data.get("name", "My Workout Plan"),
            description=plan_data.get("description", ""),
            difficulty=biometrics.get("experience_level", "beginner"),
            duration=plan_data.get("duration", 8),
            focus_areas=plan_data.get("focus_areas", []),
            generated_by="ai"
        )
        db.add(workout_plan)
        db.flush()
        
        # Add exercises
        for exercise_data in plan_data.get("exercises", []):
            exercise = Exercise(
                workout_plan_id=workout_plan.id,
                name=exercise_data.get("name", ""),
                description=exercise_data.get("description", ""),
                muscle_groups=exercise_data.get("muscle_groups", []),
                equipment=exercise_data.get("equipment", []),
                instructions=exercise_data.get("instructions", []),
                sets=exercise_data.get("sets", 3),
                reps=exercise_data.get("reps", 10),
                rest_seconds=exercise_data.get("rest_seconds", 60),
                video_url=exercise_data.get("video_url"),
                image_url=exercise_data.get("image_url")
            )
            db.add(exercise)
        
        db.commit()
        return {"success": True, "plan_id": workout_plan.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/plans")
async def get_workout_plans(
    user_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all workout plans for a user"""
    plans = db.query(WorkoutPlan).filter(WorkoutPlan.user_id == user_id).all()
    return plans

@router.get("/plans/{plan_id}")
async def get_workout_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific workout plan with exercises"""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == plan_id).first()
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Workout plan not found")
    return plan

@router.post("/sessions")
async def start_workout_session(
    workout_plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new workout session"""
    plan = db.query(WorkoutPlan).filter(WorkoutPlan.id == workout_plan_id).first()
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Workout plan not found")
    
    session = WorkoutSession(
        workout_plan_id=workout_plan_id,
        user_id=current_user.id,
        duration=plan.duration
    )
    db.add(session)
    db.commit()
    return {"session_id": session.id, "status": "started"}

@router.post("/sessions/{session_id}/complete")
async def complete_workout_session(
    session_id: str,
    session_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete a workout session"""
    session = db.query(WorkoutSession).filter(
        WorkoutSession.id == session_id,
        WorkoutSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session.is_completed = True
    session.calories_burned = session_data.get("calories_burned", 0)
    session.session_data = session_data
    session.date = datetime.utcnow()
    
    db.commit()
    return {"status": "completed"}

@router.post("/analyze-form")
@limiter.limit("20/hour")
async def analyze_exercise_form(
    request: Request,
    session_id: str = Query(...),
    exercise: str = Query(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze exercise form from uploaded video with real-time pattern recognition"""
    try:
        # Save and process file
        content = await file.read()
        
        # Use AI service with MediaPipe pose detection
        feedback = await ai_service.analyze_exercise_form(
            exercise_name=exercise,
            file_content=content,
            file_type=file.content_type
        )
        
        # Save form check result
        if feedback.get('score'):
            form_check_data = {
                "session_id": session_id,
                "exercise": exercise,
                "score": feedback.get('score'),
                "strengths": feedback.get('strengths', []),
                "improvements": feedback.get('improvements', []),
                "recommendations": feedback.get('recommendations', []),
                "warnings": feedback.get('warnings', []),
                "safety_level": feedback.get('safety_level', 'moderate'),
                "timestamp": datetime.utcnow().isoformat()
            }
            # Store in database or cache
        
        return feedback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_workout_stats(
    user_id: str = Query(...),
    days: int = Query(30),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get workout statistics for user"""
    start_date = datetime.utcnow() - timedelta(days=days)
    
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id,
        WorkoutSession.date >= start_date,
        WorkoutSession.is_completed == True
    ).all()
    
    total_workouts = len(sessions)
    total_calories = sum(s.calories_burned for s in sessions)
    avg_duration = sum(s.duration for s in sessions) / total_workouts if total_workouts > 0 else 0
    
    return {
        "workouts_completed": total_workouts,
        "total_calories": total_calories,
        "average_duration": avg_duration,
        "days_worked_out": len(set(s.date.date() for s in sessions))
    }

@router.get("/exercises/library")
async def get_exercise_library(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get library of all exercises"""
    exercises = db.query(Exercise).filter(Exercise.workout_plan_id == None).all()
    return exercises

@router.post("/exercises/{exercise_id}/favorite")
async def favorite_exercise(
    exercise_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add exercise to favorites"""
    # Implementation would store favorites in a separate table
    return {"status": "favorited"}

@router.get("/sessions")
async def get_workout_sessions(
    user_id: str = Query(...),
    limit: int = Query(10),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent workout sessions"""
    sessions = db.query(WorkoutSession).filter(
        WorkoutSession.user_id == user_id
    ).order_by(WorkoutSession.date.desc()).limit(limit).all()
    
    return sessions
