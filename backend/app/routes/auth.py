from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.models import User
from app.database import get_db
from app.core.security import pwd_context, create_access_token, get_current_user
from app.middleware.rate_limit import limiter
from app.services import refresh_tokens

router = APIRouter()


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


class TokenUser(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    role: str = "client"
    avatar_url: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[TokenUser] = None


def _token_user(u: User) -> TokenUser:
    return TokenUser(
        id=u.id,
        email=u.email,
        name=u.name,
        role=getattr(u, "role", "client") or "client",
        avatar_url=getattr(u, "profile_picture_url", None),
    )


@router.post("/register", response_model=dict)
@limiter.limit("10/minute")
async def register(request: Request, user_data: UserRegister, db: Session = Depends(get_db)):
    """Register new user - Rate limited to 10/minute"""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = pwd_context.hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.name,
    )
    db.add(new_user)
    db.commit()

    return {
        "id": new_user.id,
        "email": new_user.email,
        "name": new_user.name,
        "created_at": new_user.created_at,
    }


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user - returns access + rotating refresh token. Rate limited 10/min."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not pwd_context.verify(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(user.id)
    refresh = refresh_tokens.issue(db, user.id)
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh,
        token_type="bearer",
        user=_token_user(user),
    )


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("30/minute")
async def refresh_token(request: Request, body: RefreshRequest, db: Session = Depends(get_db)):
    """Exchange a valid refresh token for a new access + refresh pair (rotation)."""
    result = refresh_tokens.rotate(db, body.refresh_token)
    if result is None:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    user_id, new_refresh = result
    access_token = create_access_token(user_id)
    user = db.query(User).filter(User.id == user_id).first()
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh,
        token_type="bearer",
        user=_token_user(user) if user else None,
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": getattr(current_user, "role", "client"),
        "age": getattr(current_user, "age", None),
        "gender": getattr(current_user, "gender", None),
        "weight": getattr(current_user, "weight", None),
        "height": getattr(current_user, "height", None),
        "fitness_goal": getattr(current_user, "fitness_goal", None),
        "experience_level": getattr(current_user, "experience_level", None),
        "subscription_tier": getattr(current_user, "subscription_tier", None),
        "has_onboarded": getattr(current_user, "has_onboarded", False),
        "profile_picture_url": getattr(current_user, "profile_picture_url", None),
    }


@router.post("/logout")
async def logout(body: Optional[LogoutRequest] = None, db: Session = Depends(get_db)):
    """Logout: revoke the presented refresh token so it can no longer be rotated."""
    if body and body.refresh_token:
        refresh_tokens.revoke(db, body.refresh_token)
    return {"status": "logged_out"}


@router.post("/apple-signin")
async def apple_signin():
    """Sign in with Apple.

    Real Apple identity-token verification (validate the JWT against Apple's
    JWKS, check audience == APPLE_CLIENT_ID and issuer) is not configured on
    this server yet. Returning 501 instead of a fake token so clients fail
    clearly rather than receiving an unusable credential.
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Apple Sign-In is not configured on this server yet.",
    )
