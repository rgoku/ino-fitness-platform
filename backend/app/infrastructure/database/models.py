"""SQLAlchemy models."""
from sqlalchemy import Column, Index, String, Integer, Float, DateTime, Date, Boolean, ForeignKey, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, date
import uuid

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    profile_picture_url = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    fitness_goal = Column(String, nullable=True)
    experience_level = Column(String, default="beginner")
    subscription_tier = Column(String, default="free")
    has_onboarded = Column(Boolean, default=False)
    biometrics_enabled = Column(Boolean, default=False)
    # Role-based access control: 'client' (default) or 'coach'.
    # Coaches see analytics + can generate plans for clients; clients only consume.
    role = Column(String, default="client", index=True, nullable=False)
    # If role == 'client', which coach owns this client (FK to users.id).
    coach_id = Column(String, ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workout_plans = relationship("WorkoutPlan", back_populates="user")
    diet_plans = relationship("DietPlan", back_populates="user")
    progress_entries = relationship("ProgressEntry", back_populates="user")
    messages = relationship("Message", back_populates="user")
    # Coach's own clients (self-referential one-to-many)
    clients = relationship("User", remote_side="User.coach_id", overlaps="coach")
    coach = relationship("User", remote_side="User.id", overlaps="clients", foreign_keys=[coach_id])


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    name = Column(String)
    description = Column(Text)
    difficulty = Column(String)
    duration = Column(Integer)
    focus_areas = Column(JSON)
    generated_by = Column(String, default="ai")
    coach_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="workout_plans")
    exercises = relationship("Exercise", back_populates="workout_plan")
    sessions = relationship("WorkoutSession", back_populates="workout_plan")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workout_plan_id = Column(String, ForeignKey("workout_plans.id"), nullable=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    muscle_groups = Column(JSON)
    equipment = Column(JSON)
    instructions = Column(JSON)
    video_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    sets = Column(Integer, default=3)
    reps = Column(Integer, default=10)
    rest_seconds = Column(Integer, default=60)
    created_at = Column(DateTime, default=datetime.utcnow)

    workout_plan = relationship("WorkoutPlan", back_populates="exercises")


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workout_plan_id = Column(String, ForeignKey("workout_plans.id"), index=True)
    user_id = Column(String, ForeignKey("users.id"), index=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    duration = Column(Integer)
    calories_burned = Column(Float, default=0)
    is_completed = Column(Boolean, default=False)
    session_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    workout_plan = relationship("WorkoutPlan", back_populates="sessions")

    __table_args__ = (
        Index("ix_workout_sessions_user_date", "user_id", "date"),
    )


class DietPlan(Base):
    __tablename__ = "diet_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    name = Column(String)
    description = Column(Text)
    calorie_target = Column(Float)
    protein_target = Column(Float)
    carb_target = Column(Float)
    fat_target = Column(Float)
    generated_by = Column(String, default="ai")
    coach_id = Column(String, nullable=True)
    scientific_basis = Column(Text, nullable=True)
    evidence_level = Column(String, default="moderate")
    research_citations = Column(JSON, nullable=True)
    research_verified = Column(Boolean, default=True)
    supplement_recommendations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="diet_plans")
    meals = relationship("Meal", back_populates="diet_plan")


class Meal(Base):
    __tablename__ = "meals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    diet_plan_id = Column(String, ForeignKey("diet_plans.id"), index=True)
    name = Column(String)
    meal_type = Column(String)
    calories = Column(Float)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
    ingredients = Column(JSON)
    instructions = Column(JSON)
    image_url = Column(String, nullable=True)
    nutritional_benefits = Column(Text, nullable=True)
    research_backed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    diet_plan = relationship("DietPlan", back_populates="meals")


class FoodEntry(Base):
    __tablename__ = "food_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    food_name = Column(String)
    meal_type = Column(String)
    calories = Column(Float)
    protein = Column(Float)
    carbs = Column(Float)
    fat = Column(Float)
    quantity = Column(Float)
    unit = Column(String)
    image_url = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    date = Column(DateTime, default=datetime.utcnow, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ProgressEntry(Base):
    __tablename__ = "progress_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    date = Column(DateTime, default=datetime.utcnow)
    weight = Column(Float, nullable=True)
    body_fat = Column(Float, nullable=True)
    muscle_mass = Column(Float, nullable=True)
    measurements = Column(JSON, nullable=True)
    photos = Column(JSON, nullable=True)
    mood = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress_entries")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    coach_id = Column(String, nullable=True)
    sender_type = Column(String)
    content = Column(Text)
    message_type = Column(String, default="text")
    read = Column(Boolean, default=False)
    attachments = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="messages")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    title = Column(String)
    message = Column(Text)
    remind_at = Column(DateTime, nullable=False)
    repeat = Column(String, nullable=True)
    channel = Column(String, default="in-app")
    sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class Coach(Base):
    __tablename__ = "coaches"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    name = Column(String)
    bio = Column(Text)
    specialties = Column(JSON)
    photo_url = Column(String, nullable=True)
    clients = Column(JSON, default=[])
    rating = Column(Float, default=0)
    hourly_rate = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    title = Column(String)
    description = Column(Text)
    icon = Column(String)
    progress = Column(Integer, default=0)
    target = Column(Integer, default=100)
    unlocked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True)
    plan_type = Column(String)
    status = Column(String, default="active")
    stripe_subscription_id = Column(String, nullable=True)
    current_period_end = Column(DateTime)
    cancel_at_period_end = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class BodyAnalysisSession(Base):
    """A single body analysis session (weekly snapshot)."""
    __tablename__ = "body_analysis_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    week_number = Column(Integer)  # ISO week number
    year = Column(Integer)
    total_volume = Column(Float, default=0)
    symmetry_score = Column(Float, nullable=True)
    imbalance_score = Column(Float, nullable=True)
    training_readiness = Column(Float, nullable=True)
    overall_grade = Column(String, nullable=True)  # A/B/C/D/F
    ai_summary = Column(Text, nullable=True)
    muscle_data = Column(JSON, nullable=True)  # Full per-muscle breakdown
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="body_analysis_sessions")


