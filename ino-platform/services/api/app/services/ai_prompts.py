"""
Enterprise prompt versioning system.

Every prompt is a PromptTemplate with a semantic version, metadata, and
the ability to A/B test between versions.  The PromptRegistry is the single
source of truth — no raw prompt strings scattered across the codebase.

Usage:
    from app.services.ai_prompts import registry

    prompt = registry.render("workout_generation", version="latest",
                             biometrics={"age": 30, ...})
"""
from __future__ import annotations

import hashlib
import logging
import random
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any

logger = logging.getLogger(__name__)


class PromptStatus(str, Enum):
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    TESTING = "testing"      # A/B test candidate
    ARCHIVED = "archived"


@dataclass(frozen=True)
class PromptTemplate:
    """Immutable, versioned prompt template."""

    name: str                     # e.g. "workout_generation"
    version: str                  # semver e.g. "1.2.0"
    system_prompt: str            # Claude system message
    user_template: str            # Python format-string with {placeholders}
    model_hint: str = "sonnet"    # preferred model: "haiku" | "sonnet"
    max_tokens: int = 1024
    temperature: float = 0.7
    status: PromptStatus = PromptStatus.ACTIVE
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    description: str = ""
    output_schema: str | None = None  # optional JSON schema for structured output

    @property
    def fingerprint(self) -> str:
        """Content hash for cache-keying and drift detection."""
        payload = f"{self.system_prompt}|{self.user_template}|{self.version}"
        return hashlib.sha256(payload.encode()).hexdigest()[:12]


@dataclass
class ABTest:
    """A/B test between two prompt versions."""

    name: str
    control_version: str       # e.g. "1.0.0"
    candidate_version: str     # e.g. "1.1.0"
    traffic_pct: float = 0.10  # 10 % traffic to candidate
    start_time: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    enabled: bool = True


