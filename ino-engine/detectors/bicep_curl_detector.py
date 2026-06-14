"""
bicep_curl_detector.py
----------------------
Per-arm bicep-curl detection with a hysteresis rep counter plus real
form analysis (ROM, tempo, control, symmetry) computed at full frame rate.

Drop-in for the existing main.py:
    from bicep_curl_detector import BicepCurlConfig, BicepCurlDetector, FrameResult
    detector.process_frame(frame, landmarks, w, h) -> FrameResult
    detector.reset()

FrameResult keeps the original six fields and adds richer ones (scores,
ROM, tempo, a coaching cue) that main.py forwards to muscle_state.js.
"""

from __future__ import annotations

import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

import cv2
import numpy as np

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

try:
    from core.angle_calculator import (
        PoseLandmark,
        calculate_angle_from_landmarks,
        get_landmark_visibility,
        smooth_angle,
    )
except ImportError:
    from angle_calculator import (  # type: ignore[no-redef]
        PoseLandmark,
        calculate_angle_from_landmarks,
        get_landmark_visibility,
        smooth_angle,
    )

# ---------------------------------------------------------------------------
# Config / result
# ---------------------------------------------------------------------------

@dataclass
class BicepCurlConfig:
    angle_down: float = 160.0      # elbow extended (bottom of curl)
    angle_up: float = 40.0         # elbow flexed   (top of curl)
    smooth_window: int = 5
    state_hold_frames: int = 3     # debounce frames at each end
    min_visibility: float = 0.5
    ideal_tempo_s: tuple = (1.4, 3.6)   # healthy seconds-per-rep band
    full_contraction: float = 55.0      # peak angle must drop below this
    full_extension: float = 150.0       # bottom angle must exceed this


@dataclass
class FrameResult:
    frame: np.ndarray
    # original contract --------------------------------------------------
    left_reps: int
    right_reps: int
    left_angle: Optional[float]
    right_angle: Optional[float]
    left_form: str
    right_form: str
    # enriched -----------------------------------------------------------
    left_score: Optional[int] = None
    right_score: Optional[int] = None
    overall: Optional[int] = None
    sub: dict = field(default_factory=dict)   # ROM/Tempo/Symmetry/Control/Stability
    left_rom: Optional[float] = None
    right_rom: Optional[float] = None
    left_tempo: Optional[float] = None
    right_tempo: Optional[float] = None
    cue: str = "—"


# ---------------------------------------------------------------------------
# Per-arm tracker
# ---------------------------------------------------------------------------

