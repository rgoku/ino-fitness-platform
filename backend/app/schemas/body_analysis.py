"""Schemas for the Body Analysis feature."""
from datetime import datetime
from typing import Dict, Any, List, Optional

from pydantic import BaseModel


class MuscleSnapshotSchema(BaseModel):
    muscle_slug: str
    weekly_volume: float
    recovery_status: Optional[str] = None
    recovery_readiness: Optional[float] = None
    growth_phase: Optional[str] = None
    trend_direction: Optional[str] = None
    imbalance_status: Optional[str] = None


class BodyAnalysisCreate(BaseModel):
    week_number: int
    year: int
    logged_sets: List[Dict[str, Any]]  # [{exercise: str, sets: int}]
    hours_since_workout: float = 24
    sleep_quality: float = 0.8
    nutrition_score: float = 0.8


class BodyAnalysisResponse(BaseModel):
    id: str
    user_id: str
    week_number: int
    year: int
    total_volume: float
    symmetry_score: Optional[float] = None
    imbalance_score: Optional[float] = None
    training_readiness: Optional[float] = None
    overall_grade: Optional[str] = None
    ai_summary: Optional[str] = None
    muscle_data: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BodyAnalysisHistory(BaseModel):
    sessions: List[BodyAnalysisResponse]
    progress_trend: str  # improving/stable/declining
    total_weeks: int


class FormAnalysisCreate(BaseModel):
    exercise_name: str
    video_url: Optional[str] = None


class FormAnalysisResponse(BaseModel):
    id: str
    exercise_name: str
    overall_score: float
    rep_count: Optional[int] = None
    form_issues: Optional[List[Dict[str, Any]]] = None
    recommendations: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TrainingReadinessResponse(BaseModel):
    overall_readiness: float  # 0-100
    ready_muscles: List[str]
    recovering_muscles: List[str]
    fatigued_muscles: List[str]
    suggested_focus: List[str]
    recommendation: str
