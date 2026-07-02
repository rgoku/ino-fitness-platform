"""No-op placeholder (history squashed into 000_initial_schema).

The original content of this migration was folded into the consolidated
baseline (000_initial_schema), which builds the full schema from the models.
Retained so the revision id resolves and the chain stays linear.

Revision ID: 005_workout_name_exercise_catalog_id
Revises: 006_add_birthday_habits_checkin_photos
"""

revision = "005_workout_name_exercise_catalog_id"
down_revision = "006_add_birthday_habits_checkin_photos"
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
