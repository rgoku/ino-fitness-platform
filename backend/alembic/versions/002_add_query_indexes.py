"""No-op placeholder (history squashed into 000_initial_schema).

The original content of this migration was folded into the consolidated
baseline (000_initial_schema), which builds the full schema from the models.
Retained so the revision id resolves and the chain stays linear.

Revision ID: 002_add_query_indexes
Revises: 001_add_reminders_and_supplements
"""

revision = "002_add_query_indexes"
down_revision = "001_add_reminders_and_supplements"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
