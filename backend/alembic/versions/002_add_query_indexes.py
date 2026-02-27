"""Add composite indexes for common query patterns.

Revision ID: 002_add_query_indexes
Revises: 001_add_reminders_and_supplements
Create Date: 2025-11-22 00:00:01.000000

Indexes added:
- reminders(sent, remind_at): process_due_reminders filters by sent=False and remind_at <= now
- messages(user_id, created_at): list messages by user ordered by created_at
- progress_entries(user_id, date): lookups by user and date
- workout_sessions(user_id, date): lookups by user and date
"""
from alembic import op


revision = "002_add_query_indexes"
down_revision = "001_add_reminders_and_supplements"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_reminders_sent_remind_at",
        "reminders",
        ["sent", "remind_at"],
        unique=False,
    )
    op.create_index(
        "ix_messages_user_id_created_at",
        "messages",
        ["user_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_progress_entries_user_id_date",
        "progress_entries",
        ["user_id", "date"],
        unique=False,
    )
    op.create_index(
        "ix_workout_sessions_user_id_date",
        "workout_sessions",
        ["user_id", "date"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_workout_sessions_user_id_date", table_name="workout_sessions")
    op.drop_index("ix_progress_entries_user_id_date", table_name="progress_entries")
    op.drop_index("ix_messages_user_id_created_at", table_name="messages")
    op.drop_index("ix_reminders_sent_remind_at", table_name="reminders")
