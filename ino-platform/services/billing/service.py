"""
INÖ Billing Service
Stripe integration for subscription management, checkout, and webhooks.
"""
from dataclasses import dataclass
from enum import Enum


class PlanTier(str, Enum):
    STARTER = "starter"
    PRO = "pro"
    SCALE = "scale"


@dataclass
class PlanConfig:
    tier: PlanTier
    name: str
    price_monthly_cents: int
    price_yearly_cents: int
    client_limit: int
    stripe_price_monthly: str
    stripe_price_yearly: str


PLANS: dict[PlanTier, PlanConfig] = {
    PlanTier.STARTER: PlanConfig(
        tier=PlanTier.STARTER, name="Starter",
        price_monthly_cents=12_900, price_yearly_cents=103_200,
        client_limit=20,
        stripe_price_monthly="price_starter_monthly",
        stripe_price_yearly="price_starter_yearly",
    ),
    PlanTier.PRO: PlanConfig(
        tier=PlanTier.PRO, name="Pro",
        price_monthly_cents=24_900, price_yearly_cents=199_200,
        client_limit=50,
        stripe_price_monthly="price_pro_monthly",
        stripe_price_yearly="price_pro_yearly",
    ),
    PlanTier.SCALE: PlanConfig(
        tier=PlanTier.SCALE, name="Scale",
        price_monthly_cents=39_900, price_yearly_cents=319_200,
        client_limit=999,
        stripe_price_monthly="price_scale_monthly",
        stripe_price_yearly="price_scale_yearly",
    ),
}


async def create_checkout_session(
    coach_id: str,
    email: str,
    tier: PlanTier,
    billing_cycle: str = "monthly",
    trial_days: int = 14,
) -> str:
    """Create a Stripe Checkout session and return the URL."""
    plan = PLANS[tier]
    price_id = plan.stripe_price_monthly if billing_cycle == "monthly" else plan.stripe_price_yearly

    # stripe.checkout.Session.create(
    #     customer_email=email,
    #     mode="subscription",
    #     line_items=[{"price": price_id, "quantity": 1}],
    #     subscription_data={"trial_period_days": trial_days, "metadata": {"coach_id": coach_id}},
    #     success_url="https://app.inoplatform.com/onboarding?session_id={CHECKOUT_SESSION_ID}",
    #     cancel_url="https://inoplatform.com/pricing",
    # )
    return "https://checkout.stripe.com/placeholder"


async def handle_webhook_event(event_type: str, data: dict) -> None:
    """Process Stripe webhook events."""
    handlers = {
        "checkout.session.completed": _on_checkout_complete,
        "invoice.paid": _on_invoice_paid,
        "invoice.payment_failed": _on_payment_failed,
        "customer.subscription.updated": _on_subscription_updated,
        "customer.subscription.deleted": _on_subscription_canceled,
    }
    handler = handlers.get(event_type)
    if handler:
        await handler(data)


async def _on_checkout_complete(data: dict) -> None:
    """Activate subscription, set plan tier, unlock features."""
    pass  # TODO: update coach record, send welcome email


async def _on_invoice_paid(data: dict) -> None:
    """Confirm recurring payment. Extend subscription period."""
    pass


async def _on_payment_failed(data: dict) -> None:
    """Mark subscription as past_due. Send dunning email."""
    pass


async def _on_subscription_updated(data: dict) -> None:
    """Handle plan changes (upgrade/downgrade). Adjust client limits."""
    pass


async def _on_subscription_canceled(data: dict) -> None:
    """Mark subscription canceled. Retain data for 90 days."""
    pass
