"""
imbalance_detector.py
---------------------
Left vs right asymmetry from per-side rep metrics (reps, ROM, bar speed).
Feed it the same numbers the exercise detector emits per arm/leg.

Usage
~~~~~
    im = ImbalanceDetector()
    im.update_side("left",  rom=124, velocity=58)
    im.update_side("right", rom=110, velocity=49)
    im.set_reps(left=10, right=8)
    report = im.report()   # -> ImbalanceReport
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional

import numpy as np


@dataclass
class ImbalanceConfig:
    asym_watch: float = 0.08     # 8 % difference → minor
    asym_high: float = 0.15      # 15 % → notable
    min_samples: int = 2


@dataclass
class ImbalanceReport:
    rep_diff: int
    rom_asym: float              # 0–1 fraction
    vel_asym: float
    weaker: Optional[str]        # "left" | "right" | None
    severity: str                # even | minor | notable
    note: str


class ImbalanceDetector:
    def __init__(self, config: Optional[ImbalanceConfig] = None):
        self.cfg = config or ImbalanceConfig()
        self.reset()

    def reset(self) -> None:
        self._rom = {"left": [], "right": []}
        self._vel = {"left": [], "right": []}
        self.reps = {"left": 0, "right": 0}

    def update_side(self, side: str, rom: Optional[float] = None,
                    velocity: Optional[float] = None) -> None:
        if rom is not None:
            self._rom[side].append(rom)
        if velocity is not None:
            self._vel[side].append(velocity)

    def set_reps(self, left: int, right: int) -> None:
        self.reps["left"], self.reps["right"] = left, right

    @staticmethod
    def _asym(a: List[float], b: List[float]) -> float:
        if not a or not b:
            return 0.0
        ma, mb = np.mean(a), np.mean(b)
        denom = max(ma, mb, 1e-6)
        return float(abs(ma - mb) / denom)

    def report(self) -> ImbalanceReport:
        rom_asym = self._asym(self._rom["left"], self._rom["right"])
        vel_asym = self._asym(self._vel["left"], self._vel["right"])
        rep_diff = self.reps["left"] - self.reps["right"]

        # weaker side = lower mean ROM/velocity (or fewer reps)
        score = {"left": 0, "right": 0}
        for metric in (self._rom, self._vel):
            l, r = metric["left"], metric["right"]
            if l and r:
                if np.mean(l) < np.mean(r): score["left"] += 1
                elif np.mean(r) < np.mean(l): score["right"] += 1
        if rep_diff < 0: score["left"] += 1
        elif rep_diff > 0: score["right"] += 1

        worst = max(rom_asym, vel_asym, abs(rep_diff) / max(*self.reps.values(), 1))
        if worst >= self.cfg.asym_high:
            sev = "notable"
        elif worst >= self.cfg.asym_watch:
            sev = "minor"
        else:
            sev = "even"

        weaker = None
        if sev != "even" and score["left"] != score["right"]:
            weaker = "left" if score["left"] > score["right"] else "right"

        if sev == "even":
            note = "Sides are balanced — keep it symmetric."
        else:
            note = f"{weaker.capitalize()} side lagging ~{worst*100:.0f}% — add a few unilateral sets."
        return ImbalanceReport(rep_diff, round(rom_asym, 3), round(vel_asym, 3),
                               weaker, sev, note)
