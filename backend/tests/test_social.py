"""Bookings, challenges, leaderboard, and grocery endpoints."""
from datetime import datetime, timedelta

from tests.conftest import make_user, auth_headers
from app.infrastructure.database.models import (
    Challenge, DietPlan, Meal, WorkoutSession,
)


def test_booking_create_list_and_status(client, db):
    user = make_user(db, email="bk@x.com")
    h = auth_headers(user)
    when = (datetime.utcnow() + timedelta(days=1)).isoformat()
    r = client.post("/api/v1/bookings", json={"session_type": "Check-in", "scheduled_at": when, "mode": "video"}, headers=h)
    assert r.status_code == 201, r.text
    bid = r.json()["id"]

    lst = client.get("/api/v1/bookings", headers=h).json()
    assert any(b["id"] == bid for b in lst)

    r2 = client.patch(f"/api/v1/bookings/{bid}/status", json={"status": "confirmed"}, headers=h)
    assert r2.status_code == 200 and r2.json()["status"] == "confirmed"

    # invalid status rejected
    assert client.patch(f"/api/v1/bookings/{bid}/status", json={"status": "bogus"}, headers=h).status_code == 422


def test_challenge_join_and_progress(client, db):
    user = make_user(db, email="ch@x.com")
    h = auth_headers(user)
    ch = Challenge(name="30-Day Push", metric="workouts", goal=30,
                   starts_at=datetime.utcnow() - timedelta(days=1),
                   ends_at=datetime.utcnow() + timedelta(days=20))
    db.add(ch); db.commit(); db.refresh(ch)

    listed = client.get("/api/v1/challenges", headers=h).json()
    mine = next(c for c in listed if c["id"] == ch.id)
    assert mine["status"] == "active" and mine["joined"] is False

    j = client.post(f"/api/v1/challenges/{ch.id}/join", headers=h)
    assert j.status_code == 201 and j.json()["joined"] is True

    p = client.post(f"/api/v1/challenges/{ch.id}/progress", json={"progress": 12}, headers=h)
    assert p.status_code == 200 and p.json()["my_progress"] == 12 and p.json()["my_rank"] == 1


def test_leaderboard_ranks_by_metric(client, db):
    me = make_user(db, email="me@lb.com", role="client")
    other = make_user(db, email="other@lb.com", role="client")
    # give "other" two completed sessions -> higher volume
    for _ in range(2):
        db.add(WorkoutSession(user_id=other.id, date=datetime.utcnow(), is_completed=True))
    db.add(WorkoutSession(user_id=me.id, date=datetime.utcnow(), is_completed=True))
    db.commit()

    res = client.get("/api/v1/social/leaderboard?metric=volume", headers=auth_headers(me)).json()
    assert res["metric"] == "volume"
    entries = res["entries"]
    assert entries[0]["volume"] >= entries[-1]["volume"]
    assert any(e["is_current_user"] and e["name"] == "You" for e in entries)


def test_grocery_list_from_diet_plan(client, db):
    user = make_user(db, email="gr@x.com")
    plan = DietPlan(user_id=user.id, name="Cut", calorie_target=2000, protein_target=180, carb_target=180, fat_target=60)
    db.add(plan); db.commit(); db.refresh(plan)
    db.add(Meal(diet_plan_id=plan.id, name="Lunch", meal_type="lunch", calories=600, protein=50, carbs=60, fat=15,
                ingredients=["Chicken breast", "Rice", "Broccoli"]))
    db.add(Meal(diet_plan_id=plan.id, name="Dinner", meal_type="dinner", calories=700, protein=55, carbs=65, fat=18,
                ingredients=["Salmon", "Rice"]))
    db.commit()

    res = client.get("/api/v1/grocery/list", headers=auth_headers(user)).json()
    cats = {c["id"]: c for c in res["categories"]}
    assert "proteins" in cats and "carbs" in cats
    names = [it["name"] for c in res["categories"] for it in c["items"]]
    assert "Chicken breast" in names and "Rice" in names
    # Rice appears in 2 meals -> quantity x2
    rice = next(it for c in res["categories"] for it in c["items"] if it["name"] == "Rice")
    assert rice["quantity"] == "x2"
