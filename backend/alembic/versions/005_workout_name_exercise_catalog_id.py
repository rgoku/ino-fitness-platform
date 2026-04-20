"""Training workout name + exercise_definitions.catalog_id for API exercise_id int.

Revision ID: 005_workout_name_exercise_catalog_id
Revises: 004_production_training_diet_coach
Create Date: 2026-03-23

"""
from datetime import datetime
import uuid

from alembic import op
import sqlalchemy as sa

revision = "005_workout_name_exercise_catalog_id"
down_revision = "004_production_training_diet_coach"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("training_workouts", sa.Column("name", sa.String(), nullable=True))
    op.add_column("exercise_definitions", sa.Column("catalog_id", sa.Integer(), nullable=True))
    op.create_index(
        "ix_exercise_definitions_catalog_id",
        "exercise_definitions",
        ["catalog_id"],
        unique=True,
    )

    connection = op.get_bind()
    rows = connection.execute(
        sa.text("SELECT id FROM exercise_definitions ORDER BY created_at ASC, id ASC")
    ).fetchall()
    for idx, (rid,) in enumerate(rows, start=1):
        connection.execute(
            sa.text("UPDATE exercise_definitions SET catalog_id = :cid WHERE id = :id"),
            {"cid": idx, "id": rid},
        )

    if not rows:
        nid = str(uuid.uuid4())
        connection.execute(
            sa.text(
                "INSERT INTO exercise_definitions (id, catalog_id, name, muscle_group, created_at) "
                "VALUES (:id, 1, 'Bench Press', 'chest', :ts)"
            ),
            {"id": nid, "ts": datetime.utcnow()},
        )


def downgrade() -> None:
    op.drop_index("ix_exercise_definitions_catalog_id", table_name="exercise_definitions")
    op.drop_column("exercise_definitions", "catalog_id")
    op.drop_column("training_workouts", "name")
