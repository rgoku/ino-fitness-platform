"""FastAPI application entry point."""
import asyncio
import os
import uuid
from datetime import datetime

# Sentry — must init before FastAPI
_sentry_dsn = os.environ.get("SENTRY_DSN")
if _sentry_dsn:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

    sentry_sdk.init(
        dsn=_sentry_dsn,
        environment=os.environ.get("ENVIRONMENT", "production"),
        traces_sample_rate=0.1,
        profiles_sample_rate=0.1,
        integrations=[FastApiIntegration(), SqlalchemyIntegration()],
    )

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import _rate_limit_exceeded_handler

from app.core.config import get_cors_origins
from app.infrastructure.database import SessionLocal
from app.domain.reminders import reminder_service
from app.routes import (
    auth,
    workouts,
    diet,
    progress,
    coaching,
    ai_coach,
    users,
    reminders,
    subscriptions,
    engine,
    body_analysis,
    workout_builder,
    templates,
    habits,
    programs,
    bookings,
    challenges,
    social,
    grocery,
)
from app.utils.logging import setup_logging
from app.utils.error_handler import (
    global_exception_handler,
    http_exception_handler,
    validation_exception_handler,
)
from app.middleware.rate_limit import limiter, RateLimitExceeded
from app.middleware.redis_rate_limit_middleware import RedisRateLimitMiddleware
from app.middleware.security import (
    SecureHeadersMiddleware,
    IPBlockingMiddleware,
    InputSanitizationMiddleware,
    RequestLoggingMiddleware,
    CSRFMiddleware,
    ErrorSanitizationMiddleware,
)

logger = setup_logging()

app = FastAPI(
    title="INÖ Fitness API",
    description="AI-powered fitness application backend",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_cors_origins = get_cors_origins()
# A wildcard origin is incompatible with credentialed requests (browsers reject
# it). If "*" is configured, disable credentials so the policy stays valid.
_allow_credentials = "*" not in _cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Security middleware stack (order matters: outer → inner)
app.add_middleware(ErrorSanitizationMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CSRFMiddleware)
app.add_middleware(InputSanitizationMiddleware)
app.add_middleware(IPBlockingMiddleware)
app.add_middleware(SecureHeadersMiddleware)

# Redis per-user rate limits
app.add_middleware(RedisRateLimitMiddleware)


app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(workouts.router, prefix="/api/v1/workouts", tags=["Workouts"])
app.include_router(diet.router, prefix="/api/v1/diet", tags=["Diet"])
app.include_router(progress.router, prefix="/api/v1/progress", tags=["Progress"])
app.include_router(coaching.router, prefix="/api/v1/coaching", tags=["Coaching"])
app.include_router(ai_coach.router, prefix="/api/v1/ai", tags=["AI Coach"])
app.include_router(reminders.router, prefix="/api/v1", tags=["Reminders"])
app.include_router(subscriptions.router, prefix="/api/v1/subscriptions", tags=["Subscriptions"])
app.include_router(engine.router, prefix="/api/v1/engine", tags=["Exercise Intelligence Engine"])
app.include_router(body_analysis.router, prefix="/api/v1/body-analysis", tags=["Body Analysis"])
app.include_router(workout_builder.router, prefix="/api/v1/builder", tags=["Workout Builder"])
app.include_router(templates.router, prefix="/api/v1", tags=["Workout Templates"])
app.include_router(habits.router, prefix="/api/v1/habits", tags=["Habits"])
app.include_router(programs.router, prefix="/api/v1/programs", tags=["Programs"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["Bookings"])
app.include_router(challenges.router, prefix="/api/v1/challenges", tags=["Challenges"])
app.include_router(social.router, prefix="/api/v1/social", tags=["Social"])
app.include_router(grocery.router, prefix="/api/v1/grocery", tags=["Grocery"])


@app.on_event("startup")
async def create_tables_if_missing():
    """Ensure all SQLAlchemy-declared tables exist (no-op for tables already present)."""
    from app.database import init_db
    try:
        init_db()
    except Exception as exc:
        logger.warning("init_db failed at startup: %s", exc)


@app.on_event("startup")
async def start_reminder_loop():
    """
    Legacy in-process reminder worker (every 60s).
    Kept until Redis + Celery reminder system is verified in production.
    When Celery worker + beat are running, both may run; idempotency is
    enforced via Redis lock in the Celery task (only one processor at a time).
    To remove: delete this startup block and run only Celery worker + beat.
    """

    async def reminder_worker():
        while True:
            db = None
            try:
                db = SessionLocal()
                reminder_service.process_due(db)
            except Exception as e:
                logger.exception("Reminder worker error: %s", e)
                if db:
                    try:
                        db.rollback()
                    except Exception:
                        pass
            finally:
                if db:
                    try:
                        db.close()
                    except Exception:
                        pass
            await asyncio.sleep(60)

    asyncio.create_task(reminder_worker())


@app.on_event("startup")
async def validate_environment():
    """Validate critical environment variables on startup."""
    is_prod = os.environ.get("ENVIRONMENT") == "production"
    warnings = []
    if is_prod:
        required = ["DATABASE_URL", "STRIPE_SECRET_KEY"]
        for var in required:
            if not os.environ.get(var):
                warnings.append(f"CRITICAL: {var} is not set")
        # Auth signing key: accept the primary name (SECRET_KEY, used by
        # core/security.py) or the legacy alias (JWT_SECRET). One MUST be set.
        if not (os.environ.get("SECRET_KEY") or os.environ.get("JWT_SECRET")):
            warnings.append("CRITICAL: SECRET_KEY (or JWT_SECRET) is not set")
        recommended = ["SENTRY_DSN", "REDIS_URL", "ANTHROPIC_API_KEY"]
        for var in recommended:
            if not os.environ.get(var):
                warnings.append(f"WARNING: {var} is not set (recommended)")
    # The signing key that is actually used to mint/verify tokens.
    secret = os.environ.get("SECRET_KEY") or os.environ.get("JWT_SECRET") or ""
    if secret in ("", "change-me") or secret.startswith("ino-dev"):
        warnings.append(
            "WARNING: JWT signing key is unset or a known default — set a strong SECRET_KEY"
        )
    for w in warnings:
        logger.warning(w)
    # Fail closed: never serve production traffic with a missing critical var.
    criticals = [w for w in warnings if w.startswith("CRITICAL")]
    if is_prod and criticals:
        raise RuntimeError("Startup aborted — " + "; ".join(criticals))


@app.get("/")
async def root():
    return {
        "message": "INÖ Fitness API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
    }
