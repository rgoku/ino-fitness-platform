"""Re-export for backward compatibility. Prefer: from app.infrastructure.database import get_db, SessionLocal, ..."""
from app.infrastructure.database import (
    engine,
    SessionLocal,
    get_db,
    init_db,
)

__all__ = ["engine", "SessionLocal", "get_db", "init_db"]
