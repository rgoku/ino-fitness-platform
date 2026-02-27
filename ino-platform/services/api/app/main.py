"""
INÖ Platform — API Server
FastAPI application with modular routers, middleware, and health checks.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import setup_logging
from app.core.health import router as health_router
from app.middleware.request_id import RequestIDMiddleware
from app.routers import auth, coaches, clients, workouts, checkins, videos, messages, automation, billing

# Import models so Base.metadata registers all tables
import app.models  # noqa: F401

# Configure structured logging
setup_logging(debug=settings.DEBUG)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup (dev only). Use Alembic in production."""
    if settings.DEBUG:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="INÖ Platform API",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# ── Middleware (order matters: outermost first) ──────────────

# Request ID tracking (outermost — wraps everything)
app.add_middleware(RequestIDMiddleware)

# Rate limiting (applied after request ID is set)
if settings.ENVIRONMENT != "test":
    from app.middleware.rate_limit import RateLimitMiddleware
    app.add_middleware(RateLimitMiddleware)

# CORS — restrict to actual methods and headers used by the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID", "Accept"],
    expose_headers=["X-Request-ID", "X-RateLimit-Limit", "X-RateLimit-Remaining", "Retry-After"],
    max_age=600,
)

# ── Sentry (error tracking) ─────────────────────────────────

if settings.SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.1,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
    )

# ── Routes ─────────────────────────────────────────────────────

# Health check routes (no auth, no prefix)
app.include_router(health_router)

# API routes
app.include_router(auth.router,       prefix="/auth",       tags=["Auth"])
app.include_router(coaches.router,    prefix="/coaches",    tags=["Coaches"])
app.include_router(clients.router,    prefix="/clients",    tags=["Clients"])
app.include_router(workouts.router,   prefix="/workouts",   tags=["Workouts"])
app.include_router(checkins.router,   prefix="/checkins",   tags=["Check-ins"])
app.include_router(videos.router,     prefix="/videos",     tags=["Videos"])
app.include_router(messages.router,   prefix="/messages",   tags=["Messages"])
app.include_router(automation.router, prefix="/automation", tags=["Automation"])
app.include_router(billing.router,    prefix="/billing",    tags=["Billing"])
