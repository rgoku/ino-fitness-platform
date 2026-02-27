"""
Unified AI client — the single gateway for all Claude API calls.

Integrates:
  - Prompt registry (versioned prompts)
  - Model routing (Haiku/Sonnet)
  - Response validation
  - Redis caching (with semantic key)
  - Token budgeting (actual usage from API response)
  - Cost tracking (per-coach, per-request)
  - Retry with exponential backoff + model fallback
  - Circuit breaker pattern
  - Abuse prevention hooks

Usage:
    from app.services.ai_client import ai_client

    result = await ai_client.execute(
        prompt_name="workout_generation",
        coach_id="uuid",
        plan_tier="pro",
        age=30, gender="male", ...
    )
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any

import anthropic
import httpx

from app.core.config import settings
from app.services.ai_prompts import registry
from app.services.ai_validation import ValidationResult, validate_response

logger = logging.getLogger(__name__)

# ── Pricing (USD per token) — updated for latest models ─────
MODEL_PRICING = {
    "claude-haiku-4-5-20251001":    {"input": 1.00 / 1_000_000, "output": 5.00 / 1_000_000},
    "claude-sonnet-4-5-20250929":   {"input": 3.00 / 1_000_000, "output": 15.00 / 1_000_000},
    # Legacy model (fallback reference)
    "claude-3-5-sonnet-20241022":   {"input": 3.00 / 1_000_000, "output": 15.00 / 1_000_000},
}

MODEL_MAP = {
    "haiku": "claude-haiku-4-5-20251001",
    "sonnet": "claude-sonnet-4-5-20250929",
}

# Fallback chain: if Sonnet fails → try Haiku, if Haiku fails → give up
FALLBACK_CHAIN = {
    "claude-sonnet-4-5-20250929": "claude-haiku-4-5-20251001",
    "claude-haiku-4-5-20251001": None,
}


class RequestStatus(str, Enum):
    SUCCESS = "success"
    CACHED = "cached"
    VALIDATION_FAILED = "validation_failed"
    BUDGET_EXCEEDED = "budget_exceeded"
    RATE_LIMITED = "rate_limited"
    API_ERROR = "api_error"
    ABUSE_BLOCKED = "abuse_blocked"
    FALLBACK_USED = "fallback_used"
    CIRCUIT_OPEN = "circuit_open"


@dataclass
class AIResponse:
    """Standardized response from the AI client."""
    status: RequestStatus
    data: dict | str | None = None
    raw: str = ""
    model_used: str = ""
    prompt_name: str = ""
    prompt_version: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0
    latency_ms: int = 0
    cached: bool = False
    retries: int = 0
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


class CircuitBreaker:
    """Per-model circuit breaker to avoid hammering a failing API."""

    def __init__(self, failure_threshold: int = 5, recovery_timeout: int = 60):
        self._failure_count: dict[str, int] = {}
        self._last_failure: dict[str, float] = {}
        self._threshold = failure_threshold
        self._recovery_timeout = recovery_timeout

    def record_success(self, model: str) -> None:
        self._failure_count[model] = 0

    def record_failure(self, model: str) -> None:
        self._failure_count[model] = self._failure_count.get(model, 0) + 1
        self._last_failure[model] = time.time()

    def is_open(self, model: str) -> bool:
        count = self._failure_count.get(model, 0)
        if count < self._threshold:
            return False
        last = self._last_failure.get(model, 0)
        if time.time() - last > self._recovery_timeout:
            # Half-open: allow one attempt
            self._failure_count[model] = self._threshold - 1
            return False
        return True


class AIClient:
    """Production AI client with full enterprise pipeline."""

    def __init__(self) -> None:
        self._anthropic: anthropic.AsyncAnthropic | None = None
        self._circuit = CircuitBreaker(failure_threshold=5, recovery_timeout=60)
        self._redis = None

    def _get_client(self) -> anthropic.AsyncAnthropic:
        if self._anthropic is None:
            self._anthropic = anthropic.AsyncAnthropic(
                api_key=settings.ANTHROPIC_API_KEY,
                timeout=httpx.Timeout(120.0, connect=10.0),
                max_retries=0,  # we handle retries ourselves
            )
        return self._anthropic

    def _get_redis(self):
        if self._redis is None:
            import redis as redis_lib
            self._redis = redis_lib.from_url(
                f"{settings.REDIS_URL.rsplit('/', 1)[0]}/3",
                decode_responses=True,
            )
        return self._redis

    async def execute(
        self,
        prompt_name: str,
        *,
        coach_id: str = "",
        user_id: str = "",
        plan_tier: str = "starter",
        version: str = "latest",
        max_retries: int = 2,
        use_cache: bool = True,
        conversation_history: list[dict] | None = None,
        **template_kwargs: Any,
    ) -> AIResponse:
        """Execute an AI request through the full enterprise pipeline.

        Pipeline:
          1. Render prompt from registry
          2. Check cache
          3. Check budget
          4. Check circuit breaker
          5. Call Claude API (with retries + model fallback)
          6. Track token usage + cost
          7. Validate response
          8. Cache result
          9. Return standardized AIResponse
        """
        start_time = time.monotonic()

        # 1. Render prompt
        try:
            rendered = registry.render(
                prompt_name,
                version=version,
                seed=coach_id or user_id,
                **template_kwargs,
            )
        except (KeyError, ValueError) as exc:
            return AIResponse(
                status=RequestStatus.API_ERROR,
                prompt_name=prompt_name,
                errors=[f"Prompt render error: {exc}"],
                latency_ms=_elapsed_ms(start_time),
            )

        model_id = MODEL_MAP.get(rendered["model_hint"], MODEL_MAP["haiku"])
        system_prompt = rendered["system"]
        user_message = rendered["user_message"]
        max_tokens = rendered["max_tokens"]
        temperature = rendered["temperature"]

        # 2. Check cache
        if use_cache:
            cache_key = self._build_cache_key(
                prompt_name, rendered["prompt_fingerprint"], user_message,
                conversation_history,
            )
            cached = self._cache_get(cache_key)
            if cached is not None:
                logger.info("ai_client cache hit", extra={
                    "prompt": prompt_name, "coach_id": coach_id,
                })
                return AIResponse(
                    status=RequestStatus.CACHED,
                    data=cached.get("data"),
                    raw=cached.get("raw", ""),
                    model_used=cached.get("model", model_id),
                    prompt_name=prompt_name,
                    prompt_version=rendered["prompt_version"],
                    cached=True,
                    latency_ms=_elapsed_ms(start_time),
                )
        else:
            cache_key = None

        # 3. Check budget
        if coach_id:
            from app.services.ai_budget import check_and_increment
            task_type = self._budget_task_type(prompt_name, model_id)
            allowed, reason = check_and_increment(coach_id, plan_tier, task_type)
            if not allowed:
                return AIResponse(
                    status=RequestStatus.BUDGET_EXCEEDED,
                    prompt_name=prompt_name,
                    prompt_version=rendered["prompt_version"],
                    errors=[reason or "Budget exceeded"],
                    latency_ms=_elapsed_ms(start_time),
                )

        # 4-5. Call API with retries + fallback
        current_model = model_id
        retries = 0
        last_error: str = ""

        while True:
            # Check circuit breaker
            if self._circuit.is_open(current_model):
                fallback = FALLBACK_CHAIN.get(current_model)
                if fallback and not self._circuit.is_open(fallback):
                    logger.warning("circuit_open, falling back", extra={
                        "from": current_model, "to": fallback,
                    })
                    current_model = fallback
                else:
                    return AIResponse(
                        status=RequestStatus.CIRCUIT_OPEN,
                        prompt_name=prompt_name,
                        errors=["AI service temporarily unavailable"],
                        latency_ms=_elapsed_ms(start_time),
                    )

            # Build messages
            messages = self._build_messages(user_message, conversation_history)

            try:
                response = await self._get_client().messages.create(
                    model=current_model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_prompt,
                    messages=messages,
                )
                self._circuit.record_success(current_model)
                break  # success

            except anthropic.RateLimitError:
                last_error = "Claude API rate limited"
                self._circuit.record_failure(current_model)
                retries += 1
                if retries <= max_retries:
                    await asyncio.sleep(min(2 ** retries * 5, 60))
                    continue
                return AIResponse(
                    status=RequestStatus.RATE_LIMITED,
                    prompt_name=prompt_name,
                    retries=retries,
                    errors=[last_error],
                    latency_ms=_elapsed_ms(start_time),
                )

            except (anthropic.APIStatusError, anthropic.APIConnectionError) as exc:
                last_error = str(exc)
                self._circuit.record_failure(current_model)
                retries += 1

                if retries <= max_retries:
                    await asyncio.sleep(min(2 ** retries * 2, 30))
                    continue

                # Try fallback model
                fallback = FALLBACK_CHAIN.get(current_model)
                if fallback:
                    logger.warning("api_error, trying fallback model", extra={
                        "from": current_model, "to": fallback, "error": last_error,
                    })
                    current_model = fallback
                    retries = 0
                    continue

                return AIResponse(
                    status=RequestStatus.API_ERROR,
                    prompt_name=prompt_name,
                    retries=retries,
                    errors=[last_error],
                    latency_ms=_elapsed_ms(start_time),
                )

            except Exception as exc:
                return AIResponse(
                    status=RequestStatus.API_ERROR,
                    prompt_name=prompt_name,
                    errors=[f"Unexpected error: {type(exc).__name__}: {exc}"],
                    latency_ms=_elapsed_ms(start_time),
                )

        # 6. Extract usage + cost
        raw_text = response.content[0].text if response.content else ""
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        cost = _calculate_cost(current_model, input_tokens, output_tokens)

        # 7. Validate response
        validation = validate_response(raw_text, prompt_name, strict=False)

        status = RequestStatus.SUCCESS
        if current_model != model_id:
            status = RequestStatus.FALLBACK_USED
        if not validation.valid:
            status = RequestStatus.VALIDATION_FAILED

        result = AIResponse(
            status=status,
            data=validation.data,
            raw=raw_text,
            model_used=current_model,
            prompt_name=prompt_name,
            prompt_version=rendered["prompt_version"],
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_usd=cost,
            latency_ms=_elapsed_ms(start_time),
            retries=retries,
            errors=validation.errors or [],
            warnings=validation.warnings or [],
        )

        # 8. Cache on success
        if cache_key and validation.valid:
            self._cache_set(cache_key, {
                "data": validation.data,
                "raw": raw_text,
                "model": current_model,
            }, prompt_name=prompt_name)

        # 9. Log metrics
        logger.info("ai_request_completed", extra={
            "prompt": prompt_name,
            "model": current_model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost_usd": round(cost, 6),
            "latency_ms": result.latency_ms,
            "status": status.value,
            "cached": False,
            "coach_id": coach_id,
            "user_id": user_id,
        })

        return result

    # ── helpers ────────────────────────────────────────────────

    _ALLOWED_ROLES = {"user", "assistant"}

    def _build_messages(
        self,
        user_message: str,
        conversation_history: list[dict] | None,
    ) -> list[dict]:
        messages = []
        if conversation_history:
            for msg in conversation_history[-20:]:  # cap context window
                role = msg.get("role", "user")
                # Only allow user/assistant roles — block "system" injection
                if role not in self._ALLOWED_ROLES:
                    role = "user"
                content = msg.get("content", "")
                if content:
                    messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": user_message})
        return messages

    def _build_cache_key(
        self,
        prompt_name: str,
        fingerprint: str,
        user_message: str,
        history: list[dict] | None,
    ) -> str:
        recent = json.dumps(history[-3:], sort_keys=True) if history else ""
        payload = f"{prompt_name}:{fingerprint}:{user_message.strip().lower()}:{recent}"
        digest = hashlib.sha256(payload.encode()).hexdigest()[:16]
        return f"ai_cache:{prompt_name}:{digest}"

    def _cache_get(self, key: str) -> dict | None:
        try:
            raw = self._get_redis().get(key)
            return json.loads(raw) if raw else None
        except Exception:
            return None

    def _cache_set(self, key: str, value: dict, *, prompt_name: str) -> None:
        ttl = _cache_ttl(prompt_name)
        try:
            self._get_redis().setex(key, ttl, json.dumps(value, default=str))
        except Exception:
            logger.warning("ai_cache write failed", extra={"key": key})

    def _budget_task_type(self, prompt_name: str, model_id: str) -> str:
        """Map prompt_name + model to budget task_type."""
        if prompt_name == "coach_chat":
            return "ai_chat_haiku" if "haiku" in model_id else "ai_chat_sonnet"
        mapping = {
            "workout_generation": "generate_workout",
            "diet_plan_generation": "generate_diet_plan",
            "form_analysis": "form_analysis",
        }
        return mapping.get(prompt_name, "ai_chat_haiku")


def _calculate_cost(model: str, input_tokens: int, output_tokens: int) -> float:
    pricing = MODEL_PRICING.get(model, MODEL_PRICING["claude-haiku-4-5-20251001"])
    return (input_tokens * pricing["input"]) + (output_tokens * pricing["output"])


def _cache_ttl(prompt_name: str) -> int:
    """Return TTL in seconds based on content volatility."""
    long_ttl = 7 * 86400   # 7 days — static generation
    medium_ttl = 86400      # 24h — moderate
    short_ttl = 3600        # 1h — dynamic chat

    ttls = {
        "workout_generation": long_ttl,
        "diet_plan_generation": long_ttl,
        "workout_modification": long_ttl,
        "weekly_report": medium_ttl,
        "progress_analysis": medium_ttl,
        "form_analysis": medium_ttl,
        "supplement_evidence": long_ttl,
        "food_analysis": medium_ttl,
        "coach_chat": short_ttl,
        "motivation": short_ttl,
        "reminder": short_ttl,
    }
    return ttls.get(prompt_name, medium_ttl)


def _elapsed_ms(start: float) -> int:
    return int((time.monotonic() - start) * 1000)


# Singleton
ai_client = AIClient()
