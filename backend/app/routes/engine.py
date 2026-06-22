"""
INÖ Exercise Intelligence Engine — API endpoints.
Receives pose landmarks from mobile/web clients, runs all detectors,
returns real-time analysis (form, fatigue, injury, imbalance).
"""
from __future__ import annotations

import importlib
import importlib.util
import sys
import time
import logging
import math
from pathlib import Path
from typing import Optional
from dataclasses import dataclass, field, asdict

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# ---------------------------------------------------------------------------
# Wire ino-engine into import path so detectors / coaching modules resolve.
#
# We add core/ first so that modules doing ``from angle_calculator import …``
# (without the ``core.`` prefix) resolve correctly. We use importlib to load
# individual .py files rather than package imports, because the detectors
# ``__init__.py`` pulls in bicep_curl_detector which requires cv2 (not
# available in the backend virtualenv).
# ---------------------------------------------------------------------------
_ENGINE_ROOT = Path(__file__).resolve().parents[3] / "ino-engine"
_CORE_DIR = str(_ENGINE_ROOT / "core")
if _CORE_DIR not in sys.path:
    sys.path.insert(0, _CORE_DIR)
if str(_ENGINE_ROOT) not in sys.path:
    sys.path.insert(0, str(_ENGINE_ROOT))

logger = logging.getLogger("ino.engine")


def _load_module(name: str, filepath: Path):
    """Load a single .py module by filepath, bypassing package __init__.py."""
    spec = importlib.util.spec_from_file_location(name, str(filepath))
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot create spec for {filepath}")
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod  # register before exec so intra-module refs work
    spec.loader.exec_module(mod)
    return mod


# ---------------------------------------------------------------------------
# Import real detector / coaching modules — gracefully degrade if any fail.
# ---------------------------------------------------------------------------
_DETECTORS_AVAILABLE = False
_CUE_ENGINE_AVAILABLE = False
_MUSCLE_TARGETING_AVAILABLE = False
_FATIGUE_AVAILABLE = False
_INJURY_AVAILABLE = False
_IMBALANCE_AVAILABLE = False

# Sentinel references (overwritten on successful import)
UniversalDetector = None   # type: ignore[assignment]
AnalysisResult = None      # type: ignore[assignment]
CueEngine = None           # type: ignore[assignment]
get_muscle_targets_safe = None  # type: ignore[assignment]
primary_muscles = None     # type: ignore[assignment]
heatmap_data = None        # type: ignore[assignment]
FatigueDetector = None     # type: ignore[assignment]
InjuryRiskDetector = None  # type: ignore[assignment]
ImbalanceDetector = None   # type: ignore[assignment]

try:
    _mod = _load_module(
        "ino_movement_detector",
        _ENGINE_ROOT / "detectors" / "movement_detector.py",
    )
    UniversalDetector = _mod.UniversalDetector
    AnalysisResult = _mod.AnalysisResult
    _DETECTORS_AVAILABLE = True
    logger.info("UniversalDetector loaded successfully")
except Exception as exc:
    logger.warning("Could not import UniversalDetector: %s", exc)

try:
    _mod = _load_module(
        "ino_cue_engine",
        _ENGINE_ROOT / "coaching" / "cue_engine.py",
    )
    CueEngine = _mod.CueEngine
    _CUE_ENGINE_AVAILABLE = True
    logger.info("CueEngine loaded successfully")
except Exception as exc:
    logger.warning("Could not import CueEngine: %s", exc)

try:
    _mod = _load_module(
        "ino_muscle_targeting",
        _ENGINE_ROOT / "coaching" / "muscle_targeting.py",
    )
    get_muscle_targets_safe = _mod.get_muscle_targets_safe
    primary_muscles = _mod.primary_muscles
    heatmap_data = _mod.heatmap_data
    _MUSCLE_TARGETING_AVAILABLE = True
    logger.info("Muscle targeting loaded successfully")
except Exception as exc:
    logger.warning("Could not import muscle_targeting: %s", exc)