class MuscleSnapshot(Base):
    """Per-muscle data point within an analysis session."""
    __tablename__ = "muscle_snapshots"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("body_analysis_sessions.id"), index=True)
    muscle_slug = Column(String, index=True)  # e.g. 'chest', 'quadriceps'
    weekly_volume = Column(Float, default=0)
    recovery_status = Column(String, nullable=True)  # recovered/recovering/fatigued/overtrained
    recovery_readiness = Column(Float, nullable=True)  # 0-1
    growth_phase = Column(String, nullable=True)  # detraining/maintenance/hypertrophy/overreaching/peak
    trend_direction = Column(String, nullable=True)  # declining/stable/progressing/accelerating
    imbalance_status = Column(String, nullable=True)  # balanced/mild/severe
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("BodyAnalysisSession", backref="muscle_snapshots")


class FormAnalysisResult(Base):
    """Results from AI exercise form analysis."""
    __tablename__ = "form_analysis_results"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True)
    exercise_name = Column(String)
    overall_score = Column(Float)  # 0-100
    rep_count = Column(Integer, nullable=True)
    form_issues = Column(JSON, nullable=True)  # List of detected issues
    recommendations = Column(JSON, nullable=True)  # List of improvement suggestions
    landmarks_data = Column(JSON, nullable=True)  # Raw pose data for replay
    video_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", backref="form_analysis_results")


# ---------------------------------------------------------------------------
# Workout Builder / Templates / Programs
# ---------------------------------------------------------------------------


class ExerciseDefinition(Base):
    """Canonical exercise catalog entry used by the workout builder."""
    __tablename__ = "exercise_definitions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, index=True, nullable=False)
    muscle_group = Column(String, index=True, default="general")
    secondary_muscles = Column(JSON, nullable=True)  # List[str]
    description = Column(Text, nullable=True)
    cues = Column(JSON, nullable=True)  # List[str]
    common_mistakes = Column(JSON, nullable=True)  # List[str]
    equipment = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    difficulty = Column(String, default="intermediate")
    created_at = Column(DateTime, default=datetime.utcnow)


