"""
movement_detector.py
--------------------
Universal movement-pattern detector that replaces the single-exercise approach
with a general-purpose engine capable of rep counting, form scoring, and
coaching-cue generation for ANY standard resistance-training exercise.

Usage
~~~~~
    from movement_detector import UniversalDetector, AnalysisResult

    # Option A: tell it the exercise up-front
    det = UniversalDetector(exercise_slug="barbell_back_squat")

    # Option B: let it auto-detect from movement
    det = UniversalDetector()

    result: AnalysisResult = det.process_frame(landmarks, w, h)

Each ``AnalysisResult`` carries rep counts, a 0-100 overall score broken into
five sub-scores (ROM, Stability, Tempo, Symmetry, Control), the current
movement phase, targeted muscles, and a single actionable coaching cue.

Relies on ``angle_calculator`` for geometry and ``exercise_database`` for
per-exercise rule definitions.
"""

from __future__ import annotations

import logging
import math
import sys
import time
from collections import deque
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Deque, Dict, List, Optional, Tuple

import numpy as np

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

# ---------------------------------------------------------------------------
# Angle / landmark utilities (shared across all detectors)
# ---------------------------------------------------------------------------
try:
    from core.angle_calculator import (
        PoseLandmark as P,
        calculate_angle_from_landmarks,
        get_landmark_coords,
        get_landmark_visibility,
        smooth_angle,
    )
except ImportError:
    from angle_calculator import (  # type: ignore[no-redef]
        PoseLandmark as P,
        calculate_angle_from_landmarks,
        get_landmark_coords,
        get_landmark_visibility,
        smooth_angle,
    )

# ---------------------------------------------------------------------------
# Exercise database — imported if available, stubbed otherwise
# ---------------------------------------------------------------------------
try:
    from core.exercise_database import EXERCISE_DB, ExerciseDefinition, JointRule
except ImportError:
    try:
        from exercise_database import EXERCISE_DB, ExerciseDefinition, JointRule  # type: ignore[no-redef]
    except ImportError:
        # Stubs so the module is self-contained during parallel development.
        EXERCISE_DB: Dict[str, "ExerciseDefinition"] = {}  # type: ignore[no-redef]

        @dataclass
        class JointRule:  # type: ignore[no-redef]
            joint_name: str = ""
            landmarks: Tuple[int, int, int] = (0, 0, 0)
            contracted: float = 0.0
            extended: float = 180.0
            ideal_rom: float = 120.0

        @dataclass
        class ExerciseDefinition:  # type: ignore[no-redef]
            slug: str = ""
            name: str = ""
            pattern: str = ""
            primary_joints: List[JointRule] = field(default_factory=list)
            stability_joints: List[Tuple[int, int, int]] = field(default_factory=list)
            muscles: List[str] = field(default_factory=list)
            bilateral: bool = True
            ideal_tempo_s: Tuple[float, float] = (1.5, 4.0)

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Movement-pattern taxonomy
# ---------------------------------------------------------------------------

class MovementPattern(Enum):
    PUSH_HORIZONTAL = "push_horizontal"
    PUSH_VERTICAL = "push_vertical"
    PULL_HORIZONTAL = "pull_horizontal"
    PULL_VERTICAL = "pull_vertical"
    SQUAT = "squat"
    HINGE = "hinge"
    LUNGE = "lunge"
    ISOLATION_CURL = "isolation_curl"
    ISOLATION_EXTENSION = "isolation_extension"
    ISOLATION_RAISE = "isolation_raise"
    OLYMPIC = "olympic"
    CORE = "core"
    CARRY = "carry"
    CALF = "calf"


# ---------------------------------------------------------------------------
# Analysis result
# ---------------------------------------------------------------------------

@dataclass
class AnalysisResult:
    """Immutable snapshot returned by ``UniversalDetector.process_frame``."""
    exercise: str
    left_reps: int
    right_reps: int
    total_reps: int
    overall_score: int                     # 0-100
    sub_scores: Dict[str, int]             # ROM / Stability / Tempo / Symmetry / Control
    coaching_cue: str                      # single most actionable cue
    muscles_targeted: List[str]            # primary muscles being worked
    phase: str                             # eccentric / concentric / lockout / bottom
    joint_angles: Dict[str, Optional[float]]  # live angle values for overlay
    pattern: Optional[str] = None          # detected MovementPattern value
    confidence: float = 0.0                # auto-detection confidence 0-1


# ---------------------------------------------------------------------------
# Built-in exercise rules (fallback when exercise_database.py is absent)
# ---------------------------------------------------------------------------

