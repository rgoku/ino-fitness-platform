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

    # --- Query 1: all client counts in a single round-trip ----------------
    client_row = (await db.execute(
        select(
            func.count().filter(Client.status.in_(["active", "at_risk"])).label("active"),
            func.count().filter(Client.status == "at_risk").label("at_risk"),
            func.count().filter(Client.start_date <= thirty_days).label("total_30d"),
            func.count().filter(
                Client.start_date <= thirty_days, Client.status != "churned"
            ).label("active_30d"),
        ).where(Client.coach_id == coach.id)
    )).one()
    active = client_row.active
    at_risk = client_row.at_risk
    total_30d = client_row.total_30d
    active_30d = client_row.active_30d
    retention = round((active_30d / total_30d * 100) if total_30d > 0 else 100, 1)

    # --- Query 2: adherence + pending videos in a single round-trip -------
    adherence_row = (await db.execute(
        select(
            func.count().label("total_assigned"),
            func.count().filter(
                WorkoutAssignment.completed_at.isnot(None)
            ).label("total_completed"),
        ).select_from(WorkoutAssignment).join(Client).where(
            Client.coach_id == coach.id,
            WorkoutAssignment.scheduled_date >= thirty_days,
        )
    )).one()
    total_assigned = adherence_row.total_assigned
    total_completed = adherence_row.total_completed
    avg_adherence = round((total_completed / total_assigned * 100) if total_assigned > 0 else 0, 1)

    pending_videos = (await db.execute(
        select(func.count()).where(VideoReview.coach_id == coach.id, VideoReview.status == "pending")
    )).scalar() or 0

    return {
        "active_clients": active,
        "avg_adherence": avg_adherence,
        "retention_rate": retention,
        "at_risk_count": at_risk,
        "pending_video_reviews": pending_videos,
        "monthly_revenue": 0,
        "revenue_change": 0,
    }
