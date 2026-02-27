"""INO Platform — Service Layer

AI Architecture:
  ai_prompts    — Versioned prompt registry with A/B testing
  ai_client     — Unified gateway (retries, fallback, validation, caching, tracking)
  ai_validation — Response validation (JSON structure, safety, schema)
  ai_abuse      — Input abuse prevention (injection, content policy, velocity)
  ai_cache      — Tiered caching (exact, semantic dedup, template)
  ai_budget     — Token budgeting + cost tracking per coach
  ai_router     — Model routing + upgrade strategy (canary, shadow, feature flags)
  stripe_service — Stripe billing integration
"""
