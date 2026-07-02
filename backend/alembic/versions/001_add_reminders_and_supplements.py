"""No-op placeholder (history squashed into 000_initial_schema).

The original content of this migration was folded into the consolidated
baseline (000_initial_schema), which builds the full schema from the models.
Retained so the revision id resolves and the chain stays linear.

Revision ID: 001_add_reminders_and_supplements
Revises: 000_initial_schema
"""

revision = "001_add_reminders_and_supplements"
down_revision = "000_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
