from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from app.models import User
from app.database import get_db
from app.core.security import pwd_context, create_access_token, get_current_user
from app.middleware.rate_limit import limiter

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/register", response_model=dict)
@limiter.limit("10/minute")
async def register(
    request: Request,
    user_data: UserRegister,
    db: Session = Depends(get_db)
):
    """Register new user - Rate limited to 10/minute"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = pwd_context.hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        name=user_data.name
    )
    db.add(new_user)
    db.commit()
    
    return {
        "id": new_user.id,
        "email": new_user.email,
        "name": new_user.name,
        "created_at": new_user.created_at
    }

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(
    request: Request,
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user - Rate limited to 10/minute"""
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not pwd_context.verify(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    access_token = create_access_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: User = Depends(get_current_user),
):
    """Refresh JWT token"""
    access_token = create_access_token(current_user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
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
async def logout():
    """Logout user"""
    return {"status": "logged_out"}

@router.post("/apple-signin")
async def apple_signin(
    token: str,
    db: Session = Depends(get_db)
):
    """Sign in with Apple"""
    # Verify Apple token and get user info
    # This would call Apple's API
    return {
        "access_token": "token",
        "token_type": "bearer"
    }

