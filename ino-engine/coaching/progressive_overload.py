"""
progressive_overload.py
-----------------------
Turns logged session history into the next-session prescription using
double-progression (reps first, then load), with deload detection.

A "session" dict for one exercise:
    {"date": "2026-06-01", "weight": 40.0, "sets": 3,
     "reps": [10, 9, 8], "avg_form": 91}

Usage
~~~~~
    eng = ProgressiveOverloadEngine(rep_low=8, rep_high=12)
    rec = eng.recommend(history)   # -> OverloadRec(action, detail, ...)
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

import numpy as np


@dataclass
class OverloadConfig:
    rep_low: int = 8
    rep_high: int = 12
    form_floor: float = 80.0     # below this, technique gates progression
    load_step_pct: float = 0.025 # +2.5 % when adding weight
    min_load_step: float = 2.5   # absolute floor (kg or lb)
    deload_drop_sessions: int = 3


@dataclass
class OverloadRec:
    action: str          # add_weight | add_reps | add_set | deload | hold
    detail: str
    target_weight: Optional[float] = None
    target_reps: Optional[int] = None
    target_sets: Optional[int] = None


class ProgressiveOverloadEngine:
    def __init__(self, config: Optional[OverloadConfig] = None, **kw):
        self.cfg = config or OverloadConfig(**kw)

    def recommend(self, history: List[dict]) -> OverloadRec:
        if not history:
            return OverloadRec("hold", "No history yet — log a session to calibrate.")
        last = history[-1]
        cfg = self.cfg
        reps = last.get("reps", [])
        sets = last.get("sets", len(reps))
        weight = float(last.get("weight", 0))
        form = float(last.get("avg_form", 100))
        min_reps = min(reps) if reps else 0
        all_top = bool(reps) and all(r >= cfg.rep_high for r in reps)

        # 1) deload: performance trending down across recent sessions
        if len(history) >= cfg.deload_drop_sessions:
            vols = [s.get("weight", 0) * sum(s.get("reps", [])) for s in history[-cfg.deload_drop_sessions:]]
            if vols[0] > 0 and vols[-1] < vols[0] * 0.92 and form < cfg.form_floor + 5:
                return OverloadRec("deload", "Output and form slipping over 3 sessions — "
                                   "drop ~10% load this week and rebuild.",
                                   target_weight=round(weight * 0.9, 1), target_sets=sets)

        # 2) technique gate
        if form < cfg.form_floor:
            return OverloadRec("hold", f"Form {form:.0f}<{cfg.form_floor:.0f}. "
                               "Repeat this weight and clean up technique before adding load.",
                               target_weight=weight, target_reps=cfg.rep_high)

        # 3) hit top of range on every set with good form → add load, reset reps
        if all_top:
            step = max(cfg.min_load_step, round(weight * cfg.load_step_pct / cfg.min_load_step) * cfg.min_load_step)
            return OverloadRec("add_weight",
                               f"All sets at {cfg.rep_high}+ reps with solid form — add {step:g}.",
                               target_weight=round(weight + step, 1), target_reps=cfg.rep_low)

        # 4) room left in the range → add reps
        if min_reps < cfg.rep_high:
            return OverloadRec("add_reps",
                               f"Add 1 rep per set toward {cfg.rep_high} before adding weight.",
                               target_weight=weight, target_reps=min(min_reps + 1, cfg.rep_high))

        # 5) plenty of headroom / low volume → add a set
        return OverloadRec("add_set", "Strong and easy — add a set for more volume.",
                           target_weight=weight, target_sets=sets + 1)
