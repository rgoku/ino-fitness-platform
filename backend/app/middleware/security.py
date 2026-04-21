"""
INÖ Security Middleware — Enterprise-grade hardening layer.
Drop-in middleware stack for FastAPI.

Covers: secure headers, input sanitization, request logging,
IP blocking, CORS hardening, file upload validation.
"""
import os
import re
import time
import hashlib
import logging
from typing import Set
from collections import defaultdict

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("ino.security")

# ─── Blocked IP store (in-memory, use Redis in prod) ─────────────────────────

_blocked_ips: Set[str] = set()
_failed_logins: dict[str, list[float]] = defaultdict(list)

MAX_FAILED_LOGINS = 5
BLOCK_DURATION_SECONDS = 900  # 15 min
SUSPICIOUS_PATTERNS = [
    re.compile(r"(union\s+select|drop\s+table|insert\s+into|delete\s+from)", re.I),
    re.compile(r"(<script|javascript:|on\w+=)", re.I),
    re.compile(r"(\.\./|\.\.\\)", re.I),
    re.compile(r"(;|\||`|\$\()", re.I),
]


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "0.0.0.0"


def is_suspicious_input(value: str) -> bool:
    for pattern in SUSPICIOUS_PATTERNS:
        if pattern.search(value):
            return True
    return False


def record_failed_login(ip: str):
    now = time.time()
    _failed_logins[ip] = [t for t in _failed_logins[ip] if now - t < BLOCK_DURATION_SECONDS]
    _failed_logins[ip].append(now)
    if len(_failed_logins[ip]) >= MAX_FAILED_LOGINS:
        _blocked_ips.add(ip)
        logger.warning("IP blocked due to %d failed logins: %s", MAX_FAILED_LOGINS, ip)


def unblock_ip(ip: str):
    _blocked_ips.discard(ip)
    _failed_logins.pop(ip, None)


# ─── Secure Headers Middleware ────────────────────────────────────────────────

class SecureHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://fonts.gstatic.com; "
            "connect-src 'self' https://api.stripe.com https://eutils.ncbi.nlm.nih.gov"
        )
        # MutableHeaders doesn't support .pop() — use del with try/except
        for h in ("Server", "X-Powered-By"):
            try:
                del response.headers[h]
            except KeyError:
                pass
        return response


# ─── IP Blocking + Brute Force Protection ─────────────────────────────────────

class IPBlockingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ip = get_client_ip(request)

        if ip in _blocked_ips:
            # Check if block expired
            now = time.time()
            attempts = _failed_logins.get(ip, [])
            if attempts and now - attempts[-1] > BLOCK_DURATION_SECONDS:
                unblock_ip(ip)
            else:
                logger.warning("Blocked request from %s to %s", ip, request.url.path)
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many failed attempts. Try again later."},
                )

        response = await call_next(request)

        # Track failed auth attempts
        if request.url.path.endswith("/login") and response.status_code == 401:
            record_failed_login(ip)

        return response


# ─── Input Sanitization Middleware ────────────────────────────────────────────

class InputSanitizationMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Check query params
        for key, value in request.query_params.items():
            if is_suspicious_input(value):
                logger.warning("Blocked suspicious query param: %s=%s from %s", key, value[:50], get_client_ip(request))
                return JSONResponse(status_code=400, content={"detail": "Invalid input detected."})

        # Check path
        if is_suspicious_input(request.url.path):
            logger.warning("Blocked suspicious path: %s from %s", request.url.path, get_client_ip(request))
            return JSONResponse(status_code=400, content={"detail": "Invalid request."})

        return await call_next(request)


# ─── Request Logging Middleware ───────────────────────────────────────────────

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        ip = get_client_ip(request)

        response = await call_next(request)

        duration = round((time.time() - start) * 1000, 1)
        logger.info(
            "%s %s %s %dms %s",
            request.method,
            request.url.path,
            response.status_code,
            duration,
            ip,
        )

        # Flag slow requests
        if duration > 5000:
            logger.warning("Slow request: %s %s took %dms", request.method, request.url.path, duration)

        return response


# ─── File Upload Validator ────────────────────────────────────────────────────

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "video/mp4", "video/quicktime", "video/webm",
    "application/pdf",
}

MAGIC_BYTES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG": "image/png",
    b"RIFF": "image/webp",
    b"GIF8": "image/gif",
    b"\x00\x00\x00\x18ftyp": "video/mp4",
    b"\x00\x00\x00\x20ftyp": "video/mp4",
    b"%PDF": "application/pdf",
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def validate_file_upload(content: bytes, filename: str, declared_mime: str) -> tuple[bool, str]:
    """Validate file upload: size, mime, magic bytes, extension."""
    if len(content) > MAX_FILE_SIZE:
        return False, f"File too large ({len(content) // 1024 // 1024}MB > 50MB limit)"

    if declared_mime not in ALLOWED_MIME_TYPES:
        return False, f"File type not allowed: {declared_mime}"

    # Magic byte check
    detected = None
    for magic, mime in MAGIC_BYTES.items():
        if content[:len(magic)] == magic:
            detected = mime
            break

    if detected and detected != declared_mime:
        return False, f"File content doesn't match declared type (declared={declared_mime}, detected={detected})"

    # Extension check
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    safe_extensions = {"jpg", "jpeg", "png", "webp", "gif", "mp4", "mov", "webm", "pdf"}
    if ext not in safe_extensions:
        return False, f"File extension not allowed: .{ext}"

    # Check for embedded scripts
    header = content[:1024].decode("utf-8", errors="ignore").lower()
    if "<script" in header or "javascript:" in header:
        return False, "File contains embedded scripts"

    return True, "OK"


def generate_safe_filename(original: str) -> str:
    """Generate a UUID-based safe filename."""
    import uuid
    ext = original.rsplit(".", 1)[-1].lower() if "." in original else "bin"
    return f"{uuid.uuid4().hex}.{ext}"


# ─── AI Endpoint Protection ──────────────────────────────────────────────────

AI_DAILY_LIMITS = {
    "free": 5,
    "starter": 20,
    "pro": 100,
    "scale": 500,
}

_ai_usage: dict[str, list[float]] = defaultdict(list)


def check_ai_quota(user_id: str, tier: str = "free") -> tuple[bool, str]:
    """Check if user has remaining AI quota for today."""
    now = time.time()
    day_start = now - 86400
    _ai_usage[user_id] = [t for t in _ai_usage[user_id] if t > day_start]
    limit = AI_DAILY_LIMITS.get(tier, 5)
    used = len(_ai_usage[user_id])
    if used >= limit:
        return False, f"AI quota exceeded ({used}/{limit}). Upgrade for more."
    return True, f"{used}/{limit} used"


def record_ai_usage(user_id: str):
    _ai_usage[user_id].append(time.time())


def sanitize_ai_prompt(prompt: str) -> str:
    """Strip injection attempts from AI prompts."""
    dangerous = [
        "ignore previous instructions",
        "ignore all instructions",
        "system prompt",
        "you are now",
        "pretend you are",
        "reveal your",
        "show me your prompt",
    ]
    cleaned = prompt
    for pattern in dangerous:
        cleaned = re.sub(re.escape(pattern), "[FILTERED]", cleaned, flags=re.IGNORECASE)
    return cleaned[:4000]  # Hard limit on prompt length
