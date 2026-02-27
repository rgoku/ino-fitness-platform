"""
AI model routing + upgrade strategy.

Supports:
  - Feature-flagged model rollouts (gradual % rollout)
  - Shadow testing (send to both models, compare, log differences)
  - Complexity-based routing (Haiku for simple, Sonnet for complex)
  - Cost-aware routing (downgrade under budget pressure)
  - Model deprecation schedule

Usage:
    from app.services.ai_router import router

    model_id = router.resolve_model(prompt_name="coach_chat",
                                     model_hint="haiku",
                                     coach_id="uuid")
"""
from __future__ import annotations

import hashlib
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum

import redis as redis_lib

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Model Registry ────────────────────────────────────────────

class ModelStatus(str, Enum):
    ACTIVE = "active"           # fully available
    CANARY = "canary"           # rolling out to a % of traffic
    SHADOW = "shadow"           # receives traffic in shadow mode (logged, not returned)
    DEPRECATED = "deprecated"   # scheduled for removal
    DISABLED = "disabled"       # completely off


@dataclass
class ModelConfig:
    model_id: str
    display_name: str
    status: ModelStatus
    tier: str                    # "fast" or "advanced"
    input_price_per_mtok: float  # USD per million input tokens
    output_price_per_mtok: float
    max_output_tokens: int = 8192
    canary_pct: float = 0.0      # % of traffic when status=CANARY
    shadow_pct: float = 0.0      # % of traffic for shadow testing
    deprecated_at: str | None = None


# Current model inventory
MODEL_REGISTRY: dict[str, ModelConfig] = {
    "claude-haiku-4-5-20251001": ModelConfig(
        model_id="claude-haiku-4-5-20251001",
        display_name="Claude Haiku 4.5",
        status=ModelStatus.ACTIVE,
        tier="fast",
        input_price_per_mtok=1.00,
        output_price_per_mtok=5.00,
    ),
    "claude-sonnet-4-5-20250929": ModelConfig(
        model_id="claude-sonnet-4-5-20250929",
        display_name="Claude Sonnet 4.5",
        status=ModelStatus.ACTIVE,
        tier="advanced",
        input_price_per_mtok=3.00,
        output_price_per_mtok=15.00,
    ),
}

# Tier mapping (what the prompt system requests → actual model)
TIER_MAP = {
    "haiku": "claude-haiku-4-5-20251001",
    "fast": "claude-haiku-4-5-20251001",
    "sonnet": "claude-sonnet-4-5-20250929",
    "advanced": "claude-sonnet-4-5-20250929",
}

# Complexity indicators that force Sonnet (from original ai_router.py)
COMPLEX_INDICATORS = [
    "workout plan", "training program", "periodization",
    "diet plan", "meal plan", "nutrition",
    "injury", "rehabilitation", "modify exercise",
    "progress analysis", "weekly report",
    "explain", "why", "research", "evidence",
]


