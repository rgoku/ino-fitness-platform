"""initial schema — all tables

Revision ID: 001
Revises: None
Create Date: 2026-02-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Enums ──────────────────────────────────────────────
    user_role = sa.Enum("coach", "assistant", "admin", "client", name="user_role")
    plan_tier = sa.Enum("starter", "pro", "scale", name="plan_tier")
    client_status = sa.Enum("invited", "active", "at_risk", "paused", "churned", name="client_status")
    flag_severity = sa.Enum("low", "medium", "high", name="flag_severity")
    checkin_type = sa.Enum("daily_readiness", "weekly_checkin", "progress_photo", name="checkin_type")
    video_status = sa.Enum("pending", "reviewed", "approved", "needs_redo", name="video_status")
    sub_plan_tier = sa.Enum("starter", "pro", "scale", name="sub_plan_tier")
    sub_status = sa.Enum("trialing", "active", "past_due", "canceled", name="sub_status")
    log_status = sa.Enum("success", "failed", "skipped", name="automation_log_status")

    # ── Users ──────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False, unique=True, index=True),
        sa.Column("password_hash", sa.String(512), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("avatar_url", sa.String(512)),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_active_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Coaches ────────────────────────────────────────────
    op.create_table(
        "coaches",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("business_name", sa.String(255), server_default=""),
        sa.Column("plan_tier", plan_tier, server_default="starter"),
        sa.Column("client_limit", sa.Integer, server_default="20"),
        sa.Column("coach_code", sa.String(10), unique=True, nullable=False, index=True),
        sa.Column("brand_color", sa.String(7)),
        sa.Column("logo_url", sa.String(512)),
        sa.Column("onboarded_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Clients ────────────────────────────────────────────
    op.create_table(
        "clients",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("coach_id", UUID(as_uuid=True), sa.ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("status", client_status, server_default="invited"),
        sa.Column("streak", sa.Integer, server_default="0"),
        sa.Column("goals", ARRAY(sa.String), server_default="{}"),
        sa.Column("notes", sa.Text, server_default=""),
        sa.Column("start_date", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_active_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_clients_coach_status", "clients", ["coach_id", "status"])

    # ── Client Risk Flags ──────────────────────────────────
    op.create_table(
        "client_risk_flags",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("severity", flag_severity, nullable=False),
        sa.Column("message", sa.Text, nullable=False),
        sa.Column("triggered_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("resolved_at", sa.DateTime(timezone=True)),
    )

    # ── Workouts ───────────────────────────────────────────
    op.create_table(
        "workouts",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("coach_id", UUID(as_uuid=True), sa.ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, server_default=""),
        sa.Column("is_template", sa.Boolean, server_default="false"),
        sa.Column("tags", ARRAY(sa.String), server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_workouts_coach_template", "workouts", ["coach_id", "is_template"])

    # ── Exercises ──────────────────────────────────────────
    op.create_table(
        "exercises",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workout_id", UUID(as_uuid=True), sa.ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("position", sa.Integer, nullable=False, server_default="0"),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("sets", sa.Integer, nullable=False),
        sa.Column("reps", sa.String(20), nullable=False),
        sa.Column("weight", sa.Float),
        sa.Column("rest_seconds", sa.Integer, server_default="90"),
        sa.Column("notes", sa.Text, server_default=""),
        sa.Column("video_url", sa.String(512)),
    )

    # ── Workout Assignments ────────────────────────────────
    op.create_table(
        "workout_assignments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("workout_id", UUID(as_uuid=True), sa.ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("client_id", UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("scheduled_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_assignments_client_date", "workout_assignments", ["client_id", "scheduled_date"])

    # ── Exercise Completions ───────────────────────────────
    op.create_table(
        "exercise_completions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("assignment_id", UUID(as_uuid=True), sa.ForeignKey("workout_assignments.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("exercise_id", UUID(as_uuid=True), sa.ForeignKey("exercises.id", ondelete="SET NULL")),
        sa.Column("actual_sets", sa.Integer, nullable=False),
        sa.Column("actual_reps", sa.Integer, nullable=False),
        sa.Column("actual_weight", sa.Float),
        sa.Column("rpe", sa.Integer),
        sa.Column("notes", sa.Text, server_default=""),
        sa.Column("completed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Check-ins ──────────────────────────────────────────
    op.create_table(
        "checkins",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("coach_id", UUID(as_uuid=True), sa.ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("type", checkin_type, nullable=False),
        sa.Column("data", JSONB, nullable=False),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("reviewed_at", sa.DateTime(timezone=True)),
        sa.Column("coach_notes", sa.Text),
    )
    op.create_index("ix_checkins_client_type", "checkins", ["client_id", "type"])
    op.create_index("ix_checkins_coach_reviewed", "checkins", ["coach_id", "reviewed_at"])

    # ── Video Reviews ──────────────────────────────────────
    op.create_table(
        "video_reviews",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("client_id", UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("coach_id", UUID(as_uuid=True), sa.ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("exercise_name", sa.String(255), nullable=False),
        sa.Column("video_url", sa.String(512), nullable=False),
        sa.Column("thumbnail_url", sa.String(512)),
        sa.Column("s3_key", sa.String(512), nullable=False),
        sa.Column("status", video_status, server_default="pending"),
        sa.Column("coach_feedback", sa.Text),
        sa.Column("annotations", JSONB, server_default="[]"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("reviewed_at", sa.DateTime(timezone=True)),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_videos_coach_status", "video_reviews", ["coach_id", "status"])
    op.create_index("ix_videos_expires", "video_reviews", ["expires_at"])

    # ── Messages ───────────────────────────────────────────
    op.create_table(
        "messages",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("sender_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("recipient_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("attachments", JSONB, server_default="[]"),
        sa.Column("read_at", sa.DateTime(timezone=True)),
        sa.Column("sent_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_messages_conversation", "messages", ["sender_id", "recipient_id", "sent_at"])
    op.create_index("ix_messages_recipient_unread", "messages", ["recipient_id", "read_at"])

    # ── Automation Rules ───────────────────────────────────
    op.create_table(
        "automation_rules",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("coach_id", UUID(as_uuid=True), sa.ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("trigger", JSONB, nullable=False),
        sa.Column("actions", JSONB, nullable=False),
        sa.Column("delay_minutes", sa.Integer, server_default="0"),
        sa.Column("enabled", sa.Boolean, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_triggered_at", sa.DateTime(timezone=True)),
        sa.Column("trigger_count", sa.Integer, server_default="0"),
    )

    # ── Automation Logs ────────────────────────────────────
    op.create_table(
        "automation_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("rule_id", UUID(as_uuid=True), sa.ForeignKey("automation_rules.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("client_id", UUID(as_uuid=True), sa.ForeignKey("clients.id", ondelete="SET NULL")),
        sa.Column("actions_taken", JSONB, nullable=False),
        sa.Column("status", log_status, nullable=False),
        sa.Column("error", sa.Text),
        sa.Column("executed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Subscriptions ──────────────────────────────────────
    op.create_table(
        "subscriptions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("coach_id", UUID(as_uuid=True), sa.ForeignKey("coaches.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("plan_tier", sub_plan_tier, nullable=False),
        sa.Column("stripe_customer_id", sa.String(255), unique=True, nullable=False),
        sa.Column("stripe_subscription_id", sa.String(255), unique=True, nullable=False),
        sa.Column("status", sub_status, server_default="trialing"),
        sa.Column("current_period_start", sa.DateTime(timezone=True), nullable=False),
        sa.Column("current_period_end", sa.DateTime(timezone=True), nullable=False),
        sa.Column("trial_end", sa.DateTime(timezone=True)),
        sa.Column("canceled_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("subscriptions")
    op.drop_table("automation_logs")
    op.drop_table("automation_rules")
    op.drop_table("messages")
    op.drop_table("video_reviews")
    op.drop_table("checkins")
    op.drop_table("exercise_completions")
    op.drop_table("workout_assignments")
    op.drop_table("exercises")
    op.drop_table("workouts")
    op.drop_table("client_risk_flags")
    op.drop_table("clients")
    op.drop_table("coaches")
    op.drop_table("users")

    for enum_name in [
        "automation_log_status", "sub_status", "sub_plan_tier",
        "video_status", "checkin_type", "flag_severity",
        "client_status", "plan_tier", "user_role",
    ]:
        sa.Enum(name=enum_name).drop(op.get_bind(), checkfirst=True)