_BUILTIN_RULES: Dict[str, ExerciseDefinition] = {
    # ---- ISOLATION: CURL ----
    "barbell_curl": ExerciseDefinition(
        slug="barbell_curl", name="Barbell Curl",
        pattern=MovementPattern.ISOLATION_CURL.value,
        primary_joints=[
            JointRule("left_elbow", (P.LEFT_SHOULDER, P.LEFT_ELBOW, P.LEFT_WRIST), 40.0, 160.0, 115.0),
            JointRule("right_elbow", (P.RIGHT_SHOULDER, P.RIGHT_ELBOW, P.RIGHT_WRIST), 40.0, 160.0, 115.0),
        ],
        stability_joints=[
            (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE),
            (P.RIGHT_SHOULDER, P.RIGHT_HIP, P.RIGHT_KNEE),
        ],
        muscles=["biceps", "brachialis", "forearms"],
        bilateral=True,
        ideal_tempo_s=(1.4, 3.6),
    ),
    # ---- SQUAT ----
    "barbell_back_squat": ExerciseDefinition(
        slug="barbell_back_squat", name="Barbell Back Squat",
        pattern=MovementPattern.SQUAT.value,
        primary_joints=[
            JointRule("left_knee", (P.LEFT_HIP, P.LEFT_KNEE, P.LEFT_ANKLE), 70.0, 170.0, 95.0),
            JointRule("right_knee", (P.RIGHT_HIP, P.RIGHT_KNEE, P.RIGHT_ANKLE), 70.0, 170.0, 95.0),
            JointRule("left_hip", (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE), 60.0, 170.0, 100.0),
            JointRule("right_hip", (P.RIGHT_SHOULDER, P.RIGHT_HIP, P.RIGHT_KNEE), 60.0, 170.0, 100.0),
        ],
        stability_joints=[
            (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE),   # torso angle
        ],
        muscles=["quadriceps", "glutes", "hamstrings", "core"],
        bilateral=True,
        ideal_tempo_s=(2.0, 5.0),
    ),
    # ---- HINGE / DEADLIFT ----
    "conventional_deadlift": ExerciseDefinition(
        slug="conventional_deadlift", name="Conventional Deadlift",
        pattern=MovementPattern.HINGE.value,
        primary_joints=[
            JointRule("left_hip", (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE), 50.0, 170.0, 110.0),
            JointRule("right_hip", (P.RIGHT_SHOULDER, P.RIGHT_HIP, P.RIGHT_KNEE), 50.0, 170.0, 110.0),
        ],
        stability_joints=[
            (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE),
        ],
        muscles=["hamstrings", "glutes", "erectors", "traps"],
        bilateral=True,
        ideal_tempo_s=(1.5, 4.0),
    ),
    # ---- LUNGE ----
    "walking_lunge": ExerciseDefinition(
        slug="walking_lunge", name="Walking Lunge",
        pattern=MovementPattern.LUNGE.value,
        primary_joints=[
            JointRule("left_knee", (P.LEFT_HIP, P.LEFT_KNEE, P.LEFT_ANKLE), 70.0, 170.0, 90.0),
            JointRule("right_knee", (P.RIGHT_HIP, P.RIGHT_KNEE, P.RIGHT_ANKLE), 70.0, 170.0, 90.0),
        ],
        stability_joints=[
            (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE),
        ],
        muscles=["quadriceps", "glutes", "hamstrings"],
        bilateral=True,
        ideal_tempo_s=(2.0, 4.5),
    ),
    # ---- PUSH HORIZONTAL (BENCH) ----
    "bench_press": ExerciseDefinition(
        slug="bench_press", name="Bench Press",
        pattern=MovementPattern.PUSH_HORIZONTAL.value,
        primary_joints=[
            JointRule("left_elbow", (P.LEFT_SHOULDER, P.LEFT_ELBOW, P.LEFT_WRIST), 60.0, 170.0, 100.0),
            JointRule("right_elbow", (P.RIGHT_SHOULDER, P.RIGHT_ELBOW, P.RIGHT_WRIST), 60.0, 170.0, 100.0),
        ],
        stability_joints=[],
        muscles=["pectorals", "anterior_deltoid", "triceps"],
        bilateral=True,
        ideal_tempo_s=(1.5, 4.0),
    ),
    # ---- PUSH VERTICAL (OHP) ----
    "overhead_press": ExerciseDefinition(
        slug="overhead_press", name="Overhead Press",
        pattern=MovementPattern.PUSH_VERTICAL.value,
        primary_joints=[
            JointRule("left_elbow", (P.LEFT_SHOULDER, P.LEFT_ELBOW, P.LEFT_WRIST), 50.0, 170.0, 110.0),
            JointRule("right_elbow", (P.RIGHT_SHOULDER, P.RIGHT_ELBOW, P.RIGHT_WRIST), 50.0, 170.0, 110.0),
        ],
        stability_joints=[
            (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE),
        ],
        muscles=["deltoids", "triceps", "upper_chest", "core"],
        bilateral=True,
        ideal_tempo_s=(1.5, 4.0),
    ),
    # ---- PULL VERTICAL (PULL-UP) ----
    "pull_up": ExerciseDefinition(
        slug="pull_up", name="Pull-Up",
        pattern=MovementPattern.PULL_VERTICAL.value,
        primary_joints=[
            JointRule("left_elbow", (P.LEFT_SHOULDER, P.LEFT_ELBOW, P.LEFT_WRIST), 50.0, 165.0, 100.0),
            JointRule("right_elbow", (P.RIGHT_SHOULDER, P.RIGHT_ELBOW, P.RIGHT_WRIST), 50.0, 165.0, 100.0),
        ],
        stability_joints=[],
        muscles=["lats", "biceps", "rear_deltoid", "rhomboids"],
        bilateral=True,
        ideal_tempo_s=(1.5, 4.5),
    ),
    # ---- PULL HORIZONTAL (ROW) ----
    "barbell_row": ExerciseDefinition(
        slug="barbell_row", name="Barbell Row",
        pattern=MovementPattern.PULL_HORIZONTAL.value,
        primary_joints=[
            JointRule("left_elbow", (P.LEFT_SHOULDER, P.LEFT_ELBOW, P.LEFT_WRIST), 40.0, 155.0, 100.0),
            JointRule("right_elbow", (P.RIGHT_SHOULDER, P.RIGHT_ELBOW, P.RIGHT_WRIST), 40.0, 155.0, 100.0),
        ],
        stability_joints=[
            (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE),
        ],
        muscles=["lats", "rhomboids", "biceps", "rear_deltoid"],
        bilateral=True,
        ideal_tempo_s=(1.5, 4.0),
    ),
    # ---- ISOLATION EXTENSION (TRICEP) ----
    "tricep_extension": ExerciseDefinition(
        slug="tricep_extension", name="Tricep Extension",
        pattern=MovementPattern.ISOLATION_EXTENSION.value,
        primary_joints=[
            JointRule("left_elbow", (P.LEFT_SHOULDER, P.LEFT_ELBOW, P.LEFT_WRIST), 40.0, 165.0, 110.0),
            JointRule("right_elbow", (P.RIGHT_SHOULDER, P.RIGHT_ELBOW, P.RIGHT_WRIST), 40.0, 165.0, 110.0),
        ],
        stability_joints=[
            (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE),
        ],
        muscles=["triceps"],
        bilateral=True,
        ideal_tempo_s=(1.5, 3.5),
    ),
    # ---- ISOLATION RAISE (LATERAL) ----
    "lateral_raise": ExerciseDefinition(
        slug="lateral_raise", name="Lateral Raise",
        pattern=MovementPattern.ISOLATION_RAISE.value,
        primary_joints=[
            JointRule("left_shoulder_abd", (P.LEFT_HIP, P.LEFT_SHOULDER, P.LEFT_ELBOW), 20.0, 100.0, 75.0),
            JointRule("right_shoulder_abd", (P.RIGHT_HIP, P.RIGHT_SHOULDER, P.RIGHT_ELBOW), 20.0, 100.0, 75.0),
        ],
        stability_joints=[
            (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE),
        ],
        muscles=["lateral_deltoid", "traps"],
        bilateral=True,
        ideal_tempo_s=(1.5, 4.0),
    ),
    # ---- CORE (CRUNCH / SIT-UP) ----
    "crunch": ExerciseDefinition(
        slug="crunch", name="Crunch",
        pattern=MovementPattern.CORE.value,
        primary_joints=[
            JointRule("left_hip_flexion", (P.LEFT_SHOULDER, P.LEFT_HIP, P.LEFT_KNEE), 60.0, 140.0, 70.0),
        ],
        stability_joints=[],
        muscles=["rectus_abdominis", "obliques"],
        bilateral=False,
        ideal_tempo_s=(1.5, 3.5),
    ),
    # ---- CALF RAISE ----
    "calf_raise": ExerciseDefinition(
        slug="calf_raise", name="Calf Raise",
        pattern=MovementPattern.CALF.value,
        primary_joints=[
            JointRule("left_ankle", (P.LEFT_KNEE, P.LEFT_ANKLE, P.LEFT_HIP), 70.0, 120.0, 40.0),
            JointRule("right_ankle", (P.RIGHT_KNEE, P.RIGHT_ANKLE, P.RIGHT_HIP), 70.0, 120.0, 40.0),
        ],
        stability_joints=[],
        muscles=["gastrocnemius", "soleus"],
        bilateral=True,
        ideal_tempo_s=(1.0, 3.0),
    ),
}


