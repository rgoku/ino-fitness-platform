"""
ino-engine.coaching
-------------------
AI-powered coaching layer: readiness scoring, progressive-overload
prescriptions, persistent session logging, real-time cue generation,
and muscle-activation mapping.
"""
from .ai_coach import PersonalCoach, UserProfile, Recovery             # noqa: F401
from .progressive_overload import ProgressiveOverloadEngine            # noqa: F401
from .session_logger import SessionLogger                              # noqa: F401
from .cue_engine import CueEngine, CueResult                          # noqa: F401
from .muscle_targeting import (                                        # noqa: F401
    MuscleTarget,
    get_muscle_targets,
    get_muscle_targets_safe,
    exercises_for_muscle,
    muscle_volume_summary,
    heatmap_data,
    list_exercises,
)
