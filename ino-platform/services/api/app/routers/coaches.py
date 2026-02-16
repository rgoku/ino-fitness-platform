"""Coach profile and dashboard — real DB queries."""
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_coach
from app.models import Coach, Client, VideoReview, WorkoutAssignment

router = APIRouter()


class CoachUpdate(BaseModel):
    business_name: str | None = None
    brand_color: str | None = None


@router.get("/me")
async def get_coach_profile(coach: Annotated[Coach, Depends(get_coach)]):
    return {
        "id": str(coach.id), "business_name": coach.business_name,
        "plan_tier": coach.plan_tier, "coach_code": coach.coach_code,
        "client_limit": coach.client_limit, "brand_color": coach.brand_color,
    }


@router.patch("/me")
async def update_coach(
    body: CoachUpdate,
    coach: Annotated[Coach, Depends(get_coach)],
):
    if body.business_name is not None:
        coach.business_name = body.business_name
    if body.brand_color is not None:
        coach.brand_color = body.brand_color
    return {"updated": True}


@router.get("/me/stats")
async def get_coach_stats(
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    now = datetime.now(timezone.utc)
    thirty_days = now - timedelta(days=30)
    sixty_days = now - timedelta(days=60)

    # Active clients
    active = (await db.execute(
        select(func.count()).where(Client.coach_id == coach.id, Client.status.in_(["active", "at_risk"]))
    )).scalar() or 0

    # At-risk count
    at_risk = (await db.execute(
        select(func.count()).where(Client.coach_id == coach.id, Client.status == "at_risk")
    )).scalar() or 0

    # Avg adherence (last 30 days)
    total_assigned = (await db.execute(
        select(func.count()).select_from(WorkoutAssignment).join(Client).where(
            Client.coach_id == coach.id, WorkoutAssignment.scheduled_date >= thirty_days,
        )
    )).scalar() or 0
    total_completed = (await db.execute(
        select(func.count()).select_from(WorkoutAssignment).join(Client).where(
            Client.coach_id == coach.id, WorkoutAssignment.scheduled_date >= thirty_days,
            WorkoutAssignment.completed_at.isnot(None),
        )
    )).scalar() or 0
    avg_adherence = round((total_completed / total_assigned * 100) if total_assigned > 0 else 0, 1)

    # Retention: clients active now vs 30 days ago
    active_30d = (await db.execute(
        select(func.count()).where(Client.coach_id == coach.id, Client.start_date <= thirty_days, Client.status != "churned")
    )).scalar() or 0
    total_30d = (await db.execute(
        select(func.count()).where(Client.coach_id == coach.id, Client.start_date <= thirty_days)
    )).scalar() or 0
    retention = round((active_30d / total_30d * 100) if total_30d > 0 else 100, 1)

    # Pending video reviews
    pending_videos = (await db.execute(
        select(func.count()).where(VideoReview.coach_id == coach.id, VideoReview.status == "pending")
    )).scalar() or 0

    return {
        "active_clients": active,
        "avg_adherence": avg_adherence,
        "retention_rate": retention,
        "at_risk_count": at_risk,
        "pending_video_reviews": pending_videos,
        "monthly_revenue": 0,       # populated from Stripe via billing service
        "revenue_change": 0,
    }
