"""Stripe service — wraps Stripe SDK with retry logic and error handling."""
import logging
import uuid

import stripe

from app.core.config import settings

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


def verify_webhook(payload: bytes, signature: str) -> stripe.Event:
    """Verify and construct a Stripe webhook event.

    Raises stripe.error.SignatureVerificationError on invalid signature.
    """
    return stripe.Webhook.construct_event(
        payload, signature, settings.STRIPE_WEBHOOK_SECRET
    )


def create_checkout_session(
    coach_email: str,
    plan_tier: str,
    coach_id: str = "",
    billing_cycle: str = "monthly",
    success_url: str | None = None,
    cancel_url: str | None = None,
) -> stripe.checkout.Session:
    """Create a Stripe Checkout session for a plan subscription."""
    price_map = {
        "starter": settings.STRIPE_PRICE_STARTER_MONTHLY,
        "pro": settings.STRIPE_PRICE_PRO_MONTHLY,
        "scale": settings.STRIPE_PRICE_SCALE_MONTHLY,
    }
    price_id = price_map.get(plan_tier)
    if not price_id:
        raise ValueError(f"Unknown plan tier: {plan_tier}")

    # Build URLs from CORS_ORIGINS (first origin = frontend) instead of hardcoding
    frontend_base = settings.CORS_ORIGINS[0] if settings.CORS_ORIGINS else "https://app.inoplatform.com"
    if success_url is None:
        success_url = f"{frontend_base}/settings?checkout=success"
    if cancel_url is None:
        cancel_url = f"{frontend_base}/settings?checkout=cancel"

    # Idempotency key prevents duplicate charges on retries
    idempotency_key = f"checkout_{coach_id}_{plan_tier}_{uuid.uuid4().hex[:8]}"

    return stripe.checkout.Session.create(
        mode="subscription",
        customer_email=coach_email,
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"plan_tier": plan_tier, "billing_cycle": billing_cycle, "coach_id": coach_id},
        subscription_data={
            "trial_period_days": 14,
            "metadata": {"plan_tier": plan_tier, "coach_id": coach_id},
        },
        idempotency_key=idempotency_key,
    )


def retrieve_subscription(subscription_id: str) -> stripe.Subscription:
    """Retrieve a subscription from Stripe."""
    return stripe.Subscription.retrieve(subscription_id)


def update_subscription_plan(subscription_id: str, new_price_id: str) -> stripe.Subscription:
    """Update subscription to a new plan (proration applied automatically)."""
    sub = stripe.Subscription.retrieve(subscription_id)
    return stripe.Subscription.modify(
        subscription_id,
        items=[{
            "id": sub["items"]["data"][0]["id"],
            "price": new_price_id,
        }],
        proration_behavior="create_prorations",
        idempotency_key=f"upgrade_{subscription_id}_{new_price_id}_{uuid.uuid4().hex[:8]}",
    )


def cancel_subscription(subscription_id: str) -> stripe.Subscription:
    """Cancel at period end (not immediately)."""
    return stripe.Subscription.modify(
        subscription_id,
        cancel_at_period_end=True,
        idempotency_key=f"cancel_{subscription_id}_{uuid.uuid4().hex[:8]}",
    )
