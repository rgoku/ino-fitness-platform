"""Per-user rate limits by tier (Redis-based). Basic vs Premium."""
from typing import Literal

Tier = Literal["basic", "premium"]

# Limits per resource per hour
AI_LIMIT_BASIC = 20
AI_LIMIT_PREMIUM = 100
REMINDERS_LIMIT_BASIC = 10
REMINDERS_LIMIT_PREMIUM = 50  # premium gets higher reminder limit

PREMIUM_TIERS = frozenset({"premium", "premium_ai", "coach_pro"})


def is_premium(subscription_tier: str | None) -> bool:
    """Treat premium_ai, coach_pro, premium as premium; else basic."""
    if not subscription_tier:
        return False
    return subscription_tier.lower() in PREMIUM_TIERS


def get_ai_limit(tier: Tier) -> int:
    return AI_LIMIT_PREMIUM if tier == "premium" else AI_LIMIT_BASIC


def get_reminders_limit(tier: Tier) -> int:
    return REMINDERS_LIMIT_PREMIUM if tier == "premium" else REMINDERS_LIMIT_BASIC


def get_limit_for_resource(resource: str, subscription_tier: str | None) -> int:
    t: Tier = "premium" if is_premium(subscription_tier) else "basic"
    if resource == "ai":
        return get_ai_limit(t)
    if resource == "reminders":
        return get_reminders_limit(t)
    return 0
