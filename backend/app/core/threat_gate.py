"""In-memory threat detection, IP blocking, and anomaly tracking.

Works WITHOUT Redis — uses process-local counters with TTL-based expiry.
This is the last line of defense when Redis is down.

Tracks:
- Failed logins per IP → auto-block after threshold
- AI requests per user → hard cap even without Redis budget
- Upload requests per user → spam detection
- Signup per IP → mass-registration detection
"""
import logging
import threading
import time
from collections import defaultdict
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Thresholds
# ---------------------------------------------------------------------------
FAILED_LOGIN_BLOCK_THRESHOLD = 5    # block IP after N failed logins (matches rate limit window)
FAILED_LOGIN_WINDOW_SEC = 300       # within 5 minutes
BLOCK_DURATION_SEC = 900            # 15-minute ban

AI_HARD_CAP_PER_USER = 60          # absolute max AI calls per user per hour (no-Redis fallback)
AI_BURST_THRESHOLD = 20             # flag if >20 in 1 minute
AI_WINDOW_SEC = 3600

UPLOAD_CAP_PER_USER = 30            # max uploads per user per hour
UPLOAD_WINDOW_SEC = 3600

SIGNUP_PER_IP_THRESHOLD = 5         # max signups per IP per hour
SIGNUP_WINDOW_SEC = 3600


class _SlidingCounter:
    """Thread-safe sliding window counter with auto-cleanup."""

    def __init__(self, window_sec: int):
        self._window = window_sec
        self._lock = threading.Lock()
        self._buckets: dict[str, list[float]] = defaultdict(list)
        self._last_cleanup = time.monotonic()

    def increment(self, key: str) -> int:
        now = time.monotonic()
        with self._lock:
            # Periodic cleanup (every 60s)
            if now - self._last_cleanup > 60:
                self._cleanup(now)
                self._last_cleanup = now
            self._buckets[key].append(now)
            cutoff = now - self._window
            self._buckets[key] = [t for t in self._buckets[key] if t > cutoff]
            return len(self._buckets[key])

    def count(self, key: str) -> int:
        now = time.monotonic()
        with self._lock:
            cutoff = now - self._window
            self._buckets[key] = [t for t in self._buckets[key] if t > cutoff]
            return len(self._buckets[key])

    def _cleanup(self, now: float) -> None:
        cutoff = now - self._window
        dead = [k for k, ts in self._buckets.items() if not ts or ts[-1] < cutoff]
        for k in dead:
            del self._buckets[k]


class ThreatGate:
    """Centralized threat tracking. Single instance per process."""

    def __init__(self):
        self._failed_logins = _SlidingCounter(FAILED_LOGIN_WINDOW_SEC)
        self._ai_calls = _SlidingCounter(AI_WINDOW_SEC)
        self._ai_burst = _SlidingCounter(60)  # 1-minute burst window
        self._uploads = _SlidingCounter(UPLOAD_WINDOW_SEC)
        self._signups = _SlidingCounter(SIGNUP_WINDOW_SEC)
        self._blocked_ips: dict[str, float] = {}  # ip -> unblock_at (monotonic)
        self._lock = threading.Lock()

    # ── IP Blocking ──────────────────────────────────────────────

    def is_blocked(self, ip: str) -> bool:
        with self._lock:
            unblock_at = self._blocked_ips.get(ip)
            if unblock_at is None:
                return False
            if time.monotonic() > unblock_at:
                del self._blocked_ips[ip]
                return False
            return True

    def block_ip(self, ip: str, duration_sec: int = BLOCK_DURATION_SEC, reason: str = "") -> None:
        with self._lock:
            self._blocked_ips[ip] = time.monotonic() + duration_sec
        logger.critical(
            "ip_blocked",
            extra={"ip": ip, "duration_sec": duration_sec, "reason": reason},
        )

    # ── Failed Login Tracking ────────────────────────────────────

    def record_failed_login(self, ip: str, email: str) -> None:
        count = self._failed_logins.increment(f"ip:{ip}")
        if count >= FAILED_LOGIN_BLOCK_THRESHOLD:
            self.block_ip(ip, BLOCK_DURATION_SEC, f"brute_force:{count}_failures_in_{FAILED_LOGIN_WINDOW_SEC}s")

    # ── AI Call Gating (no-Redis fallback) ───────────────────────

    def check_ai_allowed(self, user_id: str) -> tuple[bool, Optional[str]]:
        """In-memory AI rate check. Use ONLY when Redis budget is unavailable."""
        hourly = self._ai_calls.increment(f"user:{user_id}")
        burst = self._ai_burst.increment(f"user:{user_id}")

        if burst > AI_BURST_THRESHOLD:
            logger.warning("ai_burst_detected", extra={"user_id": user_id, "count_1m": burst})

        if hourly > AI_HARD_CAP_PER_USER:
            logger.warning("ai_hard_cap_hit", extra={"user_id": user_id, "count_1h": hourly})
            return False, "AI rate limit exceeded. Please try again later."

        return True, None

    # ── Upload Gating ────────────────────────────────────────────

    def check_upload_allowed(self, user_id: str) -> tuple[bool, Optional[str]]:
        count = self._uploads.increment(f"user:{user_id}")
        if count > UPLOAD_CAP_PER_USER:
            logger.warning("upload_spam", extra={"user_id": user_id, "count_1h": count})
            return False, "Upload limit exceeded. Try again later."
        return True, None

    # ── Signup Gating ────────────────────────────────────────────

    def check_signup_allowed(self, ip: str) -> tuple[bool, Optional[str]]:
        count = self._signups.increment(f"ip:{ip}")
        if count > SIGNUP_PER_IP_THRESHOLD:
            logger.warning("signup_spam", extra={"ip": ip, "count_1h": count})
            self.block_ip(ip, BLOCK_DURATION_SEC * 2, f"signup_spam:{count}_in_{SIGNUP_WINDOW_SEC}s")
            return False, "Too many signups from this address."
        return True, None


# Singleton
threat_gate = ThreatGate()
