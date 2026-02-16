from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

# Import routers
from app.routes import auth, workouts, diet, progress, coaching, ai_coach, users, reminders
from app.database import SessionLocal
from app.models import Reminder, Message
from datetime import timezone
import asyncio
from app.ai_service import AIService

# Import utilities
from app.utils.logging import setup_logging
from app.utils.error_handler import (
    global_exception_handler,
    http_exception_handler,
    validation_exception_handler
)
from app.middleware.rate_limit import limiter, RateLimitExceeded
from slowapi.errors import _rate_limit_exceeded_handler

# Setup logging
logger = setup_logging()

app = FastAPI(
    title="INÖ Fitness API",
    description="AI-powered fitness application backend",
    version="1.0.0"
)

# Add rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """Add unique request ID to each request"""
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# Add error handlers
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(workouts.router, prefix="/api/v1/workouts", tags=["Workouts"])
app.include_router(diet.router, prefix="/api/v1/diet", tags=["Diet"])
app.include_router(progress.router, prefix="/api/v1/progress", tags=["Progress"])
app.include_router(coaching.router, prefix="/api/v1/coaching", tags=["Coaching"])
app.include_router(ai_coach.router, prefix="/api/v1/ai", tags=["AI Coach"])
app.include_router(reminders.router, prefix="/api/v1", tags=["Reminders"])


@app.on_event("startup")
async def start_reminder_loop():
    """Start background task that checks for due reminders every minute."""
    async def reminder_worker():
        ai = AIService()
        while True:
            try:
                db = SessionLocal()
                now = datetime.utcnow()
                due = db.query(Reminder).filter(Reminder.remind_at <= now, Reminder.sent == False).all()
                for r in due:
                    # create in-app message
                    msg = Message(
                        user_id=r.user_id,
                        coach_id=None,
                        sender_type="ai",
                        content=r.message,
                        message_type="reminder",
                        read=False
                    )
                    db.add(msg)
                    r.sent = True
                db.commit()
                db.close()
            except Exception as e:
                try:
                    db.rollback()
                    db.close()
                except:
                    pass
            await asyncio.sleep(60)

    # launch background task
    asyncio.create_task(reminder_worker())

@app.get("/")
async def root():
    return {
        "message": "INÖ Fitness API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
