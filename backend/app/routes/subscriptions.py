"""Stripe subscription management endpoints."""
import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.models import User, Subscription
from app.database import get_db
from app.core.security import get_current_user
from app.utils.logging import setup_logging

logger = setup_logging()
router = APIRouter()

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

# Price IDs from Stripe dashboard (set as env vars in prod)
PRICE_STARTER = os.environ.get("STRIPE_PRICE_STARTER", "price_starter_mock")
PRICE_PRO = os.environ.get("STRIPE_PRICE_PRO", "price_pro_mock")
PRICE_SCALE = os.environ.get("STRIPE_PRICE_SCALE", "price_scale_mock")


class CheckoutRequest(BaseModel):
    price_id: str
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None


class CheckoutResponse(BaseModel):
    checkout_url: str
    session_id: str


class SubscriptionStatus(BaseModel):
    plan: str
    status: str
    current_period_end: str
    cancel_at_period_end: bool
    max_clients: int


def get_plan_details(price_id: str) -> dict:
    """Map Stripe price IDs to plan details."""
    mapping = {
        PRICE_STARTER: {"name": "Starter", "max_clients": 15},
        PRICE_PRO: {"name": "Pro", "max_clients": 50},
        PRICE_SCALE: {"name": "Scale", "max_clients": 200},
    }
    return mapping.get(price_id, {"name": "Unknown", "max_clients": 0})


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout_session(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a Stripe Checkout session for a new subscription."""
    if not STRIPE_SECRET_KEY:
        # Mock mode when Stripe not configured
        logger.info("Stripe not configured - returning mock checkout URL")
        return CheckoutResponse(
            checkout_url=f"https://checkout.stripe.com/mock?price={body.price_id}",
            session_id=f"cs_mock_{current_user.id}",
        )

    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY

        # Get or create Stripe customer
        customer_id = getattr(current_user, "stripe_customer_id", None)
        if not customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.name,
                metadata={"user_id": str(current_user.id)},
            )
            customer_id = customer.id
            # Persist back (if model supports it)
            try:
                setattr(current_user, "stripe_customer_id", customer_id)
                db.commit()
            except Exception:
                db.rollback()
                logger.warning("User model does not support stripe_customer_id - skipping persist")

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": body.price_id, "quantity": 1}],
            mode="subscription",
            success_url=body.success_url or "https://app.ino.fit/settings?subscription=success",
            cancel_url=body.cancel_url or "https://app.ino.fit/settings?subscription=cancelled",
            metadata={"user_id": str(current_user.id)},
        )

        return CheckoutResponse(checkout_url=session.url, session_id=session.id)

    except Exception as e:
        logger.exception("Stripe checkout error: %s", e)
        raise HTTPException(status_code=500, detail=f"Checkout failed: {e}")


@router.get("/status", response_model=SubscriptionStatus)
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the current user's subscription status."""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id
    ).order_by(Subscription.created_at.desc()).first()

    if not subscription:
        # Free tier default
        return SubscriptionStatus(
            plan="Free",
            status="active",
            current_period_end="",
            cancel_at_period_end=False,
            max_clients=3,
        )

    plan_details = get_plan_details(getattr(subscription, "stripe_price_id", ""))

    # Fall back to plan_type if stripe_price_id is not mapped
    if plan_details["name"] == "Unknown":
        plan_type = getattr(subscription, "plan_type", None)
        if plan_type:
            plan_details = {"name": plan_type.capitalize(), "max_clients": plan_details["max_clients"]}

    period_end = getattr(subscription, "current_period_end", None)
    period_end_iso = period_end.isoformat() if period_end else ""

    return SubscriptionStatus(
        plan=plan_details["name"],
        status=getattr(subscription, "status", "active"),
        current_period_end=period_end_iso,
        cancel_at_period_end=getattr(subscription, "cancel_at_period_end", False),
        max_clients=plan_details["max_clients"],
    )


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel the current user's subscription at period end."""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active",
    ).first()

    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription")

    if not STRIPE_SECRET_KEY:
        # Mock mode
        logger.info("Stripe not configured - mock cancel")
        return {"success": True, "cancel_at_period_end": True, "current_period_end": ""}

    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY

        stripe_sub_id = getattr(subscription, "stripe_subscription_id", None)
        if not stripe_sub_id:
            raise HTTPException(status_code=400, detail="Subscription has no Stripe ID")

        stripe_sub = stripe.Subscription.modify(
            stripe_sub_id,
            cancel_at_period_end=True,
        )

        return {
            "success": True,
            "cancel_at_period_end": True,
            "current_period_end": stripe_sub.current_period_end,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Cancel error: %s", e)
        raise HTTPException(status_code=500, detail=f"Cancel failed: {e}")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db),
):
    """
    Stripe webhook handler. Processes subscription lifecycle events:
    - checkout.session.completed: New subscription created
    - customer.subscription.updated: Plan change, status update
    - customer.subscription.deleted: Subscription cancelled
    - invoice.payment_failed: Failed payment
    """
    if not STRIPE_WEBHOOK_SECRET or not STRIPE_SECRET_KEY:
        logger.warning("Stripe webhook received but webhook secret not configured")
        return {"received": True, "configured": False}

    payload = await request.body()

    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except Exception as e:
        logger.exception("Webhook signature verification failed: %s", e)
        raise HTTPException(status_code=400, detail="Invalid signature")

    event_type = event["type"]
    data = event["data"]["object"]

    logger.info("Stripe webhook: %s", event_type)

    try:
        if event_type == "checkout.session.completed":
            user_id = data.get("metadata", {}).get("user_id")
            if user_id:
                # Try to derive the price id from line items if present.
                price_id = ""
                try:
                    line_items = data.get("line_items", {}) or {}
                    items = line_items.get("data", []) if isinstance(line_items, dict) else []
                    if items:
                        price_id = items[0].get("price", {}).get("id", "")
                except Exception:
                    price_id = ""

                sub_kwargs = {
                    "user_id": user_id,
                    "status": "active",
                }
                # Optional fields - only set if model supports them
                sub_id = data.get("subscription")
                if sub_id and hasattr(Subscription, "stripe_subscription_id"):
                    sub_kwargs["stripe_subscription_id"] = sub_id
                if hasattr(Subscription, "stripe_price_id") and price_id:
                    sub_kwargs["stripe_price_id"] = price_id
                if hasattr(Subscription, "plan_type"):
                    plan_details = get_plan_details(price_id)
                    sub_kwargs["plan_type"] = plan_details["name"].lower()

                sub_record = Subscription(**sub_kwargs)
                db.add(sub_record)
                db.commit()

        elif event_type == "customer.subscription.updated":
            sub_id = data.get("id")
            sub_record = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == sub_id
            ).first()
            if sub_record:
                sub_record.status = data.get("status", "active")
                if hasattr(sub_record, "cancel_at_period_end"):
                    sub_record.cancel_at_period_end = data.get("cancel_at_period_end", False)
                db.commit()

        elif event_type == "customer.subscription.deleted":
            sub_id = data.get("id")
            sub_record = db.query(Subscription).filter(
                Subscription.stripe_subscription_id == sub_id
            ).first()
            if sub_record:
                sub_record.status = "canceled"
                db.commit()

        elif event_type == "invoice.payment_failed":
            customer_id = data.get("customer")
            logger.warning("Payment failed for customer %s", customer_id)
            # TODO: send notification

    except Exception as e:
        logger.exception("Webhook processing error: %s", e)
        # Still return 200 to Stripe so they don't retry
        return {"received": True, "processed": False, "error": str(e)}

    return {"received": True, "processed": True}
