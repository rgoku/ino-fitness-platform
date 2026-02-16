"""Shared FastAPI dependencies for resolving user → coach/client and plan gating."""
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import Coach, Client

PLAN_CLIENT_LIMITS = {"starter": 20, "pro": 50, "scale": 999}


async def get_coach(
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Coach:
    """Resolve JWT user to Coach record. 403 if not a coach."""
    if user["role"] not in ("coach", "admin"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Coach access required")
    result = await db.execute(select(Coach).where(Coach.user_id == user["id"]))
    coach = result.scalar_one_or_none()
    if not coach:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Coach profile not found")
    return coach


async def get_client_user(
    user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> Client:
    """Resolve JWT user to Client record."""
    result = await db.execute(select(Client).where(Client.user_id == user["id"]))
    client = result.scalar_one_or_none()
    if not client:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Client profile not found")
    return client


def require_plan(*tiers: str):
    """Dependency factory: gates endpoint to specific plan tiers."""
    async def _check(coach: Annotated[Coach, Depends(get_coach)]) -> Coach:
        if coach.plan_tier not in tiers:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                f"This feature requires {' or '.join(tiers)} plan. Current: {coach.plan_tier}",
            )
        return coach
    return _check
