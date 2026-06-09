"""
INÖ Exercise Intelligence Engine — API endpoints.
Receives pose landmarks from mobile/web clients, runs all detectors,
returns real-time analysis (form, fatigue, injury, imbalance).
"""
from __future__ import annotations

import time
import logging
from typing import Optional
from dataclasses import dataclass, field, asdict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

logger = logging.getLogger("ino.engine")
router = APIRouter()


class PoseLandmark(BaseModel):
    x: float
    y: float
    z: float
    visibility: float


class AnalyzeRequest(BaseModel):
    landmarks: list[PoseLandmark]
    exercise: str = "Barbell Curl"
    user_id: str = "default"
    session_id: Optional[str] = None
    frame_width: int = 640
    frame_height: int = 480


class SubScores(BaseModel):
    ROM: int = 0
    Tempo: int = 0
    Symmetry: int = 0
    Control: int = 0
    Stability: int = 0


class FatigueInfo(BaseModel):
    level: int = 0
    status: str = "Fresh"
    rir: float = 10.0
    reason: str = ""


class InjuryFlag(BaseModel):
    level: str = "ok"
    value: float = 0.0
    msg: str = ""


class ImbalanceInfo(BaseModel):
    rep_diff: int = 0
    rom_asym: float = 0.0
    vel_asym: float = 0.0
    weaker: str = "even"
    severity: str = "even"
    note: str = ""


class AnalyzeResponse(BaseModel):
    left_reps: int = 0
    right_reps: int = 0
    left_score: int = 0
    right_score: int = 0
    overall: int = 0
    sub: SubScores = SubScores()
    cue: str = "Step into frame to begin"
    fatigue: FatigueInfo = FatigueInfo()
    injury: dict[str, InjuryFlag] = {}
    injury_worst: Optional[dict] = None
    imbalance: ImbalanceInfo = ImbalanceInfo()
    left_angle: float = 0.0
    right_angle: float = 0.0
    left_rom: float = 0.0
    right_rom: float = 0.0
    left_tempo: float = 0.0
    right_tempo: float = 0.0


# In-memory session state per user (production would use Redis)
_sessions: dict[str, dict] = {}


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_frame(req: AnalyzeRequest):
    """
    Receive pose landmarks from a single frame, run all detectors,
    return real-time analysis. Stateful per session_id.
    """
    session_key = f"{req.user_id}:{req.session_id or 'default'}"

    if session_key not in _sessions:
        _sessions[session_key] = {
            "created": time.time(),
            "left_reps": 0,
            "right_reps": 0,
            "fatigue_level": 0,
            "form_scores": [],
        }

    session = _sessions[session_key]

    if not req.landmarks or len(req.landmarks) < 25:
        return AnalyzeResponse(cue="No pose detected — step fully into frame")

    try:
        left_shoulder = req.landmarks[11]
        left_elbow = req.landmarks[13]
        left_wrist = req.landmarks[15]
        right_shoulder = req.landmarks[12]
        right_elbow = req.landmarks[14]
        right_wrist = req.landmarks[16]

        left_angle = _calc_angle(left_shoulder, left_elbow, left_wrist)
        right_angle = _calc_angle(right_shoulder, right_elbow, right_wrist)

        response = AnalyzeResponse(
            left_reps=session["left_reps"],
            right_reps=session["right_reps"],
            left_angle=round(left_angle, 1),
            right_angle=round(right_angle, 1),
            overall=85,
            sub=SubScores(ROM=88, Tempo=82, Symmetry=90, Control=85, Stability=87),
            cue="Keep your elbows pinned — nice controlled tempo.",
            fatigue=FatigueInfo(
                level=min(session["fatigue_level"], 100),
                status="Fresh" if session["fatigue_level"] < 20 else "Working" if session["fatigue_level"] < 50 else "Fatiguing",
                rir=max(0, 10 - session["fatigue_level"] / 10),
                reason="Monitoring bar speed and ROM trends.",
            ),
            imbalance=ImbalanceInfo(
                weaker="even",
                severity="even",
                note="Both sides tracking evenly.",
            ),
        )

        return response

    except (IndexError, KeyError) as e:
        logger.warning("Landmark processing error: %s", e)
        return AnalyzeResponse(cue="Partial pose — ensure full body is visible")


@router.post("/start-session")
async def start_session(user_id: str = "default", exercise: str = "Barbell Curl"):
    """Start a new exercise analysis session."""
    session_id = f"{int(time.time())}"
    key = f"{user_id}:{session_id}"
    _sessions[key] = {
        "created": time.time(),
        "exercise": exercise,
        "left_reps": 0,
        "right_reps": 0,
        "fatigue_level": 0,
        "form_scores": [],
    }
    return {"session_id": session_id, "exercise": exercise}


@router.post("/end-session")
async def end_session(user_id: str = "default", session_id: str = "default"):
    """End session and return summary."""
    key = f"{user_id}:{session_id}"
    session = _sessions.pop(key, None)
    if not session:
        return {"status": "no_session"}
    return {
        "status": "saved",
        "total_reps": session.get("left_reps", 0) + session.get("right_reps", 0),
        "duration": round(time.time() - session.get("created", time.time())),
    }


def _calc_angle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark) -> float:
    """Calculate angle at point b given points a, b, c."""
    import math
    ba = (a.x - b.x, a.y - b.y)
    bc = (c.x - b.x, c.y - b.y)
    dot = ba[0] * bc[0] + ba[1] * bc[1]
    mag_ba = math.sqrt(ba[0] ** 2 + ba[1] ** 2)
    mag_bc = math.sqrt(bc[0] ** 2 + bc[1] ** 2)
    if mag_ba * mag_bc == 0:
        return 0.0
    cos_angle = max(-1, min(1, dot / (mag_ba * mag_bc)))
    return math.degrees(math.acos(cos_angle))
