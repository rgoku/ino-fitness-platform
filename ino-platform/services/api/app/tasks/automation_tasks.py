"""Automation rule evaluation + client risk flag computation."""
import logging

from app.worker import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.automation_tasks.evaluate_automation_rules")
def evaluate_automation_rules():
    """Check all enabled automation rules against current client data."""
    logger.info("evaluate_automation_rules started")
    # Placeholder: query enabled AutomationRules, evaluate triggers,
    # fire actions (send notification, flag client, etc.)
    evaluated = 0
    triggered = 0
    logger.info("evaluate_automation_rules completed", extra={
        "evaluated": evaluated, "triggered": triggered,
    })
    return {"evaluated": evaluated, "triggered": triggered}


@celery_app.task(name="app.tasks.automation_tasks.compute_client_risk_flags")
def compute_client_risk_flags():
    """Detect at-risk clients based on activity patterns."""
    logger.info("compute_client_risk_flags started")
    # Placeholder: check for missed sessions (>3 days), low adherence (<50%),
    # no check-in (>7 days), low readiness scores. Create/update ClientRiskFlag records.
    flagged = 0
    resolved = 0
    logger.info("compute_client_risk_flags completed", extra={
        "flagged": flagged, "resolved": resolved,
    })
    return {"flagged": flagged, "resolved": resolved}
