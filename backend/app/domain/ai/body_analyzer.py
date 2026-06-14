"""AI-powered body analysis service using Claude."""
import asyncio
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional

import anthropic


BODY_ANALYSIS_SYSTEM_PROMPT = (
    "You are an expert sports-science analyst and strength coach. "
    "Analyze training volume, muscle recovery, and symmetry data to produce "
    "actionable coaching insights. Be precise with numbers and direct with "
    "recommendations.\n"
    "CRITICAL OUTPUT RULE: Respond with a single valid JSON object only. "
    "No markdown fences, no commentary, no preamble."
)


class BodyAnalyzerService:
    """Service for AI-powered body analysis features using Claude."""

    def __init__(self):
        self.client = anthropic.Anthropic()
        self.model = "claude-3-5-sonnet-20241022"

    async def _create_message(self, **kwargs):
        """Run blocking Anthropic API call in thread pool to avoid blocking the event loop."""
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self.client.messages.create(**kwargs)
        )

    # ------------------------------------------------------------------
    # Mock helpers (used when ANTHROPIC_API_KEY is not configured)
    # ------------------------------------------------------------------

    def _mock_analysis_summary(self, muscle_data: Dict[str, Any], total_volume: float) -> Dict[str, Any]:
        """Fallback analysis returned when ANTHROPIC_API_KEY is not configured."""
        return {
            "summary": (
                f"Weekly volume of {total_volume:.0f} sets logged. "
                "Set ANTHROPIC_API_KEY for AI-generated analysis."
            ),
            "overall_grade": "B",
            "symmetry_score": 78.0,
            "imbalance_score": 12.0,
            "training_readiness": 72.0,
            "muscle_highlights": [],
            "recommendations": [
                "Maintain current volume and ensure progressive overload.",
                "Balance pushing and pulling movements.",
            ],
        }

    def _mock_training_readiness(self, muscle_snapshots: list) -> Dict[str, Any]:
        """Fallback readiness returned when ANTHROPIC_API_KEY is not configured."""
        ready = []
        recovering = []
        fatigued = []
        for snap in muscle_snapshots:
            status = getattr(snap, "recovery_status", None) or "recovered"
            slug = getattr(snap, "muscle_slug", "unknown")
            if status == "recovered":
                ready.append(slug)
            elif status in ("recovering",):
                recovering.append(slug)
            else:
                fatigued.append(slug)
        return {
            "overall_readiness": 70.0,
            "ready_muscles": ready or ["chest", "back"],
            "recovering_muscles": recovering or ["quadriceps"],
            "fatigued_muscles": fatigued,
            "suggested_focus": ready[:3] if ready else ["upper body"],
            "recommendation": (
                "AI readiness analysis unavailable (no ANTHROPIC_API_KEY). "
                "Focus on recovered muscle groups today."
            ),
        }

    # ------------------------------------------------------------------
    # Public methods
    # ------------------------------------------------------------------

    async def generate_analysis_summary(
        self,
        user_id: str,
        muscle_data: Dict[str, Any],
        total_volume: float,
        week_number: int,
        year: int,
    ) -> Dict[str, Any]:
        """Generate a personalized analysis summary for a weekly snapshot.

        Falls back to a deterministic mock when ANTHROPIC_API_KEY is not set.
        """
        if not os.environ.get("ANTHROPIC_API_KEY"):
            return self._mock_analysis_summary(muscle_data, total_volume)

        prompt = f"""
Analyze the following weekly training data for user {user_id} (Week {week_number}, {year}):

Total weekly volume (sets): {total_volume}
Per-muscle breakdown: {json.dumps(muscle_data)}

Provide:
1. A concise 2-3 sentence coaching summary.
2. An overall letter grade (A/B/C/D/F) based on volume distribution and balance.
3. A symmetry score (0-100) comparing left/right and push/pull balance.
4. An imbalance score (0-100, lower is better).
5. A training readiness estimate (0-100).
6. Top muscle highlights (strongest and weakest areas).
7. 2-4 actionable recommendations for next week.

Return JSON:
{{
    "summary": "...",
    "overall_grade": "A|B|C|D|F",
    "symmetry_score": 0.0,
    "imbalance_score": 0.0,
    "training_readiness": 0.0,
    "muscle_highlights": [{{"muscle": "...", "status": "strong|weak|balanced"}}],
    "recommendations": ["..."]
}}
""".strip()

        try:
            message = await self._create_message(
                model=self.model,
                max_tokens=1024,
                system=[
                    {
                        "type": "text",
                        "text": BODY_ANALYSIS_SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                messages=[{"role": "user", "content": prompt}],
            )
        except Exception as e:
            print(f"Body analysis via Claude failed, using mock fallback: {e}")
            return self._mock_analysis_summary(muscle_data, total_volume)

        response_text = message.content[0].text
        try:
            return json.loads(response_text)
        except Exception:
            try:
                json_start = response_text.find("{")
                json_end = response_text.rfind("}") + 1
                return json.loads(response_text[json_start:json_end])
            except Exception:
                return self._mock_analysis_summary(muscle_data, total_volume)

    async def generate_training_readiness(
        self,
        user_id: str,
        muscle_snapshots: list,
    ) -> Dict[str, Any]:
        """Generate training readiness assessment from recent muscle snapshots.

        Falls back to a deterministic mock when ANTHROPIC_API_KEY is not set.
        """
        if not os.environ.get("ANTHROPIC_API_KEY"):
            return self._mock_training_readiness(muscle_snapshots)

        snapshot_data = []
        for snap in muscle_snapshots:
            snapshot_data.append({
                "muscle": getattr(snap, "muscle_slug", "unknown"),
                "volume": getattr(snap, "weekly_volume", 0),
                "recovery_status": getattr(snap, "recovery_status", "unknown"),
                "recovery_readiness": getattr(snap, "recovery_readiness", None),
                "growth_phase": getattr(snap, "growth_phase", None),
            })

        prompt = f"""
Assess training readiness for user {user_id} based on their latest muscle data:

{json.dumps(snapshot_data, indent=2)}

Provide:
1. Overall readiness score (0-100).
2. List of muscles that are fully recovered and ready to train.
3. List of muscles still recovering.
4. List of fatigued/overtrained muscles to avoid.
5. Suggested muscle groups to focus on today.
6. A brief recommendation (1-2 sentences).

Return JSON:
{{
    "overall_readiness": 0.0,
    "ready_muscles": ["..."],
    "recovering_muscles": ["..."],
    "fatigued_muscles": ["..."],
    "suggested_focus": ["..."],
    "recommendation": "..."
}}
""".strip()

        try:
            message = await self._create_message(
                model=self.model,
                max_tokens=800,
                system=[
                    {
                        "type": "text",
                        "text": BODY_ANALYSIS_SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                messages=[{"role": "user", "content": prompt}],
            )
        except Exception as e:
            print(f"Training readiness via Claude failed, using mock fallback: {e}")
            return self._mock_training_readiness(muscle_snapshots)

        response_text = message.content[0].text
        try:
            return json.loads(response_text)
        except Exception:
            try:
                json_start = response_text.find("{")
                json_end = response_text.rfind("}") + 1
                return json.loads(response_text[json_start:json_end])
            except Exception:
                return self._mock_training_readiness(muscle_snapshots)

    async def generate_form_suggestions(
        self,
        exercise_name: str,
        form_issues: List[Dict[str, Any]],
    ) -> List[str]:
        """Generate improvement suggestions for detected form issues.

        Falls back to generic advice when ANTHROPIC_API_KEY is not set.
        """
        if not os.environ.get("ANTHROPIC_API_KEY"):
            return [
                f"Focus on controlled tempo during {exercise_name}.",
                "Record yourself from the side to check alignment.",
                "Start with a lighter weight to reinforce proper mechanics.",
            ]

        prompt = f"""
For the exercise "{exercise_name}", the following form issues were detected:
{json.dumps(form_issues, indent=2)}

Provide 3-5 specific, actionable improvement suggestions.
Return JSON: {{"suggestions": ["..."]}}
""".strip()

        try:
            message = await self._create_message(
                model=self.model,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}],
            )
            response_text = message.content[0].text
            try:
                parsed = json.loads(response_text)
                return parsed.get("suggestions", [])
            except Exception:
                json_start = response_text.find("{")
                json_end = response_text.rfind("}") + 1
                parsed = json.loads(response_text[json_start:json_end])
                return parsed.get("suggestions", [])
        except Exception as e:
            print(f"Form suggestions via Claude failed: {e}")
            return [
                f"Focus on controlled tempo during {exercise_name}.",
                "Record yourself from the side to check alignment.",
            ]
