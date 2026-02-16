"""Automation rule management — real DB queries with plan gating."""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_coach, require_plan
from app.models import Coach, AutomationRule, AutomationLog

router = APIRouter()


class TriggerInput(BaseModel):
    type: str
    value: int


class ActionInput(BaseModel):
    type: str
    config: dict = {}


class RuleCreate(BaseModel):
    name: str
    trigger: TriggerInput
    actions: list[ActionInput]
    delay_minutes: int = 0
    enabled: bool = True


@router.get("/rules")
async def list_rules(
    coach: Annotated[Coach, Depends(require_plan("pro", "scale"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    results = (await db.execute(
        select(AutomationRule).where(AutomationRule.coach_id == coach.id)
        .order_by(AutomationRule.created_at.desc())
    )).scalars().all()
    return {"data": [_serialize_rule(r) for r in results]}


@router.post("/rules", status_code=201)
async def create_rule(
    body: RuleCreate,
    coach: Annotated[Coach, Depends(require_plan("pro", "scale"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rule = AutomationRule(
        coach_id=coach.id, name=body.name,
        trigger=body.trigger.model_dump(),
        actions=[a.model_dump() for a in body.actions],
        delay_minutes=body.delay_minutes, enabled=body.enabled,
    )
    db.add(rule)
    await db.flush()
    return {"id": str(rule.id)}


@router.put("/rules/{rule_id}")
async def update_rule(
    rule_id: str, body: RuleCreate,
    coach: Annotated[Coach, Depends(require_plan("pro", "scale"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rule = await _get_rule_or_404(db, rule_id, coach.id)
    rule.name = body.name
    rule.trigger = body.trigger.model_dump()
    rule.actions = [a.model_dump() for a in body.actions]
    rule.delay_minutes = body.delay_minutes
    rule.enabled = body.enabled
    return {"id": str(rule.id), "updated": True}


@router.delete("/rules/{rule_id}", status_code=204)
async def delete_rule(
    rule_id: str,
    coach: Annotated[Coach, Depends(require_plan("pro", "scale"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rule = await _get_rule_or_404(db, rule_id, coach.id)
    await db.delete(rule)
    return None


@router.post("/rules/{rule_id}/toggle")
async def toggle_rule(
    rule_id: str,
    coach: Annotated[Coach, Depends(require_plan("pro", "scale"))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rule = await _get_rule_or_404(db, rule_id, coach.id)
    rule.enabled = not rule.enabled
    return {"id": str(rule.id), "enabled": rule.enabled}


@router.get("/rules/{rule_id}/log")
async def get_rule_log(
    rule_id: str,
    coach: Annotated[Coach, Depends(require_plan("pro", "scale"))],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
):
    await _get_rule_or_404(db, rule_id, coach.id)
    logs = (await db.execute(
        select(AutomationLog).where(AutomationLog.rule_id == rule_id)
        .order_by(AutomationLog.executed_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )).scalars().all()
    return {"data": [
        {"id": str(l.id), "client_id": str(l.client_id) if l.client_id else None,
         "actions_taken": l.actions_taken, "status": l.status,
         "error": l.error, "executed_at": l.executed_at.isoformat()}
        for l in logs
    ]}


# ── Helpers ────────────────────────────────────────────────────

async def _get_rule_or_404(db, rule_id: str, coach_id) -> AutomationRule:
    result = await db.execute(
        select(AutomationRule).where(AutomationRule.id == rule_id, AutomationRule.coach_id == coach_id)
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rule not found")
    return rule


def _serialize_rule(r: AutomationRule) -> dict:
    return {
        "id": str(r.id), "name": r.name,
        "trigger": r.trigger, "actions": r.actions,
        "delay_minutes": r.delay_minutes, "enabled": r.enabled,
        "trigger_count": r.trigger_count,
        "last_triggered_at": r.last_triggered_at.isoformat() if r.last_triggered_at else None,
        "created_at": r.created_at.isoformat(),
    }
