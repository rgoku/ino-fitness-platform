"""Billing endpoints — real DB queries + Stripe integration points."""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_coach, PLAN_CLIENT_LIMITS
from app.models import Coach, Subscription

router = APIRouter()


class CreateCheckoutRequest(BaseModel):
    plan_tier: str
    billing_cycle: str = "monthly"


class UpdatePlanRequest(BaseModel):
    plan_tier: str


PLANS = [
    {"tier": "starter", "price_monthly": 12900, "price_yearly": 103200, "client_limit": 20,
     "features": ["Up to 20 clients", "Workout builder", "Messaging", "Check-ins", "Basic analytics"]},
    {"tier": "pro", "price_monthly": 24900, "price_yearly": 199200, "client_limit": 50,
     "features": ["Up to 50 clients", "Everything in Starter", "Automation rules", "Video form review", "Advanced analytics"]},
    {"tier": "scale", "price_monthly": 39900, "price_yearly": 319200, "client_limit": 999,
     "features": ["Unlimited clients", "Everything in Pro", "Team members", "White-label branding", "Priority support"]},
]


@router.get("/plans")
async def list_plans():
    return {"data": PLANS}


@router.post("/checkout")
async def create_checkout(
    body: CreateCheckoutRequest,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if body.plan_tier not in ("starter", "pro", "scale"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid plan tier")

    # In production: stripe.checkout.Session.create(...)
    return {"checkout_url": f"https://checkout.stripe.com/pay?tier={body.plan_tier}&cycle={body.billing_cycle}"}


@router.get("/subscription")
async def get_subscription(
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    sub = (await db.execute(
        select(Subscription).where(Subscription.coach_id == coach.id)
    )).scalar_one_or_none()
    if not sub:
        return {"plan_tier": coach.plan_tier, "status": "none", "message": "No active subscription"}

    return {
        "plan_tier": sub.plan_tier, "status": sub.status,
        "current_period_start": sub.current_period_start.isoformat(),
        "current_period_end": sub.current_period_end.isoformat(),
        "trial_end": sub.trial_end.isoformat() if sub.trial_end else None,
    }


@router.post("/subscription/update")
async def update_plan(
    body: UpdatePlanRequest,
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    if body.plan_tier not in ("starter", "pro", "scale"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid plan tier")

    sub = (await db.execute(select(Subscription).where(Subscription.coach_id == coach.id))).scalar_one_or_none()
    if not sub:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No active subscription to update")

    # In production: stripe.Subscription.modify(...)
    sub.plan_tier = body.plan_tier
    coach.plan_tier = body.plan_tier
    coach.client_limit = PLAN_CLIENT_LIMITS.get(body.plan_tier, 20)

    return {"updated": True, "new_tier": body.plan_tier}


@router.post("/subscription/cancel")
async def cancel_subscription(
    coach: Annotated[Coach, Depends(get_coach)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    sub = (await db.execute(select(Subscription).where(Subscription.coach_id == coach.id))).scalar_one_or_none()
    if not sub:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No active subscription")

    # In production: stripe.Subscription.modify(cancel_at_period_end=True)
    sub.status = "canceled"
    return {"canceled": True, "active_until": sub.current_period_end.isoformat()}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events — verify, deduplicate, dispatch to Celery."""
    import logging
    import redis as redis_lib
    import stripe
    from app.core.config import settings as cfg
    from app.tasks.billing_tasks import process_stripe_event

    logger = logging.getLogger(__name__)

    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")

    # 1. Verify signature
    try:
        event = stripe.Webhook.construct_event(payload, sig, cfg.STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        logger.warning("stripe webhook signature verification failed")
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid signature")

    # 2. Idempotency check (prevent duplicate processing)
    try:
        r = redis_lib.from_url(cfg.REDIS_URL, decode_responses=True)
        idempotency_key = f"stripe:webhook:{event.id}"
        if r.get(idempotency_key):
            return {"received": True, "duplicate": True}
        r.setex(idempotency_key, 86400, "processing")
        r.close()
    except Exception:
        pass  # fail open — process even if Redis is down

    # 3. Dispatch to Celery for async processing (fast return to Stripe)
    process_stripe_event.apply_async(
        args=[event.type, event.data.object],
        priority=0,
    )

    logger.info("stripe webhook dispatched", extra={"event_type": event.type, "event_id": event.id})
    return {"received": True}
