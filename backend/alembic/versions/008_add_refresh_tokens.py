"""No-op placeholder (history squashed into 000_initial_schema).

The original content of this migration was folded into the consolidated
baseline (000_initial_schema), which builds the full schema from the models.
Retained so the revision id resolves and the chain stays linear.

Revision ID: 008_add_refresh_tokens
Revises: 007_add_program_builder_tables
"""

revision = "008_add_refresh_tokens"
down_revision = "007_add_program_builder_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
