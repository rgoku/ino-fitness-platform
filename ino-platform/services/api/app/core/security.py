"""JWT authentication and authorization dependencies."""
import logging
import uuid
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
import redis as redis_lib
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings

logger = logging.getLogger(__name__)
security = HTTPBearer()

_blacklist_redis: redis_lib.Redis | None = None


def _get_blacklist_redis() -> redis_lib.Redis:
    global _blacklist_redis
    if _blacklist_redis is None:
        _blacklist_redis = redis_lib.from_url(
            f"{settings.REDIS_URL.rsplit('/', 1)[0]}/2",
            decode_responses=True,
        )
    return _blacklist_redis


def create_access_token(user_id: str, role: str) -> str:
    jti = uuid.uuid4().hex
    payload = {
        "sub": user_id,
        "role": role,
        "jti": jti,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    jti = uuid.uuid4().hex
    payload = {
        "sub": user_id,
        "type": "refresh",
        "jti": jti,
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Check blacklist
    jti = payload.get("jti")
    if jti and is_token_blacklisted(jti):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has been revoked")
    return payload


def blacklist_token(jti: str, expires_in_seconds: int) -> None:
    """Add a JTI to the blacklist with TTL matching the token's remaining lifetime."""
    try:
        r = _get_blacklist_redis()
        r.setex(f"blacklist:{jti}", max(expires_in_seconds, 1), "1")
    except Exception:
        logger.warning("Failed to blacklist token", extra={"jti": jti})


def is_token_blacklisted(jti: str) -> bool:
    """Check if a JTI has been revoked."""
    try:
        return _get_blacklist_redis().exists(f"blacklist:{jti}") > 0
    except Exception:
        return False  # fail open — don't lock out users if Redis is down


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> dict:
    """Dependency: extracts and validates the current user from JWT."""
    payload = decode_token(credentials.credentials)
    return {"id": payload["sub"], "role": payload.get("role", "client"), "jti": payload.get("jti", "")}


async def require_coach(user: Annotated[dict, Depends(get_current_user)]) -> dict:
    """Dependency: ensures the current user is a coach or admin."""
    if user["role"] not in ("coach", "admin"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Coach access required")
    return user


async def require_admin(user: Annotated[dict, Depends(get_current_user)]) -> dict:
    if user["role"] != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
