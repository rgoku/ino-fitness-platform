"""Shared pytest fixtures: an isolated in-memory DB and a minimal FastAPI app
mounting the auth, programs, and habits routers (avoids importing app.main,
which pulls in MediaPipe/OpenCV). Auth is exercised for real via JWTs.
"""
import os
os.environ.setdefault("SECRET_KEY", "test-secret-key")

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.infrastructure.database.models import Base, User
from app.infrastructure.database import get_db
from app.core.security import create_access_token, pwd_context
from app.middleware.rate_limit import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.routes import auth as auth_routes
from app.routes import programs as programs_routes
from app.routes import habits as habits_routes
from app.routes import bookings as bookings_routes
from app.routes import challenges as challenges_routes
from app.routes import social as social_routes
from app.routes import grocery as grocery_routes

# Disable rate limiting noise during tests
limiter.enabled = False

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def _build_app() -> FastAPI:
    app = FastAPI()
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.include_router(auth_routes.router, prefix="/api/v1/auth")
    app.include_router(programs_routes.router, prefix="/api/v1/programs")
    app.include_router(habits_routes.router, prefix="/api/v1/habits")
    app.include_router(bookings_routes.router, prefix="/api/v1/bookings")
    app.include_router(challenges_routes.router, prefix="/api/v1/challenges")
    app.include_router(social_routes.router, prefix="/api/v1/social")
    app.include_router(grocery_routes.router, prefix="/api/v1/grocery")
    app.dependency_overrides[get_db] = _override_get_db
    return app


@pytest.fixture(autouse=True)
def _fresh_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    return TestClient(_build_app())


@pytest.fixture
def db():
    s = TestingSessionLocal()
    try:
        yield s
    finally:
        s.close()


def make_user(db, *, email="u@example.com", name="Test User", password="pw", role="client"):
    user = User(
        email=email,
        name=name,
        hashed_password=pwd_context.hash(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def auth_headers(user):
    return {"Authorization": f"Bearer {create_access_token(user.id)}"}