def _resolve_exercise(slug: Optional[str]) -> Optional[ExerciseDefinition]:
    """Look up exercise rules from the database, falling back to builtins."""
    if slug is None:
        return None
    if EXERCISE_DB and slug in EXERCISE_DB:
        return EXERCISE_DB[slug]
    return _BUILTIN_RULES.get(slug)


# ---------------------------------------------------------------------------
# Joint tracker — manages smoothing, hysteresis, and per-rep metrics for one
# tracked joint angle.
# ---------------------------------------------------------------------------

class _JointTracker:
    """State machine for a single joint angle with hysteresis rep counting."""

    def __init__(self, rule: JointRule, smooth_window: int = 5,
                 debounce_frames: int = 3):
        self.rule = rule
        self._smooth_window = smooth_window
        self._debounce = debounce_frames
        self.reset()

    def reset(self) -> None:
        self.reps: int = 0
        self.state: str = "extended"       # "extended" or "contracted"
        self.hold: int = 0
        self.history: List[float] = []
        self.angle: Optional[float] = None

        # Per-rep accumulators
        self._min_angle: float = 360.0
        self._max_angle: float = 0.0
        self._t_start: Optional[float] = None
        self._prev_angle: Optional[float] = None
        self._jerk_sum: float = 0.0
        self._jerk_n: int = 0

        # Last completed rep metrics
        self.last_rom: Optional[float] = None
        self.last_tempo: Optional[float] = None
        self.last_peak: Optional[float] = None   # smallest angle in the rep
        self.last_bottom: Optional[float] = None  # largest angle in the rep
        self.score: Optional[float] = None
        self.last_sub: Dict[str, float] = {}

    # -- scoring helpers ---------------------------------------------------

    def _score_rom(self, peak: float, bottom: float) -> float:
        """0-100 based on how much of the ideal ROM was achieved."""
        achieved = bottom - peak
        ideal = self.rule.ideal_rom
        ratio = achieved / max(ideal, 1.0)
        s = float(np.interp(ratio, [0.5, 0.8, 1.0, 1.15], [40, 70, 95, 99]))
        # Penalise if they didn't reach full contraction or extension
        if peak > self.rule.contracted + 15:
            s -= (peak - self.rule.contracted - 15) * 0.6
        if bottom < self.rule.extended - 15:
            s -= (self.rule.extended - 15 - bottom) * 0.4
        return float(np.clip(s, 30, 99))

    def _score_tempo(self, secs: float, ideal: Tuple[float, float]) -> float:
        lo, hi = ideal
        if lo <= secs <= hi:
            return 96.0
        if secs < lo:
            return float(np.clip(96 - (lo - secs) * 40, 40, 96))
        return float(np.clip(96 - (secs - hi) * 12, 55, 96))

    def _score_control(self) -> float:
        if self._jerk_n == 0:
            return 85.0
        mean_jerk = self._jerk_sum / self._jerk_n
        return float(np.clip(98 - mean_jerk * 6.0, 40, 99))

    # -- per-frame update --------------------------------------------------

    def update(self, raw_angle: Optional[float], now: float,
               ideal_tempo: Tuple[float, float] = (1.5, 4.0)) -> bool:
        """
        Feed one frame.  Returns True on the frame a rep completes.
        """
        if raw_angle is None:
            self.angle = None
            return False

        a = smooth_angle(raw_angle, self.history, window=self._smooth_window)
        self.angle = a

        # Jitter accumulation for control scoring
        if self._prev_angle is not None:
            self._jerk_sum += abs(a - self._prev_angle)
            self._jerk_n += 1
        self._prev_angle = a

        # Track range within the active rep
        self._min_angle = min(self._min_angle, a)
        self._max_angle = max(self._max_angle, a)

        rep_completed = False

        # Hysteresis state machine
        # "extended" = at the start/end position (angle near extended threshold)
        # "contracted" = at the peak contraction (angle near contracted threshold)
        if self.state == "extended":
            if a <= self.rule.contracted:
                self.hold += 1
                if self.hold >= self._debounce:
                    self.state = "contracted"
                    self.hold = 0
                    if self._t_start is None:
                        self._t_start = now
            else:
                self.hold = 0
        else:  # "contracted" -> wait for return to extended to complete rep
            if a >= self.rule.extended:
                self.hold += 1
                if self.hold >= self._debounce:
                    rep_completed = self._complete_rep(now, ideal_tempo)
                    self.state = "extended"
                    self.hold = 0
            else:
                self.hold = 0

        return rep_completed

    def _complete_rep(self, now: float,
                      ideal_tempo: Tuple[float, float]) -> bool:
        self.reps += 1
        peak, bottom = self._min_angle, self._max_angle
        self.last_peak = peak
        self.last_bottom = bottom
        self.last_rom = bottom - peak
        self.last_tempo = (now - self._t_start) if self._t_start else None

        rom_s = self._score_rom(peak, bottom)
        tempo_s = self._score_tempo(self.last_tempo, ideal_tempo) if self.last_tempo else 80.0
        ctrl_s = self._score_control()

        self.last_sub = {"ROM": rom_s, "Tempo": tempo_s, "Control": ctrl_s}
        rep_score = 0.45 * rom_s + 0.25 * tempo_s + 0.30 * ctrl_s

        # Exponential moving average for display stability
        self.score = rep_score if self.score is None else 0.6 * self.score + 0.4 * rep_score

        # Reset accumulators for next rep
        self._min_angle, self._max_angle = 360.0, 0.0
        self._t_start = now
        self._jerk_sum, self._jerk_n = 0.0, 0
        return True

    def live_subscores(self) -> Dict[str, Optional[float]]:
        """Last completed rep's scores, or a live estimate mid-rep."""
        if self.last_sub:
            return dict(self.last_sub)
        return {
            "ROM": self._score_rom(self._min_angle, self._max_angle)
                   if self._max_angle > 0 else None,
            "Tempo": None,
            "Control": self._score_control(),
        }


