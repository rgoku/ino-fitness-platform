"""
AI abuse prevention — multi-layer protection against misuse.

Layers:
  1. Input sanitization — strip injection attempts, control chars
  2. Content policy — block prohibited topics (non-fitness queries)
  3. Anomaly detection — flag unusual request patterns
  4. Velocity checks — per-user request frequency limits
  5. Prompt injection detection — detect jailbreak attempts

Usage:
    from app.services.ai_abuse import check_input

    result = check_input(message, coach_id=coach_id, user_id=user_id)
    if not result.allowed:
        return 400, result.reason
"""
from __future__ import annotations

import logging
import re
import time

import redis as redis_lib

from app.core.config import settings

logger = logging.getLogger(__name__)

_redis: redis_lib.Redis | None = None


def _get_redis() -> redis_lib.Redis:
    global _redis
    if _redis is None:
        _redis = redis_lib.from_url(
            f"{settings.REDIS_URL.rsplit('/', 1)[0]}/3",
            decode_responses=True,
        )
    return _redis


class AbuseCheckResult:
    __slots__ = ("allowed", "reason", "risk_score", "flags")

    def __init__(
        self,
        allowed: bool = True,
        reason: str = "",
        risk_score: float = 0.0,
        flags: list[str] | None = None,
    ):
        self.allowed = allowed
        self.reason = reason
        self.risk_score = risk_score
        self.flags = flags or []


# ── 1. Input Sanitization ────────────────────────────────────

# Control characters that have no place in a fitness prompt
_CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

# Excessive repetition (e.g. "AAAAAAA..." resource waste)
_REPETITION_RE = re.compile(r"(.)\1{50,}")

# Max input length (chars) — beyond this is likely abuse or prompt stuffing
MAX_INPUT_LENGTH = 5_000


def sanitize_input(text: str) -> str:
    """Clean user input: strip control chars, limit length."""
    text = _CONTROL_CHAR_RE.sub("", text)
    text = text.strip()
    if len(text) > MAX_INPUT_LENGTH:
        text = text[:MAX_INPUT_LENGTH]
    return text


# ── 2. Content Policy ────────────────────────────────────────

# Topics that are out-of-scope for a fitness AI coach
OFF_TOPIC_PATTERNS = [
    r"\b(?:hack|exploit|bypass|jailbreak)\b",
    r"\b(?:bomb|weapon|explosive|firearm)\b",
    r"\b(?:drug(?:s)?(?:\s+deal|\s+sell|\s+buy))\b",
    r"\b(?:kill|murder|assault|attack)\s+(?:someone|person|people)\b",
    r"\b(?:illegal|illicit)\s+(?:substance|drug|steroid)\b",
    r"\bchild\s+(?:porn|abuse|exploitation)\b",
    r"\b(?:self[- ]?harm|suicid)\b",
]

_OFF_TOPIC_RE = [re.compile(p, re.IGNORECASE) for p in OFF_TOPIC_PATTERNS]


# ── 3. Prompt Injection Detection ────────────────────────────

INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?(?:previous|above|prior)\s+instructions",
    r"disregard\s+(?:your|the)\s+(?:system|original)\s+(?:prompt|instructions)",
    r"you\s+are\s+now\s+(?:DAN|a\s+new\s+AI|unrestricted)",
    r"pretend\s+(?:you\s+are|to\s+be)\s+(?:a|an)\s+(?!coach|trainer|nutritionist)",
    r"system\s*:\s*",          # raw system message injection
    r"<\|(?:system|im_start)\|>",  # special token injection
    r"\[INST\]",               # Llama-style injection
    r"#{3,}\s*(?:SYSTEM|INSTRUCTIONS)",
    r"OVERRIDE\s+(?:SAFETY|CONTENT|POLICY)",
]

_INJECTION_RE = [re.compile(p, re.IGNORECASE) for p in INJECTION_PATTERNS]


# ── 4. Velocity Checks ───────────────────────────────────────

# Max requests per user in a sliding window (per minute)
VELOCITY_LIMITS = {
    "per_minute": 10,     # no human types 10 AI requests in 60s
    "per_hour": 120,      # sustained abuse detection
}


# ── Main check function ──────────────────────────────────────

