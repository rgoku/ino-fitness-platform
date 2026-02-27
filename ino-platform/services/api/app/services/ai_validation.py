"""
AI response validation layer.

Validates Claude responses for:
  - JSON structure (when expected)
  - Required fields per prompt schema
  - Content safety (no medical prescriptions, no harmful advice)
  - Output length bounds
  - Data type correctness

Usage:
    from app.services.ai_validation import validate_response

    result = validate_response(raw_text, prompt_name="workout_generation")
"""
from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# Phrases that indicate the model refused or went off-track
REFUSAL_INDICATORS = [
    "i cannot", "i can't", "i'm unable", "as an ai", "i apologize but",
    "i'm not able to", "i don't have the ability",
]

# Content that should NEVER appear in fitness coaching responses
UNSAFE_PATTERNS = [
    r"\bprescri(?:be|ption)\b",           # medical prescriptions
    r"\bdiagnos(?:e|is|ed)\b",            # medical diagnosis
    r"\bsteroid(?:s)?\b",                 # anabolic steroids
    r"\bclenbuterol\b",
    r"\bDNP\b",                           # 2,4-dinitrophenol
    r"\bephedra\b",
    r"\bamphetamine\b",
    r"\bself-harm\b",
    r"\bsuicid(?:e|al)\b",
    r"\banorexi(?:a|c)\b",
    r"\bbulimi(?:a|c)\b",
    r"\bpurg(?:e|ing)\b",
    r"<\s*(?:script|iframe|img|svg)\b",   # XSS injection attempts
]

# Compile once
_UNSAFE_RE = [re.compile(p, re.IGNORECASE) for p in UNSAFE_PATTERNS]

# Max allowed response lengths by prompt type (chars)
MAX_RESPONSE_LENGTH = {
    "coach_chat": 3_000,
    "motivation": 500,
    "reminder": 200,
    "form_analysis": 5_000,
    "food_analysis": 3_000,
    "workout_generation": 15_000,
    "diet_plan_generation": 20_000,
    "workout_modification": 5_000,
    "progress_analysis": 8_000,
    "supplement_evidence": 3_000,
    "weekly_report": 10_000,
}

# Prompts that MUST return valid JSON
JSON_REQUIRED_PROMPTS = {
    "workout_generation", "diet_plan_generation", "form_analysis",
    "food_analysis", "workout_modification", "progress_analysis",
    "supplement_evidence", "weekly_report",
}

# Required top-level keys per prompt
REQUIRED_KEYS: dict[str, list[str]] = {
    "workout_generation": ["name", "exercises"],
    "diet_plan_generation": ["name", "meals", "calorie_target"],
    "form_analysis": ["score", "safety_level"],
    "food_analysis": ["foods", "calories"],
    "workout_modification": ["alternatives"],
    "progress_analysis": ["summary", "recommendations"],
    "supplement_evidence": ["summary", "evidence_level"],
    "weekly_report": ["title", "summary"],
}

# Type checks for specific keys
KEY_TYPE_CHECKS: dict[str, dict[str, type]] = {
    "form_analysis": {"score": (int, float)},
    "food_analysis": {"calories": (int, float), "protein": (int, float)},
    "diet_plan_generation": {"calorie_target": (int, float)},
}


@dataclass
class ValidationResult:
    valid: bool
    data: dict | str | None = None     # parsed data (dict for JSON, str for text)
    raw: str = ""
    errors: list[str] | None = None
    warnings: list[str] | None = None
    was_repaired: bool = False


