"""Redis-backed per-user rate limiting: check + increment, return 429 info."""
import logging
from datetime import datetime, timezone

from redis import Redis

from app.core.config import get_redis_url
from app.core.rate_limit_config import get_limit_for_resource

logger = logging.getLogger(__name__)

KEY_PREFIX = "ino:rate_limit"
WINDOW_TTL_SECONDS = 3700  # slightly over 1 hour so the hour window is covered


def _redis() -> Redis:
    return Redis.from_url(get_redis_url(), decode_responses=True)


def _window_key(user_id: str, resource: str) -> str:
    """Key per user, resource, and hour (e.g. ino:rate_limit:user123:ai:2025-01-15T14)."""
    hour_bucket = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H")
    return f"{KEY_PREFIX}:{user_id}:{resource}:{hour_bucket}"


def _seconds_until_next_hour() -> int:
    now = datetime.now(timezone.utc)
    return WINDOW_TTL_SECONDS - (now.minute * 60 + now.second)


def check_and_increment(
    user_id: str,
    resource: str,
    subscription_tier: str | None,
) -> tuple[bool, int, int, int]:
    """
    Increment usage and check against limit.
    Returns (allowed, current_count, limit, retry_after_seconds).
    If not allowed, retry_after_seconds is seconds until the next hour window.
    """
    limit = get_limit_for_resource(resource, subscription_tier)
    if limit <= 0:
        return True, 0, 0, 0

    key = _window_key(user_id, resource)
    redis = _redis()
    try:
        pipe = redis.pipeline()
        pipe.incr(key)
        pipe.ttl(key)
        results = pipe.execute()
        count = results[0]
        ttl = results[1]
        if ttl == -1:
            redis.expire(key, WINDOW_TTL_SECONDS)
            ttl = WINDOW_TTL_SECONDS
        allowed = count <= limit
        retry_after = _seconds_until_next_hour() if not allowed else 0
        if not allowed:
            logger.warning(
                "rate_limit_exceeded",
                extra={
                    "user_id": user_id,
                    "resource": resource,
                    "count": count,
                    "limit": limit,
                    "retry_after": retry_after,
                },
            )
        return allowed, count, limit, retry_after
    except Exception as e:
        logger.exception("redis_rate_limit_error: %s", e)
        # Fail open: allow the request if Redis is down
        return True, 0, limit, 0