class _ArmTracker:
    """State machine + per-rep metric collection for one arm."""

    def __init__(self, cfg: BicepCurlConfig):
        self.cfg = cfg
        self.reset()

    def reset(self) -> None:
        self.reps = 0
        self.state = "down"          # "down" = extended, "up" = flexed
        self.history: list[float] = []
        self.hold = 0
        # current-rep accumulators
        self._min = 180.0            # peak contraction (smallest angle)
        self._max = 0.0              # deepest extension (largest angle)
        self._t_start = None
        self._prev_a = None
        self._jerk_sum = 0.0
        self._jerk_n = 0
        # last completed rep
        self.last_rom: Optional[float] = None
        self.last_tempo: Optional[float] = None
        self.form = "Landmark not visible"
        # exponential-moving form score so the ring is stable
        self.score: Optional[float] = None
        self.last_sub: dict = {}

    # -- scoring helpers ----------------------------------------------------
    def _score_rom(self, peak: float, bottom: float) -> float:
        rng = bottom - peak
        s = np.interp(rng, [60, 115], [55, 99])
        if peak > self.cfg.full_contraction:      # didn't curl high enough
            s -= (peak - self.cfg.full_contraction) * 0.8
        if bottom < self.cfg.full_extension:       # didn't extend fully
            s -= (self.cfg.full_extension - bottom) * 0.6
        return float(np.clip(s, 40, 99))

    def _score_tempo(self, secs: float) -> float:
        lo, hi = self.cfg.ideal_tempo_s
        if lo <= secs <= hi:
            return 96.0
        if secs < lo:
            return float(np.clip(96 - (lo - secs) * 40, 45, 96))   # too fast = momentum
        return float(np.clip(96 - (secs - hi) * 12, 60, 96))        # slow is fine-ish

    def _score_control(self) -> float:
        if self._jerk_n == 0:
            return 85.0
        mean_jerk = self._jerk_sum / self._jerk_n   # avg °/frame of fluctuation
        return float(np.clip(98 - mean_jerk * 6.0, 50, 99))

    # -- per-frame update ---------------------------------------------------
    def update(self, raw_angle: Optional[float], now: float) -> None:
        if raw_angle is None:
            self.form = "Landmark not visible"
            return

        a = smooth_angle(raw_angle, self.history, window=self.cfg.smooth_window)
        if self.form == "Landmark not visible":
            self.form = "—"   # visible now; awaiting first completed rep

        # jitter / control accumulation
        if self._prev_a is not None:
            self._jerk_sum += abs(a - self._prev_a)
            self._jerk_n += 1
        self._prev_a = a

        # track range within the active rep
        self._min = min(self._min, a)
        self._max = max(self._max, a)

        # state machine with debounce
        if self.state == "down":
            if a <= self.cfg.angle_up:
                self.hold += 1
                if self.hold >= self.cfg.state_hold_frames:
                    self.state = "up"
                    self.hold = 0
                    if self._t_start is None:
                        self._t_start = now
            else:
                self.hold = 0
        else:  # "up"  → wait for full extension to complete the rep
            if a >= self.cfg.angle_down:
                self.hold += 1
                if self.hold >= self.cfg.state_hold_frames:
                    self._complete_rep(now)
                    self.state = "down"
                    self.hold = 0
            else:
                self.hold = 0

    def _complete_rep(self, now: float) -> None:
        self.reps += 1
        peak, bottom = self._min, self._max
        self.last_rom = bottom - peak
        self.last_tempo = (now - self._t_start) if self._t_start else None

        rom_s = self._score_rom(peak, bottom)
        tempo_s = self._score_tempo(self.last_tempo) if self.last_tempo else 80.0
        ctrl_s = self._score_control()
        self.last_sub = {"ROM": rom_s, "Tempo": tempo_s, "Control": ctrl_s}
        rep_score = 0.45 * rom_s + 0.25 * tempo_s + 0.30 * ctrl_s
        # EMA so the displayed score doesn't whip around
        self.score = rep_score if self.score is None else 0.6 * self.score + 0.4 * rep_score

        # human-readable form cue (kept compatible with the old badge logic)
        if peak > self.cfg.full_contraction:
            self.form = "Curl higher"
        elif bottom < self.cfg.full_extension:
            self.form = "Lower fully"
        elif self.last_tempo and self.last_tempo < self.cfg.ideal_tempo_s[0]:
            self.form = "Control the weight"
        else:
            self.form = "✓ Good rep"

        # reset accumulators for next rep
        self._min, self._max = 180.0, 0.0
        self._t_start = now
        self._jerk_sum, self._jerk_n = 0.0, 0

    # expose the live sub-scores (mid-rep estimate) -------------------------
    def live_subscores(self) -> dict:
        """Last completed rep's scores (stable); fall back to a live estimate."""
        if self.last_sub:
            return dict(self.last_sub)
        return {
            "ROM": self._score_rom(self._min, self._max) if self._max > 0 else None,
            "Tempo": self._score_tempo(self.last_tempo) if self.last_tempo else None,
            "Control": self._score_control(),
        }


# ---------------------------------------------------------------------------
# Detector
# ---------------------------------------------------------------------------

