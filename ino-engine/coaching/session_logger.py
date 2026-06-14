"""
session_logger.py
-----------------
Persistent training log — the data backbone for the coach. Records every rep
and set to JSON on disk so progression, fatigue trends, and imbalance can be
computed across sessions. No database required.

Layout:
    data/sessions/<user>/<YYYY-MM-DD_HHMMSS>.json

Usage
~~~~~
    log = SessionLogger(user="ruben")
    log.start_session()
    log.log_rep("Barbell Curl", side="left", rom=124, tempo=2.1, form=92)
    log.end_set("Barbell Curl", weight=15)        # closes current set
    path = log.save()
    history = SessionLogger.exercise_history("ruben", "Barbell Curl")
"""
from __future__ import annotations

import datetime as _dt
import json
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Optional

DATA_ROOT = Path(__file__).with_name("data") / "sessions"


@dataclass
class RepRecord:
    exercise: str
    side: Optional[str]
    rom: Optional[float]
    tempo: Optional[float]
    form: Optional[float]
    velocity: Optional[float]
    t: float


@dataclass
class SetRecord:
    exercise: str
    weight: Optional[float]
    reps: int
    avg_form: Optional[float]
    avg_rom: Optional[float]
    started: float


class SessionLogger:
    def __init__(self, user: str = "default", root: Path = DATA_ROOT):
        self.user = user
        self.root = Path(root) / user
        self.root.mkdir(parents=True, exist_ok=True)
        self.reset()

    def reset(self) -> None:
        self.date = _dt.datetime.now()
        self.reps: List[RepRecord] = []
        self.sets: List[SetRecord] = []
        self._open_reps: List[RepRecord] = []

    def start_session(self) -> None:
        self.reset()

    # -- live capture -------------------------------------------------------
    def log_rep(self, exercise: str, side: Optional[str] = None,
                rom=None, tempo=None, form=None, velocity=None) -> None:
        rec = RepRecord(exercise, side, rom, tempo, form, velocity,
                        _dt.datetime.now().timestamp())
        self.reps.append(rec)
        self._open_reps.append(rec)

    def end_set(self, exercise: str, weight: Optional[float] = None) -> SetRecord:
        reps = [r for r in self._open_reps if r.exercise == exercise]
        forms = [r.form for r in reps if r.form is not None]
        roms = [r.rom for r in reps if r.rom is not None]
        rec = SetRecord(
            exercise=exercise,
            weight=weight,
            reps=len(reps),
            avg_form=round(sum(forms) / len(forms), 1) if forms else None,
            avg_rom=round(sum(roms) / len(roms), 1) if roms else None,
            started=reps[0].t if reps else _dt.datetime.now().timestamp(),
        )
        self.sets.append(rec)
        self._open_reps = [r for r in self._open_reps if r.exercise != exercise]
        return rec

    # -- persistence --------------------------------------------------------
    def save(self) -> Path:
        fname = self.date.strftime("%Y-%m-%d_%H%M%S") + ".json"
        path = self.root / fname
        payload = {
            "user": self.user,
            "date": self.date.isoformat(),
            "reps": [asdict(r) for r in self.reps],
            "sets": [asdict(s) for s in self.sets],
        }
        path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return path

    # -- history queries ----------------------------------------------------
    @classmethod
    def load_all(cls, user: str, root: Path = DATA_ROOT) -> List[dict]:
        d = Path(root) / user
        if not d.exists():
            return []
        out = []
        for f in sorted(d.glob("*.json")):
            try:
                out.append(json.loads(f.read_text(encoding="utf-8")))
            except Exception:
                continue
        return out

    @classmethod
    def exercise_history(cls, user: str, exercise: str,
                         root: Path = DATA_ROOT) -> List[dict]:
        """One row per (session, exercise) shaped for ProgressiveOverloadEngine."""
        rows = []
        for sess in cls.load_all(user, root):
            sets = [s for s in sess["sets"] if s["exercise"] == exercise]
            if not sets:
                continue
            forms = [s["avg_form"] for s in sets if s["avg_form"] is not None]
            rows.append({
                "date": sess["date"][:10],
                "weight": sets[-1].get("weight") or 0,
                "sets": len(sets),
                "reps": [s["reps"] for s in sets],
                "avg_form": round(sum(forms) / len(forms), 1) if forms else 100,
            })
        return rows