try:
    _mod = _load_module(
        "ino_fatigue_detector",
        _ENGINE_ROOT / "detectors" / "fatigue_detector.py",
    )
    FatigueDetector = _mod.FatigueDetector
    _FATIGUE_AVAILABLE = True
    logger.info("FatigueDetector loaded successfully")
except Exception as exc:
    logger.warning("Could not import FatigueDetector: %s", exc)

try:
    _mod = _load_module(
        "ino_injury_risk_detector",
        _ENGINE_ROOT / "detectors" / "injury_risk_detector.py",
    )
    InjuryRiskDetector = _mod.InjuryRiskDetector
    _INJURY_AVAILABLE = True
    logger.info("InjuryRiskDetector loaded successfully")
except Exception as exc:
    logger.warning("Could not import InjuryRiskDetector: %s", exc)

try:
    _mod = _load_module(
        "ino_imbalance_detector",
        _ENGINE_ROOT / "detectors" / "imbalance_detector.py",
    )
    ImbalanceDetector = _mod.ImbalanceDetector
    _IMBALANCE_AVAILABLE = True
    logger.info("ImbalanceDetector loaded successfully")
except Exception as exc:
    logger.warning("Could not import ImbalanceDetector: %s", exc)


router = APIRouter()


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

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
    muscles_targeted: list[str] = []


# ---------------------------------------------------------------------------
# Landmark adapter — bridge API PoseLandmark list to MediaPipe-style object
# ---------------------------------------------------------------------------

class _LandmarkEntry:
    """Duck-typed replacement for mediapipe NormalizedLandmark."""
    __slots__ = ("x", "y", "z", "visibility")

    def __init__(self, x: float, y: float, z: float, visibility: float):
        self.x = x
        self.y = y
        self.z = z
        self.visibility = visibility


class _LandmarkList:
    """
    Duck-typed replacement for mediapipe NormalizedLandmarkList.
    Provides ``landmark[index]`` access the way angle_calculator expects.
    """
    __slots__ = ("landmark",)

    def __init__(self, api_landmarks: list[PoseLandmark]):
        self.landmark = [
            _LandmarkEntry(lm.x, lm.y, lm.z, lm.visibility)
            for lm in api_landmarks
        ]


# ---------------------------------------------------------------------------
# Exercise slug normalizer
# ---------------------------------------------------------------------------

def _to_slug(exercise_name: str) -> str:
    """Convert a human-readable exercise name into a detector slug."""
    return exercise_name.strip().lower().replace(" ", "_").replace("-", "_")


# ---------------------------------------------------------------------------
# In-memory session state per user (production would use Redis)
# ---------------------------------------------------------------------------

_sessions: dict[str, dict] = {}
# Store the last analysis result per session for the /state endpoint
_last_results: dict[str, AnalyzeResponse] = {}


def _get_or_create_session(session_key: str, exercise_slug: str) -> dict:
    """Get an existing session or create a new one with real detector instances."""
    if session_key in _sessions:
        return _sessions[session_key]

    session: dict = {
        "created": time.time(),
        "exercise_slug": exercise_slug,
        "left_reps": 0,
        "right_reps": 0,
        "fatigue_level": 0,
        "form_scores": [],
        # Track previous rep counts to detect new reps for fatigue updates
        "_prev_total_reps": 0,
    }

    # Instantiate real detectors if available
    if _DETECTORS_AVAILABLE:
        try:
            session["detector"] = UniversalDetector(exercise_slug=exercise_slug)
        except Exception as exc:
            logger.warning("Failed to create UniversalDetector for %s: %s", exercise_slug, exc)

    if _CUE_ENGINE_AVAILABLE:
        try:
            session["cue_engine"] = CueEngine()
        except Exception as exc:
            logger.warning("Failed to create CueEngine: %s", exc)

    if _FATIGUE_AVAILABLE:
        try:
            session["fatigue_detector"] = FatigueDetector()
        except Exception as exc:
            logger.warning("Failed to create FatigueDetector: %s", exc)

    if _INJURY_AVAILABLE:
        try:
            session["injury_detector"] = InjuryRiskDetector()
        except Exception as exc:
            logger.warning("Failed to create InjuryRiskDetector: %s", exc)

    if _IMBALANCE_AVAILABLE:
        try:
            session["imbalance_detector"] = ImbalanceDetector()
        except Exception as exc:
            logger.warning("Failed to create ImbalanceDetector: %s", exc)

    _sessions[session_key] = session
    return session


