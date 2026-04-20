"""Schemas for the AI Workout Builder."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ParseWorkoutRequest(BaseModel):
    text: str = Field(..., min_length=3, max_length=5000, description="Freeform workout text, e.g. 'Bench Press 4x8, Squats 5x5'")


class ParsedExercise(BaseModel):
    exercise_name: str
    sets: int
    reps: int
    rest_seconds: int = 60
    rpe: Optional[float] = None
    notes: Optional[str] = None
    order_index: int = 0
    muscle_group: str = "general"


class ParseWorkoutResponse(BaseModel):
    exercises: List[ParsedExercise]
    count: int


class BuildWorkoutRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    text: str = Field(..., min_length=3, max_length=5000)


class VideoMatch(BaseModel):
    source: str
    youtube_id: Optional[str] = None
    url: Optional[str] = None
    thumbnail: Optional[str] = None


class EnrichedExercise(BaseModel):
    id: str
    exercise_name: str
    sets: int
    reps: int
    rest_seconds: int
    rpe: Optional[float] = None
    notes: Optional[str] = None
    order_index: int
    muscle_group: str
    description: Optional[str] = None
    cues: Optional[List[str]] = None
    common_mistakes: Optional[List[str]] = None
    muscles: Optional[List[str]] = None
    video: VideoMatch


class BuildWorkoutResponse(BaseModel):
    template_id: str
    name: str
    exercises: List[EnrichedExercise]
    exercise_count: int
    muscle_groups: List[str]


class GenerateDescriptionRequest(BaseModel):
    exercise_name: str = Field(..., min_length=1, max_length=200)


class ExerciseDescription(BaseModel):
    description: str
    cues: List[str]
    common_mistakes: List[str]
    muscles: List[str]


class VideoMatchRequest(BaseModel):
    exercise_name: str = Field(..., min_length=1, max_length=200)


class ExerciseCatalogItem(BaseModel):
    id: str
    name: str
    muscle_group: str
    secondary_muscles: Optional[List[str]] = None
    description: Optional[str] = None
    cues: Optional[List[str]] = None
    common_mistakes: Optional[List[str]] = None
    equipment: Optional[str] = None
    video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    difficulty: str = "intermediate"

    class Config:
        from_attributes = True
