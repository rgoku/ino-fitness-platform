"""
Tiered AI response caching — Redis-backed with semantic deduplication.

Cache tiers:
  1. Exact-match cache — SHA256 of (prompt_fingerprint + user_message + recent_history)
  2. Template cache — Pre-generated outputs for common parameter combos (7d TTL)
  3. Semantic dedup — Normalize input to catch near-duplicates

TTL strategy:
  - Static generation (workout/diet plans): 7 days
  - Semi-static (reports, analysis): 24 hours
  - Dynamic (chat, motivation): 1 hour
  - Templates: 7 days

Usage:
    from app.services.ai_cache import cache

    # Check cache
    hit = cache.get(prompt_name, fingerprint, user_message, history)

    # Store in cache
    cache.set(prompt_name, fingerprint, user_message, history, response_data)
"""
from __future__ import annotations

import hashlib
import json
import logging
import re

import redis as redis_lib

from app.core.config import settings

logger = logging.getLogger(__name__)

# TTLs by prompt category (seconds)
CACHE_TTLS = {
    # Static — workout/diet plans generated from same params are identical
    "workout_generation": 7 * 86400,
    "diet_plan_generation": 7 * 86400,
    "workout_modification": 7 * 86400,
    "supplement_evidence": 7 * 86400,

    # Semi-static — periodic analysis changes daily
    "weekly_report": 86400,
    "progress_analysis": 86400,
    "form_analysis": 86400,
    "food_analysis": 86400,

    # Dynamic — chat is contextual, low TTL
    "coach_chat": 3600,
    "motivation": 3600,
    "reminder": 3600,
}

# Template key patterns for common generation combos
TEMPLATE_PATTERNS = {
    "workout_generation": ["goals", "experience_level", "equipment", "days_per_week"],
    "diet_plan_generation": ["goal", "restrictions", "calorie_target"],
}


