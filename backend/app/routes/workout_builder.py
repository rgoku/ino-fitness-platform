"""AI Workout Builder API routes."""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.infrastructure.database import get_db
from app.infrastructure.database.models import ExerciseDefinition, User
from app.schemas.workout_builder import (
    BuildWorkoutRequest,
    BuildWorkoutResponse,
    ExerciseCatalogItem,
    ExerciseDescription,
    GenerateDescriptionRequest,
    ParsedExercise,
    ParseWorkoutRequest,
    ParseWorkoutResponse,
    VideoMatch,
    VideoMatchRequest,
)
from app.services.workout_builder import (
    build_workout_from_text,
    generate_exercise_description_fallback,
    match_video,
    parse_workout_text,
)

router = APIRouter()


@router.post("/parse", response_model=ParseWorkoutResponse)
def parse_workout(
    body: ParseWorkoutRequest,
    _user: User = Depends(get_current_user),
):
    """Parse freeform workout text into structured exercises."""
    exercises = parse_workout_text(body.text)
    return ParseWorkoutResponse(
        exercises=[ParsedExercise(**e) for e in exercises],
        count=len(exercises),
    )


@router.post("/build", response_model=BuildWorkoutResponse)
def build_workout(
    body: BuildWorkoutRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Parse text, create template, enrich with AI descriptions and videos."""
    result = build_workout_from_text(db, user.id, body.name, body.text)
    if "error" in result:
        raise HTTPException(status_code=422, detail=result["error"])
    return result


@router.post("/exercise/describe", response_model=ExerciseDescription)
def describe_exercise(
    body: GenerateDescriptionRequest,
    _user: User = Depends(get_current_user),
):
    """Generate description, cues, and mistakes for an exercise."""
    return generate_exercise_description_fallback(body.exercise_name)


@router.post("/exercise/video", response_model=VideoMatch)
def match_exercise_video(
    body: VideoMatchRequest,
    _user: User = Depends(get_current_user),
):
    """Match an exercise to a demo video from the curated library."""
    return match_video(body.exercise_name)


@router.get("/catalog", response_model=List[ExerciseCatalogItem])
def list_exercise_catalog(
    q: str = "",
    muscle_group: str = "",
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Search the exercise catalog with optional filters."""
    query = db.query(ExerciseDefinition)
    if q:
        query = query.filter(ExerciseDefinition.name.ilike(f"%{q}%"))
    if muscle_group:
        query = query.filter(ExerciseDefinition.muscle_group == muscle_group)
    return query.order_by(ExerciseDefinition.name).limit(100).all()
