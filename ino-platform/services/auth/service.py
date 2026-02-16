"""
INÖ Auth Service
Handles password hashing, coach code generation, and token management.
Designed to be imported by the API service.
"""
import hashlib
import secrets
from datetime import datetime, timezone


def hash_password(password: str) -> str:
    """Argon2id hashing (use argon2-cffi in production)."""
    # Placeholder: use bcrypt/argon2 in real deployment
    salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100_000)
    return f"{salt}${hashed.hex()}"


def verify_password(password: str, stored: str) -> bool:
    salt, hashed = stored.split('$')
    check = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100_000)
    return check.hex() == hashed


def generate_coach_code(coach_id: str) -> str:
    """Generate a 6-char alphanumeric code for client onboarding.
    Clients enter this code in the app to connect with their coach."""
    return secrets.token_urlsafe(4).upper()[:6]


def generate_invite_token() -> str:
    """Generate a one-time invite token for email-based client onboarding."""
    return secrets.token_urlsafe(32)
