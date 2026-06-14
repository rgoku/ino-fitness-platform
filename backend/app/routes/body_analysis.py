"""API routes for body analysis features."""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.models import User
from app.infrastructure.database.models import (
    BodyAnalysisSession,
    MuscleSnapshot,
    FormAnalysisResult,
)
from app.database import get_db
from app.auth import get_current_user
from app.domain.ai.body_analyzer import BodyAnalyzerService
from app.schemas.body_analysis import (
    BodyAnalysisCreate,
    BodyAnalysisResponse,
    BodyAnalysisHistory,
    TrainingReadinessResponse,
)

router = APIRouter()
body_analyzer = BodyAnalyzerService()

# ------------------------------------------------------------------
# Mapping from exercise names to primary muscle groups.
# Used to distribute logged sets into per-muscle volume.
# ------------------------------------------------------------------
# Muscle slugs MUST match the frontend MuscleSlug type:
# chest | obliques | abs | biceps | triceps | trapezius | deltoids
# quadriceps | tibialis | calves | forearm | adductors
# upper-back | lower-back | gluteal | hamstring
EXERCISE_MUSCLE_MAP: dict[str, list[str]] = {
    "bench press": ["chest", "triceps", "deltoids"],
    "squat": ["quadriceps", "gluteal", "hamstring"],
    "deadlift": ["hamstring", "gluteal", "lower-back"],
    "overhead press": ["deltoids", "triceps"],
    "barbell row": ["upper-back", "biceps", "deltoids"],
    "pull-up": ["upper-back", "biceps"],
    "lat pulldown": ["upper-back", "biceps"],
    "leg press": ["quadriceps", "gluteal"],
    "romanian deadlift": ["hamstring", "gluteal"],
    "lateral raise": ["deltoids"],
    "bicep curl": ["biceps"],
    "tricep pushdown": ["triceps"],
    "leg curl": ["hamstring"],
    "leg extension": ["quadriceps"],
    "calf raise": ["calves"],
    "hip thrust": ["gluteal"],
    "face pull": ["deltoids", "upper-back"],
    "cable fly": ["chest"],
    "incline press": ["chest", "deltoids", "triceps"],
    "dumbbell row": ["upper-back", "biceps"],
}


def _resolve_muscles(exercise_name: str) -> list[str]:
    """Return muscle slugs for a given exercise name (case-insensitive)."""
    key = exercise_name.strip().lower()
    if key in EXERCISE_MUSCLE_MAP:
        return EXERCISE_MUSCLE_MAP[key]
    # Fuzzy fallback: check if any known exercise is a substring
    for ex, muscles in EXERCISE_MUSCLE_MAP.items():
        if ex in key or key in ex:
            return muscles
    return ["general"]


def _compute_muscle_volumes(logged_sets: list[dict]) -> dict[str, float]:
    """Aggregate per-muscle volume from a list of logged sets."""
    volumes: dict[str, float] = {}
    for entry in logged_sets:
        exercise = entry.get("exercise", "")
        sets = float(entry.get("sets", 0))
        muscles = _resolve_muscles(exercise)
        per_muscle = sets / len(muscles) if muscles else sets
        for m in muscles:
            volumes[m] = volumes.get(m, 0) + per_muscle
    return volumes


def _assess_recovery(hours_since: float, sleep: float, nutrition: float) -> tuple[str, float]:
    """Simple heuristic for recovery status and readiness."""
    score = min(1.0, (hours_since / 72) * 0.5 + sleep * 0.3 + nutrition * 0.2)
    if score >= 0.8:
        return "recovered", score
    if score >= 0.5:
        return "recovering", score
    if score >= 0.3:
        return "fatigued", score
    return "overtrained", score


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------


