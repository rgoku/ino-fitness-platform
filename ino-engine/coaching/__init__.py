"""
ino-engine.coaching
-------------------
AI-powered coaching layer: readiness scoring, progressive-overload
prescriptions, and persistent session logging.
"""
from .ai_coach import PersonalCoach, UserProfile, Recovery             # noqa: F401
from .progressive_overload import ProgressiveOverloadEngine            # noqa: F401
from .session_logger import SessionLogger                              # noqa: F401
