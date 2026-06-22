"""AI Alert evaluation engine.

`compute_alerts_for_coach(coach_id)` walks every client owned by the coach
and runs the six trigger rules, returning a flat list of `Alert` records
the dashboard can render.

The rules are intentionally heuristics, not ML — we want them to be cheap,
deterministic and easy to explain to coaches. Tune the thresholds in
ALERT_RULES (top of file) without rewiring anything.
"""
from __future__ import annotations

from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
from typing import List, Optional

from sqlalchemy.orm import Session

from app.infrastructure.database.models import (
    User,
    WorkoutPlan,
    WorkoutSession,
    ProgressEntry,
    FoodEntry,
)


# ─── Tunable thresholds ─────────────────────────────────────────────────────

ALERT_RULES = {
    # Weight stalls
    "stall_window_days": 14,
    "stall_max_change_kg": 0.4,

    # Workout adherence
    "adherence_window_days": 14,
    "adherence_warn_pct": 70,
    "adherence_critical_pct": 50,

    # Skipped workouts (gap since last completed session)
    "skip_warn_days": 5,
    "skip_critical_days": 10,

    # Nutrition: calories logged vs target
    "nutrition_min_logged_days": 5,    # need 5+ logged days to evaluate
    "nutrition_window_days": 7,
    "calorie_target_default": 2000,
    "calorie_band_pct": 25,            # ±25% of target is acceptable
}


# ─── Types ──────────────────────────────────────────────────────────────────

class AlertSeverity(str, Enum):
    INFO = "info"
    WARN = "warn"
    CRITICAL = "critical"


class AlertType(str, Enum):
    WEIGHT_STALL = "weight_stall"
    LOW_ADHERENCE = "low_adherence"
    SKIPPED_WORKOUTS = "skipped_workouts"
    NUTRITION_MISS = "nutrition_miss"
    SLEEP_DECLINE = "sleep_decline"      # requires HealthKit integration to fire
    RECOVERY_DECLINE = "recovery_decline" # requires HRV integration to fire


@dataclass
class Alert:
    id: str
    client_id: str
    client_name: str
    type: AlertType
    severity: AlertSeverity
    title: str
    message: str
    metric: Optional[dict] = None
    created_at: str = ""

    def to_dict(self) -> dict:
        d = asdict(self)
        d["type"] = self.type.value
        d["severity"] = self.severity.value
        return d


# ─── Rule implementations ───────────────────────────────────────────────────

def _weight_stall(db: Session, client: User) -> Optional[Alert]:
    """Fires when weight has barely moved over the stall window."""
    cutoff = datetime.utcnow() - timedelta(days=ALERT_RULES["stall_window_days"])
    entries = (
        db.query(ProgressEntry)
        .filter(
            ProgressEntry.user_id == client.id,
            ProgressEntry.weight.isnot(None),
            ProgressEntry.created_at >= cutoff,
        )
        .order_by(ProgressEntry.created_at.asc())
        .all()
    )
    if len(entries) < 2:
        return None
    first, last = entries[0], entries[-1]
    change = abs(float(last.weight) - float(first.weight))
    if change <= ALERT_RULES["stall_max_change_kg"]:
        return Alert(
            id=f"stall:{client.id}",
            client_id=client.id,
            client_name=client.name or client.email,
            type=AlertType.WEIGHT_STALL,
            severity=AlertSeverity.WARN,
            title="Weight plateau",
            message=(
                f"Weight has moved only {change:.1f} kg in "
                f"{ALERT_RULES['stall_window_days']} days. Consider adjusting "
                "calories or training stimulus."
            ),
            metric={"change_kg": round(change, 2)},
            created_at=last.created_at.isoformat() if last.created_at else "",
        )
    return None


