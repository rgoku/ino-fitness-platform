"""Pydantic schemas for API request/response models."""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


class TemplateExerciseCreate(BaseModel):
    exercise_name: str
    sets: int = 3
    reps: int = 10
    rest_seconds: int = 60
    notes: Optional[str] = None
    order_index: int = 0


class TemplateExercise(BaseModel):
    id: str
    template_id: str
    exercise_name: str
    sets: int
    reps: int
    rest_seconds: int
    notes: Optional[str] = None
    order_index: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkoutTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    weeks: int = 1
    days_per_week: int = 1
    thumbnail_url: Optional[str] = None
    is_public: Optional[bool] = False


class WorkoutTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    weeks: Optional[int] = None
    days_per_week: Optional[int] = None
    thumbnail_url: Optional[str] = None
    is_public: Optional[bool] = None


class WorkoutTemplate(BaseModel):
    id: str
    trainer_id: Optional[str] = None
    name: str
    description: Optional[str] = None
    weeks: int
    days_per_week: int
    thumbnail_url: Optional[str] = None
    is_public: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