class AICache:
    """Redis-backed multi-tier AI response cache."""

    def __init__(self) -> None:
        self._redis: redis_lib.Redis | None = None

    def _get_redis(self) -> redis_lib.Redis:
        if self._redis is None:
            self._redis = redis_lib.from_url(
                f"{settings.REDIS_URL.rsplit('/', 1)[0]}/3",
                decode_responses=True,
            )
        return self._redis

    # ── Exact-match cache ─────────────────────────────────────

    def get(
        self,
        prompt_name: str,
        fingerprint: str,
        user_message: str,
        history: list[dict] | None = None,
    ) -> dict | None:
        """Check exact-match cache.  Returns cached response dict or None."""
        key = self._exact_key(prompt_name, fingerprint, user_message, history)
        try:
            raw = self._get_redis().get(key)
            if raw:
                logger.debug("cache_hit_exact", extra={"prompt": prompt_name, "key": key})
                return json.loads(raw)
        except Exception:
            pass

        # Fallback: try semantic-normalized key
        norm_key = self._semantic_key(prompt_name, fingerprint, user_message)
        try:
            raw = self._get_redis().get(norm_key)
            if raw:
                logger.debug("cache_hit_semantic", extra={"prompt": prompt_name})
                return json.loads(raw)
        except Exception:
            pass

        return None

    def set(
        self,
        prompt_name: str,
        fingerprint: str,
        user_message: str,
        history: list[dict] | None,
        response: dict,
    ) -> None:
        """Store response in both exact and semantic caches."""
        ttl = CACHE_TTLS.get(prompt_name, 86400)
        serialized = json.dumps(response, default=str)

        try:
            pipe = self._get_redis().pipeline()

            # Exact key
            exact_key = self._exact_key(prompt_name, fingerprint, user_message, history)
            pipe.setex(exact_key, ttl, serialized)

            # Semantic key (slightly longer TTL — covers near-duplicate requests)
            sem_key = self._semantic_key(prompt_name, fingerprint, user_message)
            pipe.setex(sem_key, ttl, serialized)

            pipe.execute()
        except Exception:
            logger.warning("cache_write_failed", extra={"prompt": prompt_name})

    # ── Template cache ────────────────────────────────────────

    def get_template(self, prompt_name: str, params: dict) -> dict | None:
        """Check template cache for pre-generated outputs."""
        key = self._template_key(prompt_name, params)
        if not key:
            return None
        try:
            raw = self._get_redis().get(key)
            if raw:
                logger.debug("cache_hit_template", extra={"prompt": prompt_name})
                return json.loads(raw)
        except Exception:
            pass
        return None

    def set_template(self, prompt_name: str, params: dict, response: dict) -> None:
        """Cache a template response (7 day TTL)."""
        key = self._template_key(prompt_name, params)
        if not key:
            return
        try:
            self._get_redis().setex(key, 7 * 86400, json.dumps(response, default=str))
        except Exception:
            logger.warning("cache_template_write_failed", extra={"prompt": prompt_name})

    # ── Cache invalidation ────────────────────────────────────

    def invalidate_prompt(self, prompt_name: str) -> int:
        """Invalidate all cached responses for a prompt (e.g. after prompt version update)."""
        try:
            r = self._get_redis()
            keys = list(r.scan_iter(f"ai_cache:{prompt_name}:*", count=500))
            keys.extend(r.scan_iter(f"ai_sem:{prompt_name}:*", count=500))
            keys.extend(r.scan_iter(f"ai_tpl:{prompt_name}:*", count=500))
            if keys:
                r.delete(*keys)
                logger.info("cache_invalidated", extra={
                    "prompt": prompt_name, "keys_deleted": len(keys),
                })
            return len(keys)
        except Exception:
            return 0

    def invalidate_coach(self, coach_id: str) -> int:
        """Invalidate all cached responses for a specific coach."""
        try:
            r = self._get_redis()
            keys = list(r.scan_iter(f"ai_cache:*:{coach_id}*", count=500))
            if keys:
                r.delete(*keys)
            return len(keys)
        except Exception:
            return 0

    # ── Stats ─────────────────────────────────────────────────

    def get_stats(self) -> dict:
        """Return cache stats for monitoring dashboard."""
        try:
            r = self._get_redis()
            info = r.info("memory")
            keyspace = r.info("keyspace")

            exact_count = len(list(r.scan_iter("ai_cache:*", count=1000)))
            sem_count = len(list(r.scan_iter("ai_sem:*", count=1000)))
            tpl_count = len(list(r.scan_iter("ai_tpl:*", count=1000)))

            return {
                "exact_entries": exact_count,
                "semantic_entries": sem_count,
                "template_entries": tpl_count,
                "total_entries": exact_count + sem_count + tpl_count,
                "memory_used_bytes": info.get("used_memory", 0),
            }
        except Exception:
            return {"exact_entries": 0, "semantic_entries": 0, "template_entries": 0}

    # ── Key builders ──────────────────────────────────────────

    def _exact_key(
        self,
        prompt_name: str,
        fingerprint: str,
        user_message: str,
        history: list[dict] | None,
    ) -> str:
        recent = json.dumps(history[-3:], sort_keys=True) if history else ""
        payload = f"{prompt_name}:{fingerprint}:{user_message.strip()}:{recent}"
        digest = hashlib.sha256(payload.encode()).hexdigest()[:16]
        return f"ai_cache:{prompt_name}:{digest}"

    def _semantic_key(self, prompt_name: str, fingerprint: str, user_message: str) -> str:
        """Normalized key that ignores whitespace, case, and filler words."""
        normalized = _normalize_text(user_message)
        payload = f"{prompt_name}:{fingerprint}:{normalized}"
        digest = hashlib.sha256(payload.encode()).hexdigest()[:16]
        return f"ai_sem:{prompt_name}:{digest}"

    def _template_key(self, prompt_name: str, params: dict) -> str | None:
        """Build a template cache key from known parameter fields."""
        fields = TEMPLATE_PATTERNS.get(prompt_name)
        if not fields:
            return None
        key_parts = []
        for f in sorted(fields):
            val = params.get(f, "")
            if isinstance(val, (list, tuple)):
                val = ",".join(sorted(str(v) for v in val))
            key_parts.append(f"{f}={str(val).lower().strip()}")
        payload = f"{prompt_name}:{':'.join(key_parts)}"
        digest = hashlib.sha256(payload.encode()).hexdigest()[:12]
        return f"ai_tpl:{prompt_name}:{digest}"


# ── Text normalization for semantic dedup ────────────────────

_FILLER_WORDS = {"please", "can", "you", "could", "would", "help", "me", "i", "a", "the", "my"}
_WHITESPACE_RE = re.compile(r"\s+")
_PUNCTUATION_RE = re.compile(r"[^\w\s]")


def _normalize_text(text: str) -> str:
    """Normalize text for semantic cache keying: lowercase, strip filler, collapse whitespace."""
    text = text.lower()
    text = _PUNCTUATION_RE.sub("", text)
    words = text.split()
    words = [w for w in words if w not in _FILLER_WORDS]
    return _WHITESPACE_RE.sub(" ", " ".join(words)).strip()


# Singleton
cache = AICache()