# ---------------------------------------------------------------------------
# Fallback angle calculation (kept for when detectors are unavailable)
# ---------------------------------------------------------------------------

def _calc_angle(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark) -> float:
    """Calculate angle at point b given points a, b, c."""
    ba = (a.x - b.x, a.y - b.y)
    bc = (c.x - b.x, c.y - b.y)
    dot = ba[0] * bc[0] + ba[1] * bc[1]
    mag_ba = math.sqrt(ba[0] ** 2 + ba[1] ** 2)
    mag_bc = math.sqrt(bc[0] ** 2 + bc[1] ** 2)
    if mag_ba * mag_bc == 0:
        return 0.0
    cos_angle = max(-1, min(1, dot / (mag_ba * mag_bc)))
    return math.degrees(math.acos(cos_angle))


# ---------------------------------------------------------------------------
# POST /analyze
# ---------------------------------------------------------------------------

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_frame(req: AnalyzeRequest):
    """
    Receive pose landmarks from a single frame, run all detectors,
    return real-time analysis. Stateful per session_id.
    """
    session_key = f"{req.user_id}:{req.session_id or 'default'}"
    exercise_slug = _to_slug(req.exercise)
    session = _get_or_create_session(session_key, exercise_slug)

    if not req.landmarks or len(req.landmarks) < 25:
        result = AnalyzeResponse(cue="No pose detected — step fully into frame")
        _last_results[session_key] = result
        return result

    # Convert API landmarks to the duck-typed format detectors expect
    lm_list = _LandmarkList(req.landmarks)

    # -- Run UniversalDetector (form scoring, rep counting, phase) ----------
    analysis = None
    if "detector" in session:
        try:
            analysis = session["detector"].process_frame(
                lm_list, req.frame_width, req.frame_height
            )
        except Exception as exc:
            logger.warning("UniversalDetector.process_frame failed: %s", exc)

    # -- Run InjuryRiskDetector --------------------------------------------
    injury_flags: dict[str, dict] = {}
    injury_worst: Optional[dict] = None
    if "injury_detector" in session:
        try:
            injury_flags = session["injury_detector"].process(
                lm_list, req.frame_width, req.frame_height
            )
            injury_worst = InjuryRiskDetector.worst(injury_flags) if injury_flags else None
        except Exception as exc:
            logger.warning("InjuryRiskDetector.process failed: %s", exc)

    # -- Update FatigueDetector (only on new reps) --------------------------
    fatigue_state = None
    if analysis and "fatigue_detector" in session:
        try:
            total_reps = analysis.total_reps
            prev_total = session.get("_prev_total_reps", 0)
            if total_reps > prev_total:
                # A rep just completed — feed fatigue detector per-rep data
                # Extract ROM and tempo from the analysis joint_angles (best effort)
                fd = session["fatigue_detector"]
                # Use the sub-scores as a proxy for form_score
                form_score = analysis.overall_score
                # Attempt to pull ROM/tempo from the detector's trackers
                det = session["detector"]
                rom_val = None
                tempo_val = None
                for tracker in det._trackers.values():
                    if tracker.last_rom is not None:
                        rom_val = tracker.last_rom
                    if tracker.last_tempo is not None:
                        tempo_val = tracker.last_tempo
                    break  # use the first tracker that has data
                fd.update_rep(rom=rom_val, tempo=tempo_val, form_score=form_score)
                session["_prev_total_reps"] = total_reps
            fatigue_state = session["fatigue_detector"].state()
        except Exception as exc:
            logger.warning("FatigueDetector update failed: %s", exc)

    # -- Update ImbalanceDetector ------------------------------------------
    imbalance_report = None
    if analysis and "imbalance_detector" in session:
        try:
            im = session["imbalance_detector"]
            im.set_reps(left=analysis.left_reps, right=analysis.right_reps)
            # Feed per-side ROM/velocity from trackers
            det = session["detector"]
            for name, tracker in det._trackers.items():
                side = "left" if "left" in name else "right" if "right" in name else None
                if side and tracker.last_rom is not None:
                    velocity = None
                    if tracker.last_rom and tracker.last_tempo:
                        velocity = tracker.last_rom / max(tracker.last_tempo, 1e-3)
                    im.update_side(side, rom=tracker.last_rom, velocity=velocity)
            imbalance_report = im.report()
        except Exception as exc:
            logger.warning("ImbalanceDetector update failed: %s", exc)

    # -- Run CueEngine (enhanced coaching cue with priority) ----------------
    cue_text = None
    if analysis and "cue_engine" in session:
        try:
            cue_engine = session["cue_engine"]
            sub_scores_dict = analysis.sub_scores if analysis.sub_scores else {}
            fatigue_dict = {}
            if fatigue_state:
                fatigue_dict = {
                    "level": fatigue_state.level,
                    "status": fatigue_state.status,
                    "rir": fatigue_state.rir,
                    "reason": fatigue_state.reason,
                }
            cue_result = cue_engine.generate_cue(
                exercise=req.exercise,
                sub_scores=sub_scores_dict,
                injury_flags=injury_flags,
                fatigue=fatigue_dict,
                angles=analysis.joint_angles or {},
                phase=analysis.phase or "",
            )
            cue_text = cue_result.text
        except Exception as exc:
            logger.warning("CueEngine.generate_cue failed: %s", exc)

    # -- Muscle targeting ---------------------------------------------------
    muscles_targeted: list[str] = []
    if analysis and analysis.muscles_targeted:
        muscles_targeted = analysis.muscles_targeted
    elif _MUSCLE_TARGETING_AVAILABLE:
        try:
            targets = get_muscle_targets_safe(exercise_slug)
            if targets:
                muscles_targeted = [t.muscle for t in targets if t.role == "primary"]
        except Exception as exc:
            logger.warning("get_muscle_targets_safe failed: %s", exc)

    # -- Extract angle data from analysis for left/right angles ------------
    left_angle = 0.0
    right_angle = 0.0
    left_rom = 0.0
    right_rom = 0.0
    left_tempo = 0.0
    right_tempo = 0.0

    if analysis and analysis.joint_angles:
        # Find left/right angles from joint_angles dict
        for name, val in analysis.joint_angles.items():
            if val is None:
                continue
            if "left" in name:
                left_angle = val
            elif "right" in name:
                right_angle = val

    # Extract ROM/tempo from trackers if available
    if analysis and "detector" in session:
        try:
            det = session["detector"]
            for name, tracker in det._trackers.items():
                if "left" in name:
                    if tracker.last_rom is not None:
                        left_rom = round(tracker.last_rom, 1)
                    if tracker.last_tempo is not None:
                        left_tempo = round(tracker.last_tempo, 2)
                elif "right" in name:
                    if tracker.last_rom is not None:
                        right_rom = round(tracker.last_rom, 1)
                    if tracker.last_tempo is not None:
                        right_tempo = round(tracker.last_tempo, 2)
        except Exception as exc:
            logger.warning("Failed to extract ROM/tempo from trackers: %s", exc)

    # -- Fallback: use basic angle calculation if detectors unavailable -----
    if analysis is None:
        try:
            left_shoulder = req.landmarks[11]
            left_elbow = req.landmarks[13]
            left_wrist = req.landmarks[15]
            right_shoulder = req.landmarks[12]
            right_elbow = req.landmarks[14]
            right_wrist = req.landmarks[16]

            left_angle = round(_calc_angle(left_shoulder, left_elbow, left_wrist), 1)
            right_angle = round(_calc_angle(right_shoulder, right_elbow, right_wrist), 1)
        except (IndexError, KeyError) as e:
            logger.warning("Fallback landmark processing error: %s", e)

    # -- Build response ----------------------------------------------------
    # Convert injury flags to the InjuryFlag model
    injury_model: dict[str, InjuryFlag] = {}
    for slug, data in injury_flags.items():
        injury_model[slug] = InjuryFlag(
            level=data.get("level", "ok"),
            value=data.get("value", 0.0),
            msg=data.get("msg", ""),
        )

    # Build fatigue info
    fatigue_info = FatigueInfo()
    if fatigue_state:
        fatigue_info = FatigueInfo(
            level=fatigue_state.level,
            status=fatigue_state.status,
            rir=fatigue_state.rir if fatigue_state.rir is not None else 10.0,
            reason=fatigue_state.reason,
        )

    # Build imbalance info
    imbalance_info = ImbalanceInfo()
    if imbalance_report:
        imbalance_info = ImbalanceInfo(
            rep_diff=imbalance_report.rep_diff,
            rom_asym=imbalance_report.rom_asym,
            vel_asym=imbalance_report.vel_asym,
            weaker=imbalance_report.weaker or "even",
            severity=imbalance_report.severity,
            note=imbalance_report.note,
        )

    # Determine the coaching cue to return
    final_cue = "Step into frame to begin"
    if cue_text:
        final_cue = cue_text
    elif analysis:
        final_cue = analysis.coaching_cue

    # Sub-scores
    sub = SubScores()
    if analysis and analysis.sub_scores:
        sub = SubScores(
            ROM=analysis.sub_scores.get("ROM", 0),
            Tempo=analysis.sub_scores.get("Tempo", 0),
            Symmetry=analysis.sub_scores.get("Symmetry", 0),
            Control=analysis.sub_scores.get("Control", 0),
            Stability=analysis.sub_scores.get("Stability", 0),
        )

    response = AnalyzeResponse(
        left_reps=analysis.left_reps if analysis else session.get("left_reps", 0),
        right_reps=analysis.right_reps if analysis else session.get("right_reps", 0),
        left_score=analysis.overall_score if analysis else 0,
        right_score=analysis.overall_score if analysis else 0,
        overall=analysis.overall_score if analysis else 0,
        sub=sub,
        cue=final_cue,
        fatigue=fatigue_info,
        injury=injury_model,
        injury_worst=injury_worst,
        imbalance=imbalance_info,
        left_angle=left_angle,
        right_angle=right_angle,
        left_rom=left_rom,
        right_rom=right_rom,
        left_tempo=left_tempo,
        right_tempo=right_tempo,
        muscles_targeted=muscles_targeted,
    )

    _last_results[session_key] = response
    return response


