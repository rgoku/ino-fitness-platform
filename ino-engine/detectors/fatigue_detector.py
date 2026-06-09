"""
fatigue_detector.py
-------------------
Tracks intra-set fatigue from the same per-rep data the bicep detector
already produces (ROM, tempo, form score). Bar-speed proxy = ROM ÷ concentric
seconds, the basis of Velocity-Based Training.

Usage
~~~~~
    fd = FatigueDetector()
    fd.update_rep(rom=124, tempo=2.1, form_score=92)   # call once per completed rep
    state = fd.state()        # -> FatigueState(level, status, rir, reason)
    fd.reset()                # at the start of each set
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

import numpy as np


@dataclass
class FatigueConfig:
    baseline_reps: int = 2       # reps used to establish "fresh" output
    vel_drop_warn: float = 0.20  # 20 % bar-speed loss → fatiguing
    vel_drop_fail: float = 0.35  # 35 % → approaching failure
    rom_drop_warn: float = 0.12  # 12 % ROM loss contributes
    form_drop_warn: float = 8.0  # form-score points lost contributes


@dataclass
class FatigueState:
    level: int                   # 0–100 fatigue meter
    status: str                  # Fresh | Working | Fatiguing | Near failure
    rir: Optional[float]         # estimated reps-in-reserve
    reason: str


class FatigueDetector:
    def __init__(self, config: Optional[FatigueConfig] = None):
        self.cfg = config or FatigueConfig()
        self.reset()

    def reset(self) -> None:
        self.vel: List[float] = []
        self.rom: List[float] = []
        self.form: List[float] = []
        self.base_vel: Optional[float] = None
        self.base_rom: Optional[float] = None
        self.base_form: Optional[float] = None

    def update_rep(
        self,
        rom: Optional[float],
        tempo: Optional[float],
        form_score: Optional[float],
        velocity: Optional[float] = None,
    ) -> FatigueState:
        v = velocity
        if v is None and rom and tempo:
            v = rom / max(tempo, 1e-3)         # °/s concentric proxy
        if v is not None:
            self.vel.append(v)
        if rom is not None:
            self.rom.append(rom)
        if form_score is not None:
            self.form.append(form_score)

        if self.base_vel is None and len(self.vel) >= self.cfg.baseline_reps:
            n = self.cfg.baseline_reps
            self.base_vel = float(np.mean(self.vel[:n]))
            self.base_rom = float(np.mean(self.rom[:n])) if self.rom else None
            self.base_form = float(np.mean(self.form[:n])) if self.form else None
        return self.state()

    def state(self) -> FatigueState:
        if not self.vel or self.base_vel is None:
            return FatigueState(
                level=min(40, len(self.vel) * 8),
                status="Working" if self.vel else "Fresh",
                rir=None,
                reason="Establishing baseline",
            )

        cur_v = self.vel[-1]
        drop = max(0.0, (self.base_vel - cur_v) / self.base_vel)
        rom_drop = 0.0
        form_drop = 0.0
        if self.base_rom and self.rom:
            rom_drop = max(0.0, (self.base_rom - self.rom[-1]) / self.base_rom)
        if self.base_form and self.form:
            form_drop = max(0.0, self.base_form - self.form[-1])

        level = int(min(100,
            drop / self.cfg.vel_drop_fail * 70
            + rom_drop / self.cfg.rom_drop_warn * 15
            + form_drop / self.cfg.form_drop_warn * 15))

        rir = max(0.0, round((self.cfg.vel_drop_fail - drop) / self.cfg.vel_drop_fail * 4, 1))

        if drop >= self.cfg.vel_drop_fail or level >= 80:
            return FatigueState(max(level, 80), "Near failure", min(rir, 1.0),
                                f"Bar speed down {drop*100:.0f}% — stop with 1 in reserve.")
        if drop >= self.cfg.vel_drop_warn or level >= 50:
            return FatigueState(max(level, 50), "Fatiguing", rir,
                                "Velocity and ROM are dropping.")
        return FatigueState(level, "Working", rir, "Holding output.")
