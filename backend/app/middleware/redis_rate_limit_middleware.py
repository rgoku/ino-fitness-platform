"""
Redis-based per-user rate limit middleware.
Applies to AI calls (20/h basic, 100/h premium) and reminders (10/h basic, 50/h premium).
Returns 429 Too Many Requests with Retry-After when limit exceeded.
"""
import asyncio
import logging
from typing import Callable

from fastapi import Request, Response
from jose import JWTError, jwt
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import get_secret_key
from app.infrastructure.database import SessionLocal
from app.infrastructure.database.models import User
from app.infrastructure.redis_rate_limit import check_and_increment

logger = logging.getLogger(__name__)

# (path_prefix, method, resource) - method None means any
_RATE_LIMIT_ROUTES = [
    ("/api/v1/ai", None, "ai"),
    ("/api/v1/diet/plans/generate", "POST", "ai"),
    ("/api/v1/diet/analyze-food", "POST", "ai"),
    ("/api/v1/workouts/plans/generate", "POST", "ai"),
    ("/api/v1/workouts/analyze-form", "POST", "ai"),
    ("/api/v1/reminders", "POST", "reminders"),
]


def _get_resource_for_request(path: str, method: str) -> str | None:
    for prefix, allowed_method, resource in _RATE_LIMIT_ROUTES:
        if not path.startswith(prefix):
            continue
        if allowed_method is not None and method.upper() != allowed_method:
            continue
        return resource
    return None


def _get_user_id_from_token(request: Request) -> str | None:
    auth = request.headers.get("Authorization")
    if not auth or not auth.lower().startswith("bearer "):
        return None
    token = auth[7:].strip()
    if not token:
        return None
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=["HS256"])
        return payload.get("sub")
    except JWTError:
        return None


def _get_user_tier(user_id: str) -> str | None:
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        return user.subscription_tier if user else None
    finally:
        db.close()


class RedisRateLimitMiddleware(BaseHTTPMiddleware):
    """Per-user Redis rate limit: AI and reminders. Returns 429 when exceeded."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        path = request.url.path
        method = request.method
        resource = _get_resource_for_request(path, method)
        if resource is None:
            return await call_next(request)

        user_id = _get_user_id_from_token(request)
        if not user_id:
            # No auth; let the route return 401
            return await call_next(request)

        # Run sync DB query in thread pool to avoid blocking the event loop
        tier_str = await asyncio.get_event_loop().run_in_executor(
            None, _get_user_tier, user_id
        )
        allowed, current, limit, retry_after = check_and_increment(
            user_id, resource, tier_str
        )
        if allowed:
            response = await call_next(request)
            # Optionally add rate limit headers to response
            response.headers["X-RateLimit-Limit"] = str(limit)
            response.headers["X-RateLimit-Remaining"] = str(max(0, limit - current))
            return response

        return JSONResponse(
            status_code=429,
            content={
                "detail": "Rate limit exceeded. Too many requests for this resource.",
                "resource": resource,
                "limit": limit,
                "retry_after_seconds": retry_after,
            },
            headers={"Retry-After": str(retry_after)},
        )
