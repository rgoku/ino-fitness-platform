"""AI Alert System — surfaces client risk signals to coaches.

Per spec, the alert engine fires when:
  • Weight stalls (no change for N days against trend)
  • Compliance drops (workout/diet adherence falls below threshold)
  • Sleep quality declines
  • Recovery declines
  • Workouts are skipped (scheduled but not completed)
  • Nutrition targets are missed (calorie/protein out of band)

Each alert has a severity (info / warn / critical) and is attached to
exactly one (coach, client) pair so the dashboard can group + filter.
"""
from .service import AlertService, alert_service, Alert, AlertSeverity, AlertType

__all__ = ["AlertService", "alert_service", "Alert", "AlertSeverity", "AlertType"]
