"""Check-in endpoints — real DB queries with readiness computation."""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_coach, get_client_user
from app.models import Coach, Client, CheckIn

router = APIRouter()


class ReadinessInput(BaseModel):
    sleep_quality: int
    energy_level: int
    stress_level: int
    soreness: int
    notes: str = ""


class WeeklyInput(BaseModel):
    weight: float | None = None
    body_fat: float | None = None
    measurements: dict[str, float] = {}
    wins: str = ""
    struggles: str = ""
    questions: str = ""


@router.post("/readiness", status_code=201)
async def submit_readiness(
    body: ReadinessInput,
    client: Annotated[Client, Depends(get_client_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    score = round(
        ((body.sleep_quality - 1) / 4 * 0.3 +
         (body.energy_level - 1) / 4 * 0.3 +
         (5 - body.stress_level) / 4 * 0.2 +
         (5 - body.soreness) / 4 * 0.2) * 100
    )
    checkin = CheckIn(
        client_id=client.id, coach_id=client.coach_id, type="daily_readiness",
        data={
            "sleep_quality": body.sleep_quality, "energy_level": body.energy_level,
            "stress_level": body.stress_level, "soreness": body.soreness,
            "readiness_score": score, "notes": body.notes,
        },
    )
    db.add(checkin)
    await db.flush()

    # Update client last active
    client.last_active_at = datetime.now(timezone.utc)

    return {"id": str(checkin.id), "readiness_score": score}


@router.post("/weekly", status_code=201)
async def submit_weekly(
    body: WeeklyInput,
    client: Annotated[Client, Depends(get_client_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    checkin = CheckIn(
        client_id=client.id, coach_id=client.coach_id, type="weekly_checkin",
        data=body.model_dump(),
    )
    db.add(checkin)
    await db.flush()
    client.last_active_at = datetime.now(timezone.utc)
    return {"id": str(checkin.id)}


@router.get("/client/{client_id}")
async def get_client_checkins(
    client_id: str,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
    checkin_type: str | None = Query(None, alias="type"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
):
    query = select(CheckIn).where(CheckIn.client_id == client_id, CheckIn.coach_id == coach.id)
    if checkin_type:
        query = query.where(CheckIn.type == checkin_type)
    query = query.order_by(CheckIn.submitted_at.desc()).offset((page - 1) * page_size).limit(page_size)
    results = (await db.execute(query)).scalars().all()
    return {"data": [
        {"id": str(c.id), "type": c.type, "data": c.data,
         "submitted_at": c.submitted_at.isoformat(),
         "reviewed_at": c.reviewed_at.isoformat() if c.reviewed_at else None,
         "coach_notes": c.coach_notes}
        for c in results
    ]}


@router.post("/{checkin_id}/review")
async def review_checkin(
    checkin_id: str,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
    notes: str = "",
):
    result = await db.execute(select(CheckIn).where(CheckIn.id == checkin_id, CheckIn.coach_id == coach.id))
    checkin = result.scalar_one_or_none()
    if not checkin:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Check-in not found")
    checkin.reviewed_at = datetime.now(timezone.utc)
    checkin.coach_notes = notes
    return {"reviewed": True}