@router.post("")
async def create_body_analysis(
    payload: BodyAnalysisCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new body analysis session from logged training data."""
    try:
        muscle_volumes = _compute_muscle_volumes(payload.logged_sets)
        total_volume = sum(float(e.get("sets", 0)) for e in payload.logged_sets)
        recovery_status, recovery_readiness = _assess_recovery(
            payload.hours_since_workout,
            payload.sleep_quality,
            payload.nutrition_score,
        )

        # Build per-muscle data dict for storage and AI analysis
        muscle_data: dict = {}
        for slug, vol in muscle_volumes.items():
            muscle_data[slug] = {
                "weekly_volume": vol,
                "recovery_status": recovery_status,
                "recovery_readiness": recovery_readiness,
            }

        # Ask AI for summary + grades
        ai_result = await body_analyzer.generate_analysis_summary(
            user_id=current_user.id,
            muscle_data=muscle_data,
            total_volume=total_volume,
            week_number=payload.week_number,
            year=payload.year,
        )

        session = BodyAnalysisSession(
            user_id=current_user.id,
            week_number=payload.week_number,
            year=payload.year,
            total_volume=total_volume,
            symmetry_score=ai_result.get("symmetry_score"),
            imbalance_score=ai_result.get("imbalance_score"),
            training_readiness=ai_result.get("training_readiness"),
            overall_grade=ai_result.get("overall_grade"),
            ai_summary=ai_result.get("summary"),
            muscle_data=muscle_data,
        )
        db.add(session)
        db.flush()

        # Persist individual muscle snapshots
        for slug, data in muscle_data.items():
            snapshot = MuscleSnapshot(
                session_id=session.id,
                muscle_slug=slug,
                weekly_volume=data["weekly_volume"],
                recovery_status=data["recovery_status"],
                recovery_readiness=data["recovery_readiness"],
            )
            db.add(snapshot)

        db.commit()
        db.refresh(session)

        return BodyAnalysisResponse.model_validate(session)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_analysis_history(
    limit: int = Query(12, ge=1, le=52),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the authenticated user's body analysis history."""
    sessions = (
        db.query(BodyAnalysisSession)
        .filter(BodyAnalysisSession.user_id == current_user.id)
        .order_by(BodyAnalysisSession.created_at.desc())
        .limit(limit)
        .all()
    )

    # Determine simple progress trend from the last few readiness scores
    readiness_scores = [
        s.training_readiness for s in sessions if s.training_readiness is not None
    ]
    if len(readiness_scores) >= 2:
        if readiness_scores[0] > readiness_scores[-1] + 5:
            trend = "improving"
        elif readiness_scores[0] < readiness_scores[-1] - 5:
            trend = "declining"
        else:
            trend = "stable"
    else:
        trend = "stable"

    return BodyAnalysisHistory(
        sessions=[BodyAnalysisResponse.model_validate(s) for s in sessions],
        progress_trend=trend,
        total_weeks=len(sessions),
    )


@router.get("/latest")
async def get_latest_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the most recent analysis session for the authenticated user."""
    session = (
        db.query(BodyAnalysisSession)
        .filter(BodyAnalysisSession.user_id == current_user.id)
        .order_by(BodyAnalysisSession.created_at.desc())
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="No analysis sessions found")
    return BodyAnalysisResponse.model_validate(session)


@router.get("/readiness")
async def get_training_readiness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current training readiness based on the latest muscle snapshots."""
    latest_session = (
        db.query(BodyAnalysisSession)
        .filter(BodyAnalysisSession.user_id == current_user.id)
        .order_by(BodyAnalysisSession.created_at.desc())
        .first()
    )
    if not latest_session:
        raise HTTPException(status_code=404, detail="No analysis sessions found")

    snapshots = (
        db.query(MuscleSnapshot)
        .filter(MuscleSnapshot.session_id == latest_session.id)
        .all()
    )

    readiness = await body_analyzer.generate_training_readiness(
        user_id=current_user.id,
        muscle_snapshots=snapshots,
    )

    return TrainingReadinessResponse(**readiness)


@router.get("/{session_id}")
async def get_analysis_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific analysis session by ID."""
    session = (
        db.query(BodyAnalysisSession)
        .filter(BodyAnalysisSession.id == session_id)
        .first()
    )
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis session not found")
    return BodyAnalysisResponse.model_validate(session)


@router.post("/ai-summary")
async def generate_ai_summary(
    session_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate (or regenerate) an AI summary for an existing analysis session."""
    session = (
        db.query(BodyAnalysisSession)
        .filter(BodyAnalysisSession.id == session_id)
        .first()
    )
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Analysis session not found")

    try:
        ai_result = await body_analyzer.generate_analysis_summary(
            user_id=current_user.id,
            muscle_data=session.muscle_data or {},
            total_volume=session.total_volume,
            week_number=session.week_number,
            year=session.year,
        )

        session.ai_summary = ai_result.get("summary")
        session.overall_grade = ai_result.get("overall_grade", session.overall_grade)
        session.symmetry_score = ai_result.get("symmetry_score", session.symmetry_score)
        session.imbalance_score = ai_result.get("imbalance_score", session.imbalance_score)
        session.training_readiness = ai_result.get("training_readiness", session.training_readiness)

        db.commit()
        db.refresh(session)

        return BodyAnalysisResponse.model_validate(session)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
