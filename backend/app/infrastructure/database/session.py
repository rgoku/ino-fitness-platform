"""Database engine and session — PostgreSQL with connection pooling."""
import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import get_database_url, get_debug

logger = logging.getLogger(__name__)

DATABASE_URL = get_database_url()

if DATABASE_URL.startswith("sqlite"):
    logger.warning("Using SQLite — not suitable for production. Set DATABASE_URL to PostgreSQL.")
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(
        DATABASE_URL,
        echo=get_debug(),
        pool_size=50,
        max_overflow=25,
        pool_recycle=1800,
        pool_pre_ping=True,
        pool_timeout=10,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    from app.infrastructure.database.models import Base
    Base.metadata.create_all(bind=engine)
