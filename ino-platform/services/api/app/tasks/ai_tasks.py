"""
AI Celery tasks — wired through the unified AI client pipeline.

Each task:
  1. Runs abuse prevention checks on input
  2. Calls ai_client.execute() which handles:
     prompts → cache → budget → circuit breaker → Claude API → validation → tracking
  3. Records actual token usage post-flight
  4. Returns standardized AIResponse dict
"""
import asyncio
import json
import logging

from app.worker import celery_app

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Run an async coroutine from a sync Celery task."""
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                return pool.submit(asyncio.run, coro).result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)


def _post_flight(response, coach_id: str, user_id: str) -> None:
    """Record actual token usage after a successful API call."""
    if response.cached or response.input_tokens == 0:
        return
    try:
        from app.services.ai_budget import record_actual_usage
        record_actual_usage(
            coach_id, user_id,
            prompt_name=response.prompt_name,
            model=response.model_used,
            input_tokens=response.input_tokens,
            output_tokens=response.output_tokens,
            cost_usd=response.cost_usd,
            latency_ms=response.latency_ms,
            cached=response.cached,
            status=response.status.value,
        )
    except Exception as exc:
        logger.error("post_flight_tracking_failed", extra={"error": str(exc)})


def _to_dict(response) -> dict:
    """Convert AIResponse to a JSON-serializable dict for Celery result backend."""
    return {
        "status": response.status.value,
        "data": response.data,
        "model_used": response.model_used,
        "prompt_name": response.prompt_name,
        "prompt_version": response.prompt_version,
        "input_tokens": response.input_tokens,
        "output_tokens": response.output_tokens,
        "cost_usd": round(response.cost_usd, 6),
        "latency_ms": response.latency_ms,
        "cached": response.cached,
        "errors": response.errors,
        "warnings": response.warnings,
    }


# ── Chat ──────────────────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="app.tasks.ai_tasks.ai_chat",
    max_retries=2,
    default_retry_delay=30,
    soft_time_limit=120,
    time_limit=180,
)
def ai_chat(self, user_id: str, coach_id: str, message: str, conversation_history: list):
    """Process an AI chat message through the full enterprise pipeline."""
    from app.services.ai_abuse import check_input, sanitize_input
    from app.services.ai_client import ai_client

    try:
        # 1. Abuse prevention
        clean_message = sanitize_input(message)
        abuse_check = check_input(clean_message, coach_id=coach_id, user_id=user_id)
        if not abuse_check.allowed:
            return {"status": "abuse_blocked", "error": abuse_check.reason}

        # 2. Execute through unified pipeline
        response = _run_async(ai_client.execute(
            prompt_name="coach_chat",
            coach_id=coach_id,
            user_id=user_id,
            plan_tier=_get_plan_tier(coach_id),
            conversation_history=conversation_history,
            message=clean_message,
        ))

        # 3. Post-flight tracking
        _post_flight(response, coach_id, user_id)

        return _to_dict(response)

    except Exception as exc:
        logger.error("ai_chat failed", extra={"user_id": user_id, "error": str(exc)})
        raise self.retry(exc=exc)


# ── Workout Generation ────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="app.tasks.ai_tasks.generate_workout",
    max_retries=2,
    default_retry_delay=60,
    soft_time_limit=180,
    time_limit=300,
)
def generate_workout(self, coach_id: str, client_id: str, params: dict):
    """Generate a workout plan through the enterprise pipeline."""
    from app.services.ai_client import ai_client

    try:
        response = _run_async(ai_client.execute(
            prompt_name="workout_generation",
            coach_id=coach_id,
            user_id=client_id,
            plan_tier=_get_plan_tier(coach_id),
            age=params.get("age", ""),
            gender=params.get("gender", ""),
            weight=params.get("weight", ""),
            height=params.get("height", ""),
            experience_level=params.get("experience_level", "beginner"),
            goals=params.get("goals", "general fitness"),
            equipment=params.get("equipment", "bodyweight"),
            days_per_week=params.get("days_per_week", 3),
        ))

        _post_flight(response, coach_id, client_id)
        return _to_dict(response)

    except Exception as exc:
        logger.error("generate_workout failed", extra={
            "coach_id": coach_id, "error": str(exc),
        })
        raise self.retry(exc=exc)


# ── Diet Plan Generation ──────────────────────────────────────

@celery_app.task(
    bind=True,
    name="app.tasks.ai_tasks.generate_diet_plan",
    max_retries=2,
    default_retry_delay=60,
    soft_time_limit=180,
    time_limit=300,
)
def generate_diet_plan(self, coach_id: str, client_id: str, params: dict):
    """Generate a diet plan with PubMed research backing through the enterprise pipeline."""
    from app.services.ai_client import ai_client

    try:
        # Fetch research context (re-use legacy pattern)
        research_context = _get_research_context(params)

        response = _run_async(ai_client.execute(
            prompt_name="diet_plan_generation",
            coach_id=coach_id,
            user_id=client_id,
            plan_tier=_get_plan_tier(coach_id),
            age=params.get("age", ""),
            weight=params.get("weight", ""),
            height=params.get("height", ""),
            goal=params.get("goal", "general health"),
            restrictions=params.get("restrictions", "none"),
            cuisines=params.get("cuisines", "any"),
            research_context=research_context,
        ))

        _post_flight(response, coach_id, client_id)
        return _to_dict(response)

    except Exception as exc:
        logger.error("generate_diet_plan failed", extra={
            "coach_id": coach_id, "error": str(exc),
        })
        raise self.retry(exc=exc)


# ── Form Analysis ─────────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="app.tasks.ai_tasks.analyze_form",
    max_retries=1,
    default_retry_delay=60,
    soft_time_limit=180,
    time_limit=300,
)
def analyze_form(self, coach_id: str, client_id: str, exercise_name: str, pose_data: dict):
    """Analyze exercise form from MediaPipe pose data."""
    from app.services.ai_client import ai_client

    try:
        response = _run_async(ai_client.execute(
            prompt_name="form_analysis",
            coach_id=coach_id,
            user_id=client_id,
            plan_tier=_get_plan_tier(coach_id),
            exercise_name=exercise_name,
            frame_count=pose_data.get("frame_count", 0),
            joint_angles=json.dumps(pose_data.get("angles", {})),
        ))

        _post_flight(response, coach_id, client_id)
        return _to_dict(response)

    except Exception as exc:
        logger.error("analyze_form failed", extra={"error": str(exc)})
        raise self.retry(exc=exc)


# ── Progress Analysis ─────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="app.tasks.ai_tasks.analyze_progress",
    max_retries=2,
    default_retry_delay=30,
    soft_time_limit=120,
    time_limit=180,
)
def analyze_progress(self, coach_id: str, client_id: str, progress_data: dict):
    """Analyze client progress and return insights."""
    from app.services.ai_client import ai_client

    try:
        response = _run_async(ai_client.execute(
            prompt_name="progress_analysis",
            coach_id=coach_id,
            user_id=client_id,
            plan_tier=_get_plan_tier(coach_id),
            progress_data=json.dumps(progress_data),
        ))

        _post_flight(response, coach_id, client_id)
        return _to_dict(response)

    except Exception as exc:
        logger.error("analyze_progress failed", extra={"error": str(exc)})
        raise self.retry(exc=exc)


# ── Weekly Report ─────────────────────────────────────────────

@celery_app.task(
    bind=True,
    name="app.tasks.ai_tasks.generate_weekly_report",
    max_retries=2,
    default_retry_delay=30,
    soft_time_limit=120,
    time_limit=180,
)
def generate_weekly_report(self, coach_id: str, client_id: str, report_data: dict):
    """Generate a weekly coaching report."""
    from app.services.ai_client import ai_client

    try:
        response = _run_async(ai_client.execute(
            prompt_name="weekly_report",
            coach_id=coach_id,
            user_id=client_id,
            plan_tier=_get_plan_tier(coach_id),
            client_name=report_data.get("client_name", "Client"),
            workouts_completed=report_data.get("workouts_completed", 0),
            workouts_planned=report_data.get("workouts_planned", 0),
            checkins_submitted=report_data.get("checkins_submitted", 0),
            weight_trend=report_data.get("weight_trend", "stable"),
            adherence_pct=report_data.get("adherence_pct", 0),
            coach_notes=report_data.get("coach_notes", ""),
        ))

        _post_flight(response, coach_id, client_id)
        return _to_dict(response)

    except Exception as exc:
        logger.error("generate_weekly_report failed", extra={"error": str(exc)})
        raise self.retry(exc=exc)


# ── Motivation ────────────────────────────────────────────────

@celery_app.task(
    name="app.tasks.ai_tasks.get_motivation",
    soft_time_limit=30,
    time_limit=60,
)
def get_motivation(user_id: str, coach_id: str = ""):
    """Get a motivational fitness quote."""
    from app.services.ai_client import ai_client

    response = _run_async(ai_client.execute(
        prompt_name="motivation",
        coach_id=coach_id,
        user_id=user_id,
        plan_tier=_get_plan_tier(coach_id) if coach_id else "starter",
    ))
    return _to_dict(response)


# ── Reminder ──────────────────────────────────────────────────

@celery_app.task(
    name="app.tasks.ai_tasks.generate_reminder",
    soft_time_limit=30,
    time_limit=60,
)
def generate_reminder(user_id: str, coach_id: str = "", context: dict | None = None):
    """Generate a context-aware reminder message via ReminderService."""
    from app.services.reminder_service import reminder_service

    result = _run_async(reminder_service.send_one(user_id, coach_id, context))
    return {
        "user_id": result.user_id,
        "coach_id": result.coach_id,
        "reminder_type": result.reminder_type,
        "ai_text": result.ai_text,
        "delivered_via": result.delivered_via,
        "error": result.error,
    }


# ── Helpers ───────────────────────────────────────────────────

def _get_plan_tier(coach_id: str) -> str:
    """Look up coach's plan tier.  Falls back to 'starter' if unavailable."""
    # In production this would query DB or cached subscription state.
    # For now, return a safe default.
    try:
        import redis as redis_lib
        from app.core.config import settings
        r = redis_lib.from_url(
            f"{settings.REDIS_URL.rsplit('/', 1)[0]}/3",
            decode_responses=True,
        )
        tier = r.get(f"coach_tier:{coach_id}")
        return tier if tier in ("trial", "starter", "pro", "scale") else "starter"
    except Exception:
        return "starter"


