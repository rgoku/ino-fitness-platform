"""
Seed script — populates the database with demo data matching the Command Center.
Run: python -m scripts.seed
"""
import asyncio
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import text

from app.core.database import async_session, engine, Base
from app.models import (
    User, Coach, Client, ClientRiskFlag, Workout, Exercise,
    WorkoutAssignment, CheckIn, VideoReview, Message, Subscription,
)
from services.auth.service import hash_password, generate_coach_code

# ── Demo password for all accounts ────────────────────────────
PASSWORD = hash_password("demo1234")
NOW = datetime.now(timezone.utc)


def ago(**kw):
    return NOW - timedelta(**kw)


async def seed():
    # Create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # ── Coach ──────────────────────────────────────────
        coach_user = User(
            email="sarah@inocoach.com", password_hash=PASSWORD,
            name="Sarah Miller", role="coach", last_active_at=NOW,
        )
        db.add(coach_user)
        await db.flush()

        coach = Coach(
            user_id=coach_user.id, business_name="SM Coaching",
            plan_tier="pro", client_limit=50,
            coach_code=generate_coach_code(str(coach_user.id)),
            onboarded_at=ago(days=90),
        )
        db.add(coach)
        await db.flush()

        # ── Subscription ──────────────────────────────────
        db.add(Subscription(
            coach_id=coach.id, plan_tier="pro",
            stripe_customer_id=f"cus_{uuid.uuid4().hex[:14]}",
            stripe_subscription_id=f"sub_{uuid.uuid4().hex[:14]}",
            status="active",
            current_period_start=ago(days=15),
            current_period_end=ago(days=-15),
        ))

        # ── Clients ────────────────────────────────────────
        client_data = [
            {"name": "James Wilson",  "email": "james@mail.com",  "status": "active",   "streak": 14, "color": "#818CF8", "compliance": 91},
            {"name": "Emma Davis",    "email": "emma@mail.com",   "status": "active",   "streak": 7,  "color": "#F59E0B", "compliance": 78},
            {"name": "Mike Chen",     "email": "mike@mail.com",   "status": "at_risk",  "streak": 0,  "color": "#F43F5E", "compliance": 42},
            {"name": "Lisa Park",     "email": "lisa@mail.com",   "status": "active",   "streak": 28, "color": "#10B981", "compliance": 96},
            {"name": "Ryan Torres",   "email": "ryan@mail.com",   "status": "active",   "streak": 3,  "color": "#06B6D4", "compliance": 65},
            {"name": "Sarah Kim",     "email": "sarah.k@mail.com","status": "active",   "streak": 12, "color": "#8B5CF6", "compliance": 88},
            {"name": "David Okafor",  "email": "david@mail.com",  "status": "active",   "streak": 1,  "color": "#F59E0B", "compliance": 50},
            {"name": "Anika Patel",   "email": "anika@mail.com",  "status": "active",   "streak": 21, "color": "#10B981", "compliance": 94},
        ]

        client_records = []
        client_users = []
        for cd in client_data:
            u = User(
                email=cd["email"], password_hash=PASSWORD,
                name=cd["name"], role="client",
                last_active_at=ago(hours=2) if cd["streak"] > 0 else ago(days=4),
            )
            db.add(u)
            await db.flush()

            c = Client(
                user_id=u.id, coach_id=coach.id,
                status=cd["status"], streak=cd["streak"],
                goals=["Build muscle", "Improve consistency"],
                start_date=ago(days=60),
                last_active_at=u.last_active_at,
            )
            db.add(c)
            await db.flush()
            client_records.append(c)
            client_users.append(u)

        # ── Risk Flags ─────────────────────────────────────
        # Mike Chen — at risk
        mike = client_records[2]
        for flag_data in [
            ("missed_sessions", "high", "Missed 3 workouts"),
            ("no_checkin", "high", "Overdue check-in"),
            ("weight_trending", "medium", "Weight trending up"),
        ]:
            db.add(ClientRiskFlag(
                client_id=mike.id, type=flag_data[0],
                severity=flag_data[1], message=flag_data[2],
            ))

        # Emma — flags
        emma = client_records[1]
        db.add(ClientRiskFlag(client_id=emma.id, type="high_stress", severity="medium", message="High stress"))
        db.add(ClientRiskFlag(client_id=emma.id, type="low_energy", severity="low", message="Low energy"))

        # Ryan — flag
        ryan = client_records[4]
        db.add(ClientRiskFlag(client_id=ryan.id, type="low_adherence", severity="medium", message="Nutrition adherence low"))

        # David — flags
        david = client_records[6]
        db.add(ClientRiskFlag(client_id=david.id, type="high_soreness", severity="medium", message="High soreness"))
        db.add(ClientRiskFlag(client_id=david.id, type="no_checkin", severity="low", message="Overdue check-in"))

        # ── Workouts + Exercises ───────────────────────────
        programs = [
            ("Hypertrophy A", [
                ("Bench Press", 4, "8-10", 80),
                ("Incline DB Press", 3, "10-12", 30),
                ("Cable Flyes", 3, "12-15", 15),
                ("Lateral Raises", 3, "12-15", 10),
                ("Tricep Pushdowns", 3, "10-12", 25),
            ]),
            ("Fat Loss Phase 2", [
                ("Goblet Squat", 3, "12", 24),
                ("Romanian Deadlift", 3, "10", 50),
                ("Walking Lunges", 3, "12 each", 16),
                ("Plank", 3, "45s", None),
                ("Kettlebell Swings", 3, "15", 20),
            ]),
            ("Strength Block", [
                ("Back Squat", 5, "5", 120),
                ("Deadlift", 5, "3", 160),
                ("Overhead Press", 4, "5", 50),
                ("Barbell Row", 4, "5", 80),
                ("Weighted Pull-ups", 3, "5", 20),
            ]),
            ("Glute Focus", [
                ("Hip Thrust", 4, "10-12", 80),
                ("Bulgarian Split Squat", 3, "10 each", 20),
                ("Cable Kickback", 3, "12 each", 10),
                ("Sumo Deadlift", 3, "8", 60),
                ("Abduction Machine", 3, "15", 40),
            ]),
        ]

        workout_records = []
        for title, exercises in programs:
            w = Workout(coach_id=coach.id, title=title, is_template=True, tags=["demo"])
            db.add(w)
            await db.flush()
            workout_records.append(w)
            for i, (ename, sets, reps, weight) in enumerate(exercises):
                db.add(Exercise(
                    workout_id=w.id, position=i, name=ename,
                    sets=sets, reps=reps, weight=weight,
                ))

        # ── Assignments (last 30 days) ─────────────────────
        for ci, c in enumerate(client_records):
            workout = workout_records[ci % len(workout_records)]
            for day_offset in range(0, 28, 3):  # every 3 days
                scheduled = ago(days=28 - day_offset)
                completed = scheduled if (day_offset / 3) < (client_data[ci]["compliance"] / 100 * 10) else None
                a = WorkoutAssignment(
                    workout_id=workout.id, client_id=c.id,
                    scheduled_date=scheduled,
                    completed_at=completed,
                )
                db.add(a)

        # ── Check-ins ──────────────────────────────────────
        checkin_profiles = [
            {"sleep": 7.5, "stress": 3, "energy": 8, "soreness": 4},  # James
            {"sleep": 6,   "stress": 6, "energy": 5, "soreness": 6},  # Emma
            {"sleep": 5,   "stress": 8, "energy": 3, "soreness": 7},  # Mike
            {"sleep": 8,   "stress": 2, "energy": 9, "soreness": 3},  # Lisa
            {"sleep": 6.5, "stress": 5, "energy": 6, "soreness": 5},  # Ryan
            {"sleep": 7,   "stress": 4, "energy": 7, "soreness": 5},  # Sarah K
            {"sleep": 5.5, "stress": 7, "energy": 4, "soreness": 8},  # David
            {"sleep": 7.5, "stress": 3, "energy": 8, "soreness": 3},  # Anika
        ]

        for ci, c in enumerate(client_records):
            profile = checkin_profiles[ci]
            for day in range(0, 14, 2):
                # Daily readiness
                score = round(((profile["sleep"] / 10) * 0.3 + (profile["energy"] / 10) * 0.3 +
                               ((10 - profile["stress"]) / 10) * 0.2 + ((10 - profile["soreness"]) / 10) * 0.2) * 100)
                db.add(CheckIn(
                    client_id=c.id, coach_id=coach.id, type="daily_readiness",
                    data={**profile, "readiness_score": score},
                    submitted_at=ago(days=day, hours=8),
                    reviewed_at=ago(days=day, hours=6) if day > 0 else None,
                ))

        # ── Messages ───────────────────────────────────────
        message_data = [
            (0, [("client", "Hit a PR on bench today! 100kg x 5 🔥", 2), ("coach", "Let's go! Adding 2.5kg next session.", 1)]),
            (1, [("client", "Can we adjust my macros? Feeling drained.", 5), ("client", "Also sleep has been rough 😔", 5)]),
            (2, [("coach", "Hey Mike — just checking in. Everything alright?", 48)]),
            (3, [("client", "Thanks for the new program! Loving it 💪", 1), ("coach", "Glad to hear it — keep pushing!", 0.75)]),
            (4, [("client", "Skipped meal prep Sunday... back on track today", 24), ("coach", "No worries — consistency > perfection.", 23)]),
            (5, [("client", "Hip thrust felt so much better today!", 3)]),
            (6, [("client", "Legs are destroyed after Monday. Is this normal?", 48)]),
            (7, [("client", "Checked the scale — 69.2! Can't believe it 🥹", 0.5), ("coach", "YOU did that. Let's plan next phase.", 0.25)]),
        ]

        for ci, msgs in message_data:
            client_user = client_users[ci]
            for sender, text_content, hours_ago in msgs:
                sender_id = client_user.id if sender == "client" else coach_user.id
                recipient_id = coach_user.id if sender == "client" else client_user.id
                db.add(Message(
                    sender_id=sender_id, recipient_id=recipient_id,
                    content=text_content,
                    sent_at=ago(hours=hours_ago),
                    read_at=ago(hours=hours_ago - 0.1) if sender == "client" and hours_ago > 1 else None,
                ))

        await db.commit()

    print("✅ Seed complete!")
    print(f"   Coach login: sarah@inocoach.com / demo1234")
    print(f"   Client login: james@mail.com / demo1234 (or any client)")
    print(f"   8 clients, 4 workout templates, 56 assignments, 56 check-ins, 13 messages")


if __name__ == "__main__":
    asyncio.run(seed())
