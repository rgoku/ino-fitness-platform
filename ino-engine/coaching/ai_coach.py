"""
ai_coach.py
-----------
The hub. Combines persisted history (session_logger) with a recovery/profile
snapshot to produce a readiness score, a daily brief, and per-exercise
prescriptions (via progressive_overload). This is what "builds workouts
automatically" — heuristic now, a drop-in seam for an ML policy later.

Usage
~~~~~
    coach = PersonalCoach(user="ruben",
                          profile=UserProfile(goal="hypertrophy"))
    coach.update_recovery(sleep_h=7.5, soreness=3, nutrition=0.9, rhr=54)
    brief = coach.daily_brief(exercises=["Barbell Curl", "Back Squat"])
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from progressive_overload import ProgressiveOverloadEngine, OverloadConfig
from session_logger import SessionLogger


@dataclass
class UserProfile:
    goal: str = "hypertrophy"          # strength | hypertrophy | fat_loss
    experience: str = "intermediate"
    rep_range: tuple = (8, 12)


@dataclass
class Recovery:
    sleep_h: float = 7.5
    soreness: int = 2                  # 1 (none) – 5 (severe)
    nutrition: float = 0.9             # 0–1 adherence
    rhr: Optional[int] = None          # resting HR (bpm), optional


class PersonalCoach:
    def __init__(self, user: str = "default", profile: Optional[UserProfile] = None):
        self.user = user
        self.profile = profile or UserProfile()
        self.recovery = Recovery()
        lo, hi = self.profile.rep_range
        self.overload = ProgressiveOverloadEngine(OverloadConfig(rep_low=lo, rep_high=hi))

    def update_recovery(self, **kw) -> None:
        for k, v in kw.items():
            if hasattr(self.recovery, k):
                setattr(self.recovery, k, v)

    # -- readiness 0–100 ----------------------------------------------------
    def readiness(self) -> Dict[str, object]:
        r = self.recovery
        sleep_s = max(0.0, min(1.0, (r.sleep_h - 5) / 3))        # 5h→0, 8h→1
        sore_s = max(0.0, (5 - r.soreness) / 4)                  # 1→1, 5→0
        nut_s = max(0.0, min(1.0, r.nutrition))
        score = round((0.45 * sleep_s + 0.35 * sore_s + 0.20 * nut_s) * 100)
        if score >= 75:
            band, advice = "Primed", "Push it — green light for adding load."
        elif score >= 55:
            band, advice = "Ready", "Train as planned; progress where it feels strong."
        elif score >= 38:
            band, advice = "Caution", "Hold loads, drop a set, prioritize technique."
        else:
            band, advice = "Recover", "Light/active recovery — don't chase PRs today."
        return {"score": score, "band": band, "advice": advice}

    # -- per-exercise prescription -----------------------------------------
    def prescribe(self, exercise: str) -> Dict[str, object]:
        hist = SessionLogger.exercise_history(self.user, exercise)
        rec = self.overload.recommend(hist)
        ready = self.readiness()
        # readiness can veto an aggressive jump
        if ready["score"] < 55 and rec.action in ("add_weight", "add_set"):
            note = f"(held back from {rec.action} — readiness {ready['score']})"
            return {"exercise": exercise, "action": "hold", "detail":
                    f"Repeat last session. {note}", "history_sessions": len(hist)}
        return {"exercise": exercise, "action": rec.action, "detail": rec.detail,
                "target_weight": rec.target_weight, "target_reps": rec.target_reps,
                "target_sets": rec.target_sets, "history_sessions": len(hist)}

    # -- daily brief --------------------------------------------------------
    def daily_brief(self, exercises: List[str]) -> Dict[str, object]:
        return {
            "user": self.user,
            "readiness": self.readiness(),
            "goal": self.profile.goal,
            "plan": [self.prescribe(ex) for ex in exercises],
        }