# ---------------------------------------------------------------------------
# GET /state/{session_id} — polls last analysis (for mobile ExerciseCamera)
# ---------------------------------------------------------------------------

@router.get("/state/{session_id}", response_model=AnalyzeResponse)
async def get_session_state(session_id: str, user_id: str = "default"):
    """
    Return the last analysis result for a session. The mobile ExerciseCamera
    component polls this endpoint to get the latest scores/cues between its
    own frame submissions.
    """
    session_key = f"{user_id}:{session_id}"

    if session_key in _last_results:
        return _last_results[session_key]

    # No analysis yet — return a default
    return AnalyzeResponse(cue="Waiting for first frame — step into view")


# ---------------------------------------------------------------------------
# POST /start-session
# ---------------------------------------------------------------------------

@router.post("/start-session")
async def start_session(user_id: str = "default", exercise: str = "Barbell Curl"):
    """Start a new exercise analysis session."""
    session_id = f"{int(time.time())}"
    key = f"{user_id}:{session_id}"
    exercise_slug = _to_slug(exercise)
    _get_or_create_session(key, exercise_slug)
    return {"session_id": session_id, "exercise": exercise}


# ---------------------------------------------------------------------------
# POST /end-session
# ---------------------------------------------------------------------------

# ---------------------------------------------------------------------------
# POST /analyze-frame — image-based pose detection (mobile-friendly)
# ---------------------------------------------------------------------------

