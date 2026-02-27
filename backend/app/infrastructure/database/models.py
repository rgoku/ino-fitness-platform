"""SQLAlchemy models."""
from sqlalchemy import Column, Index, String, Integer, Float, DateTime, Boolean, ForeignKey, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    workout_plans = relationship("WorkoutPlan", back_populates="user")
    diet_plans = relationship("DietPlan", back_populates="user")
    progress_entries = relationship("ProgressEntry", back_populates="user")
    messages = relationship("Message", back_populates="user")


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