# ---------------------------------------------------------------------------
# Movement-phase detector
# ---------------------------------------------------------------------------

class _PhaseTracker:
    """Determines the current movement phase from angle velocity."""

    def __init__(self, window: int = 6):
        self._window = window
        self._angles: Deque[float] = deque(maxlen=window)
        self.phase: str = "idle"

    def update(self, angle: Optional[float]) -> str:
        if angle is None:
            return self.phase
        self._angles.append(angle)
        if len(self._angles) < 3:
            return self.phase

        recent = list(self._angles)
        velocity = recent[-1] - recent[-3]  # degrees over ~3 frames
        if velocity < -2.5:
            self.phase = "concentric"       # angle decreasing = contracting
        elif velocity > 2.5:
            self.phase = "eccentric"        # angle increasing = lengthening
        else:
            # Isometric at the top or bottom of the movement
            avg = np.mean(recent[-3:])
            if avg < 90:
                self.phase = "bottom"       # in the hole / peak contraction
            else:
                self.phase = "lockout"      # standing / extended
        return self.phase

    def reset(self) -> None:
        self._angles.clear()
        self.phase = "idle"


# ---------------------------------------------------------------------------
# Stability scorer
# ---------------------------------------------------------------------------

class _StabilityScorer:
    """Tracks how still the non-working joints remain during the set."""

    def __init__(self, stability_joints: List[Tuple[int, int, int]],
                 window: int = 30):
        self._joints = stability_joints
        self._window = window
        # Per-joint angle history (rolling)
        self._histories: Dict[str, Deque[float]] = {
            f"{a}_{b}_{c}": deque(maxlen=window) for a, b, c in stability_joints
        }

    def update(self, landmarks, w: int, h: int, min_vis: float = 0.5) -> None:
        for (a, b, c) in self._joints:
            key = f"{a}_{b}_{c}"
            angle = calculate_angle_from_landmarks(
                landmarks, a, b, c, w, h, min_visibility=min_vis)
            if angle is not None:
                self._histories[key].append(angle)

    def score(self) -> float:
        """0-100; higher means more stable (less deviation)."""
        if not self._joints:
            return 90.0   # no stability requirement defined
        deviations: List[float] = []
        for key, hist in self._histories.items():
            if len(hist) >= 5:
                deviations.append(float(np.std(hist)))
        if not deviations:
            return 85.0
        avg_dev = np.mean(deviations)
        # Map: 0 deviation -> 99, 8+ degrees of wobble -> 40
        return float(np.clip(99 - avg_dev * 7.5, 30, 99))

    def reset(self) -> None:
        for hist in self._histories.values():
            hist.clear()