@dataclass
class ShadowTestConfig:
    """Configuration for shadow-testing a new model."""
    name: str
    primary_model: str     # model that returns the actual response
    shadow_model: str      # model that runs in shadow (result logged, not returned)
    traffic_pct: float     # % of requests that trigger shadow call
    enabled: bool = True
    started_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ModelRouter:
    """Enterprise model router with upgrade strategy."""

    def __init__(self) -> None:
        self._shadow_tests: dict[str, ShadowTestConfig] = {}
        self._redis: redis_lib.Redis | None = None

    def _get_redis(self) -> redis_lib.Redis:
        if self._redis is None:
            self._redis = redis_lib.from_url(
                f"{settings.REDIS_URL.rsplit('/', 1)[0]}/3",
                decode_responses=True,
            )
        return self._redis

    def resolve_model(
        self,
        *,
        prompt_name: str = "",
        model_hint: str = "haiku",
        message: str = "",
        conversation_history: list | None = None,
        coach_id: str = "",
    ) -> str:
        """Resolve the actual model ID to use for a request.

        Resolution order:
          1. Check for canary rollout (returns new model for X% of traffic)
          2. Check for feature flag override (Redis-based, per prompt or global)
          3. Apply complexity-based routing (if hint is "haiku" but message is complex → upgrade to Sonnet)
          4. Fall back to tier map
        """
        # Base model from hint
        base_model = TIER_MAP.get(model_hint, TIER_MAP["haiku"])

        # 1. Check canary rollout
        canary_model = self._check_canary(base_model, coach_id)
        if canary_model:
            return canary_model

        # 2. Check feature flag override
        override = self._check_feature_flag(prompt_name)
        if override:
            return override

        # 3. Complexity-based upgrade (only for chat-type prompts)
        if model_hint == "haiku" and message:
            if self._is_complex(message, conversation_history):
                return TIER_MAP["sonnet"]

        return base_model

    def get_shadow_model(
        self,
        primary_model: str,
        coach_id: str = "",
    ) -> str | None:
        """Check if there's an active shadow test. Returns shadow model ID or None."""
        for test in self._shadow_tests.values():
            if not test.enabled or test.primary_model != primary_model:
                continue
            # Deterministic bucketing by coach_id
            bucket = int(hashlib.md5(coach_id.encode()).hexdigest(), 16) % 100
            if bucket < test.traffic_pct * 100:
                return test.shadow_model
        return None

    def add_shadow_test(self, config: ShadowTestConfig) -> None:
        self._shadow_tests[config.name] = config
        logger.info("shadow_test_added", extra={
            "name": config.name, "primary": config.primary_model,
            "shadow": config.shadow_model, "pct": config.traffic_pct,
        })

    def remove_shadow_test(self, name: str) -> None:
        self._shadow_tests.pop(name, None)

    def set_model_status(self, model_id: str, status: ModelStatus) -> None:
        config = MODEL_REGISTRY.get(model_id)
        if config:
            # Create a new ModelConfig with updated status since we're modifying the registry
            MODEL_REGISTRY[model_id] = ModelConfig(
                model_id=config.model_id,
                display_name=config.display_name,
                status=status,
                tier=config.tier,
                input_price_per_mtok=config.input_price_per_mtok,
                output_price_per_mtok=config.output_price_per_mtok,
                max_output_tokens=config.max_output_tokens,
                canary_pct=config.canary_pct,
                shadow_pct=config.shadow_pct,
                deprecated_at=config.deprecated_at,
            )
            logger.info("model_status_changed", extra={
                "model": model_id, "status": status.value,
            })

    def list_models(self) -> list[dict]:
        """Return model inventory for admin dashboard."""
        return [
            {
                "model_id": cfg.model_id,
                "display_name": cfg.display_name,
                "status": cfg.status.value,
                "tier": cfg.tier,
                "pricing": {
                    "input_per_mtok": cfg.input_price_per_mtok,
                    "output_per_mtok": cfg.output_price_per_mtok,
                },
                "canary_pct": cfg.canary_pct,
            }
            for cfg in MODEL_REGISTRY.values()
        ]

    # ── Internals ─────────────────────────────────────────────

    def _check_canary(self, base_model: str, coach_id: str) -> str | None:
        """If a model has CANARY status, route a % of traffic to it."""
        for model_id, cfg in MODEL_REGISTRY.items():
            if cfg.status != ModelStatus.CANARY:
                continue
            if cfg.tier != MODEL_REGISTRY.get(base_model, cfg).tier:
                continue
            # Deterministic bucket
            bucket = int(hashlib.md5(f"{coach_id}:canary".encode()).hexdigest(), 16) % 100
            if bucket < cfg.canary_pct * 100:
                logger.info("canary_routed", extra={
                    "model": model_id, "coach_id": coach_id,
                })
                return model_id
        return None

    def _check_feature_flag(self, prompt_name: str) -> str | None:
        """Check Redis for a model override flag.

        Keys:
          ai_flag:model_override:{prompt_name} → model_id
          ai_flag:model_override:global → model_id
        """
        try:
            r = self._get_redis()
            # Prompt-specific override first
            override = r.get(f"ai_flag:model_override:{prompt_name}")
            if override:
                return override
            # Global override
            override = r.get("ai_flag:model_override:global")
            if override:
                return override
        except Exception:
            pass
        return None

    def _is_complex(self, message: str, history: list | None) -> bool:
        """Detect whether a message warrants the advanced model."""
        msg_lower = message.lower()

        if len(message) > 500:
            return True

        for indicator in COMPLEX_INDICATORS:
            if indicator in msg_lower:
                return True

        if history and len(history) > 10:
            return True

        return False


# Singleton
router = ModelRouter()
