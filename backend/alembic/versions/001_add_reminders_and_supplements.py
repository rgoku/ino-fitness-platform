"""Add reminders table and supplement_recommendations column.

Revision ID: 001_add_reminders_and_supplements
Revises: 000_initial_schema
Create Date: 2025-11-22 00:00:00.000000

NOTE: As of the 000_initial_schema baseline, the reminders table and the
`diet_plans.supplement_recommendations` column are created directly in the
initial schema. This revision is retained as a historical no-op so existing
deployments that have already applied it continue to have a contiguous
migration chain.
"""
from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401


# revision identifiers, used by Alembic.
revision = '001_add_reminders_and_supplements'
down_revision = '000_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # No-op: reminders table and supplement_recommendations column are now
    # created in 000_initial_schema.
    pass


def downgrade() -> None:
    # No-op: nothing to undo here; 000_initial_schema handles the schema.
    pass
