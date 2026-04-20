"""Symmetric field-level encryption for PII / health data.

Uses Fernet (AES-128-CBC + HMAC-SHA256). Key derived from SECRET_KEY.
If FIELD_ENCRYPTION_KEY is set, uses that directly; otherwise derives from SECRET_KEY.

Usage:
    from app.core.encryption import field_encrypt, field_decrypt

    encrypted = field_encrypt("sensitive value")
    original  = field_decrypt(encrypted)
"""
import base64
import hashlib
import logging
import os

logger = logging.getLogger(__name__)

_fernet = None
_available = False

try:
    from cryptography.fernet import Fernet, InvalidToken

    def _get_fernet():
        global _fernet, _available
        if _fernet is not None:
            return _fernet

        raw_key = os.getenv("FIELD_ENCRYPTION_KEY", "")
        if not raw_key:
            # Derive a Fernet-compatible key from SECRET_KEY
            secret = os.getenv("SECRET_KEY", "change-me")
            raw_key = base64.urlsafe_b64encode(
                hashlib.sha256(secret.encode()).digest()
            ).decode()

        _fernet = Fernet(raw_key)
        _available = True
        return _fernet

    def field_encrypt(value: str) -> str:
        """Encrypt a string field. Returns base64-encoded ciphertext."""
        if not value:
            return value
        f = _get_fernet()
        return f.encrypt(value.encode("utf-8")).decode("utf-8")

    def field_decrypt(token: str) -> str:
        """Decrypt a field. Returns plaintext. Falls back to raw value if not encrypted."""
        if not token:
            return token
        try:
            f = _get_fernet()
            return f.decrypt(token.encode("utf-8")).decode("utf-8")
        except (InvalidToken, Exception):
            # Value is not encrypted (legacy data or plain text) — return as-is
            return token

    def is_encryption_available() -> bool:
        try:
            _get_fernet()
            return True
        except Exception:
            return False

except ImportError:
    logger.info("cryptography package not installed — field encryption disabled")

    def field_encrypt(value: str) -> str:
        return value

    def field_decrypt(token: str) -> str:
        return token

    def is_encryption_available() -> bool:
        return False