def _low_adherence(db: Session, client: User) -> Optional[Alert]:
    """Fires when planned sessions completed % falls below threshold."""
    cutoff = datetime.utcnow() - timedelta(days=ALERT_RULES["adherence_window_days"])

    # Planned sessions = workout plans active in window
    plan_count = (
        db.query(WorkoutPlan)
        .filter(WorkoutPlan.user_id == client.id)
        .count()
    )
    completed = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == client.id,
            WorkoutSession.is_completed == True,
            WorkoutSession.date >= cutoff,
        )
        .count()
    )
    # Heuristic: assume 3-4 sessions/week as the target if a plan exists
    if plan_count == 0:
        return None
    expected = max(1, (ALERT_RULES["adherence_window_days"] // 7) * 3)
    pct = int(round((completed / expected) * 100))

    if pct < ALERT_RULES["adherence_critical_pct"]:
        sev = AlertSeverity.CRITICAL
    elif pct < ALERT_RULES["adherence_warn_pct"]:
        sev = AlertSeverity.WARN
    else:
        return None

    return Alert(
        id=f"adherence:{client.id}",
        client_id=client.id,
        client_name=client.name or client.email,
        type=AlertType.LOW_ADHERENCE,
        severity=sev,
        title="Low workout adherence",
        message=(
            f"Completed {completed} of ~{expected} expected sessions "
            f"({pct}%) in the last {ALERT_RULES['adherence_window_days']} days."
        ),
        metric={"completed": completed, "expected": expected, "pct": pct},
        created_at=datetime.utcnow().isoformat(),
    )


def _skipped_workouts(db: Session, client: User) -> Optional[Alert]:
    """Fires when too long since the last completed session."""
    last_session = (
        db.query(WorkoutSession)
        .filter(
            WorkoutSession.user_id == client.id,
            WorkoutSession.is_completed == True,
        )
        .order_by(WorkoutSession.date.desc())
        .first()
    )
    if not last_session or not last_session.date:
        return None
    gap = (datetime.utcnow() - last_session.date).days

    if gap >= ALERT_RULES["skip_critical_days"]:
        sev = AlertSeverity.CRITICAL
    elif gap >= ALERT_RULES["skip_warn_days"]:
        sev = AlertSeverity.WARN
    else:
        return None

    return Alert(
        id=f"skip:{client.id}",
        client_id=client.id,
        client_name=client.name or client.email,
        type=AlertType.SKIPPED_WORKOUTS,
        severity=sev,
        title="Skipped workouts",
        message=f"{gap} days since the last completed workout. Reach out to re-engage.",
        metric={"days_since_last": gap},
        created_at=last_session.date.isoformat(),
    )


def _nutrition_miss(db: Session, client: User) -> Optional[Alert]:
    """Fires when average daily calories are far outside the band."""
    cutoff = datetime.utcnow() - timedelta(days=ALERT_RULES["nutrition_window_days"])
    entries = (
        db.query(FoodEntry)
        .filter(
            FoodEntry.user_id == client.id,
            FoodEntry.date >= cutoff,
        )
        .all()
    )
    if not entries:
        return None

    # Group by day, sum calories
    by_day: dict[str, float] = {}
    for e in entries:
        if e.date:
            key = e.date.date().isoformat() if hasattr(e.date, "date") else str(e.date)[:10]
            by_day[key] = by_day.get(key, 0) + float(e.calories or 0)

    if len(by_day) < ALERT_RULES["nutrition_min_logged_days"]:
        # Not enough data — could also be a "client isn't logging" signal,
        # but we keep this alert focused on overshoot/undershoot.
        return None

    avg = sum(by_day.values()) / len(by_day)
    target = ALERT_RULES["calorie_target_default"]
    band = target * (ALERT_RULES["calorie_band_pct"] / 100)

    if avg < target - band or avg > target + band:
        direction = "under" if avg < target else "over"
        return Alert(
            id=f"nutrition:{client.id}",
            client_id=client.id,
            client_name=client.name or client.email,
            type=AlertType.NUTRITION_MISS,
            severity=AlertSeverity.WARN,
            title=f"Calories {direction} target",
            message=(
                f"7-day average is {int(avg)} kcal, ~{abs(int(avg - target))} kcal "
                f"{direction} the {target} kcal target."
            ),
            metric={"avg_kcal": int(avg), "target_kcal": target, "direction": direction},
            created_at=datetime.utcnow().isoformat(),
        )
    return None


# ─── Service ────────────────────────────────────────────────────────────────

RULE_FUNCTIONS = [
    _weight_stall,
    _low_adherence,
    _skipped_workouts,
    _nutrition_miss,
    # _sleep_decline and _recovery_decline are wired when HRV/sleep
    # integrations ship (Apple Health, Garmin, Oura, etc.).
]


class AlertService:
    """Aggregates alert evaluations across all clients owned by a coach."""

    def compute_for_coach(self, db: Session, coach: User) -> List[Alert]:
        # Find this coach's clients. Fall back to all clients (role != coach)
        # while the coach<->client assignment workflow is still being seeded.
        clients = db.query(User).filter(User.coach_id == coach.id).all()
        if not clients:
            clients = (
                db.query(User)
                .filter(User.id != coach.id, User.role != "coach")
                .all()
            )

        alerts: List[Alert] = []
        for client in clients:
            for rule in RULE_FUNCTIONS:
                try:
                    alert = rule(db, client)
                    if alert:
                        alerts.append(alert)
                except Exception:
                    # Individual rule failures must not poison the batch
                    continue

        # Sort: critical > warn > info, then most recent
        sev_order = {AlertSeverity.CRITICAL: 0, AlertSeverity.WARN: 1, AlertSeverity.INFO: 2}
        alerts.sort(key=lambda a: (sev_order[a.severity], -1 * len(a.created_at)))
        return alerts

    def summary_for_coach(self, db: Session, coach: User) -> dict:
        """Counts of each severity for the dashboard badge."""
        alerts = self.compute_for_coach(db, coach)
        counts = {"critical": 0, "warn": 0, "info": 0, "total": len(alerts)}
        for a in alerts:
            counts[a.severity.value] += 1
        return counts


alert_service = AlertService()
