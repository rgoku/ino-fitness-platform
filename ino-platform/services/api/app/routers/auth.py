"""Authentication endpoints — real DB queries."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token, get_current_user
from app.models import User, Coach, Client
from services.auth.service import hash_password, verify_password, generate_coach_code

router = APIRouter()


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str = "coach"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    avatar_url: str | None = None

    class Config:
        from_attributes = True


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(body: SignupRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    # Check duplicate
    exists = await db.execute(select(User).where(User.email == body.email))
    if exists.scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered")

    # Create user
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        name=body.name,
        role=body.role,
    )
    db.add(user)
    await db.flush()   # get user.id

    # Create coach profile if signing up as coach
    if body.role == "coach":
        coach = Coach(
            user_id=user.id,
            coach_code=generate_coach_code(str(user.id)),
        )
        db.add(coach)

    access = create_access_token(str(user.id), user.role)
    refresh = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access, refresh_token=refresh, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account deactivated")

    access = create_access_token(str(user.id), user.role)
    refresh = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access, refresh_token=refresh, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: Annotated[AsyncSession, Depends(get_db)]):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid refresh token")

    # Verify user still exists and is active
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    access = create_access_token(str(user.id), user.role)
    refresh_tok = create_refresh_token(str(user.id))
    return TokenResponse(access_token=access, refresh_token=refresh_tok, expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)


@router.get("/me", response_model=UserResponse)
async def me(
    user_jwt: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    result = await db.execute(select(User).where(User.id == user_jwt["id"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user
