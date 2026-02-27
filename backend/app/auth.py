"""Re-export for backward compatibility. Prefer: from app.core.security import get_current_user."""
from app.core.security import get_current_user

__all__ = ["get_current_user"]
