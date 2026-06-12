"""
injury_risk_detector.py
-----------------------
Per-frame postural risk flags from MediaPipe pose landmarks, reusing the
geometry helpers in angle_calculator. Outputs are screening heuristics from a
single 2D camera — calibrate thresholds to your camera angle; they are cues to
review, not diagnoses.

Usage
~~~~~
    ir = InjuryRiskDetector()
    flags = ir.process(landmarks, w, h)   # dict slug -> {level, value, msg}
    # levels: "ok" | "low" | "watch" | "high"
"""
from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional, Tuple

import numpy as np

_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

try:
    from core.angle_calculator import (
        PoseLandmark as P,
        get_landmark_coords as gc,
        get_landmark_visibility as gv,
        calculate_angle,
    )
except ImportError:
    from angle_calculator import (  # type: ignore[no-redef]
        PoseLandmark as P,
        get_landmark_coords as gc,
        get_landmark_visibility as gv,
        calculate_angle,
    )

Point = Tuple[float, float]


@dataclass
class InjuryConfig:
    min_visibility: float = 0.5
    valgus_watch: float = 0.06       # knee medial drift / hip-width
    valgus_high: float = 0.12
    lumbar_watch: float = 26.0       # torso-vs-thigh deviation (deg) past neutral
    lumbar_high: float = 40.0
    shoulder_round_watch: float = 0.10   # ear-ahead-of-shoulder / shoulder-width
    shoulder_round_high: float = 0.20
    tilt_watch: float = 0.05         # L/R height diff / hip-width
    tilt_high: float = 0.10
    shift_watch: float = 0.10        # lateral pelvis shift / hip-width
    shift_high: float = 0.18


def _lvl(v: float, watch: float, high: float) -> str:
    if v >= high: return "high"
    if v >= watch: return "watch"
    if v >= watch * 0.5: return "low"
    return "ok"


class InjuryRiskDetector:
    def __init__(self, config: Optional[InjuryConfig] = None):
        self.cfg = config or InjuryConfig()

    def _pt(self, lm, idx, w, h) -> Optional[Point]:
        if gv(lm, idx) < self.cfg.min_visibility:
            return None
        return gc(lm, idx, w, h)

    def process(self, landmarks, w: int, h: int) -> Dict[str, dict]:
        c = self.cfg
        g = lambda i: self._pt(landmarks, i, w, h)
        Lsh, Rsh = g(P.LEFT_SHOULDER), g(P.RIGHT_SHOULDER)
        Lhip, Rhip = g(P.LEFT_HIP), g(P.RIGHT_HIP)
        Lkn, Rkn = g(P.LEFT_KNEE), g(P.RIGHT_KNEE)
        Lank, Rank = g(P.LEFT_ANKLE), g(P.RIGHT_ANKLE)
        Lear, Rear = g(P.LEFT_EAR), g(P.RIGHT_EAR)

        out: Dict[str, dict] = {}
        hip_w = abs(Lhip[0] - Rhip[0]) if (Lhip and Rhip) else None
        sh_w = abs(Lsh[0] - Rsh[0]) if (Lsh and Rsh) else None

        # ---- knee valgus (per leg): knee drifting toward midline vs ankle ----
        if hip_w and Lhip and Rhip and Lkn and Rkn and Lank and Rank:
            mid = (Lhip[0] + Rhip[0]) / 2
            def medial(knee, ankle):
                # positive = knee is closer to midline than the ankle (caving in)
                return (abs(ankle[0] - mid) - abs(knee[0] - mid)) / hip_w
            v = max(medial(Lkn, Lank), medial(Rkn, Rank), 0.0)
            out["knee_valgus"] = {"level": _lvl(v, c.valgus_watch, c.valgus_high),
                                  "value": round(v, 3),
                                  "msg": "Drive your knees out — track over your toes."}

        # ---- lumbar flexion: torso-vs-thigh deviation from a neutral hinge ----
        if Lsh and Lhip and Lkn:
            torso_thigh = calculate_angle(Lsh, Lhip, Lkn)   # shoulder-hip-knee
            dev = max(0.0, 180 - torso_thigh - 60)          # >60° closed past neutral
            out["lumbar_flexion"] = {"level": _lvl(dev, c.lumbar_watch, c.lumbar_high),
                                     "value": round(dev, 1),
                                     "msg": "Brace and keep a neutral spine — chest up."}

        # ---- rounded shoulders: ear ahead of shoulder (side view) ----
        if sh_w and Lear and Lsh:
            r = abs(Lear[0] - Lsh[0]) / sh_w
            out["rounded_shoulders"] = {"level": _lvl(r, c.shoulder_round_watch, c.shoulder_round_high),
                                        "value": round(r, 3),
                                        "msg": "Pull your head back — stack ears over shoulders."}

        # ---- hip / shoulder tilt = uneven loading ----
        if hip_w and Lhip and Rhip:
            tilt = abs(Lhip[1] - Rhip[1]) / hip_w
            sh_tilt = abs(Lsh[1] - Rsh[1]) / hip_w if (Lsh and Rsh) else 0.0
            uneven = max(tilt, sh_tilt)
            out["uneven_loading"] = {"level": _lvl(uneven, c.tilt_watch, c.tilt_high),
                                     "value": round(uneven, 3),
                                     "msg": "Level your hips and shoulders — load both sides evenly."}

        # ---- lateral hip shift: pelvis off the base of support ----
        if hip_w and Lhip and Rhip and Lank and Rank:
            mid_hip = (Lhip[0] + Rhip[0]) / 2
            mid_ank = (Lank[0] + Rank[0]) / 2
            shift = abs(mid_hip - mid_ank) / hip_w
            out["hip_shift"] = {"level": _lvl(shift, c.shift_watch, c.shift_high),
                                "value": round(shift, 3),
                                "msg": "Center your weight — you're shifting to one side."}

        return out

    @staticmethod
    def worst(flags: Dict[str, dict]) -> Optional[dict]:
        order = {"ok": 0, "low": 1, "watch": 2, "high": 3}
        ranked = sorted(flags.items(), key=lambda kv: order[kv[1]["level"]], reverse=True)
        if ranked and order[ranked[0][1]["level"]] >= 2:
            slug, d = ranked[0]
            return {"slug": slug, **d}
        return None