def check_input(
    message: str,
    *,
    coach_id: str = "",
    user_id: str = "",
) -> AbuseCheckResult:
    """Run all abuse prevention checks on user input.

    Returns AbuseCheckResult with allowed=True if the request can proceed.
    """
    flags: list[str] = []
    risk_score = 0.0

    # 1. Empty check
    if not message or not message.strip():
        return AbuseCheckResult(allowed=False, reason="Empty message")

    # 2. Length check
    if len(message) > MAX_INPUT_LENGTH:
        flags.append("oversized_input")
        risk_score += 0.2

    # 3. Repetition check
    if _REPETITION_RE.search(message):
        flags.append("excessive_repetition")
        risk_score += 0.3

    # 4. Content policy
    for pattern in _OFF_TOPIC_RE:
        if pattern.search(message):
            logger.warning("abuse_content_policy", extra={
                "coach_id": coach_id, "user_id": user_id,
                "pattern": pattern.pattern[:40],
            })
            return AbuseCheckResult(
                allowed=False,
                reason="Your message contains content outside the scope of fitness coaching.",
                risk_score=1.0,
                flags=["content_policy_violation"],
            )

    # 5. Prompt injection detection
    for pattern in _INJECTION_RE:
        if pattern.search(message):
            flags.append("prompt_injection_attempt")
            risk_score += 0.8
            logger.warning("abuse_prompt_injection", extra={
                "coach_id": coach_id, "user_id": user_id,
                "pattern": pattern.pattern[:40],
            })
            return AbuseCheckResult(
                allowed=False,
                reason="Your message was flagged by our safety system. Please rephrase.",
                risk_score=1.0,
                flags=flags,
            )

    # 6. Velocity check (Redis-based)
    identifier = user_id or coach_id
    if identifier:
        velocity_result = _check_velocity(identifier)
        if not velocity_result.allowed:
            return velocity_result
        flags.extend(velocity_result.flags)
        risk_score += velocity_result.risk_score

    # 7. High-risk but allowed — log for review
    if risk_score >= 0.5:
        logger.warning("abuse_high_risk_request", extra={
            "coach_id": coach_id, "user_id": user_id,
            "risk_score": risk_score, "flags": flags,
        })

    return AbuseCheckResult(
        allowed=True,
        risk_score=risk_score,
        flags=flags,
    )


def _check_velocity(identifier: str) -> AbuseCheckResult:
    """Check request velocity for a specific user."""
    try:
        r = _get_redis()
        now = time.time()
        key_minute = f"ai_velocity:min:{identifier}"
        key_hour = f"ai_velocity:hr:{identifier}"

        pipe = r.pipeline()

        # Per-minute window
        pipe.zremrangebyscore(key_minute, 0, now - 60)
        pipe.zadd(key_minute, {str(now): now})
        pipe.zcard(key_minute)
        pipe.expire(key_minute, 120)

        # Per-hour window
        pipe.zremrangebyscore(key_hour, 0, now - 3600)
        pipe.zadd(key_hour, {str(now): now})
        pipe.zcard(key_hour)
        pipe.expire(key_hour, 7200)

        results = pipe.execute()
        count_minute = results[2]
        count_hour = results[6]

        flags = []
        risk = 0.0

        if count_minute > VELOCITY_LIMITS["per_minute"]:
            logger.warning("abuse_velocity_minute", extra={
                "identifier": identifier, "count": count_minute,
            })
            return AbuseCheckResult(
                allowed=False,
                reason="Too many AI requests. Please wait a moment before trying again.",
                risk_score=0.9,
                flags=["velocity_minute_exceeded"],
            )

        if count_hour > VELOCITY_LIMITS["per_hour"]:
            logger.warning("abuse_velocity_hour", extra={
                "identifier": identifier, "count": count_hour,
            })
            return AbuseCheckResult(
                allowed=False,
                reason="Hourly AI request limit reached. Please try again later.",
                risk_score=0.8,
                flags=["velocity_hour_exceeded"],
            )

        # Soft warnings
        if count_minute > VELOCITY_LIMITS["per_minute"] * 0.7:
            flags.append("velocity_minute_warning")
            risk += 0.2
        if count_hour > VELOCITY_LIMITS["per_hour"] * 0.7:
            flags.append("velocity_hour_warning")
            risk += 0.1

        return AbuseCheckResult(allowed=True, risk_score=risk, flags=flags)

    except Exception:
        # Fail open — don't block users if Redis is down
        return AbuseCheckResult(allowed=True)
