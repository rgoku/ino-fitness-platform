"""Re-export for backward compatibility. Prefer: from app.infrastructure.database.models import ..."""
from app.infrastructure.database.models import (
    Base,
    User,
    WorkoutPlan,
    Exercise,
    WorkoutSession,
    DietPlan,
    Meal,
    FoodEntry,
    ProgressEntry,
    Message,
    Reminder,
    Coach,
    Achievement,
    Subscription,
)

__all__ = [
    "Base",
    "User",
    "WorkoutPlan",
    "Exercise",
    "WorkoutSession",
    "DietPlan",
    "Meal",
    "FoodEntry",
    "ProgressEntry",
    "Message",
    "Reminder",
    "Coach",
    "Achievement",
    "Subscription",
]