# ---------------------------------------------------------------------------
# Auto-detection engine
# ---------------------------------------------------------------------------

_DETECTION_JOINTS = {
    "left_elbow":  (P.LEFT_SHOULDER,  P.LEFT_ELBOW,  P.LEFT_WRIST),
    "right_elbow": (P.RIGHT_SHOULDER, P.RIGHT_ELBOW, P.RIGHT_WRIST),
    "left_knee":   (P.LEFT_HIP,       P.LEFT_KNEE,   P.LEFT_ANKLE),
    "right_knee":  (P.RIGHT_HIP,      P.RIGHT_KNEE,  P.RIGHT_ANKLE),
    "left_hip":    (P.LEFT_SHOULDER,   P.LEFT_HIP,    P.LEFT_KNEE),
    "right_hip":   (P.RIGHT_SHOULDER,  P.RIGHT_HIP,   P.RIGHT_KNEE),
    "left_shoulder_abd":  (P.LEFT_HIP,  P.LEFT_SHOULDER,  P.LEFT_ELBOW),
    "right_shoulder_abd": (P.RIGHT_HIP, P.RIGHT_SHOULDER, P.RIGHT_ELBOW),
}


class _AutoDetector:
    """
    Accumulates joint-angle variance over a warm-up window and matches the
    movement signature against known exercise patterns.
    """

    WARMUP_FRAMES = 90   # ~3 seconds at 30 fps

    def __init__(self):
        self.reset()

    def reset(self) -> None:
        self._history: Dict[str, List[float]] = {k: [] for k in _DETECTION_JOINTS}
        self._frames: int = 0
        self.detected_slug: Optional[str] = None
        self.confidence: float = 0.0

    def feed(self, landmarks, w: int, h: int,
             min_vis: float = 0.5) -> Optional[str]:
        """Feed a frame; returns exercise slug once detection is confident."""
        if self.detected_slug is not None:
            return self.detected_slug

        self._frames += 1
        for name, (a, b, c) in _DETECTION_JOINTS.items():
            angle = calculate_angle_from_landmarks(
                landmarks, a, b, c, w, h, min_visibility=min_vis)
            if angle is not None:
                self._history[name].append(angle)

        if self._frames < self.WARMUP_FRAMES:
            return None

        return self._classify()

    def _classify(self) -> Optional[str]:
        """
        Rank joints by variance — the most-moving joints define the pattern.
        """
        variances: Dict[str, float] = {}
        for name, angles in self._history.items():
            if len(angles) >= 20:
                variances[name] = float(np.var(angles))

        if not variances:
            return None

        # Sort joints by variance, descending
        ranked = sorted(variances.items(), key=lambda kv: kv[1], reverse=True)
        top_joint = ranked[0][0]
        top_var = ranked[0][1]

        # Need meaningful movement (variance > noise threshold)
        if top_var < 50.0:
            return None

        # Determine which body region is moving most
        elbow_var = max(variances.get("left_elbow", 0),
                        variances.get("right_elbow", 0))
        knee_var = max(variances.get("left_knee", 0),
                       variances.get("right_knee", 0))
        hip_var = max(variances.get("left_hip", 0),
                      variances.get("right_hip", 0))
        shoulder_var = max(variances.get("left_shoulder_abd", 0),
                          variances.get("right_shoulder_abd", 0))

        slug = None
        conf = 0.0

        # Hip + knee moving together = squat or lunge
        if knee_var > 100 and hip_var > 100:
            # Distinguish squat from lunge by symmetry of knee variance
            l_knee = variances.get("left_knee", 0)
            r_knee = variances.get("right_knee", 0)
            asym = abs(l_knee - r_knee) / max(l_knee, r_knee, 1)
            if asym > 0.5:
                slug = "walking_lunge"
                conf = 0.7
            else:
                slug = "barbell_back_squat"
                conf = 0.8

        # Hip moving, knees not much = hinge
        elif hip_var > 150 and knee_var < 80:
            slug = "conventional_deadlift"
            conf = 0.75

        # Elbows moving, hips and knees static
        elif elbow_var > 100 and hip_var < 60 and knee_var < 60:
            # Distinguish curl from press from pull by mean elbow angle range
            left_elbow_angles = self._history.get("left_elbow", [])
            right_elbow_angles = self._history.get("right_elbow", [])
            elbow_angles = left_elbow_angles or right_elbow_angles

            if elbow_angles:
                min_a = np.min(elbow_angles)
                max_a = np.max(elbow_angles)
                mean_shoulder_var = shoulder_var

                # Shoulder abduction moving = lateral raise
                if mean_shoulder_var > 100:
                    slug = "lateral_raise"
                    conf = 0.65
                # Narrow contraction, wide extension = curl
                elif min_a < 55 and max_a > 140:
                    slug = "barbell_curl"
                    conf = 0.8
                # Wide extension but moderate contraction = extension
                elif min_a < 70 and max_a > 130:
                    slug = "tricep_extension"
                    conf = 0.6
                # Moderate range with shoulder involvement = press
                elif mean_shoulder_var > 50:
                    slug = "overhead_press"
                    conf = 0.6
                else:
                    slug = "barbell_curl"
                    conf = 0.5

        # Shoulder abduction dominant = raise
        elif shoulder_var > 100:
            slug = "lateral_raise"
            conf = 0.7

        # Hip flexion dominant with low knee/elbow = core
        elif hip_var > 60 and knee_var < 40 and elbow_var < 40:
            slug = "crunch"
            conf = 0.55

        if slug is not None:
            self.detected_slug = slug
            self.confidence = conf
        return slug


