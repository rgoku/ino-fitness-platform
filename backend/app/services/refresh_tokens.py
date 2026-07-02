"""Durable refresh-token service (DB-backed, rotating).

Refresh tokens are opaque random strings; only their SHA-256 hash is stored, so
a database leak does not expose usable tokens. Tokens rotate on every use (the
old one is revoked) and survive process restarts / multiple workers, unlike the
previous in-memory store in app/core/jwt.py.
"""
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.infrastructure.database.models import RefreshToken

REFRESH_TOKEN_EXPIRE_DAYS = 7


def _hash(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def issue(db: Session, user_id: str, expires_days: int = REFRESH_TOKEN_EXPIRE_DAYS) -> str:
    """Create and persist a new refresh token; return the raw (un-hashed) value."""
    raw = secrets.token_urlsafe(48)
    rec = RefreshToken(
        id=str(uuid.uuid4()),
        user_id=user_id,
        token_hash=_hash(raw),
        expires_at=datetime.utcnow() + timedelta(days=expires_days),
        revoked=False,
        created_at=datetime.utcnow(),
    )
    db.add(rec)
    db.commit()
    return raw


def _valid_record(db: Session, raw: str) -> Optional[RefreshToken]:
    rec = db.query(RefreshToken).filter(RefreshToken.token_hash == _hash(raw)).first()
    if rec is None or rec.revoked or rec.expires_at < datetime.utcnow():
        return None
    return rec


def rotate(db: Session, raw: str) -> Optional[Tuple[str, str]]:
    """Validate + revoke the presented token and issue a new one.

    Returns (user_id, new_raw_token) or None if the token is invalid/expired.
    """
    rec = _valid_record(db, raw)
    if rec is None:
        return None
    rec.revoked = True
    db.commit()
    new_raw = issue(db, rec.user_id)
    return rec.user_id, new_raw


def revoke(db: Session, raw: str) -> None:
    rec = db.query(RefreshToken).filter(RefreshToken.token_hash == _hash(raw)).first()
    if rec is not None and not rec.revoked:
        rec.revoked = True
        db.commit()


def revoke_all_for_user(db: Session, user_id: str) -> int:
    """Revoke every active refresh token for a user (logout-everywhere)."""
    n = (
        db.query(RefreshToken)
        .filter(RefreshToken.user_id == user_id, RefreshToken.revoked == False)  # noqa: E712
        .update({"revoked": True})
    )
    db.commit()
    return n
