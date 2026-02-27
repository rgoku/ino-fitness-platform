"""Health check endpoints — /health and /ready."""
import logging
import time

from fastapi import APIRouter
from sqlalchemy import text

from app.core.config import settings

router = APIRouter(tags=["health"])
logger = logging.getLogger(__name__)


@router.get("/health")
async def health():
    """Liveness probe — returns 200 if the process is running."""
    return {"status": "ok"}


@router.get("/ready")
async def ready():
    """Readiness probe — checks DB, Redis, and Celery connectivity."""
    checks = {}

    # Database check
    try:
        from app.core.database import engine
        t0 = time.monotonic()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = {"status": "ok", "latency_ms": round((time.monotonic() - t0) * 1000, 1)}
    except Exception as e:
        checks["database"] = {"status": "error", "error": str(e)}

    # Redis check
    try:
        import redis as redis_lib
        t0 = time.monotonic()
        r = redis_lib.from_url(settings.REDIS_URL)
        r.ping()
        checks["redis"] = {"status": "ok", "latency_ms": round((time.monotonic() - t0) * 1000, 1)}
        r.close()
    except Exception as e:
        checks["redis"] = {"status": "error", "error": str(e)}

    # Celery check (verify broker is reachable)
    try:
        from app.worker import celery_app
        t0 = time.monotonic()
        insp = celery_app.control.inspect(timeout=2.0)
        active = insp.active()
        worker_count = len(active) if active else 0
        checks["celery"] = {
            "status": "ok" if worker_count > 0 else "degraded",
            "workers": worker_count,
            "latency_ms": round((time.monotonic() - t0) * 1000, 1),
        }
    except Exception as e:
        checks["celery"] = {"status": "error", "error": str(e)}

    all_ok = all(c.get("status") == "ok" for c in checks.values())

    return {
        "status": "ok" if all_ok else "degraded",
        "checks": checks,
    }
