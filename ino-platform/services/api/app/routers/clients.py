"""Client management — real DB queries with filtering, pagination, adherence."""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_coach, PLAN_CLIENT_LIMITS
from app.models import Coach, Client, ClientRiskFlag, User, WorkoutAssignment
from services.auth.service import hash_password, generate_invite_token

router = APIRouter()


class ClientCreate(BaseModel):
    email: EmailStr
    name: str
    goals: list[str] = []
    notes: str = ""


class ClientUpdate(BaseModel):
    status: str | None = None
    goals: list[str] | None = None
    notes: str | None = None


class ClientResponse(BaseModel):
    id: str
    name: str
    email: str
    status: str
    streak: int
    goals: list[str]
    notes: str
    adherence: float
    last_active_at: str

    class Config:
        from_attributes = True


@router.get("/")
async def list_clients(
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
    status_filter: str | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = select(Client).where(Client.coach_id == coach.id)
    if status_filter:
        query = query.where(Client.status == status_filter)

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Fetch page
    query = query.order_by(Client.last_active_at.desc()).offset((page - 1) * page_size).limit(page_size)
    results = (await db.execute(query)).scalars().all()

    # Compute adherence per client
    client_data = []
    for c in results:
        adherence = await _compute_adherence(db, c.id)
        user = (await db.execute(select(User).where(User.id == c.user_id))).scalar_one()
        client_data.append({
            "id": str(c.id), "name": user.name, "email": user.email,
            "status": c.status, "streak": c.streak, "goals": c.goals or [],
            "notes": c.notes, "adherence": adherence,
            "last_active_at": c.last_active_at.isoformat() if c.last_active_at else "",
        })

    return {
        "data": client_data,
        "meta": {"page": page, "page_size": page_size, "total": total, "has_more": page * page_size < total},
    }


@router.post("/", status_code=201)
async def create_client(
    body: ClientCreate,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    # Check plan limits
    count = (await db.execute(
        select(func.count()).where(Client.coach_id == coach.id, Client.status != "churned")
    )).scalar() or 0
    limit = PLAN_CLIENT_LIMITS.get(coach.plan_tier, 20)
    if count >= limit:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"Your {coach.plan_tier} plan supports up to {limit} clients. Upgrade to add more.",
        )

    # Check duplicate email
    exists = await db.execute(select(User).where(User.email == body.email))
    if exists.scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "A user with this email already exists")

    # Create user + client
    user = User(
        email=body.email, password_hash=hash_password(generate_invite_token()[:16]),
        name=body.name, role="client",
    )
    db.add(user)
    await db.flush()

    client = Client(
        user_id=user.id, coach_id=coach.id,
        status="invited", goals=body.goals, notes=body.notes,
    )
    db.add(client)
    await db.flush()

    return {"id": str(client.id), "status": "invited", "coach_code": coach.coach_code}


@router.get("/{client_id}")
async def get_client(
    client_id: str,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    client = await _get_client_or_404(db, client_id, coach.id)
    user = (await db.execute(select(User).where(User.id == client.user_id))).scalar_one()
    adherence = await _compute_adherence(db, client.id)

    # Get active risk flags
    flags_q = select(ClientRiskFlag).where(
        ClientRiskFlag.client_id == client.id,
        ClientRiskFlag.resolved_at.is_(None),
    )
    flags = (await db.execute(flags_q)).scalars().all()

    return {
        "id": str(client.id), "name": user.name, "email": user.email,
        "status": client.status, "streak": client.streak, "goals": client.goals or [],
        "notes": client.notes, "adherence": adherence,
        "start_date": client.start_date.isoformat() if client.start_date else "",
        "last_active_at": client.last_active_at.isoformat() if client.last_active_at else "",
        "risk_flags": [
            {"id": str(f.id), "type": f.type, "severity": f.severity, "message": f.message, "triggered_at": f.triggered_at.isoformat()}
            for f in flags
        ],
    }


@router.patch("/{client_id}")
async def update_client(
    client_id: str, body: ClientUpdate,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    client = await _get_client_or_404(db, client_id, coach.id)
    if body.status is not None:
        client.status = body.status
    if body.goals is not None:
        client.goals = body.goals
    if body.notes is not None:
        client.notes = body.notes
    return {"id": str(client.id), "updated": True}


@router.get("/{client_id}/risk-flags")
async def get_risk_flags(
    client_id: str,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await _get_client_or_404(db, client_id, coach.id)
    flags = (await db.execute(
        select(ClientRiskFlag).where(ClientRiskFlag.client_id == client_id, ClientRiskFlag.resolved_at.is_(None))
    )).scalars().all()
    return {"data": [
        {"id": str(f.id), "type": f.type, "severity": f.severity, "message": f.message}
        for f in flags
    ]}


@router.post("/{client_id}/risk-flags/{flag_id}/resolve")
async def resolve_risk_flag(
    client_id: str, flag_id: str,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    await _get_client_or_404(db, client_id, coach.id)
    flag = (await db.execute(select(ClientRiskFlag).where(ClientRiskFlag.id == flag_id))).scalar_one_or_none()
    if not flag:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Flag not found")
    flag.resolved_at = datetime.now(timezone.utc)
    return {"resolved": True}


# ── Helpers ────────────────────────────────────────────────────

async def _get_client_or_404(db: AsyncSession, client_id: str, coach_id) -> Client:
    result = await db.execute(
        select(Client).where(Client.id == client_id, Client.coach_id == coach_id)
    )
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Client not found")
    return client


async def _compute_adherence(db: AsyncSession, client_id) -> float:
    """Adherence = completed assignments / total assignments (last 30 days)."""
    thirty_days_ago = datetime.now(timezone.utc).replace(day=max(1, datetime.now(timezone.utc).day - 30))
    total = (await db.execute(
        select(func.count()).where(WorkoutAssignment.client_id == client_id, WorkoutAssignment.scheduled_date >= thirty_days_ago)
    )).scalar() or 0
    if total == 0:
        return 0.0
    completed = (await db.execute(
        select(func.count()).where(
            WorkoutAssignment.client_id == client_id,
            WorkoutAssignment.scheduled_date >= thirty_days_ago,
            WorkoutAssignment.completed_at.isnot(None),
        )
    )).scalar() or 0
    return round((completed / total) * 100, 1)