def _get_research_context(params: dict) -> str:
    """Fetch PubMed research context for diet plans.

    Simplified version of the legacy _get_research_context.
    In production, this would call the PubMed API via httpx.
    """
    try:
        import httpx

        goal = params.get("goal", "general health").lower()
        queries = []

        if "weight loss" in goal:
            queries.append("protein intake weight loss randomized controlled trial")
        elif "muscle" in goal:
            queries.append("protein synthesis resistance training nutrition")
        elif "endurance" in goal:
            queries.append("carbohydrate loading endurance performance")
        else:
            queries.append(f"{goal} nutrition randomized trial")

        summaries = []
        base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

        for query in queries[:2]:
            try:
                resp = httpx.get(
                    f"{base_url}/esearch.fcgi",
                    params={"db": "pubmed", "term": query, "retmax": 3, "rettype": "json"},
                    timeout=5.0,
                )
                data = resp.json()
                pmids = data.get("esearchresult", {}).get("idlist", [])

                if pmids:
                    fetch_resp = httpx.get(
                        f"{base_url}/esummary.fcgi",
                        params={"db": "pubmed", "id": ",".join(pmids), "rettype": "json"},
                        timeout=5.0,
                    )
                    fetch_data = fetch_resp.json()
                    for pmid in pmids:
                        article = fetch_data.get("result", {}).get(pmid, {})
                        title = article.get("title", "")
                        source = article.get("source", "")
                        year = article.get("pubdate", "")[:4]
                        if title:
                            summaries.append(f"{title} ({source}, {year}) - PMID: {pmid}")
            except Exception:
                continue

        if summaries:
            return "Based on recent peer-reviewed research:\n" + "\n".join(
                f"- {s}" for s in summaries[:5]
            )
        return "Plan based on established nutritional guidelines."

    except Exception:
        return "Plan based on established nutritional guidelines (research fetch unavailable)."