import base64
import io

class AnalyzeFrameRequest(BaseModel):
    """Request body: a single base64-encoded JPEG/PNG from the mobile camera."""
    image_base64: str
    exercise: str = "Barbell Curl"
    user_id: str = "default"
    session_id: Optional[str] = None


# Lazy-init MediaPipe Pose (heavy import, share one instance across requests)
_mp_pose_instance = None


def _get_mp_pose():
    global _mp_pose_instance
    if _mp_pose_instance is None:
        try:
            from mediapipe import solutions as mp_solutions
            _mp_pose_instance = mp_solutions.pose.Pose(
                static_image_mode=False,
                model_complexity=1,           # 1 is fast enough on server
                smooth_landmarks=True,
                min_detection_confidence=0.6,
                min_tracking_confidence=0.5,
            )
        except Exception as exc:
            logger.warning("MediaPipe Pose unavailable: %s", exc)
            _mp_pose_instance = False  # sentinel so we don't retry
    return _mp_pose_instance if _mp_pose_instance is not False else None


@router.post("/analyze-frame", response_model=AnalyzeResponse)
async def analyze_frame_image(req: AnalyzeFrameRequest):
    """Server-side pose detection from a single camera frame.

    The mobile client sends a base64-encoded JPEG; we run MediaPipe Pose,
    extract 33 landmarks, then hand off to the regular /analyze pipeline.
    Lets the mobile app skip native pose-detection deps entirely.
    """
    pose = _get_mp_pose()
    if pose is None:
        return AnalyzeResponse(cue="Pose engine unavailable on server")

    # Decode the image. We import OpenCV + NumPy lazily so other endpoints
    # don't pay the import cost.
    try:
        import cv2
        import numpy as np
        raw_b64 = req.image_base64.split(",", 1)[-1]   # strip data: prefix if present
        img_bytes = base64.b64decode(raw_b64)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        bgr = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if bgr is None:
            return AnalyzeResponse(cue="Could not decode camera frame")
        rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
        h, w = rgb.shape[:2]
    except Exception as exc:
        logger.warning("frame decode failed: %s", exc)
        return AnalyzeResponse(cue="Frame decode error")

    # Run pose detection
    try:
        results = pose.process(rgb)
    except Exception as exc:
        logger.warning("pose.process failed: %s", exc)
        return AnalyzeResponse(cue="Pose detection failed")

    if not results.pose_landmarks:
        # No body detected — return a hint, keep session alive
        session_key = f"{req.user_id}:{req.session_id or 'default'}"
        result = AnalyzeResponse(cue="No body detected — step into frame")
        _last_results[session_key] = result
        return result

    # Convert MediaPipe landmarks to our API shape, then reuse analyze_frame
    landmarks = [
        PoseLandmark(
            x=float(lm.x),
            y=float(lm.y),
            z=float(lm.z),
            visibility=float(lm.visibility),
        )
        for lm in results.pose_landmarks.landmark
    ]
    return await analyze_frame(
        AnalyzeRequest(
            landmarks=landmarks,
            exercise=req.exercise,
            user_id=req.user_id,
            session_id=req.session_id,
            frame_width=w,
            frame_height=h,
        )
    )


@router.post("/end-session")
async def end_session(user_id: str = "default", session_id: str = "default"):
    """End session and return summary."""
    key = f"{user_id}:{session_id}"
    session = _sessions.pop(key, None)
    last_result = _last_results.pop(key, None)
    if not session:
        return {"status": "no_session"}

    # Gather summary from last result if available
    total_reps = 0
    avg_score = 0
    if last_result:
        total_reps = last_result.left_reps + last_result.right_reps
        avg_score = last_result.overall

    return {
        "status": "saved",
        "total_reps": total_reps,
        "avg_score": avg_score,
        "duration": round(time.time() - session.get("created", time.time())),
        "muscles_targeted": last_result.muscles_targeted if last_result else [],
    }
