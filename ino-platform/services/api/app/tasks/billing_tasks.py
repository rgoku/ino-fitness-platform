"""Stripe billing Celery tasks — webhook processing, reconciliation."""
import logging

from app.worker import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(
    bind=True,
    name="app.tasks.billing_tasks.process_stripe_event",
    max_retries=5,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=900,
    soft_time_limit=60,
    time_limit=120,
)
def process_stripe_event(self, event_type: str, event_data: dict):
    """Process a verified Stripe webhook event."""
    logger.info("process_stripe_event", extra={"event_type": event_type})

    handlers = {
        "checkout.session.completed": _handle_checkout_completed,
        "invoice.paid": _handle_invoice_paid,
        "invoice.payment_failed": _handle_payment_failed,
        "customer.subscription.updated": _handle_subscription_updated,
        "customer.subscription.deleted": _handle_subscription_deleted,
        "customer.subscription.trial_will_end": _handle_trial_ending,
        "charge.dispute.created": _handle_dispute,
    }

    handler = handlers.get(event_type)
    if handler:
        handler(event_data)
    else:
        logger.info("unhandled stripe event", extra={"event_type": event_type})

    return {"processed": True, "event_type": event_type}


@celery_app.task(name="app.tasks.billing_tasks.sync_stripe_subscriptions")
def sync_stripe_subscriptions():
    """Reconcile DB subscription state with Stripe (catch missed webhooks)."""
    logger.info("sync_stripe_subscriptions started")
    # Placeholder: query active subscriptions, compare with Stripe API
    reconciled = 0
    logger.info("sync_stripe_subscriptions completed", extra={"reconciled": reconciled})
    return {"reconciled": reconciled}


# ── Event Handlers ───────────────────────────────────────────

def _handle_checkout_completed(data: dict):
    """Create Subscription record, set coach plan tier, send welcome email."""
    logger.info("checkout completed", extra={"session_id": data.get("id")})
    # Placeholder: create Subscription, update Coach.plan_tier, send email


def _handle_invoice_paid(data: dict):
    """Extend subscription current_period_end."""
    logger.info("invoice paid", extra={"invoice_id": data.get("id")})
    # Placeholder: update Subscription.current_period_end


def _handle_payment_failed(data: dict):
    """Set subscription to past_due, notify coach."""
    logger.info("payment failed", extra={"invoice_id": data.get("id")})
    # Placeholder: update status, send email + push notification


def _handle_subscription_updated(data: dict):
    """Sync plan tier and client limit from Stripe metadata."""
    logger.info("subscription updated", extra={"sub_id": data.get("id")})
    # Placeholder: update Subscription + Coach


def _handle_subscription_deleted(data: dict):
    """Mark subscription as canceled, schedule access downgrade."""
    logger.info("subscription deleted", extra={"sub_id": data.get("id")})
    # Placeholder: update status, schedule downgrade at period end


def _handle_trial_ending(data: dict):
    """Send trial-ending email to coach."""
    logger.info("trial ending", extra={"sub_id": data.get("id")})
    from app.tasks.notification_tasks import send_email
    # Placeholder: send_email.delay(coach_email, "Trial ending soon", ...)


def _handle_dispute(data: dict):
    """Alert admin and freeze account pending review."""
    logger.error("charge disputed", extra={"dispute_id": data.get("id")})
    # Placeholder: alert admin, freeze coach account
