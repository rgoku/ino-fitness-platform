"""Auth: register, login, /me, and refresh-token rotation."""
from tests.conftest import make_user, auth_headers


def test_register_then_login_returns_tokens_and_user(client):
    r = client.post("/api/v1/auth/register", json={"email": "a@b.com", "password": "secret123", "name": "Ann"})
    assert r.status_code == 200, r.text

    r = client.post("/api/v1/auth/login", json={"email": "a@b.com", "password": "secret123"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["access_token"] and body["refresh_token"]
    assert body["user"]["email"] == "a@b.com"
    assert body["user"]["role"] == "client"


def test_login_wrong_password_401(client):
    client.post("/api/v1/auth/register", json={"email": "a@b.com", "password": "secret123", "name": "Ann"})
    r = client.post("/api/v1/auth/login", json={"email": "a@b.com", "password": "WRONG"})
    assert r.status_code == 401


def test_duplicate_register_400(client):
    client.post("/api/v1/auth/register", json={"email": "a@b.com", "password": "secret123", "name": "Ann"})
    r = client.post("/api/v1/auth/register", json={"email": "a@b.com", "password": "secret123", "name": "Ann"})
    assert r.status_code == 400


def test_me_requires_and_returns_user(client, db):
    user = make_user(db, email="me@x.com")
    r = client.get("/api/v1/auth/me", headers=auth_headers(user))
    assert r.status_code == 200
    assert r.json()["email"] == "me@x.com"
    # No token -> 401/403
    assert client.get("/api/v1/auth/me").status_code in (401, 403)


def test_refresh_rotates_and_revokes_old(client):
    client.post("/api/v1/auth/register", json={"email": "r@b.com", "password": "secret123", "name": "Ray"})
    login = client.post("/api/v1/auth/login", json={"email": "r@b.com", "password": "secret123"}).json()
    old_refresh = login["refresh_token"]

    r1 = client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert r1.status_code == 200, r1.text
    new_refresh = r1.json()["refresh_token"]
    assert new_refresh and new_refresh != old_refresh

    # Old refresh token must no longer work (rotation revoked it)
    r2 = client.post("/api/v1/auth/refresh", json={"refresh_token": old_refresh})
    assert r2.status_code == 401
    # New one works
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": new_refresh}).status_code == 200


def test_refresh_invalid_token_401(client):
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": "nonsense"}).status_code == 401
