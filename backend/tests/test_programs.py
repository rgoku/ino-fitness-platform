"""Programs: coach-gated CRUD + ownership scoping."""
from tests.conftest import make_user, auth_headers

PROGRAM = {
    "name": "Push Day A",
    "weeks": 1,
    "days_per_week": 1,
    "exercises": [
        {"name": "Bench Press", "sets": 4, "reps": "8-12", "rest": "90s", "rpe": "8", "muscle_groups": ["Chest"]},
        {"name": "Overhead Press", "sets": 3, "reps": "10", "rest": "60s"},
    ],
}


def test_client_role_cannot_create_program(client, db):
    user = make_user(db, email="client@x.com", role="client")
    r = client.post("/api/v1/programs", json=PROGRAM, headers=auth_headers(user))
    assert r.status_code == 403


def test_coach_program_crud(client, db):
    coach = make_user(db, email="coach@x.com", role="coach")
    h = auth_headers(coach)

    r = client.post("/api/v1/programs", json=PROGRAM, headers=h)
    assert r.status_code == 201, r.text
    pid = r.json()["id"]
    assert r.json()["exercise_count"] == 2
    # lossless range text preserved
    assert r.json()["exercises"][0]["reps"] == "8-12"

    assert client.get("/api/v1/programs", headers=h).json()[0]["id"] == pid
    assert client.get(f"/api/v1/programs/{pid}", headers=h).status_code == 200

    upd = dict(PROGRAM, name="Push Day B")
    assert client.put(f"/api/v1/programs/{pid}", json=upd, headers=h).json()["name"] == "Push Day B"

    assert client.delete(f"/api/v1/programs/{pid}", headers=h).status_code == 204
    assert client.get(f"/api/v1/programs/{pid}", headers=h).status_code == 404


def test_coach_cannot_access_other_coachs_program(client, db):
    c1 = make_user(db, email="c1@x.com", role="coach")
    c2 = make_user(db, email="c2@x.com", role="coach")
    pid = client.post("/api/v1/programs", json=PROGRAM, headers=auth_headers(c1)).json()["id"]
    r = client.get(f"/api/v1/programs/{pid}", headers=auth_headers(c2))
    assert r.status_code in (403, 404)
