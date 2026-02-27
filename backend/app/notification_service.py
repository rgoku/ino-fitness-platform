"""Re-export for backward compatibility. Prefer: from app.domain.notifications import notification_service."""
from app.domain.notifications import (
    NotificationChannel,
    InAppNotification,
    PushNotification,
    EmailNotification,
    NotificationService,
    notification_service,
)

__all__ = [
    "NotificationChannel",
    "InAppNotification",
    "PushNotification",
    "EmailNotification",
    "NotificationService",
    "notification_service",
]