# ---------------------------------------------------------------------------
# Coaching-cue generator
# ---------------------------------------------------------------------------

_CUE_TEMPLATES: Dict[str, Dict[str, str]] = {
    # key = sub_score name, value = dict mapping condition -> cue template
    "ROM": {
        "short_contraction": "Squeeze {amount} deeper at the top for full contraction.",
        "short_extension": "Lower {amount} more to reach full depth.",
        "generic_short": "Use a bigger range of motion — you're cutting {pct}% short.",
    },
    "Stability": {
        "torso_sway": "Brace your core — your torso is swaying {amount} between reps.",
        "generic": "Keep your non-working joints still — minimize body sway.",
    },
    "Tempo": {
        "too_fast": "Slow down — control the eccentric for at least {min_s:.1f}s.",
        "too_slow": "Pick up the pace — you're stalling at {tempo:.1f}s per rep.",
    },
    "Symmetry": {
        "rep_lag": "Your {weak} side is {diff} reps behind — even it out.",
        "rom_lag": "Your {weak} side has {pct}% less range of motion.",
    },
    "Control": {
        "jerky": "Smooth out the movement — reduce the jerking through the mid-range.",
    },
}


def _generate_cue(sub_scores: Dict[str, Optional[float]],
                  trackers: Dict[str, _JointTracker],
                  left_reps: int, right_reps: int,
                  exercise_def: Optional[ExerciseDefinition],
                  phase: str) -> str:
    """
    Produce the single most impactful coaching cue based on the weakest
    sub-score and the specific data behind it.
    """
    # Find the weakest sub-score
    valid = {k: v for k, v in sub_scores.items() if v is not None}
    if not valid:
        if left_reps + right_reps == 0:
            return "Ready — start your first rep."
        return "Keep going — maintain your form."

    weakest_key = min(valid, key=lambda k: valid[k])
    weakest_val = valid[weakest_key]

    # Only generate corrective cues if something is actually below par
    if weakest_val >= 88:
        return "Clean rep — keep that form locked in."

    # Gather tracker data for specificity
    all_trackers = list(trackers.values())
    primary = all_trackers[0] if all_trackers else None

    if weakest_key == "ROM" and primary:
        peak = primary.last_peak
        bottom = primary.last_bottom
        rule = primary.rule
        if peak is not None and peak > rule.contracted + 10:
            deficit = int(peak - rule.contracted)
            return f"Squeeze {deficit} degrees deeper at the top for full contraction."
        if bottom is not None and bottom < rule.extended - 10:
            deficit = int(rule.extended - bottom)
            return f"Lower {deficit} degrees more to reach full depth."
        ideal = rule.ideal_rom
        actual = (primary.last_rom or 0)
        if ideal > 0:
            pct_short = int((1 - actual / ideal) * 100)
            if pct_short > 5:
                return f"Use a bigger range of motion — you're cutting {pct_short}% short."
        return "Push through the full range of motion on every rep."

    if weakest_key == "Stability":
        return "Brace your core — keep non-working joints locked in position."

    if weakest_key == "Tempo":
        if primary and primary.last_tempo is not None:
            tempo = primary.last_tempo
            ideal_lo = (exercise_def.ideal_tempo_s[0] if exercise_def
                        else 1.5)
            ideal_hi = (exercise_def.ideal_tempo_s[1] if exercise_def
                        else 4.0)
            if tempo < ideal_lo:
                return f"Slow down — control the eccentric for at least {ideal_lo:.1f}s."
            if tempo > ideal_hi:
                return f"Pick up the pace — you're stalling at {tempo:.1f}s per rep."
        return "Control your rep speed — not too fast, not too slow."

    if weakest_key == "Symmetry":
        diff = abs(left_reps - right_reps)
        if diff >= 2:
            weak = "left" if left_reps < right_reps else "right"
            return f"Your {weak} side is {diff} reps behind — even it out."
        # ROM-based asymmetry
        left_t = [t for name, t in trackers.items() if "left" in name]
        right_t = [t for name, t in trackers.items() if "right" in name]
        if left_t and right_t:
            l_rom = left_t[0].last_rom
            r_rom = right_t[0].last_rom
            if l_rom and r_rom:
                weaker = "left" if l_rom < r_rom else "right"
                pct = int(abs(l_rom - r_rom) / max(l_rom, r_rom, 1) * 100)
                return f"Your {weaker} side has {pct}% less range of motion."
        return "Focus on moving both sides evenly."

    if weakest_key == "Control":
        return "Smooth out the movement — reduce jerking through the mid-range."

    return "Focus on form — quality over quantity."


# ---------------------------------------------------------------------------
# UniversalDetector
# ---------------------------------------------------------------------------

