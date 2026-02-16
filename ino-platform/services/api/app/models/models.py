"""
INÖ Platform — Database Models
Maps 1:1 to @ino/types. Every table has real columns, relationships, and indexes.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Boolean, DateTime, Enum, Float, ForeignKey, Index, Integer,
    String, Text, UniqueConstraint, func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


# ── Helpers ────────────────────────────────────────────────────

def pk() -> Mapped[uuid.UUID]:
    return mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

def now() -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), server_default=func.now())

def now_nullable() -> Mapped[datetime | None]:
    return mapped_column(DateTime(timezone=True), nullable=True)


# ══════════════════════════════════════════════════════════════
# USER
# ══════════════════════════════════════════════════════════════

class User(Base):
    __tablename__ = "users"

    id:             Mapped[uuid.UUID] = pk()
    email:          Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash:  Mapped[str] = mapped_column(String(512), nullable=False)
    name:           Mapped[str] = mapped_column(String(255), nullable=False)
    role:           Mapped[str] = mapped_column(Enum("coach", "assistant", "admin", "client", name="user_role"), nullable=False)
    avatar_url:     Mapped[str | None] = mapped_column(String(512))
    is_active:      Mapped[bool] = mapped_column(Boolean, default=True)
    created_at:     Mapped[datetime] = now()
    updated_at:     Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_active_at: Mapped[datetime] = now()

    # Relationships
    coach_profile:  Mapped["Coach | None"] = relationship(back_populates="user", uselist=False)
    client_profile: Mapped["Client | None"] = relationship(back_populates="user", uselist=False)


# ══════════════════════════════════════════════════════════════
# COACH
# ══════════════════════════════════════════════════════════════

class Coach(Base):
    __tablename__ = "coaches"

    id:             Mapped[uuid.UUID] = pk()
    user_id:        Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    business_name:  Mapped[str] = mapped_column(String(255), default="")
    plan_tier:      Mapped[str] = mapped_column(Enum("starter", "pro", "scale", name="plan_tier"), default="starter")
    client_limit:   Mapped[int] = mapped_column(Integer, default=20)
    coach_code:     Mapped[str] = mapped_column(String(10), unique=True, nullable=False, index=True)
    brand_color:    Mapped[str | None] = mapped_column(String(7))
    logo_url:       Mapped[str | None] = mapped_column(String(512))
    onboarded_at:   Mapped[datetime | None] = now_nullable()
    created_at:     Mapped[datetime] = now()

    # Relationships
    user:           Mapped["User"] = relationship(back_populates="coach_profile")
    clients:        Mapped[list["Client"]] = relationship(back_populates="coach", cascade="all, delete-orphan")
    workouts:       Mapped[list["Workout"]] = relationship(back_populates="coach", cascade="all, delete-orphan")
    automation_rules: Mapped[list["AutomationRule"]] = relationship(back_populates="coach", cascade="all, delete-orphan")
    subscription:   Mapped["Subscription | None"] = relationship(back_populates="coach", uselist=False)


# ══════════════════════════════════════════════════════════════
# CLIENT
# ══════════════════════════════════════════════════════════════

class Client(Base):
    __tablename__ = "clients"

    id:             Mapped[uuid.UUID] = pk()
    user_id:        Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    coach_id:       Mapped[uuid.UUID] = mapped_column(ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False, index=True)
    status:         Mapped[str] = mapped_column(Enum("invited", "active", "at_risk", "paused", "churned", name="client_status"), default="invited")
    streak:         Mapped[int] = mapped_column(Integer, default=0)
    goals:          Mapped[list] = mapped_column(ARRAY(String), default=[])
    notes:          Mapped[str] = mapped_column(Text, default="")
    start_date:     Mapped[datetime] = now()
    last_active_at: Mapped[datetime] = now()
    created_at:     Mapped[datetime] = now()

    # Relationships
    user:           Mapped["User"] = relationship(back_populates="client_profile")
    coach:          Mapped["Coach"] = relationship(back_populates="clients")
    workout_assignments: Mapped[list["WorkoutAssignment"]] = relationship(back_populates="client", cascade="all, delete-orphan")
    checkins:       Mapped[list["CheckIn"]] = relationship(back_populates="client", cascade="all, delete-orphan")
    video_reviews:  Mapped[list["VideoReview"]] = relationship(back_populates="client", cascade="all, delete-orphan")
    risk_flags:     Mapped[list["ClientRiskFlag"]] = relationship(back_populates="client", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_clients_coach_status", "coach_id", "status"),
    )


# ══════════════════════════════════════════════════════════════
# CLIENT RISK FLAGS
# ══════════════════════════════════════════════════════════════

class ClientRiskFlag(Base):
    __tablename__ = "client_risk_flags"

    id:             Mapped[uuid.UUID] = pk()
    client_id:      Mapped[uuid.UUID] = mapped_column(ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    type:           Mapped[str] = mapped_column(String(50), nullable=False)   # missed_sessions, low_adherence, no_checkin, low_readiness
    severity:       Mapped[str] = mapped_column(Enum("low", "medium", "high", name="flag_severity"), nullable=False)
    message:        Mapped[str] = mapped_column(Text, nullable=False)
    triggered_at:   Mapped[datetime] = now()
    resolved_at:    Mapped[datetime | None] = now_nullable()

    # Relationships
    client:         Mapped["Client"] = relationship(back_populates="risk_flags")


# ══════════════════════════════════════════════════════════════
# WORKOUT
# ══════════════════════════════════════════════════════════════

class Workout(Base):
    __tablename__ = "workouts"

    id:             Mapped[uuid.UUID] = pk()
    coach_id:       Mapped[uuid.UUID] = mapped_column(ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False, index=True)
    title:          Mapped[str] = mapped_column(String(255), nullable=False)
    description:    Mapped[str] = mapped_column(Text, default="")
    is_template:    Mapped[bool] = mapped_column(Boolean, default=False)
    tags:           Mapped[list] = mapped_column(ARRAY(String), default=[])
    created_at:     Mapped[datetime] = now()
    updated_at:     Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    coach:          Mapped["Coach"] = relationship(back_populates="workouts")
    exercises:      Mapped[list["Exercise"]] = relationship(back_populates="workout", cascade="all, delete-orphan", order_by="Exercise.position")
    assignments:    Mapped[list["WorkoutAssignment"]] = relationship(back_populates="workout", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_workouts_coach_template", "coach_id", "is_template"),
    )


class Exercise(Base):
    __tablename__ = "exercises"

    id:             Mapped[uuid.UUID] = pk()
    workout_id:     Mapped[uuid.UUID] = mapped_column(ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False, index=True)
    position:       Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    name:           Mapped[str] = mapped_column(String(255), nullable=False)
    sets:           Mapped[int] = mapped_column(Integer, nullable=False)
    reps:           Mapped[str] = mapped_column(String(20), nullable=False)     # "8" or "8-12"
    weight:         Mapped[float | None] = mapped_column(Float)
    rest_seconds:   Mapped[int] = mapped_column(Integer, default=90)
    notes:          Mapped[str] = mapped_column(Text, default="")
    video_url:      Mapped[str | None] = mapped_column(String(512))

    # Relationships
    workout:        Mapped["Workout"] = relationship(back_populates="exercises")


# ══════════════════════════════════════════════════════════════
# WORKOUT ASSIGNMENT
# ══════════════════════════════════════════════════════════════

class WorkoutAssignment(Base):
    __tablename__ = "workout_assignments"

    id:             Mapped[uuid.UUID] = pk()
    workout_id:     Mapped[uuid.UUID] = mapped_column(ForeignKey("workouts.id", ondelete="CASCADE"), nullable=False)
    client_id:      Mapped[uuid.UUID] = mapped_column(ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at:   Mapped[datetime | None] = now_nullable()
    created_at:     Mapped[datetime] = now()

    # Relationships
    workout:        Mapped["Workout"] = relationship(back_populates="assignments")
    client:         Mapped["Client"] = relationship(back_populates="workout_assignments")
    completions:    Mapped[list["ExerciseCompletion"]] = relationship(back_populates="assignment", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_assignments_client_date", "client_id", "scheduled_date"),
    )


class ExerciseCompletion(Base):
    __tablename__ = "exercise_completions"

    id:             Mapped[uuid.UUID] = pk()
    assignment_id:  Mapped[uuid.UUID] = mapped_column(ForeignKey("workout_assignments.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_id:    Mapped[uuid.UUID] = mapped_column(ForeignKey("exercises.id", ondelete="SET NULL"), nullable=True)
    actual_sets:    Mapped[int] = mapped_column(Integer, nullable=False)
    actual_reps:    Mapped[int] = mapped_column(Integer, nullable=False)
    actual_weight:  Mapped[float | None] = mapped_column(Float)
    rpe:            Mapped[int | None] = mapped_column(Integer)                 # 1-10
    notes:          Mapped[str] = mapped_column(Text, default="")
    completed_at:   Mapped[datetime] = now()

    # Relationships
    assignment:     Mapped["WorkoutAssignment"] = relationship(back_populates="completions")


# ══════════════════════════════════════════════════════════════
# CHECK-IN
# ══════════════════════════════════════════════════════════════

class CheckIn(Base):
    __tablename__ = "checkins"

    id:             Mapped[uuid.UUID] = pk()
    client_id:      Mapped[uuid.UUID] = mapped_column(ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    coach_id:       Mapped[uuid.UUID] = mapped_column(ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    type:           Mapped[str] = mapped_column(Enum("daily_readiness", "weekly_checkin", "progress_photo", name="checkin_type"), nullable=False)
    data:           Mapped[dict] = mapped_column(JSONB, nullable=False)         # ReadinessData | WeeklyData | ProgressPhotoData
    submitted_at:   Mapped[datetime] = now()
    reviewed_at:    Mapped[datetime | None] = now_nullable()
    coach_notes:    Mapped[str | None] = mapped_column(Text)

    # Relationships
    client:         Mapped["Client"] = relationship(back_populates="checkins")

    __table_args__ = (
        Index("ix_checkins_client_type", "client_id", "type"),
        Index("ix_checkins_coach_reviewed", "coach_id", "reviewed_at"),
    )


# ══════════════════════════════════════════════════════════════
# VIDEO REVIEW
# ══════════════════════════════════════════════════════════════

class VideoReview(Base):
    __tablename__ = "video_reviews"

    id:             Mapped[uuid.UUID] = pk()
    client_id:      Mapped[uuid.UUID] = mapped_column(ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    coach_id:       Mapped[uuid.UUID] = mapped_column(ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False)
    exercise_name:  Mapped[str] = mapped_column(String(255), nullable=False)
    video_url:      Mapped[str] = mapped_column(String(512), nullable=False)
    thumbnail_url:  Mapped[str | None] = mapped_column(String(512))
    s3_key:         Mapped[str] = mapped_column(String(512), nullable=False)
    status:         Mapped[str] = mapped_column(Enum("pending", "reviewed", "approved", "needs_redo", name="video_status"), default="pending")
    coach_feedback: Mapped[str | None] = mapped_column(Text)
    annotations:    Mapped[list] = mapped_column(JSONB, default=[])             # [{timestamp_ms, text, type}]
    submitted_at:   Mapped[datetime] = now()
    reviewed_at:    Mapped[datetime | None] = now_nullable()
    expires_at:     Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Relationships
    client:         Mapped["Client"] = relationship(back_populates="video_reviews")

    __table_args__ = (
        Index("ix_videos_coach_status", "coach_id", "status"),
        Index("ix_videos_expires", "expires_at"),
    )


# ══════════════════════════════════════════════════════════════
# MESSAGING
# ══════════════════════════════════════════════════════════════

class Message(Base):
    __tablename__ = "messages"

    id:             Mapped[uuid.UUID] = pk()
    sender_id:      Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    recipient_id:   Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content:        Mapped[str] = mapped_column(Text, nullable=False)
    attachments:    Mapped[list] = mapped_column(JSONB, default=[])             # [{type, url, reference_id}]
    read_at:        Mapped[datetime | None] = now_nullable()
    sent_at:        Mapped[datetime] = now()

    __table_args__ = (
        Index("ix_messages_conversation", "sender_id", "recipient_id", "sent_at"),
        Index("ix_messages_recipient_unread", "recipient_id", "read_at"),
    )


# ══════════════════════════════════════════════════════════════
# AUTOMATION
# ══════════════════════════════════════════════════════════════

class AutomationRule(Base):
    __tablename__ = "automation_rules"

    id:             Mapped[uuid.UUID] = pk()
    coach_id:       Mapped[uuid.UUID] = mapped_column(ForeignKey("coaches.id", ondelete="CASCADE"), nullable=False, index=True)
    name:           Mapped[str] = mapped_column(String(255), nullable=False)
    trigger:        Mapped[dict] = mapped_column(JSONB, nullable=False)         # {type, count/days/threshold}
    actions:        Mapped[list] = mapped_column(JSONB, nullable=False)         # [{type, config}]
    delay_minutes:  Mapped[int] = mapped_column(Integer, default=0)
    enabled:        Mapped[bool] = mapped_column(Boolean, default=True)
    created_at:     Mapped[datetime] = now()
    last_triggered_at: Mapped[datetime | None] = now_nullable()
    trigger_count:  Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    coach:          Mapped["Coach"] = relationship(back_populates="automation_rules")
    logs:           Mapped[list["AutomationLog"]] = relationship(back_populates="rule", cascade="all, delete-orphan")


class AutomationLog(Base):
    __tablename__ = "automation_logs"

    id:             Mapped[uuid.UUID] = pk()
    rule_id:        Mapped[uuid.UUID] = mapped_column(ForeignKey("automation_rules.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id:      Mapped[uuid.UUID] = mapped_column(ForeignKey("clients.id", ondelete="SET NULL"), nullable=True)
    actions_taken:  Mapped[list] = mapped_column(JSONB, nullable=False)         # snapshot of what fired
    status:         Mapped[str] = mapped_column(Enum("success", "failed", "skipped", name="automation_log_status"), nullable=False)
    error:          Mapped[str | None] = mapped_column(Text)
    executed_at:    Mapped[datetime] = now()

    # Relationships
    rule:           Mapped["AutomationRule"] = relationship(back_populates="logs")


# ══════════════════════════════════════════════════════════════
# SUBSCRIPTION (BILLING)
# ══════════════════════════════════════════════════════════════

class Subscription(Base):
    __tablename__ = "subscriptions"

    id:                     Mapped[uuid.UUID] = pk()
    coach_id:               Mapped[uuid.UUID] = mapped_column(ForeignKey("coaches.id", ondelete="CASCADE"), unique=True, nullable=False)
    plan_tier:              Mapped[str] = mapped_column(Enum("starter", "pro", "scale", name="sub_plan_tier"), nullable=False)
    stripe_customer_id:     Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    stripe_subscription_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    status:                 Mapped[str] = mapped_column(Enum("trialing", "active", "past_due", "canceled", name="sub_status"), default="trialing")
    current_period_start:   Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    current_period_end:     Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    trial_end:              Mapped[datetime | None] = now_nullable()
    canceled_at:            Mapped[datetime | None] = now_nullable()
    created_at:             Mapped[datetime] = now()

    # Relationships
    coach:                  Mapped["Coach"] = relationship(back_populates="subscription")