class WorkoutTemplate(Base):
    """A reusable workout program template authored by a trainer."""
    __tablename__ = "workout_templates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    weeks = Column(Integer, default=1)
    days_per_week = Column(Integer, default=1)
    thumbnail_url = Column(String, nullable=True)
    is_public = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    exercises = relationship(
        "TemplateExercise",
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="TemplateExercise.order_index",
    )


class TemplateExercise(Base):
    """An exercise row inside a WorkoutTemplate (ordered for drag-and-drop)."""
    __tablename__ = "template_exercises"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id = Column(String, ForeignKey("workout_templates.id"), index=True, nullable=False)
    exercise_name = Column(String, nullable=False)
    sets = Column(Integer, default=3)
    reps = Column(Integer, default=10)
    rest_seconds = Column(Integer, default=60)
    # Free-text variants for ranges the coach types in the builder
    # (e.g. reps "8-12", rest "90s", rpe "8"). Integer columns above hold the
    # best-effort parsed value for structured consumers.
    reps_text = Column(String, nullable=True)
    rest_text = Column(String, nullable=True)
    rpe = Column(String, nullable=True)
    muscle_groups = Column(JSON, nullable=True)  # List[str]
    notes = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    template = relationship("WorkoutTemplate", back_populates="exercises")


class Workout(Base):
    """A concrete workout assigned to a client (materialized from a template)."""
    __tablename__ = "workouts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    trainer_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    name = Column(String, nullable=False)
    week = Column(Integer, default=1)
    day = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    exercises = relationship(
        "WorkoutExercise",
        back_populates="workout",
        cascade="all, delete-orphan",
        order_by="WorkoutExercise.order_index",
    )

    __table_args__ = (
        Index("ix_workouts_client_week_day", "client_id", "week", "day"),
    )


class WorkoutExercise(Base):
    """An exercise row inside an assigned client Workout."""
    __tablename__ = "workout_exercises"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workout_id = Column(String, ForeignKey("workouts.id"), index=True, nullable=False)
    exercise_name = Column(String, nullable=False)
    sets = Column(Integer, default=3)
    reps = Column(Integer, default=10)
    rpe = Column(Float, nullable=True)
    rest = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workout = relationship("Workout", back_populates="exercises")


class HabitLog(Base):
    """Daily habit tracking entry (water, sleep, steps, custom)."""
    __tablename__ = "habit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    date = Column(Date, index=True, default=date.today)
    habit_type = Column(String, index=True, nullable=False)
    value = Column(Float, default=0)
    target = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_habit_logs_user_date_type", "user_id", "date", "habit_type"),
    )


class RefreshToken(Base):
    """Durable, rotating refresh token (opaque, stored hashed). Replaces the
    previous in-memory store so sessions survive restarts and work across
    multiple worker processes."""
    __tablename__ = "refresh_tokens"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    token_hash = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------------------------------------------------------------------------
# Social / scheduling: bookings + challenges
# ---------------------------------------------------------------------------


class Booking(Base):
    """A scheduled session between a client and a coach."""
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    coach_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    session_type = Column(String, nullable=False)
    scheduled_at = Column(DateTime, index=True, nullable=False)
    duration_min = Column(Integer, default=30)
    mode = Column(String, default="video")  # video | in-person
    status = Column(String, default="pending", index=True)  # pending | confirmed | cancelled | completed
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Challenge(Base):
    """A time-bound fitness challenge users can join."""
    __tablename__ = "challenges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    metric = Column(String, default="workouts")  # workouts | steps | volume | streak
    goal = Column(Float, nullable=True)
    entry_fee = Column(String, nullable=True)
    prize_pool = Column(String, nullable=True)
    starts_at = Column(DateTime, index=True, nullable=True)
    ends_at = Column(DateTime, index=True, nullable=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    participants = relationship(
        "ChallengeParticipant",
        back_populates="challenge",
        cascade="all, delete-orphan",
    )


class ChallengeParticipant(Base):
    """A user's participation + progress in a challenge."""
    __tablename__ = "challenge_participants"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    challenge_id = Column(String, ForeignKey("challenges.id"), index=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    progress = Column(Float, default=0)
    joined_at = Column(DateTime, default=datetime.utcnow)

    challenge = relationship("Challenge", back_populates="participants")

    __table_args__ = (
        Index("ix_challenge_participants_unique", "challenge_id", "user_id", unique=True),
    )