class BicepCurlDetector:
    def __init__(self, config: Optional[BicepCurlConfig] = None):
        self.cfg = config or BicepCurlConfig()
        self.left = _ArmTracker(self.cfg)
        self.right = _ArmTracker(self.cfg)

    def reset(self) -> None:
        self.left.reset()
        self.right.reset()

    # -- main entry ---------------------------------------------------------
    def process_frame(self, frame, landmarks, w: int, h: int) -> FrameResult:
        now = time.time()

        l_angle = calculate_angle_from_landmarks(
            landmarks, PoseLandmark.LEFT_SHOULDER, PoseLandmark.LEFT_ELBOW,
            PoseLandmark.LEFT_WRIST, w, h, min_visibility=self.cfg.min_visibility,
        )
        r_angle = calculate_angle_from_landmarks(
            landmarks, PoseLandmark.RIGHT_SHOULDER, PoseLandmark.RIGHT_ELBOW,
            PoseLandmark.RIGHT_WRIST, w, h, min_visibility=self.cfg.min_visibility,
        )

        self.left.update(l_angle, now)
        self.right.update(r_angle, now)

        # symmetry from rep balance + per-rep ROM agreement
        sym = self._symmetry_score()
        subs = self._combined_subscores(sym)
        overall = int(round(np.mean([v for v in subs.values() if v is not None]))) \
            if any(v is not None for v in subs.values()) else None

        self._draw_hud(frame, l_angle, r_angle)

        return FrameResult(
            frame=frame,
            left_reps=self.left.reps,
            right_reps=self.right.reps,
            left_angle=l_angle,
            right_angle=r_angle,
            left_form=self.left.form,
            right_form=self.right.form,
            left_score=int(self.left.score) if self.left.score else None,
            right_score=int(self.right.score) if self.right.score else None,
            overall=overall,
            sub=subs,
            left_rom=self.left.last_rom,
            right_rom=self.right.last_rom,
            left_tempo=self.left.last_tempo,
            right_tempo=self.right.last_tempo,
            cue=self._coaching_cue(),
        )

    # -- aggregate scoring --------------------------------------------------
    def _symmetry_score(self) -> Optional[float]:
        lr, rr = self.left.reps, self.right.reps
        if lr + rr == 0:
            return None
        rep_pen = abs(lr - rr) / max(lr, rr, 1) * 60
        rom_pen = 0.0
        if self.left.last_rom and self.right.last_rom:
            rom_pen = abs(self.left.last_rom - self.right.last_rom) * 0.5
        return float(np.clip(99 - rep_pen - rom_pen, 40, 99))

    def _combined_subscores(self, sym: Optional[float]) -> dict:
        ls, rs = self.left.live_subscores(), self.right.live_subscores()

        def avg(key):
            vals = [d[key] for d in (ls, rs) if d.get(key) is not None]
            return float(np.mean(vals)) if vals else None

        rom, tempo, ctrl = avg("ROM"), avg("Tempo"), avg("Control")
        stability = None
        if ctrl is not None:
            stability = float(np.clip(ctrl * 0.6 + (sym or 80) * 0.4, 40, 99))
        out = {"ROM": rom, "Tempo": tempo, "Symmetry": sym,
               "Control": ctrl, "Stability": stability}
        return {k: (round(v) if v is not None else None) for k, v in out.items()}

    def _coaching_cue(self) -> str:
        forms = [self.left.form, self.right.form]
        if "Landmark not visible" in forms and self.left.reps + self.right.reps == 0:
            return "Step into frame — show both arms."
        if "Curl higher" in forms:
            return "Squeeze higher at the top — full contraction."
        if "Lower fully" in forms:
            return "Extend all the way down — own the stretch."
        if "Control the weight" in forms:
            return "Slow the eccentric — no swinging."
        lr, rr = self.left.reps, self.right.reps
        if lr + rr >= 2 and abs(lr - rr) >= 2:
            weak = "left" if lr < rr else "right"
            return f"Your {weak} arm is lagging — even it out."
        if lr + rr > 0:
            return "Clean reps — keep the tempo controlled."
        return "Ready. Start curling."

    # -- on-frame HUD -------------------------------------------------------
    def _draw_hud(self, frame, l_angle, r_angle) -> None:
        h, w = frame.shape[:2]
        cv2.rectangle(frame, (0, 0), (w, 54), (12, 12, 16), -1)
        cv2.putText(frame, f"L {self.left.reps}  reps", (16, 36),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (90, 200, 255), 2, cv2.LINE_AA)
        cv2.putText(frame, f"R {self.right.reps}  reps", (w - 190, 36),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.9, (60, 90, 255), 2, cv2.LINE_AA)
        if l_angle is not None:
            cv2.putText(frame, f"{l_angle:0.0f}deg", (16, h - 18),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2, cv2.LINE_AA)
        if r_angle is not None:
            cv2.putText(frame, f"{r_angle:0.0f}deg", (w - 120, h - 18),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2, cv2.LINE_AA)
