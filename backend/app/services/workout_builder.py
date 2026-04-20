"""AI Workout Builder — parse text, generate descriptions, match videos."""
import json
import logging
import re
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.infrastructure.database.models import (
    ExerciseDefinition,
    TemplateExercise,
    WorkoutTemplate,
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# 1. NLP WORKOUT PARSER
# ---------------------------------------------------------------------------

# Matches: "Bench Press 4x8" or "Lat Pulldown 3x12 @RPE8" or "Squats 5x5 60s rest"
_EXERCISE_RE = re.compile(
    r"(?P<name>[A-Za-z][A-Za-z &\-'/]+?)"          # exercise name
    r"\s+"
    r"(?P<sets>\d+)\s*[xX×]\s*(?P<reps>\d+)"       # sets x reps
    r"(?:\s*@?\s*RPE\s*(?P<rpe>\d+\.?\d*))?"        # optional RPE
    r"(?:\s*(?P<rest>\d+)\s*s(?:ec)?\s*rest)?"       # optional rest
    r"(?:\s*[-–—]\s*(?P<notes>.+))?"                 # optional notes after dash
)

# Muscle group guessing from exercise name
_MUSCLE_MAP: dict[str, list[str]] = {
    "chest":     ["bench press", "chest press", "push up", "pushup", "pec fly", "dumbbell fly", "cable fly", "incline press", "decline press"],
    "back":      ["row", "pull up", "pullup", "lat pulldown", "pulldown", "deadlift", "chin up", "cable row", "t-bar"],
    "shoulders": ["ohp", "overhead press", "shoulder press", "lateral raise", "front raise", "face pull", "arnold press", "military press"],
    "quads":     ["squat", "leg press", "lunge", "leg extension", "front squat", "goblet squat", "hack squat", "split squat"],
    "hamstrings":["leg curl", "romanian deadlift", "rdl", "stiff leg", "good morning", "nordic curl"],
    "glutes":    ["hip thrust", "glute bridge", "cable kickback", "sumo deadlift"],
    "biceps":    ["curl", "bicep", "hammer curl", "preacher curl", "concentration curl"],
    "triceps":   ["tricep", "pushdown", "skull crusher", "dip", "close grip bench", "overhead extension"],
    "calves":    ["calf raise", "calf press", "seated calf"],
    "core":      ["plank", "crunch", "sit up", "ab wheel", "russian twist", "leg raise", "cable crunch", "wood chop"],
}


def _guess_muscle_group(name: str) -> str:
    low = name.lower().strip()
    for group, keywords in _MUSCLE_MAP.items():
        for kw in keywords:
            if kw in low:
                return group
    return "general"


def parse_workout_text(text: str) -> list[dict]:
    """Parse freeform workout text into structured exercises.

    Supports formats:
      - "Bench Press 4x8, Lat Pulldown 3x10"
      - "Bench Press 4x8\\nSquats 5x5"
      - "1. Bench Press 4x8 @RPE7 - heavy day"
    """
    # Split on commas, newlines, or numbered lists
    raw_lines = re.split(r"[,\n]+", text)
    exercises: list[dict] = []

    for idx, line in enumerate(raw_lines):
        line = line.strip()
        # Strip leading numbering: "1." or "1)" or "-"
        line = re.sub(r"^\d+[.)]\s*", "", line)
        line = re.sub(r"^[-–—]\s*", "", line)
        if not line:
            continue

        m = _EXERCISE_RE.match(line)
        if m:
            exercises.append({
                "exercise_name": m.group("name").strip().title(),
                "sets": int(m.group("sets")),
                "reps": int(m.group("reps")),
                "rpe": float(m.group("rpe")) if m.group("rpe") else None,
                "rest_seconds": int(m.group("rest")) if m.group("rest") else 60,
                "notes": (m.group("notes") or "").strip() or None,
                "order_index": idx,
                "muscle_group": _guess_muscle_group(m.group("name")),
            })
        else:
            # Couldn't parse — keep as raw text entry
            exercises.append({
                "exercise_name": line.strip().title(),
                "sets": 3,
                "reps": 10,
                "rpe": None,
                "rest_seconds": 60,
                "notes": None,
                "order_index": idx,
                "muscle_group": _guess_muscle_group(line),
            })

    return exercises


# ---------------------------------------------------------------------------
# 2. AI DESCRIPTION GENERATOR (Claude or Fallback)
# ---------------------------------------------------------------------------

_FALLBACK_DESCRIPTIONS: dict[str, dict] = {
    "bench press": {
        "description": "Lie on a flat bench, grip the barbell slightly wider than shoulder-width. Unrack, lower to mid-chest, then press up to full lockout.",
        "cues": ["Drive feet into floor", "Squeeze shoulder blades together", "Touch chest lightly", "Press in a slight arc"],
        "common_mistakes": ["Flaring elbows too wide", "Bouncing bar off chest", "Lifting hips off bench"],
        "muscles": ["chest", "triceps", "anterior deltoids"],
    },
    "squat": {
        "description": "Place the barbell across your upper traps. Brace core, push hips back and bend knees until thighs are parallel. Drive up through heels.",
        "cues": ["Chest up", "Knees track over toes", "Brace before descent", "Full depth"],
        "common_mistakes": ["Knees caving inward", "Rising on toes", "Rounding lower back", "Half-repping"],
        "muscles": ["quads", "glutes", "hamstrings", "core"],
    },
    "deadlift": {
        "description": "Stand with feet hip-width, grip the bar just outside your legs. Brace, drive through the floor and stand up, keeping the bar close to your body.",
        "cues": ["Push the floor away", "Lock hips at the top", "Bar stays against your legs", "Neutral spine"],
        "common_mistakes": ["Rounding the back", "Jerking the bar", "Hips shooting up first"],
        "muscles": ["back", "glutes", "hamstrings", "core"],
    },
}


def generate_exercise_description_fallback(name: str) -> dict:
    """Return a structured exercise description using hardcoded library."""
    low = name.lower().strip()
    for key, data in _FALLBACK_DESCRIPTIONS.items():
        if key in low:
            return data
    muscles = _guess_muscle_group(name)
    return {
        "description": f"Perform {name} with controlled form, full range of motion, and consistent tempo.",
        "cues": ["Control the eccentric", "Breathe rhythmically", "Maintain tension"],
        "common_mistakes": ["Using momentum", "Partial range of motion"],
        "muscles": [muscles] if muscles != "general" else ["multiple"],
    }


async def generate_exercise_description_ai(name: str, ai_service) -> dict:
    """Use Claude to generate a rich exercise description."""
    try:
        prompt = f"""Generate a structured exercise guide for "{name}".
Return ONLY valid JSON:
{{
  "description": "How to perform (2-3 sentences)",
  "cues": ["cue1", "cue2", "cue3", "cue4"],
  "common_mistakes": ["mistake1", "mistake2", "mistake3"],
  "muscles": ["primary", "secondary"]
}}"""
        import asyncio
        response = await asyncio.to_thread(
            ai_service.client.messages.create,
            model=ai_service.model,
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        # Extract JSON from possible markdown wrapping
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()
        return json.loads(text)
    except Exception as e:
        logger.warning("AI description generation failed for %s: %s", name, e)
        return generate_exercise_description_fallback(name)


# ---------------------------------------------------------------------------
# 3. VIDEO MATCHING
# ---------------------------------------------------------------------------

# Curated exercise video library (YouTube embed IDs)
_VIDEO_LIBRARY: dict[str, str] = {
    "bench press":      "rT7DgCr-3pg",
    "squat":            "ultWZbUMPL8",
    "deadlift":         "op9kVnSso6Q",
    "overhead press":   "2yjwXTZQDDI",
    "barbell row":      "kBWAon7ItDw",
    "pull up":          "eGo4IYlbE5g",
    "lat pulldown":     "CAwf7n6Luuc",
    "dumbbell curl":    "ykJmrZ5v0Oo",
    "tricep pushdown":  "2-LAMcpzODU",
    "leg press":        "IZxyjW7MPJQ",
    "romanian deadlift":"jEy_czb3RKA",
    "hip thrust":       "SEdqd1n0cvg",
    "lateral raise":    "3VcKaXpzqRo",
    "cable fly":        "Iwe6AmxVf7o",
    "leg curl":         "1Tq3QdYUuHs",
    "leg extension":    "YyvSfVjQeL0",
    "plank":            "ASdvN_XEl_c",
    "calf raise":       "-M4-G8p8fmc",
    "face pull":        "rep-qVOkqgk",
    "dip":              "2z8JmcrW-As",
    "lunge":            "QOVaHwm-Q6U",
}


def match_video(exercise_name: str) -> dict:
    """Match an exercise to a demo video from the library."""
    low = exercise_name.lower().strip()
    for key, yt_id in _VIDEO_LIBRARY.items():
        if key in low or low in key:
            return {
                "source": "youtube",
                "youtube_id": yt_id,
                "url": f"https://www.youtube.com/embed/{yt_id}",
                "thumbnail": f"https://img.youtube.com/vi/{yt_id}/hqdefault.jpg",
            }
    return {
        "source": "none",
        "youtube_id": None,
        "url": None,
        "thumbnail": None,
    }


# ---------------------------------------------------------------------------
# 3b. SMART WORKOUT GENERATOR (natural language fallback)
# ---------------------------------------------------------------------------

_PRESET_WORKOUTS: dict[str, str] = {
    "push": "Bench Press 4x8, Incline Dumbbell Press 3x10, Cable Fly 3x12, Overhead Press 3x8, Lateral Raise 3x15, Tricep Pushdown 3x12",
    "pull": "Barbell Row 4x8, Lat Pulldown 3x10, Face Pull 3x15, Dumbbell Curl 3x12, Cable Row 3x10, Deadlift 3x5",
    "leg": "Squat 4x8, Romanian Deadlift 3x10, Leg Press 3x12, Leg Curl 3x12, Leg Extension 3x15, Calf Raise 4x15",
    "upper": "Bench Press 4x8, Barbell Row 4x8, Overhead Press 3x10, Lat Pulldown 3x10, Dumbbell Curl 3x12, Tricep Pushdown 3x12",
    "lower": "Squat 4x8, Romanian Deadlift 3x10, Leg Press 3x12, Lunge 3x10, Leg Curl 3x12, Calf Raise 4x15",
    "full body": "Squat 4x8, Bench Press 4x8, Barbell Row 4x8, Overhead Press 3x10, Deadlift 3x5, Plank 3x30",
    "chest": "Bench Press 4x8, Incline Dumbbell Press 3x10, Cable Fly 3x12, Dip 3x10",
    "back": "Deadlift 3x5, Barbell Row 4x8, Lat Pulldown 3x10, Cable Row 3x12, Face Pull 3x15",
    "shoulder": "Overhead Press 4x8, Lateral Raise 4x15, Face Pull 3x15, Barbell Row 3x10",
    "arm": "Dumbbell Curl 4x10, Tricep Pushdown 4x12, Hammer Curl 3x10, Overhead Extension 3x12",
    "hiit": "Squat 5x10, Push Up 5x15, Lunge 5x10, Plank 5x30",
    "strength": "Squat 5x5, Bench Press 5x5, Deadlift 5x5, Overhead Press 5x5, Barbell Row 5x5",
    "hypertrophy": "Bench Press 4x10, Squat 4x10, Barbell Row 4x10, Overhead Press 3x12, Lat Pulldown 3x12, Dumbbell Curl 3x15, Tricep Pushdown 3x15",
}


def _detect_natural_language(text: str) -> str | None:
    """If text looks like a natural language request, return matching preset key."""
    low = text.lower().strip()
    # Must NOT contain sets×reps pattern to be "natural language"
    if re.search(r"\d+\s*[xX×]\s*\d+", low):
        return None
    for key in _PRESET_WORKOUTS:
        if key in low:
            return key
    # Common phrases
    if any(w in low for w in ["generate", "create", "make", "give me", "build"]):
        for key in _PRESET_WORKOUTS:
            if key in low:
                return key
        # Default to full body if nothing matches
        if any(w in low for w in ["workout", "session", "routine", "training"]):
            return "full body"
    return None


# ---------------------------------------------------------------------------
# 4. FULL WORKOUT BUILDER (orchestrator)
# ---------------------------------------------------------------------------


def build_workout_from_text(
    db: Session, trainer_id: str, name: str, text: str
) -> dict:
    """Parse workout text → create template → enrich with descriptions + videos."""
    # Try natural language detection first
    preset_key = _detect_natural_language(text)
    if preset_key:
        text = _PRESET_WORKOUTS[preset_key]

    parsed = parse_workout_text(text)
    if not parsed:
        return {"error": "Could not parse exercises. Try format: 'Bench Press 4x8, Squats 5x5'"}

    # Create template
    template = WorkoutTemplate(
        id=str(uuid.uuid4()),
        trainer_id=trainer_id,
        name=name,
        description=f"Auto-built from: {text[:100]}",
        weeks=1,
        days_per_week=1,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(template)
    db.flush()

    enriched: list[dict] = []
    for ex in parsed:
        # Ensure in catalog
        defn = (
            db.query(ExerciseDefinition)
            .filter(ExerciseDefinition.name == ex["exercise_name"])
            .first()
        )
        if not defn:
            defn = ExerciseDefinition(
                id=str(uuid.uuid4()),
                name=ex["exercise_name"],
                muscle_group=ex["muscle_group"],
            )
            db.add(defn)
            db.flush()

        # Create template exercise
        te = TemplateExercise(
            id=str(uuid.uuid4()),
            template_id=template.id,
            exercise_name=ex["exercise_name"],
            sets=ex["sets"],
            reps=ex["reps"],
            rest_seconds=ex["rest_seconds"],
            notes=ex.get("notes"),
            order_index=ex["order_index"],
        )
        db.add(te)

        # Enrich with description + video
        desc = generate_exercise_description_fallback(ex["exercise_name"])
        video = match_video(ex["exercise_name"])

        # Update definition with enrichment if empty
        if not defn.description:
            defn.description = desc["description"]
            defn.cues = desc["cues"]
            defn.common_mistakes = desc["common_mistakes"]
            defn.secondary_muscles = desc["muscles"]
        if not defn.video_url and video["url"]:
            defn.video_url = video["url"]
            defn.thumbnail_url = video["thumbnail"]

        enriched.append({
            "id": te.id,
            "exercise_name": ex["exercise_name"],
            "sets": ex["sets"],
            "reps": ex["reps"],
            "rest_seconds": ex["rest_seconds"],
            "rpe": ex.get("rpe"),
            "notes": ex.get("notes"),
            "order_index": ex["order_index"],
            "muscle_group": ex["muscle_group"],
            "description": defn.description,
            "cues": defn.cues,
            "common_mistakes": defn.common_mistakes,
            "muscles": defn.secondary_muscles,
            "video": video,
        })

    db.commit()

    return {
        "template_id": template.id,
        "name": template.name,
        "exercises": enriched,
        "exercise_count": len(enriched),
        "muscle_groups": list({e["muscle_group"] for e in enriched}),
    }


async def enrich_exercise_ai(
    db: Session, exercise_name: str, ai_service
) -> dict:
    """Enrich a single exercise with AI-generated description + video match."""
    desc = await generate_exercise_description_ai(exercise_name, ai_service)
    video = match_video(exercise_name)

    # Persist to catalog
    defn = (
        db.query(ExerciseDefinition)
        .filter(ExerciseDefinition.name == exercise_name)
        .first()
    )
    if defn:
        defn.description = desc.get("description")
        defn.cues = desc.get("cues")
        defn.common_mistakes = desc.get("common_mistakes")
        defn.secondary_muscles = desc.get("muscles")
        if video["url"]:
            defn.video_url = video["url"]
            defn.thumbnail_url = video["thumbnail"]
        db.commit()

    return {
        "exercise_name": exercise_name,
        "description": desc,
        "video": video,
        "muscle_group": _guess_muscle_group(exercise_name),
    }
