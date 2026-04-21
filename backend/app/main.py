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
from app.routes import auth, workouts, diet, progress, coaching, ai_coach, users, reminders, subscriptions
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
)

logger = setup_logging()

app = FastAPI(
    title="INÖ Fitness API",
    description="AI-powered fitness application backend",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
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
app.add_middleware(RequestLoggingMiddleware)
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
