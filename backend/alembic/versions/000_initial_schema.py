"""Initial schema migration — creates all 14 core models.

Revision ID: 000_initial_schema
Revises:
Create Date: 2025-11-20 00:00:00.000000

Tables created (14 total):
  1. users
  2. coaches
  3. workout_plans
  4. exercises
  5. workout_sessions
  6. diet_plans
  7. meals
  8. food_entries
  9. progress_entries
 10. messages
 11. reminders
 12. achievements
 13. subscriptions

Note: `supplement_recommendations` on diet_plans and the reminders table were
previously introduced by `001_add_reminders_and_supplements`. This baseline
migration now owns them so that a clean database can be initialized from a
single starting point.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "000_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # -----------------------------------------------------------------------
    # users
    # -----------------------------------------------------------------------
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("profile_picture_url", sa.String(), nullable=True),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("gender", sa.String(), nullable=True),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.Column("height", sa.Float(), nullable=True),
        sa.Column("fitness_goal", sa.String(), nullable=True),
        sa.Column("experience_level", sa.String(), nullable=True, server_default="beginner"),
        sa.Column("subscription_tier", sa.String(), nullable=True, server_default="free"),
        sa.Column("has_onboarded", sa.Boolean(), nullable=True, server_default=sa.text("false")),
        sa.Column("biometrics_enabled", sa.Boolean(), nullable=True, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # -----------------------------------------------------------------------
    # coaches
    # -----------------------------------------------------------------------
    op.create_table(
        "coaches",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("specialties", sa.JSON(), nullable=True),
        sa.Column("photo_url", sa.String(), nullable=True),
        sa.Column("clients", sa.JSON(), nullable=True),
        sa.Column("rating", sa.Float(), nullable=True, server_default="0"),
        sa.Column("hourly_rate", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_coaches_user_id", "coaches", ["user_id"])

    # -----------------------------------------------------------------------
    # workout_plans
    # -----------------------------------------------------------------------
    op.create_table(
        "workout_plans",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("difficulty", sa.String(), nullable=True),
        sa.Column("duration", sa.Integer(), nullable=True),
        sa.Column("focus_areas", sa.JSON(), nullable=True),
        sa.Column("generated_by", sa.String(), nullable=True, server_default="ai"),
        sa.Column("coach_id", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workout_plans_user_id", "workout_plans", ["user_id"])

    # -----------------------------------------------------------------------
    # exercises
    # -----------------------------------------------------------------------
    op.create_table(
        "exercises",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("workout_plan_id", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("muscle_groups", sa.JSON(), nullable=True),
        sa.Column("equipment", sa.JSON(), nullable=True),
        sa.Column("instructions", sa.JSON(), nullable=True),
        sa.Column("video_url", sa.String(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("sets", sa.Integer(), nullable=True, server_default="3"),
        sa.Column("reps", sa.Integer(), nullable=True, server_default="10"),
        sa.Column("rest_seconds", sa.Integer(), nullable=True, server_default="60"),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["workout_plan_id"], ["workout_plans.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_exercises_name", "exercises", ["name"])
    op.create_index("ix_exercises_workout_plan_id", "exercises", ["workout_plan_id"])

    # -----------------------------------------------------------------------
    # workout_sessions
    # -----------------------------------------------------------------------
    op.create_table(
        "workout_sessions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("workout_plan_id", sa.String(), nullable=True),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("date", sa.DateTime(), nullable=True),
        sa.Column("duration", sa.Integer(), nullable=True),
        sa.Column("calories_burned", sa.Float(), nullable=True, server_default="0"),
        sa.Column("is_completed", sa.Boolean(), nullable=True, server_default=sa.text("false")),
        sa.Column("session_data", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["workout_plan_id"], ["workout_plans.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_workout_sessions_workout_plan_id", "workout_sessions", ["workout_plan_id"])
    op.create_index("ix_workout_sessions_user_id", "workout_sessions", ["user_id"])
    op.create_index("ix_workout_sessions_date", "workout_sessions", ["date"])
    op.create_index("ix_workout_sessions_user_date", "workout_sessions", ["user_id", "date"])

    # -----------------------------------------------------------------------
    # diet_plans (includes supplement_recommendations)
    # -----------------------------------------------------------------------
    op.create_table(
        "diet_plans",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("calorie_target", sa.Float(), nullable=True),
        sa.Column("protein_target", sa.Float(), nullable=True),
        sa.Column("carb_target", sa.Float(), nullable=True),
        sa.Column("fat_target", sa.Float(), nullable=True),
        sa.Column("generated_by", sa.String(), nullable=True, server_default="ai"),
        sa.Column("coach_id", sa.String(), nullable=True),
        sa.Column("scientific_basis", sa.Text(), nullable=True),
        sa.Column("evidence_level", sa.String(), nullable=True, server_default="moderate"),
        sa.Column("research_citations", sa.JSON(), nullable=True),
        sa.Column("research_verified", sa.Boolean(), nullable=True, server_default=sa.text("true")),
        sa.Column("supplement_recommendations", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_diet_plans_user_id", "diet_plans", ["user_id"])

    # -----------------------------------------------------------------------
    # meals
    # -----------------------------------------------------------------------
    op.create_table(
        "meals",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("diet_plan_id", sa.String(), nullable=True),
        sa.Column("name", sa.String(), nullable=True),
        sa.Column("meal_type", sa.String(), nullable=True),
        sa.Column("calories", sa.Float(), nullable=True),
        sa.Column("protein", sa.Float(), nullable=True),
        sa.Column("carbs", sa.Float(), nullable=True),
        sa.Column("fat", sa.Float(), nullable=True),
        sa.Column("ingredients", sa.JSON(), nullable=True),
        sa.Column("instructions", sa.JSON(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("nutritional_benefits", sa.Text(), nullable=True),
        sa.Column("research_backed", sa.Boolean(), nullable=True, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["diet_plan_id"], ["diet_plans.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_meals_diet_plan_id", "meals", ["diet_plan_id"])

    # -----------------------------------------------------------------------
    # food_entries
    # -----------------------------------------------------------------------
    op.create_table(
        "food_entries",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("food_name", sa.String(), nullable=True),
        sa.Column("meal_type", sa.String(), nullable=True),
        sa.Column("calories", sa.Float(), nullable=True),
        sa.Column("protein", sa.Float(), nullable=True),
        sa.Column("carbs", sa.Float(), nullable=True),
        sa.Column("fat", sa.Float(), nullable=True),
        sa.Column("quantity", sa.Float(), nullable=True),
        sa.Column("unit", sa.String(), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("date", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_food_entries_user_id", "food_entries", ["user_id"])
    op.create_index("ix_food_entries_date", "food_entries", ["date"])

    # -----------------------------------------------------------------------
    # progress_entries
    # -----------------------------------------------------------------------
    op.create_table(
        "progress_entries",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("date", sa.DateTime(), nullable=True),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.Column("body_fat", sa.Float(), nullable=True),
        sa.Column("muscle_mass", sa.Float(), nullable=True),
        sa.Column("measurements", sa.JSON(), nullable=True),
        sa.Column("photos", sa.JSON(), nullable=True),
        sa.Column("mood", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_progress_entries_user_id", "progress_entries", ["user_id"])

    # -----------------------------------------------------------------------
    # messages
    # -----------------------------------------------------------------------
    op.create_table(
        "messages",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("coach_id", sa.String(), nullable=True),
        sa.Column("sender_type", sa.String(), nullable=True),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("message_type", sa.String(), nullable=True, server_default="text"),
        sa.Column("read", sa.Boolean(), nullable=True, server_default=sa.text("false")),
        sa.Column("attachments", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # -----------------------------------------------------------------------
    # reminders
    # -----------------------------------------------------------------------
    op.create_table(
        "reminders",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("remind_at", sa.DateTime(), nullable=False),
        sa.Column("repeat", sa.String(), nullable=True),
        sa.Column("channel", sa.String(), nullable=True, server_default="in-app"),
        sa.Column("sent", sa.Boolean(), nullable=True, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reminders_user_id", "reminders", ["user_id"])

    # -----------------------------------------------------------------------
    # achievements
    # -----------------------------------------------------------------------
    op.create_table(
        "achievements",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("title", sa.String(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("icon", sa.String(), nullable=True),
        sa.Column("progress", sa.Integer(), nullable=True, server_default="0"),
        sa.Column("target", sa.Integer(), nullable=True, server_default="100"),
        sa.Column("unlocked_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_achievements_user_id", "achievements", ["user_id"])

    # -----------------------------------------------------------------------
    # subscriptions
    # -----------------------------------------------------------------------
    op.create_table(
        "subscriptions",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("plan_type", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=True, server_default="active"),
        sa.Column("stripe_subscription_id", sa.String(), nullable=True),
        sa.Column("current_period_end", sa.DateTime(), nullable=True),
        sa.Column("cancel_at_period_end", sa.Boolean(), nullable=True, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )


def downgrade() -> None:
    op.drop_table("subscriptions")
    op.drop_index("ix_achievements_user_id", table_name="achievements")
    op.drop_table("achievements")
    op.drop_index("ix_reminders_user_id", table_name="reminders")
    op.drop_table("reminders")
    op.drop_table("messages")
    op.drop_index("ix_progress_entries_user_id", table_name="progress_entries")
    op.drop_table("progress_entries")
    op.drop_index("ix_food_entries_date", table_name="food_entries")
    op.drop_index("ix_food_entries_user_id", table_name="food_entries")
    op.drop_table("food_entries")
    op.drop_index("ix_meals_diet_plan_id", table_name="meals")
    op.drop_table("meals")
    op.drop_index("ix_diet_plans_user_id", table_name="diet_plans")
    op.drop_table("diet_plans")
    op.drop_index("ix_workout_sessions_user_date", table_name="workout_sessions")
    op.drop_index("ix_workout_sessions_date", table_name="workout_sessions")
    op.drop_index("ix_workout_sessions_user_id", table_name="workout_sessions")
    op.drop_index("ix_workout_sessions_workout_plan_id", table_name="workout_sessions")
    op.drop_table("workout_sessions")
    op.drop_index("ix_exercises_workout_plan_id", table_name="exercises")
    op.drop_index("ix_exercises_name", table_name="exercises")
    op.drop_table("exercises")
    op.drop_index("ix_workout_plans_user_id", table_name="workout_plans")
    op.drop_table("workout_plans")
    op.drop_index("ix_coaches_user_id", table_name="coaches")
    op.drop_table("coaches")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
