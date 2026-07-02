"""Consolidated baseline schema.

Squashes the previous (partially-deleted, broken) migration history into a
single baseline generated directly from the SQLAlchemy models, which are the
source of truth. The prior chain referenced a deleted revision (004) and
assumed tables that no longer exist in the models, so `alembic upgrade head`
could not run. Subsequent revisions (001, 002, 005, 006, 007, 008) are kept as
no-op placeholders so their ids still resolve; add new schema changes as fresh
revisions after 008 via `alembic revision --autogenerate`.

Revision ID: 000_initial_schema
Revises:
Create Date: 2026-06-28
"""
from alembic import op
from app.infrastructure.database.models import Base

revision = "000_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    Base.metadata.drop_all(bind=op.get_bind())
