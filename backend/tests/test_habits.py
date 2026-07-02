"""Habits: log, today summary, history, validation."""
from tests.conftest import make_user, auth_headers


def test_log_and_today(client, db):
    user = make_user(db, email="h@x.com")
    h = auth_headers(user)

    r = client.post("/api/v1/habits", json={"habit_type": "water", "value": 6, "target": 8, "unit": "glasses"}, headers=h)
    assert r.status_code == 200, r.text
    assert r.json()["habit_type"] == "water"

    today = client.get("/api/v1/habits/today", headers=h)
    assert today.status_code == 200
    assert any(x["habit_type"] == "water" for x in today.json()["habits"])


def test_log_upserts_same_day(client, db):
    user = make_user(db, email="h2@x.com")
    h = auth_headers(user)
    client.post("/api/v1/habits", json={"habit_type": "steps", "value": 5000}, headers=h)
    client.post("/api/v1/habits", json={"habit_type": "steps", "value": 9000}, headers=h)
    rows = [x for x in client.get("/api/v1/habits/today", headers=h).json()["habits"] if x["habit_type"] == "steps"]
    assert len(rows) == 1 and rows[0]["value"] == 9000


def test_invalid_habit_type_422(client, db):
    user = make_user(db, email="h3@x.com")
    r = client.post("/api/v1/habits", json={"habit_type": "smoking", "value": 1}, headers=auth_headers(user))
    assert r.status_code == 422


def test_history_returns_logged(client, db):
    user = make_user(db, email="h4@x.com")
    h = auth_headers(user)
    client.post("/api/v1/habits", json={"habit_type": "sleep", "value": 7, "unit": "hours"}, headers=h)
    hist = client.get("/api/v1/habits/history?days=7", headers=h)
    assert hist.status_code == 200
    assert any(x["habit_type"] == "sleep" for x in hist.json())
