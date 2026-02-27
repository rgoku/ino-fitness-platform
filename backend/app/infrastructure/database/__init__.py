"""Database session and models. Re-exports for app.database / app.models compatibility."""
from app.infrastructure.database.session import (
    engine,
    SessionLocal,
    get_db,
    init_db,
)
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
    "engine",
    "SessionLocal",
    "get_db",
    "init_db",
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
