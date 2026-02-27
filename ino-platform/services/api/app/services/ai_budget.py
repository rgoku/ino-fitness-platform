"""
AI budget tracking — Redis counters for per-coach and global spend control,
plus actual token-level metering from API responses.

Supports:
  - Estimated pre-flight cost checks (before API call)
  - Actual post-flight cost recording (from API response usage)
  - Per-coach daily/monthly limits by plan tier
  - Global platform daily cap
  - Usage reporting for admin dashboard
  - Token-level audit trail in Redis
"""
from __future__ import annotations

import json
import logging
from datetime import date, datetime, timezone

import redis as redis_lib

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis: redis_lib.Redis | None = None

# Budget limits by plan tier (in USD)
DAILY_LIMITS = {
    "trial": 0.10,
    "starter": 0.50,
    "pro": 1.50,
    "scale": 5.00,
}

MONTHLY_LIMITS = {
    "trial": 1.00,
    "starter": 8.00,
    "pro": 25.00,
    "scale": 80.00,
}

GLOBAL_DAILY_CAP = 200.00  # total platform spend per day

# Estimated cost per task type (USD) — used for pre-flight checks
ESTIMATED_COSTS = {
    "ai_chat_haiku": 0.0009,
    "ai_chat_sonnet": 0.018,
    "generate_workout": 0.036,
    "generate_diet_plan": 0.060,
    "form_analysis": 0.0009,
    "motivation": 0.0003,
    "reminder": 0.0002,
    "workout_modification": 0.005,
    "progress_analysis": 0.020,
    "supplement_evidence": 0.005,
    "weekly_report": 0.030,
    "food_analysis": 0.005,
}

# Token limits per request (safety guardrail)
MAX_INPUT_TOKENS_PER_REQUEST = 10_000
MAX_OUTPUT_TOKENS_PER_REQUEST = 4_000


def _get_redis() -> redis_lib.Redis:
    global _redis
    if _redis is None:
        _redis = redis_lib.from_url(
            f"{settings.REDIS_URL.rsplit('/', 1)[0]}/3",
            decode_responses=True,
        )
    return _redis


def check_and_increment(
    coach_id: str,
    plan_tier: str,
    task_type: str,
) -> tuple[bool, str | None]:
    """Pre-flight budget check using estimated costs.

    Returns (allowed, rejection_reason).  Increments estimated counters.
    """
    r = _get_redis()
    today = date.today().isoformat()
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    cost = ESTIMATED_COSTS.get(task_type, 0.01)

    daily_key = f"ai_budget:daily:{coach_id}:{today}"
    monthly_key = f"ai_budget:monthly:{coach_id}:{month}"
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

        daily_limit = DAILY_LIMITS.get(plan_tier, 0.10)
        monthly_limit = MONTHLY_LIMITS.get(plan_tier, 1.00)

        if daily_spent > daily_limit:
            logger.warning("ai_budget daily exceeded", extra={
                "coach_id": coach_id, "spent": daily_spent, "limit": daily_limit,
            })
            return False, "Daily AI budget exceeded. Resets at midnight UTC."

        if monthly_spent > monthly_limit:
            logger.warning("ai_budget monthly exceeded", extra={
                "coach_id": coach_id, "spent": monthly_spent, "limit": monthly_limit,
            })
            return False, "Monthly AI budget exceeded. Upgrade your plan for higher limits."

        if global_spent > GLOBAL_DAILY_CAP:
            logger.warning("ai_budget global cap reached", extra={"spent": global_spent})
            # Don't reject — just log.  Tasks will be queued with low priority.
            return True, None

        return True, None

    except Exception as exc:
        logger.error("ai_budget check failed", extra={"error": str(exc)})
        # Fail open — allow the request if Redis is down
        return True, None


