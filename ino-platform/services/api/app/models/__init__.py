"""Export all models for Alembic discovery and router imports."""
from app.models.models import (
    User,
    Coach,
    Client,
    ClientRiskFlag,
    Workout,
    Exercise,
    WorkoutAssignment,
    ExerciseCompletion,
    CheckIn,
    VideoReview,
    Message,
    AutomationRule,
    AutomationLog,
    Subscription,
)

__all__ = [
    "User", "Coach", "Client", "ClientRiskFlag",
    "Workout", "Exercise", "WorkoutAssignment", "ExerciseCompletion",
    "CheckIn", "VideoReview", "Message",
    "AutomationRule", "AutomationLog", "Subscription",
]