def validate_response(
    raw_text: str,
    prompt_name: str,
    *,
    strict: bool = True,
) -> ValidationResult:
    """Validate and sanitize an AI response.

    Args:
        raw_text: Raw text from Claude API.
        prompt_name: Registered prompt name (drives validation rules).
        strict: If True, return invalid on any error. If False, attempt repair.

    Returns:
        ValidationResult with parsed data and any errors/warnings.
    """
    errors: list[str] = []
    warnings: list[str] = []
    was_repaired = False

    if not raw_text or not raw_text.strip():
        return ValidationResult(valid=False, raw=raw_text, errors=["Empty response"])

    text = raw_text.strip()

    # 1. Check for refusal
    text_lower = text.lower()
    for indicator in REFUSAL_INDICATORS:
        if indicator in text_lower:
            warnings.append(f"Possible refusal detected: '{indicator}'")
            break

    # 2. Content safety scan
    safety_violations = _check_safety(text)
    if safety_violations:
        errors.extend(safety_violations)
        if strict:
            return ValidationResult(valid=False, raw=raw_text, errors=errors, warnings=warnings)

    # 3. Length check
    max_len = MAX_RESPONSE_LENGTH.get(prompt_name, 10_000)
    if len(text) > max_len:
        warnings.append(f"Response length ({len(text)}) exceeds max ({max_len}), truncated")
        text = text[:max_len]
        was_repaired = True

    # 4. JSON validation (if required)
    if prompt_name in JSON_REQUIRED_PROMPTS:
        parsed, json_errors, json_repaired = _extract_and_validate_json(
            text, prompt_name, strict=strict,
        )
        errors.extend(json_errors)
        was_repaired = was_repaired or json_repaired

        if parsed is None:
            return ValidationResult(
                valid=False, raw=raw_text, errors=errors, warnings=warnings,
            )

        # 5. Type checks
        type_rules = KEY_TYPE_CHECKS.get(prompt_name, {})
        for key, expected_types in type_rules.items():
            val = parsed.get(key)
            if val is not None and not isinstance(val, expected_types):
                try:
                    parsed[key] = float(val)
                    was_repaired = True
                except (ValueError, TypeError):
                    errors.append(f"Key '{key}' has wrong type: expected {expected_types}, got {type(val).__name__}")

        if errors and strict:
            return ValidationResult(valid=False, data=parsed, raw=raw_text, errors=errors, warnings=warnings)

        return ValidationResult(
            valid=len(errors) == 0,
            data=parsed,
            raw=raw_text,
            errors=errors or None,
            warnings=warnings or None,
            was_repaired=was_repaired,
        )

    # Text response (chat, motivation, reminder)
    return ValidationResult(
        valid=len(errors) == 0,
        data=text,
        raw=raw_text,
        errors=errors or None,
        warnings=warnings or None,
        was_repaired=was_repaired,
    )


def _check_safety(text: str) -> list[str]:
    violations = []
    for pattern in _UNSAFE_RE:
        match = pattern.search(text)
        if match:
            violations.append(f"Unsafe content detected: '{match.group()}'")
    return violations


def _extract_and_validate_json(
    text: str,
    prompt_name: str,
    *,
    strict: bool,
) -> tuple[dict | None, list[str], bool]:
    """Extract JSON from text, validate required keys. Returns (parsed, errors, was_repaired)."""
    errors: list[str] = []
    repaired = False

    # Try direct parse first
    parsed = _try_parse_json(text)

    # Try extracting JSON block from markdown or surrounding text
    if parsed is None:
        parsed = _extract_json_block(text)
        if parsed is not None:
            repaired = True

    if parsed is None:
        errors.append("Response is not valid JSON")
        return None, errors, False

    # Check required keys
    required = REQUIRED_KEYS.get(prompt_name, [])
    for key in required:
        if key not in parsed:
            errors.append(f"Missing required key: '{key}'")

    if errors and strict:
        return parsed, errors, repaired

    return parsed, errors, repaired


def _try_parse_json(text: str) -> dict | None:
    try:
        result = json.loads(text)
        return result if isinstance(result, dict) else None
    except (json.JSONDecodeError, ValueError):
        return None


def _extract_json_block(text: str) -> dict | None:
    """Try multiple strategies to extract JSON from a text response."""
    # Strategy 1: ```json ... ``` block
    match = re.search(r"```(?:json)?\s*\n?(.*?)```", text, re.DOTALL)
    if match:
        parsed = _try_parse_json(match.group(1).strip())
        if parsed is not None:
            return parsed

    # Strategy 2: First { to last }
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace > first_brace:
        parsed = _try_parse_json(text[first_brace:last_brace + 1])
        if parsed is not None:
            return parsed

    return None
