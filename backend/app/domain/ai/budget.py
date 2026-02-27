"""AI budget enforcement for legacy backend.

Ported from ino-platform ai_budget.py — adapted for sync config pattern.
Provides pre-flight cost gating and post-flight usage recording via Redis.

Hard global cap: $100/day (rejects requests when exceeded).
"""
from __future__ import annotations

import json
import logging
from datetime import date, datetime, timezone

import redis as redis_lib

from app.core.config import get_redis_url

logger = logging.getLogger(__name__)

_redis: redis_lib.Redis | None = None

# ---------------------------------------------------------------------------
# Tier limits (USD)
# ---------------------------------------------------------------------------
DAILY_LIMITS = {
    "free": 0.05,
    "basic": 0.30,
    "premium": 1.50,
    "enterprise": 5.00,
}

MONTHLY_LIMITS = {
    "free": 0.50,
    "basic": 5.00,
    "premium": 25.00,
    "enterprise": 80.00,
}

GLOBAL_DAILY_CAP = 100.00  # HARD cap — rejects requests when exceeded

# ---------------------------------------------------------------------------
# Estimated cost per task type (USD)
# ---------------------------------------------------------------------------
ESTIMATED_COSTS = {
    "ai_chat": 0.018,
    "generate_workout": 0.036,
    "generate_diet_plan": 0.060,
    "form_analysis": 0.009,
    "motivation": 0.0003,
    "reminder": 0.0002,
    "progress_analysis": 0.020,
    "supplement_evidence": 0.005,
    "food_analysis": 0.005,
}


def _get_redis() -> redis_lib.Redis:
    global _redis
    if _redis is None:
        base_url = get_redis_url().rsplit("/", 1)[0]
        _redis = redis_lib.from_url(f"{base_url}/3", decode_responses=True)
    return _redis


def check_and_increment(
    user_id: str,
    plan_tier: str,
    task_type: str,
) -> tuple[bool, str | None]:
    """Pre-flight budget check. Returns (allowed, rejection_reason)."""
    r = _get_redis()
    today = date.today().isoformat()
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    cost = ESTIMATED_COSTS.get(task_type, 0.01)

    daily_key = f"ai_budget:daily:{user_id}:{today}"
    monthly_key = f"ai_budget:monthly:{user_id}:{month}"
    global_key = f"ai_budget:global:{today}"

    try:
        pipe = r.pipeline()
        pipe.incrbyfloat(daily_key, cost)
        pipe.expire(daily_key, 86400 * 2)
        pipe.incrbyfloat(monthly_key, cost)
        pipe.expire(monthly_key, 86400 * 35)
        pipe.incrbyfloat(global_key, cost)
        pipe.expire(global_key, 86400 * 2)
        results = pipe.execute()

        daily_spent = float(results[0])
        monthly_spent = float(results[2])
        global_spent = float(results[4])

        daily_limit = DAILY_LIMITS.get(plan_tier, 0.05)
        monthly_limit = MONTHLY_LIMITS.get(plan_tier, 0.50)

        if daily_spent > daily_limit:
            logger.warning("ai_budget daily exceeded", extra={
                "user_id": user_id, "spent": daily_spent, "limit": daily_limit,
            })
            return False, "Daily AI budget exceeded. Resets at midnight UTC."

        if monthly_spent > monthly_limit:
            logger.warning("ai_budget monthly exceeded", extra={
                "user_id": user_id, "spent": monthly_spent, "limit": monthly_limit,
            })
            return False, "Monthly AI budget exceeded. Upgrade your plan for higher limits."

        if global_spent > GLOBAL_DAILY_CAP:
            logger.critical("ai_budget GLOBAL CAP exceeded", extra={"spent": global_spent})
            return False, "AI service temporarily at capacity. Please try again later."

        return True, None

    except Exception as exc:
        logger.error("ai_budget check failed", extra={"error": str(exc)})
        return True, None  # fail open


def record_actual_usage(
    user_id: str,
    *,
    task_type: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    cost_usd: float,
    latency_ms: int,
    cached: bool = False,
    status: str = "success",
) -> None:
    """Record actual token usage after API call completes."""
    r = _get_redis()
    today = date.today().isoformat()
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        pipe = r.pipeline()

        # Token counters
        pipe.incrbyfloat(f"ai_tokens:input:{user_id}:{today}", input_tokens)
        pipe.expire(f"ai_tokens:input:{user_id}:{today}", 86400 * 7)
        pipe.incrbyfloat(f"ai_tokens:output:{user_id}:{today}", output_tokens)
        pipe.expire(f"ai_tokens:output:{user_id}:{today}", 86400 * 7)

        # Request count
        pipe.incr(f"ai_requests:{user_id}:{today}")
        pipe.expire(f"ai_requests:{user_id}:{today}", 86400 * 7)

        # Global totals
        pipe.incrbyfloat(f"ai_tokens:global:input:{today}", input_tokens)
        pipe.expire(f"ai_tokens:global:input:{today}", 86400 * 7)
        pipe.incrbyfloat(f"ai_tokens:global:output:{today}", output_tokens)
        pipe.expire(f"ai_tokens:global:output:{today}", 86400 * 7)

        # Audit log (last 1000 per user per month)
        audit_entry = json.dumps({
            "ts": now_iso,
            "task": task_type,
            "model": model,
            "in": input_tokens,
            "out": output_tokens,
            "cost": round(cost_usd, 6),
            "ms": latency_ms,
            "cached": cached,
            "status": status,
        })
        audit_key = f"ai_audit:{user_id}:{month}"
        pipe.lpush(audit_key, audit_entry)
        pipe.ltrim(audit_key, 0, 999)
        pipe.expire(audit_key, 86400 * 35)

        pipe.execute()

    except Exception as exc:
        logger.error("ai_budget record_actual failed", extra={"error": str(exc)})


def get_usage(user_id: str) -> dict:
    """Return current AI usage stats for a user."""
    r = _get_redis()
    today = date.today().isoformat()
    month = datetime.now(timezone.utc).strftime("%Y-%m")

    try:
        daily = float(r.get(f"ai_budget:daily:{user_id}:{today}") or 0)
        monthly = float(r.get(f"ai_budget:monthly:{user_id}:{month}") or 0)
        requests_today = int(r.get(f"ai_requests:{user_id}:{today}") or 0)

        return {
            "daily_spent_usd": round(daily, 4),
            "monthly_spent_usd": round(monthly, 4),
            "requests_today": requests_today,
        }
    except Exception:
        return {"daily_spent_usd": 0, "monthly_spent_usd": 0, "requests_today": 0}


def get_global_usage() -> dict:
    """Return platform-wide AI usage stats."""
    r = _get_redis()
    today = date.today().isoformat()

    try:
        global_spend = float(r.get(f"ai_budget:global:{today}") or 0)
        return {
            "date": today,
            "total_spend_usd": round(global_spend, 4),
            "global_cap_usd": GLOBAL_DAILY_CAP,
            "utilization_pct": round((global_spend / GLOBAL_DAILY_CAP) * 100, 1),
        }
    except Exception:
        return {"date": today, "total_spend_usd": 0, "global_cap_usd": GLOBAL_DAILY_CAP}
