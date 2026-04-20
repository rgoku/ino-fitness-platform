"""Add birthday to users, photos to check_ins, create habit_logs table.

Revision ID: 006_add_birthday_habits_checkin_photos
Revises: 002_add_query_indexes
Create Date: 2026-04-16

"""
from alembic import op
import sqlalchemy as sa

revision = "006_add_birthday_habits_checkin_photos"
down_revision = "002_add_query_indexes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # User.birthday
    op.add_column("users", sa.Column("birthday", sa.Date(), nullable=True))

    # CheckIn.photos
    op.add_column("check_ins", sa.Column("photos", sa.JSON(), nullable=True))

    # HabitLog table
    op.create_table(
        "habit_logs",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("date", sa.Date(), nullable=False, index=True),
        sa.Column("habit_type", sa.String(), nullable=False),
        sa.Column("value", sa.Float(), default=0),
        sa.Column("target", sa.Float(), nullable=True),
        sa.Column("unit", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index("ix_habit_user_date_type", "habit_logs", ["user_id", "date", "habit_type"])


def downgrade() -> None:
    op.drop_index("ix_habit_user_date_type", "habit_logs")
    op.drop_table("habit_logs")
    op.drop_column("check_ins", "photos")
    op.drop_column("users", "birthday")