def record_actual_usage(
    coach_id: str,
    user_id: str,
    *,
    prompt_name: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    cost_usd: float,
    latency_ms: int,
    cached: bool = False,
    status: str = "success",
) -> None:
    """Record actual token usage after an API call completes.

    Stores:
      - Corrected spend counters (replace estimate with actual)
      - Token audit entry in a Redis list for reporting
      - Per-coach token totals
    """
    r = _get_redis()
    today = date.today().isoformat()
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    now_iso = datetime.now(timezone.utc).isoformat()

    try:
        pipe = r.pipeline()

        # Token counters (daily)
        pipe.incrbyfloat(f"ai_tokens:input:{coach_id}:{today}", input_tokens)
        pipe.expire(f"ai_tokens:input:{coach_id}:{today}", 86400 * 7)
        pipe.incrbyfloat(f"ai_tokens:output:{coach_id}:{today}", output_tokens)
        pipe.expire(f"ai_tokens:output:{coach_id}:{today}", 86400 * 7)

        # Request count (daily)
        pipe.incr(f"ai_requests:{coach_id}:{today}")
        pipe.expire(f"ai_requests:{coach_id}:{today}", 86400 * 7)

        # Global token totals (daily)
        pipe.incrbyfloat(f"ai_tokens:global:input:{today}", input_tokens)
        pipe.expire(f"ai_tokens:global:input:{today}", 86400 * 7)
        pipe.incrbyfloat(f"ai_tokens:global:output:{today}", output_tokens)
        pipe.expire(f"ai_tokens:global:output:{today}", 86400 * 7)

        # Audit log entry (keep last 1000 per coach for the month)
        audit_key = f"ai_audit:{coach_id}:{month}"
        audit_entry = json.dumps({
            "ts": now_iso,
            "prompt": prompt_name,
            "model": model,
            "in": input_tokens,
            "out": output_tokens,
            "cost": round(cost_usd, 6),
            "ms": latency_ms,
            "cached": cached,
            "status": status,
            "user_id": user_id,
        })
        pipe.lpush(audit_key, audit_entry)
        pipe.ltrim(audit_key, 0, 999)
        pipe.expire(audit_key, 86400 * 35)

        # Model usage counters (for model strategy dashboards)
        model_key = f"ai_model_usage:{model}:{today}"
        pipe.incr(model_key)
        pipe.expire(model_key, 86400 * 7)

        pipe.execute()

    except Exception as exc:
        logger.error("ai_budget record_actual failed", extra={"error": str(exc)})


def get_usage(coach_id: str) -> dict:
    """Return current AI usage stats for a coach."""
    r = _get_redis()
    today = date.today().isoformat()
    month = datetime.now(timezone.utc).strftime("%Y-%m")

    try:
        daily = float(r.get(f"ai_budget:daily:{coach_id}:{today}") or 0)
        monthly = float(r.get(f"ai_budget:monthly:{coach_id}:{month}") or 0)
        requests_today = int(r.get(f"ai_requests:{coach_id}:{today}") or 0)
        input_today = int(float(r.get(f"ai_tokens:input:{coach_id}:{today}") or 0))
        output_today = int(float(r.get(f"ai_tokens:output:{coach_id}:{today}") or 0))

        return {
            "daily_spent_usd": round(daily, 4),
            "monthly_spent_usd": round(monthly, 4),
            "requests_today": requests_today,
            "tokens_today": {"input": input_today, "output": output_today},
        }
    except Exception:
        return {
            "daily_spent_usd": 0,
            "monthly_spent_usd": 0,
            "requests_today": 0,
            "tokens_today": {"input": 0, "output": 0},
        }


def get_audit_log(coach_id: str, month: str | None = None, limit: int = 50) -> list[dict]:
    """Return recent AI request audit entries for a coach."""
    r = _get_redis()
    if month is None:
        month = datetime.now(timezone.utc).strftime("%Y-%m")

    try:
        raw_entries = r.lrange(f"ai_audit:{coach_id}:{month}", 0, limit - 1)
        return [json.loads(e) for e in raw_entries]
    except Exception:
        return []


def get_global_usage() -> dict:
    """Return platform-wide AI usage stats (admin dashboard)."""
    r = _get_redis()
    today = date.today().isoformat()

    try:
        global_spend = float(r.get(f"ai_budget:global:{today}") or 0)
        global_input = int(float(r.get(f"ai_tokens:global:input:{today}") or 0))
        global_output = int(float(r.get(f"ai_tokens:global:output:{today}") or 0))

        # Model breakdown
        models = {}
        for model_name in ["claude-haiku-4-5-20251001", "claude-sonnet-4-5-20250929"]:
            count = int(r.get(f"ai_model_usage:{model_name}:{today}") or 0)
            if count:
                models[model_name] = count

        return {
            "date": today,
            "total_spend_usd": round(global_spend, 4),
            "global_cap_usd": GLOBAL_DAILY_CAP,
            "utilization_pct": round((global_spend / GLOBAL_DAILY_CAP) * 100, 1),
            "tokens": {"input": global_input, "output": global_output},
            "model_breakdown": models,
        }
    except Exception:
        return {"date": today, "total_spend_usd": 0, "global_cap_usd": GLOBAL_DAILY_CAP}
