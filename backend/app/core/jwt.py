"""
JWT Token Management — Short-lived access + rotating refresh tokens.

Access token: 15 min (default)
Refresh token: 7 days, rotated on every use
"""
import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt

SECRET_KEY = os.environ.get("JWT_SECRET", "ino-dev-secret-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# In-memory refresh token store (use Redis in prod)
_refresh_tokens: dict[str, dict] = {}


def create_access_token(user_id: str, role: str = "user", expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    payload = {
        "sub": user_id,
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    token = secrets.token_urlsafe(64)
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    _refresh_tokens[token_hash] = {
        "user_id": user_id,
        "created_at": datetime.utcnow(),
        "expires_at": datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return token


def rotate_refresh_token(old_token: str) -> tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Validate old refresh token, revoke it, issue new pair.
    Returns: (new_access_token, new_refresh_token, user_id) or (None, None, None)
    """
    token_hash = hashlib.sha256(old_token.encode()).hexdigest()
    record = _refresh_tokens.pop(token_hash, None)

    if not record:
        return None, None, None

    if datetime.utcnow() > record["expires_at"]:
        return None, None, None

    user_id = record["user_id"]
    new_access = create_access_token(user_id)
    new_refresh = create_refresh_token(user_id)
    return new_access, new_refresh, user_id


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return None
        return payload
    except JWTError:
        return None


def revoke_all_refresh_tokens(user_id: str):
    """Revoke all refresh tokens for a user (logout everywhere)."""
    to_remove = [h for h, r in _refresh_tokens.items() if r["user_id"] == user_id]
    for h in to_remove:
        del _refresh_tokens[h]
