"""
INÖ Platform — API Server
FastAPI application with modular routers.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, coaches, clients, workouts, checkins, videos, messages, automation, billing

# Import models so Base.metadata registers all tables
import app.models  # noqa: F401


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
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ─────────────────────────────────────────────────────
app.include_router(auth.router,       prefix="/auth",       tags=["Auth"])
app.include_router(coaches.router,    prefix="/coaches",    tags=["Coaches"])
app.include_router(clients.router,    prefix="/clients",    tags=["Clients"])
app.include_router(workouts.router,   prefix="/workouts",   tags=["Workouts"])
app.include_router(checkins.router,   prefix="/checkins",   tags=["Check-ins"])
app.include_router(videos.router,     prefix="/videos",     tags=["Videos"])
app.include_router(messages.router,   prefix="/messages",   tags=["Messages"])
app.include_router(automation.router, prefix="/automation", tags=["Automation"])
app.include_router(billing.router,    prefix="/billing",    tags=["Billing"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
