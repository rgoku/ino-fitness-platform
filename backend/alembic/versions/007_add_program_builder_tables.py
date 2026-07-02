"""No-op placeholder (history squashed into 000_initial_schema).

The original content of this migration was folded into the consolidated
baseline (000_initial_schema), which builds the full schema from the models.
Retained so the revision id resolves and the chain stays linear.

Revision ID: 007_add_program_builder_tables
Revises: 005_workout_name_exercise_catalog_id
"""

revision = "007_add_program_builder_tables"
down_revision = "005_workout_name_exercise_catalog_id"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