class UniversalDetector:
    """
    Handles rep counting, form scoring, and coaching-cue generation for ANY
    exercise.  Provide an ``exercise_slug`` to load specific rules, or leave
    it ``None`` to auto-detect the exercise from observed movement.
    """

    MIN_VISIBILITY: float = 0.5

    def __init__(self, exercise_slug: Optional[str] = None,
                 smooth_window: int = 5, debounce_frames: int = 3):
        self._slug = exercise_slug
        self._smooth_window = smooth_window
        self._debounce = debounce_frames

        # Resolve exercise definition (may be None for auto-detect)
        self._exercise_def: Optional[ExerciseDefinition] = _resolve_exercise(exercise_slug)

        # Joint trackers — one per primary joint in the exercise
        self._trackers: Dict[str, _JointTracker] = {}
        self._phase_tracker = _PhaseTracker()
        self._stability: Optional[_StabilityScorer] = None
        self._auto_detector: Optional[_AutoDetector] = None

        if self._exercise_def is not None:
            self._init_from_definition(self._exercise_def)
        else:
            # Auto-detect mode
            self._auto_detector = _AutoDetector()

        # Aggregate state
        self._left_reps: int = 0
        self._right_reps: int = 0
        self._total_reps: int = 0
        self._symmetry_history: Deque[Tuple[int, int]] = deque(maxlen=50)

    def _init_from_definition(self, defn: ExerciseDefinition) -> None:
        """Wire up trackers and stability scorer from an exercise definition."""
        self._exercise_def = defn
        self._trackers = {}
        for rule in defn.primary_joints:
            self._trackers[rule.joint_name] = _JointTracker(
                rule, smooth_window=self._smooth_window,
                debounce_frames=self._debounce)
        self._stability = _StabilityScorer(defn.stability_joints)
        self._phase_tracker = _PhaseTracker()

    def reset(self) -> None:
        """Reset all state for a new set."""
        for t in self._trackers.values():
            t.reset()
        self._phase_tracker.reset()
        if self._stability:
            self._stability.reset()
        if self._auto_detector:
            self._auto_detector.reset()
        self._left_reps = 0
        self._right_reps = 0
        self._total_reps = 0
        self._symmetry_history.clear()

    # -- main entry --------------------------------------------------------

    def process_frame(self, landmarks, frame_width: int,
                      frame_height: int) -> AnalysisResult:
        """
        Process one frame of pose landmarks and return a complete analysis.

        Parameters
        ----------
        landmarks : mediapipe NormalizedLandmarkList
            The ``pose_landmarks`` from a MediaPipe Pose result.
        frame_width : int
            Width of the video frame in pixels.
        frame_height : int
            Height of the video frame in pixels.

        Returns
        -------
        AnalysisResult
            Rep counts, scores, phase, coaching cue, and more.
        """
        now = time.time()
        w, h = frame_width, frame_height

        # -- Step 0: auto-detect if no exercise was specified ---------------
        if self._auto_detector is not None and self._exercise_def is None:
            slug = self._auto_detector.feed(landmarks, w, h, self.MIN_VISIBILITY)
            if slug is not None:
                defn = _resolve_exercise(slug)
                if defn is not None:
                    self._slug = slug
                    self._init_from_definition(defn)
                    log.info("Auto-detected exercise: %s (conf=%.2f)",
                             defn.name, self._auto_detector.confidence)

        # -- Step 1: compute all joint angles ------------------------------
        joint_angles: Dict[str, Optional[float]] = {}
        for name, tracker in self._trackers.items():
            a, b, c = tracker.rule.landmarks
            raw = calculate_angle_from_landmarks(
                landmarks, a, b, c, w, h,
                min_visibility=self.MIN_VISIBILITY)
            joint_angles[name] = raw

        # -- Step 2: update trackers and detect reps -----------------------
        ideal_tempo = (self._exercise_def.ideal_tempo_s
                       if self._exercise_def else (1.5, 4.0))

        rep_this_frame = False
        for name, tracker in self._trackers.items():
            completed = tracker.update(joint_angles[name], now, ideal_tempo)
            if completed:
                rep_this_frame = True

        # Aggregate reps per side
        self._aggregate_reps()

        # -- Step 3: determine movement phase ------------------------------
        primary_angle = self._primary_angle()
        phase = self._phase_tracker.update(primary_angle)

        # -- Step 4: update stability scorer -------------------------------
        if self._stability:
            self._stability.update(landmarks, w, h, self.MIN_VISIBILITY)

        # -- Step 5: compute sub-scores ------------------------------------
        sub_scores = self._compute_sub_scores()

        # -- Step 6: compute overall score ---------------------------------
        valid_scores = [v for v in sub_scores.values() if v is not None]
        if valid_scores:
            # Weighted: ROM 30%, Stability 15%, Tempo 20%, Symmetry 15%, Control 20%
            weights = {"ROM": 0.30, "Stability": 0.15, "Tempo": 0.20,
                       "Symmetry": 0.15, "Control": 0.20}
            weighted_sum = 0.0
            weight_total = 0.0
            for key, w_val in weights.items():
                if sub_scores.get(key) is not None:
                    weighted_sum += sub_scores[key] * w_val
                    weight_total += w_val
            overall = int(round(weighted_sum / weight_total)) if weight_total > 0 else 0
        else:
            overall = 0

        # -- Step 7: generate coaching cue ---------------------------------
        exercise_name = (self._exercise_def.name if self._exercise_def
                         else self._slug or "Unknown")
        cue = _generate_cue(
            sub_scores, self._trackers,
            self._left_reps, self._right_reps,
            self._exercise_def, phase)

        muscles = (self._exercise_def.muscles if self._exercise_def
                   else [])

        pattern = (self._exercise_def.pattern if self._exercise_def
                   else None)
        confidence = (self._auto_detector.confidence if self._auto_detector
                      else 1.0)

        return AnalysisResult(
            exercise=exercise_name,
            left_reps=self._left_reps,
            right_reps=self._right_reps,
            total_reps=self._total_reps,
            overall_score=overall,
            sub_scores={k: (v if v is not None else 0) for k, v in sub_scores.items()},
            coaching_cue=cue,
            muscles_targeted=muscles,
            phase=phase,
            joint_angles={k: (round(v, 1) if v is not None else None)
                          for k, v in joint_angles.items()},
            pattern=pattern,
            confidence=confidence,
        )

    # -- auto-detect public API --------------------------------------------

    def auto_detect_exercise(self, angle_history: List[Dict[str, float]]
                             ) -> Optional[str]:
        """
        Analyse a list of per-frame joint-angle snapshots and return the
        best-matching exercise slug, or None if no confident match.

        This is the offline/batch variant of the per-frame auto-detection
        that ``process_frame`` does internally.
        """
        if not angle_history:
            return None

        # Compute variance per joint across the provided history
        keys = angle_history[0].keys()
        variances: Dict[str, float] = {}
        for k in keys:
            vals = [frame[k] for frame in angle_history if k in frame]
            if len(vals) >= 10:
                variances[k] = float(np.var(vals))

        if not variances:
            return None

        # Re-use the same classification logic
        detector = _AutoDetector()
        detector._history = {k: [] for k in _DETECTION_JOINTS}
        for k, v_list in variances.items():
            if k in detector._history:
                # Populate enough synthetic data to trigger classification
                detector._history[k] = [0.0] * 20  # dummy length
        # Override variances directly for classification
        detector._frames = _AutoDetector.WARMUP_FRAMES
        # Reconstruct from provided data
        for frame_data in angle_history:
            for k, v in frame_data.items():
                if k in detector._history:
                    detector._history[k].append(v)
        return detector._classify()

    # -- internal helpers --------------------------------------------------

    def _primary_angle(self) -> Optional[float]:
        """Return the angle of the first tracker that has a valid reading."""
        for tracker in self._trackers.values():
            if tracker.angle is not None:
                return tracker.angle
        return None

    def _aggregate_reps(self) -> None:
        """
        Update left/right/total rep counts from the joint trackers.

        For bilateral exercises the left and right trackers are separate.
        For unilateral or non-sided exercises, total = max of all trackers.
        """
        left_trackers = [t for n, t in self._trackers.items() if "left" in n]
        right_trackers = [t for n, t in self._trackers.items() if "right" in n]

        if left_trackers and right_trackers:
            self._left_reps = max(t.reps for t in left_trackers)
            self._right_reps = max(t.reps for t in right_trackers)
            self._total_reps = self._left_reps + self._right_reps
        else:
            # Non-bilateral: total reps = max across all trackers
            all_reps = [t.reps for t in self._trackers.values()]
            total = max(all_reps) if all_reps else 0
            self._left_reps = total
            self._right_reps = total
            self._total_reps = total

    def _compute_sub_scores(self) -> Dict[str, Optional[int]]:
        """Merge per-joint tracker scores into the five sub-score categories."""

        # --- ROM: average across trackers ---
        rom_vals = []
        for t in self._trackers.values():
            ss = t.live_subscores()
            if ss.get("ROM") is not None:
                rom_vals.append(ss["ROM"])
        rom = round(np.mean(rom_vals)) if rom_vals else None

        # --- Tempo: average across trackers ---
        tempo_vals = []
        for t in self._trackers.values():
            ss = t.live_subscores()
            if ss.get("Tempo") is not None:
                tempo_vals.append(ss["Tempo"])
        tempo = round(np.mean(tempo_vals)) if tempo_vals else None

        # --- Control: average across trackers ---
        ctrl_vals = []
        for t in self._trackers.values():
            ss = t.live_subscores()
            if ss.get("Control") is not None:
                ctrl_vals.append(ss["Control"])
        control = round(np.mean(ctrl_vals)) if ctrl_vals else None

        # --- Stability: from the stability scorer ---
        stability = None
        if self._stability:
            raw_stability = self._stability.score()
            stability = round(raw_stability)

        # --- Symmetry: rep balance + ROM agreement between sides ---
        symmetry = self._symmetry_score()

        return {
            "ROM": rom,
            "Stability": stability,
            "Tempo": tempo,
            "Symmetry": symmetry,
            "Control": control,
        }

    def _symmetry_score(self) -> Optional[int]:
        """
        Compute a 0-100 symmetry score from rep balance and per-side ROM
        agreement.
        """
        lr, rr = self._left_reps, self._right_reps
        if lr + rr == 0:
            return None

        # Rep balance penalty
        rep_penalty = abs(lr - rr) / max(lr, rr, 1) * 55

        # ROM agreement penalty
        left_trackers = [t for n, t in self._trackers.items() if "left" in n]
        right_trackers = [t for n, t in self._trackers.items() if "right" in n]
        rom_penalty = 0.0
        if left_trackers and right_trackers:
            l_roms = [t.last_rom for t in left_trackers if t.last_rom is not None]
            r_roms = [t.last_rom for t in right_trackers if t.last_rom is not None]
            if l_roms and r_roms:
                l_avg = np.mean(l_roms)
                r_avg = np.mean(r_roms)
                rom_penalty = abs(l_avg - r_avg) * 0.5

        return int(round(float(np.clip(99 - rep_penalty - rom_penalty, 30, 99))))
