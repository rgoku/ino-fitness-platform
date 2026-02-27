"""Rate limiting middleware — Redis sliding window per user per endpoint category."""
import logging
import time
import uuid

import redis as redis_lib
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.config import settings

logger = logging.getLogger(__name__)

# Rate limit tiers: {plan_tier: {category: max_requests_per_window}}
RATE_LIMITS = {
    "trial": {"auth": 10, "api": 100, "ai_chat": 5, "ai_gen": 2, "video": 2},
    "starter": {"auth": 10, "api": 500, "ai_chat": 30, "ai_gen": 10, "video": 10},
    "pro": {"auth": 10, "api": 1000, "ai_chat": 100, "ai_gen": 30, "video": 30},
    "scale": {"auth": 10, "api": 2000, "ai_chat": 300, "ai_gen": 100, "video": 100},
}

WINDOW_SECONDS = {
    "auth": 60,       # per minute
    "api": 3600,      # per hour
    "ai_chat": 3600,
    "ai_gen": 3600,
    "video": 3600,
}


def _categorize_path(path: str, method: str) -> str:
    """Map request path to a rate limit category."""
    if "/auth/" in path:
        return "auth"
    if "/ai/chat" in path:
        return "ai_chat"
    if any(x in path for x in ["/ai/generate", "/ai/workout", "/ai/diet"]):
        return "ai_gen"
    if "/video" in path and method == "POST":
        return "video"
    return "api"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Redis-backed sliding window rate limiter."""

    def __init__(self, app):
        super().__init__(app)
        try:
            redis_url = f"{settings.REDIS_URL.rsplit('/', 1)[0]}/2"
            self._redis = redis_lib.from_url(redis_url, decode_responses=True)
            self._redis.ping()
            self._enabled = True
        except Exception:
            logger.warning("Rate limit Redis unavailable — rate limiting disabled")
            self._enabled = False

    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip rate limiting for health checks and webhooks
        if request.url.path in ("/health", "/ready") or "webhook" in request.url.path:
            return await call_next(request)

        if not self._enabled:
            return await call_next(request)

        # Identify user (from JWT sub claim or IP fallback)
        user_id = request.state.user_id if hasattr(request.state, "user_id") else ""
        identifier = user_id or (request.client.host if request.client else "unknown")
        plan_tier = getattr(request.state, "plan_tier", "trial") if hasattr(request.state, "plan_tier") else "trial"

        category = _categorize_path(request.url.path, request.method)
        window = WINDOW_SECONDS.get(category, 3600)
        limit = RATE_LIMITS.get(plan_tier, RATE_LIMITS["trial"]).get(category, 100)

        key = f"rate:{identifier}:{category}"
        now = time.time()

        try:
            pipe = self._redis.pipeline()
            pipe.zremrangebyscore(key, 0, now - window)
            pipe.zadd(key, {str(uuid.uuid4()): now})
            pipe.zcard(key)
            pipe.expire(key, window + 60)
            results = pipe.execute()
            count = results[2]
        except Exception:
            # Fail open on Redis errors
            return await call_next(request)

        if count > limit:
            logger.warning("rate_limit_exceeded", extra={
                "identifier": identifier, "category": category,
                "count": count, "limit": limit,
            })
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Rate limit exceeded",
                    "category": category,
                    "limit": limit,
                    "window_seconds": window,
                    "retry_after": window,
                },
                headers={
                    "Retry-After": str(window),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, limit - count))
        return response