class PromptRegistry:
    """Central registry for all versioned prompts."""

    def __init__(self) -> None:
        self._templates: dict[str, dict[str, PromptTemplate]] = {}  # name → {version → tpl}
        self._ab_tests: dict[str, ABTest] = {}                      # name → ABTest
        self._register_builtin_prompts()

    # ── public API ────────────────────────────────────────────

    def register(self, template: PromptTemplate) -> None:
        self._templates.setdefault(template.name, {})[template.version] = template

    def get(self, name: str, version: str = "latest") -> PromptTemplate:
        versions = self._templates.get(name)
        if not versions:
            raise KeyError(f"Prompt '{name}' not registered")
        if version == "latest":
            active = {v: t for v, t in versions.items() if t.status == PromptStatus.ACTIVE}
            if not active:
                raise KeyError(f"No active version for prompt '{name}'")
            return active[max(active)]
        tpl = versions.get(version)
        if tpl is None:
            raise KeyError(f"Prompt '{name}' version '{version}' not found")
        return tpl

    def resolve(self, name: str, *, seed: str = "") -> PromptTemplate:
        """Resolve with A/B test awareness.  ``seed`` is used for deterministic bucketing."""
        ab = self._ab_tests.get(name)
        if ab and ab.enabled:
            bucket = int(hashlib.md5(seed.encode()).hexdigest(), 16) % 100
            if bucket < ab.traffic_pct * 100:
                try:
                    return self.get(name, ab.candidate_version)
                except KeyError:
                    pass
            return self.get(name, ab.control_version)
        return self.get(name)

    def render(
        self,
        name: str,
        *,
        version: str = "latest",
        seed: str = "",
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Return a dict ready for the AI client: system, user_message, model_hint, max_tokens, etc."""
        tpl = self.resolve(name, seed=seed) if version == "latest" else self.get(name, version)
        try:
            user_message = tpl.user_template.format(**kwargs)
        except KeyError as exc:
            raise ValueError(f"Missing template variable for prompt '{name}': {exc}") from exc

        return {
            "system": tpl.system_prompt,
            "user_message": user_message,
            "model_hint": tpl.model_hint,
            "max_tokens": tpl.max_tokens,
            "temperature": tpl.temperature,
            "prompt_name": tpl.name,
            "prompt_version": tpl.version,
            "prompt_fingerprint": tpl.fingerprint,
            "output_schema": tpl.output_schema,
        }

    def list_prompts(self) -> list[dict]:
        """Return metadata for all registered prompts (admin dashboard)."""
        out = []
        for name, versions in self._templates.items():
            for ver, tpl in versions.items():
                out.append({
                    "name": tpl.name,
                    "version": ver,
                    "status": tpl.status.value,
                    "model_hint": tpl.model_hint,
                    "max_tokens": tpl.max_tokens,
                    "fingerprint": tpl.fingerprint,
                    "description": tpl.description,
                })
        return out

    def set_ab_test(self, ab: ABTest) -> None:
        self._ab_tests[ab.name] = ab

    def remove_ab_test(self, name: str) -> None:
        self._ab_tests.pop(name, None)

    # ── built-in prompts ──────────────────────────────────────

    def _register_builtin_prompts(self) -> None:
        """Register all INO platform prompts from the legacy ai_service.py, now versioned."""

        # ── Workout Generation ────────────────────────────────
        self.register(PromptTemplate(
            name="workout_generation",
            version="1.0.0",
            description="Generate personalized workout plan from biometrics",
            model_hint="sonnet",
            max_tokens=2000,
            temperature=0.7,
            system_prompt=(
                "You are an expert exercise physiologist and certified personal trainer. "
                "Generate evidence-based, periodized workout plans tailored to the client's "
                "profile. Always prioritise safety and progressive overload. "
                "Return ONLY valid JSON — no markdown, no commentary."
            ),
            user_template=(
                "Create a detailed, personalized workout plan for a client with:\n"
                "- Age: {age}\n"
                "- Gender: {gender}\n"
                "- Weight: {weight} kg\n"
                "- Height: {height} cm\n"
                "- Experience Level: {experience_level}\n"
                "- Goals: {goals}\n"
                "- Available equipment: {equipment}\n"
                "- Days per week: {days_per_week}\n\n"
                "Return JSON:\n"
                '{{"name":"...","description":"...","duration_weeks":8,'
                '"focus_areas":["..."],"exercises":[{{"name":"...","description":"...",'
                '"muscle_groups":["..."],"equipment":["..."],"sets":3,"reps":10,'
                '"rest_seconds":60,"instructions":["..."]}}]}}'
            ),
            output_schema=(
                '{"type":"object","required":["name","exercises"],'
                '"properties":{"name":{"type":"string"},"exercises":{"type":"array"}}}'
            ),
        ))

        # ── Diet Plan Generation ──────────────────────────────
        self.register(PromptTemplate(
            name="diet_plan_generation",
            version="1.0.0",
            description="Evidence-based diet plan with PubMed research context",
            model_hint="sonnet",
            max_tokens=3000,
            temperature=0.6,
            system_prompt=(
                "You are a registered dietitian with expertise in sports nutrition. "
                "Generate evidence-based meal plans using peer-reviewed research. "
                "Cite specific studies when possible. Return ONLY valid JSON."
            ),
            user_template=(
                "Create an evidence-based diet plan for:\n"
                "- Age: {age}\n"
                "- Weight: {weight} kg\n"
                "- Height: {height} cm\n"
                "- Goal: {goal}\n"
                "- Dietary restrictions: {restrictions}\n"
                "- Cuisine preferences: {cuisines}\n\n"
                "Research context:\n{research_context}\n\n"
                "Return JSON:\n"
                '{{"name":"...","description":"...","scientific_basis":"...",'
                '"calorie_target":2000,"protein_target":150,"carb_target":200,'
                '"fat_target":65,"evidence_level":"high|moderate|preliminary",'
                '"research_citations":["..."],"meals":[{{"name":"...","meal_type":"...",'
                '"calories":500,"protein":40,"carbs":50,"fat":20,'
                '"ingredients":["..."],"instructions":["..."],'
                '"nutritional_benefits":"...","research_backed":true}}]}}'
            ),
            output_schema=(
                '{"type":"object","required":["name","meals","calorie_target"]}'
            ),
        ))

        # ── AI Coach Chat ─────────────────────────────────────
        self.register(PromptTemplate(
            name="coach_chat",
            version="1.0.0",
            description="Conversational fitness coaching",
            model_hint="haiku",
            max_tokens=500,
            temperature=0.8,
            system_prompt=(
                "You are an expert AI fitness coach for the INO platform. "
                "Provide helpful, motivating, and evidence-based advice. "
                "Be conversational, supportive, and practical. "
                "Keep responses concise but informative. "
                "Never prescribe medication or diagnose medical conditions."
            ),
            user_template="{message}",
        ))

        # ── Form Analysis ─────────────────────────────────────
        self.register(PromptTemplate(
            name="form_analysis",
            version="1.0.0",
            description="Evaluate exercise form from MediaPipe pose data",
            model_hint="haiku",
            max_tokens=800,
            temperature=0.4,
            system_prompt=(
                "You are an expert biomechanics analyst. Evaluate exercise form "
                "from pose data and provide actionable corrections. "
                "Prioritise safety — flag any injury risks immediately. "
                "Return ONLY valid JSON."
            ),
            user_template=(
                "Analyze form for: {exercise_name}\n\n"
                "Pose data:\n"
                "- Frames analyzed: {frame_count}\n"
                "- Joint angles over time: {joint_angles}\n\n"
                "Return JSON: {{\"score\":0-100,\"strengths\":[\"...\"],"
                "\"improvements\":[\"...\"],\"recommendations\":[\"...\"],"
                "\"warnings\":[\"...\"],\"safety_level\":\"safe|caution|stop\"}}"
            ),
            output_schema=(
                '{"type":"object","required":["score","safety_level"]}'
            ),
        ))

        # ── Food Photo Analysis ───────────────────────────────
        self.register(PromptTemplate(
            name="food_analysis",
            version="1.0.0",
            description="Analyze food photo for macro extraction",
            model_hint="haiku",
            max_tokens=600,
            temperature=0.3,
            system_prompt=(
                "You are a nutritionist with expertise in portion estimation. "
                "Identify foods and estimate macronutrients from descriptions. "
                "Return ONLY valid JSON."
            ),
            user_template=(
                "Analyze this food and identify:\n"
                "1. All food items: {food_description}\n"
                "2. Estimated portion size\n"
                "3. Nutritional information\n\n"
                "Return JSON: {{\"foods\":[\"...\"],\"calories\":0,"
                "\"protein\":0,\"carbs\":0,\"fat\":0,"
                "\"portion_size\":\"...\",\"meal_type\":\"...\","
                "\"confidence\":0.0}}"
            ),
            output_schema=(
                '{"type":"object","required":["foods","calories"]}'
            ),
        ))

        # ── Motivation ────────────────────────────────────────
        self.register(PromptTemplate(
            name="motivation",
            version="1.0.0",
            description="Short motivational message",
            model_hint="haiku",
            max_tokens=100,
            temperature=0.9,
            system_prompt="You are an upbeat fitness coach.",
            user_template="Give me one short, motivational fitness quote (max 15 words).",
        ))

        # ── Reminder ──────────────────────────────────────────
        self.register(PromptTemplate(
            name="reminder",
            version="1.0.0",
            description="Context-aware reminder message",
            model_hint="haiku",
            max_tokens=60,
            temperature=0.7,
            system_prompt=(
                "You are a friendly AI fitness coach. Write one short (max 25 words), "
                "actionable, polite reminder message."
            ),
            user_template=(
                "Context: title={title}; goal={goal}; type={reminder_type}.\n"
                "Return only the reminder text."
            ),
        ))

        # ── Workout Modification ──────────────────────────────
        self.register(PromptTemplate(
            name="workout_modification",
            version="1.0.0",
            description="Suggest alternative exercises based on constraints",
            model_hint="haiku",
            max_tokens=500,
            temperature=0.6,
            system_prompt=(
                "You are a certified personal trainer specialising in exercise "
                "modifications and injury prevention. Return ONLY valid JSON."
            ),
            user_template=(
                "The user cannot perform {exercise_name} due to: {reason}\n"
                "Available equipment: {equipment}\n"
                "Space limitations: {space_limitations}\n\n"
                "Suggest 3 effective alternative exercises.\n"
                "Return JSON: {{\"alternatives\":[{{\"name\":\"...\","
                "\"description\":\"...\",\"why_suitable\":\"...\"}}]}}"
            ),
            output_schema=(
                '{"type":"object","required":["alternatives"]}'
            ),
        ))

        # ── Progress Analysis ─────────────────────────────────
        self.register(PromptTemplate(
            name="progress_analysis",
            version="1.0.0",
            description="Analyse client progress data and provide insights",
            model_hint="sonnet",
            max_tokens=800,
            temperature=0.5,
            system_prompt=(
                "You are a sports scientist. Analyse fitness progress data and "
                "provide actionable insights. Return ONLY valid JSON."
            ),
            user_template=(
                "Analyse this fitness progress data:\n{progress_data}\n\n"
                "Return JSON: {{\"summary\":\"...\",\"trends\":[\"...\"],"
                "\"recommendations\":[\"...\"],\"focus_areas\":[\"...\"]}}"
            ),
            output_schema=(
                '{"type":"object","required":["summary","recommendations"]}'
            ),
        ))

        # ── Supplement Recommendation ─────────────────────────
        self.register(PromptTemplate(
            name="supplement_evidence",
            version="1.0.0",
            description="Summarize PubMed citations for supplement evidence",
            model_hint="haiku",
            max_tokens=500,
            temperature=0.3,
            system_prompt=(
                "You are an expert nutrition scientist. Evaluate supplement evidence. "
                "Return ONLY valid JSON."
            ),
            user_template=(
                "For the supplement '{supplement_name}', these peer-reviewed studies were found:\n"
                "{citations_text}\n\n"
                "Provide a 2-3 sentence evidence summary and assign an evidence level.\n"
                "Return JSON: {{\"summary\":\"...\",\"evidence_level\":\"high|moderate|preliminary\"}}"
            ),
            output_schema=(
                '{"type":"object","required":["summary","evidence_level"]}'
            ),
        ))

        # ── Weekly Report ─────────────────────────────────────
        self.register(PromptTemplate(
            name="weekly_report",
            version="1.0.0",
            description="Generate weekly coaching report for a client",
            model_hint="sonnet",
            max_tokens=1200,
            temperature=0.5,
            system_prompt=(
                "You are a head coach writing a weekly progress report. "
                "Be encouraging but honest. Highlight wins and areas for improvement. "
                "Return ONLY valid JSON."
            ),
            user_template=(
                "Generate a weekly report for client:\n"
                "- Name: {client_name}\n"
                "- Workouts completed: {workouts_completed}/{workouts_planned}\n"
                "- Check-ins submitted: {checkins_submitted}\n"
                "- Weight trend: {weight_trend}\n"
                "- Adherence rate: {adherence_pct}%\n"
                "- Notes from coach: {coach_notes}\n\n"
                "Return JSON: {{\"title\":\"...\",\"summary\":\"...\","
                "\"wins\":[\"...\"],\"improvements\":[\"...\"],"
                "\"next_week_focus\":[\"...\"],\"motivation_message\":\"...\"}}"
            ),
            output_schema=(
                '{"type":"object","required":["title","summary","wins"]}'
            ),
        ))


# Singleton registry — import and use everywhere
registry = PromptRegistry()
