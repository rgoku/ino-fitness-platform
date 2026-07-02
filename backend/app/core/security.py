"""Authentication and security: JWT, password hashing, current user."""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials as HTTPAuthCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import get_jwt_expiration_hours, get_secret_key
from app.infrastructure.database import get_db
from app.infrastructure.database.models import User

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(user_id: str, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(hours=get_jwt_expiration_hours())
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": user_id, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, get_secret_key(), algorithm="HS256")
    return encoded_jwt


def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated user from JWT."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, get_secret_key(), algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


# ─── Role-based access control ──────────────────────────────────────────────

def require_role(*allowed_roles: str):
    """FastAPI dependency factory: require the current user to have one of the
    given roles. Usage:

        @router.get("/clients", dependencies=[Depends(require_role("coach"))])

    Or as a parameter dependency to receive the user back:

        coach: User = Depends(require_role("coach"))
    """
    def _enforce(current_user: User = Depends(get_current_user)) -> User:
        role = getattr(current_user, "role", "client") or "client"
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"This endpoint requires role {allowed_roles!r}; "
                    f"current user is '{role}'."
                ),
            )
        return current_user
    return _enforce


def require_coach(current_user: User = Depends(get_current_user)) -> User:
    """Shortcut: only coaches may proceed."""
    role = getattr(current_user, "role", "client") or "client"
    if role != "coach":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action is restricted to coaches.",
        )
    return current_user


def ensure_own_or_coach(target_user_id: str, current_user: User, db: Session) -> None:
    """Raise 403 unless current_user is the target, or is a coach who owns the
    target client (target.coach_id == coach.id). Unassigned clients
    (coach_id is None) are accessible to any coach during early-platform
    onboarding; assigned clients are scoped strictly to their coach."""
    if current_user.id == target_user_id:
        return
    if getattr(current_user, "role", "client") == "coach":
        target = db.query(User).filter(User.id == target_user_id).first()
        if target is not None and target.coach_id in (None, current_user.id):
            return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="You do not have access to this resource.",
    )
