"""
cue_engine.py
-------------
Real-time coaching cue generator. Produces specific, actionable verbal cues
based on form sub-scores, injury flags, fatigue state, joint angles, and
movement phase. Designed to be called every frame (or every rep) by the
main engine loop.

Priority order (safety first):
    injury > fatigue > ROM > tempo > symmetry > control > stability

The engine picks the SINGLE highest-priority cue and suppresses it for a
cooldown window to avoid nagging. Every cue is numeric and contextual —
never "bad form"; always "Lower 2 more inches to reach full depth".

Usage
~~~~~
    cue_eng = CueEngine()
    text = cue_eng.generate_cue(
        exercise="barbell_back_squat",
        sub_scores={"ROM": 72, "Stability": 88, "Tempo": 60, "Symmetry": 91, "Control": 85},
        injury_flags={"knee_valgus": {"level": "watch", "value": 0.09}},
        fatigue={"level": 70, "status": "Fatiguing", "rir": 2.0},
        angles={"left_knee": 95, "right_knee": 98, "hip": 80, "elbow": 155},
        phase="descent",
    )
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Types
# ---------------------------------------------------------------------------

@dataclass
class CueResult:
    """Returned by generate_cue — includes the text plus metadata for overlays."""
    text: str
    priority: int          # 0 = highest (injury), 6 = lowest (general)
    category: str          # injury | fatigue | rom | tempo | symmetry | control | stability | general
    exercise: str


# ---------------------------------------------------------------------------
# Cue database — keyed by exercise *category* slug
# ---------------------------------------------------------------------------
# Each entry: (condition_fn, priority, category, template)
#   condition_fn(sub_scores, injury_flags, fatigue, angles, phase) -> Optional[str]
#       Returns a formatted cue string if the condition fires, else None.
#   priority: 0 = injury, 1 = fatigue, 2 = ROM, 3 = tempo, 4 = symmetry,
#             5 = control, 6 = stability / general

CueEntry = Tuple[Callable, int, str, str]  # (fn, priority, category, label)


def _score(sub: dict, key: str) -> Optional[float]:
    """Safely pull a sub-score (may be None)."""
    v = sub.get(key)
    return float(v) if v is not None else None


def _angle(angles: dict, key: str) -> Optional[float]:
    v = angles.get(key)
    return float(v) if v is not None else None


def _injury_level(flags: dict, slug: str) -> str:
    entry = flags.get(slug, {})
    return entry.get("level", "ok")


def _injury_value(flags: dict, slug: str) -> float:
    entry = flags.get(slug, {})
    return float(entry.get("value", 0.0))


# ---- helpers for building cue condition functions ----

def _check_injury(slug: str, min_level: str = "watch"):
    """Return a condition that fires when an injury flag is at or above min_level."""
    order = {"ok": 0, "low": 1, "watch": 2, "high": 3}
    threshold = order.get(min_level, 2)

    def _fn(sub: dict, inj: dict, fat: dict, ang: dict, phase: str) -> Optional[str]:
        lvl = _injury_level(inj, slug)
        if order.get(lvl, 0) >= threshold:
            return ""  # template will be used
        return None
    return _fn


# ---------------------------------------------------------------------------
# Per-category cue databases
# ---------------------------------------------------------------------------

# The structure: list of (condition_fn, priority, category, cue_template)
# condition_fn signature: (sub_scores, injury_flags, fatigue, angles, phase) -> Optional[str]
# If it returns a non-None string, that IS the cue text (overrides template).
# If it returns "", the template string is used as-is.


def _bench_cues() -> List[CueEntry]:
    """Bench Press variants — flat, incline, decline, dumbbell, close-grip."""

    def elbow_flare(sub, inj, fat, ang, phase):
        elbow = _angle(ang, "elbow_flare")
        if elbow is not None and elbow > 75:
            excess = round(elbow - 75)
            return f"Tuck your elbows {excess}° closer to your torso — they're flaring wide."
        return None

    def bar_path(sub, inj, fat, ang, phase):
        drift = _angle(ang, "bar_drift")
        if drift is not None and abs(drift) > 5:
            direction = "toward your face" if drift > 0 else "toward your belly"
            return f"Bring the bar path back — it's drifting {abs(round(drift))}° {direction}."
        return None

    def scapular_retraction(sub, inj, fat, ang, phase):
        if _injury_level(inj, "rounded_shoulders") in ("watch", "high"):
            return "Retract your shoulder blades before the next rep — squeeze them together and down."
        s = _score(sub, "Stability")
        if s is not None and s < 70:
            return "Pin your shoulder blades into the bench — you're losing upper-back tightness."
        return None

    def arch(sub, inj, fat, ang, phase):
        lumbar = _angle(ang, "lumbar_arch")
        if lumbar is not None and lumbar < 5:
            return "Maintain a slight arch — your back is flat against the bench, losing leg drive."
        return None

    def leg_drive(sub, inj, fat, ang, phase):
        ctrl = _score(sub, "Control")
        if ctrl is not None and ctrl < 65 and phase in ("ascent", "concentric"):
            return "Drive your feet into the floor — use leg drive to stabilize the press."
        return None

    def wrist_alignment(sub, inj, fat, ang, phase):
        wrist = _angle(ang, "wrist_extension")
        if wrist is not None and wrist > 30:
            return f"Straighten your wrists — they're bent back {round(wrist)}°, risking strain."
        return None

    def tempo_bench(sub, inj, fat, ang, phase):
        t = _score(sub, "Tempo")
        if t is not None and t < 60 and phase in ("descent", "eccentric"):
            return "Slow down the eccentric — 2–3 seconds down to the chest."
        if t is not None and t < 60 and phase in ("ascent", "concentric"):
            return "You're grinding — explode through the concentric and lock out."
        return None

    def lockout(sub, inj, fat, ang, phase):
        elbow = _angle(ang, "elbow")
        if elbow is not None and phase in ("top", "lockout") and elbow < 165:
            gap = round(180 - elbow)
            return f"Lock out fully — extend {gap}° more at the top."
        return None

    return [
        (elbow_flare,         2, "rom",       "elbow_flare"),
        (bar_path,            2, "rom",       "bar_path"),
        (scapular_retraction, 0, "stability", "scap_retraction"),
        (arch,                5, "stability", "arch"),
        (leg_drive,           5, "control",   "leg_drive"),
        (wrist_alignment,     0, "injury",    "wrist_alignment"),
        (tempo_bench,         3, "tempo",     "tempo"),
        (lockout,             2, "rom",       "lockout"),
    ]


def _squat_cues() -> List[CueEntry]:
    """Squat variants — back squat, front squat, goblet, Bulgarian split, leg press."""

    def knee_cave(sub, inj, fat, ang, phase):
        if _injury_level(inj, "knee_valgus") in ("watch", "high"):
            val = _injury_value(inj, "knee_valgus")
            deg = round(val * 90)  # approximate degrees from ratio
            return f"Drive your knees out slightly — they're caving {deg}° inward."
        return None

    def depth(sub, inj, fat, ang, phase):
        hip = _angle(ang, "hip")
        knee = _angle(ang, "left_knee") or _angle(ang, "right_knee")
        if phase in ("bottom", "descent") and knee is not None and knee > 100:
            inches = round((knee - 90) * 0.3)  # rough estimate
            if inches > 0:
                return f"Lower {inches} more inches to reach parallel — crease of hip below knee."
        r = _score(sub, "ROM")
        if r is not None and r < 65:
            return "You're cutting depth short — sit deeper into the hole."
        return None

    def chest_up(sub, inj, fat, ang, phase):
        if _injury_level(inj, "lumbar_flexion") in ("watch", "high"):
            return "Chest up — you're rounding forward. Brace your core and look ahead."
        torso = _angle(ang, "torso_lean")
        if torso is not None and torso > 55:
            return f"Your torso is leaning {round(torso)}° forward — stay more upright."
        return None

    def hip_drive(sub, inj, fat, ang, phase):
        if phase in ("ascent", "concentric"):
            ctrl = _score(sub, "Control")
            if ctrl is not None and ctrl < 70:
                return "Lead with your chest on the way up — don't let your hips shoot back."
        return None

    def bracing(sub, inj, fat, ang, phase):
        stab = _score(sub, "Stability")
        if stab is not None and stab < 65:
            return "Brace harder — big breath into your belly, lock your core before each rep."
        return None

    def heel_pressure(sub, inj, fat, ang, phase):
        if _injury_level(inj, "hip_shift") in ("watch", "high"):
            return "Press through your whole foot — you're shifting forward onto your toes."
        return None

    def tempo_squat(sub, inj, fat, ang, phase):
        t = _score(sub, "Tempo")
        if t is not None and t < 55:
            return "Slow down your descent — 2–3 seconds down, controlled and tight."
        return None

    def uneven(sub, inj, fat, ang, phase):
        sym = _score(sub, "Symmetry")
        if sym is not None and sym < 75:
            if _injury_level(inj, "uneven_loading") in ("watch", "high"):
                return "Your left side is lagging — focus on driving evenly through both legs."
            return "Uneven loading detected — push through both legs equally."
        return None

    return [
        (knee_cave,     0, "injury",    "knee_cave"),
        (chest_up,      0, "injury",    "chest_up"),
        (depth,         2, "rom",       "depth"),
        (tempo_squat,   3, "tempo",     "tempo"),
        (uneven,        4, "symmetry",  "symmetry"),
        (hip_drive,     5, "control",   "hip_drive"),
        (bracing,       6, "stability", "bracing"),
        (heel_pressure, 5, "control",   "heel_pressure"),
    ]


def _deadlift_cues() -> List[CueEntry]:
    """Deadlift variants — conventional, sumo, RDL, trap bar, stiff-leg."""

    def hip_hinge(sub, inj, fat, ang, phase):
        if _injury_level(inj, "lumbar_flexion") in ("watch", "high"):
            val = _injury_value(inj, "lumbar_flexion")
            return f"Hinge at the hips, not the spine — {round(val)}° lumbar flexion detected."
        return None

    def bar_path_dl(sub, inj, fat, ang, phase):
        drift = _angle(ang, "bar_drift")
        if drift is not None and abs(drift) > 4:
            return "Keep the bar dragging your shins — it's drifting forward of midfoot."
        return None

    def lat_engagement(sub, inj, fat, ang, phase):
        if _injury_level(inj, "rounded_shoulders") in ("watch", "high"):
            return "Engage your lats — pull the bar into your body like you're bending it."
        stab = _score(sub, "Stability")
        if stab is not None and stab < 70:
            return "Pack your lats — squeeze oranges in your armpits before you pull."
        return None

    def lockout_dl(sub, inj, fat, ang, phase):
        hip = _angle(ang, "hip")
        if phase in ("top", "lockout") and hip is not None and hip < 170:
            return "Squeeze your glutes and stand tall — finish the lockout completely."
        r = _score(sub, "ROM")
        if r is not None and r < 70 and phase in ("top", "lockout", "ascent"):
            return "Finish the rep — hips fully extended, shoulders back."
        return None

    def head_position(sub, inj, fat, ang, phase):
        neck = _angle(ang, "neck_angle")
        if neck is not None and neck > 40:
            return "Neutral head — look at the floor 6–8 feet ahead, not up at the mirror."
        return None

    def tempo_dl(sub, inj, fat, ang, phase):
        t = _score(sub, "Tempo")
        if t is not None and t < 55 and phase in ("descent", "eccentric"):
            return "Control the descent — don't drop the bar. Hinge back slowly."
        return None

    def setup(sub, inj, fat, ang, phase):
        ctrl = _score(sub, "Control")
        if ctrl is not None and ctrl < 60 and phase in ("setup", "bottom"):
            return "Reset your setup — bar over midfoot, hips back, chest proud."
        return None

    return [
        (hip_hinge,       0, "injury",    "hip_hinge"),
        (lat_engagement,  0, "injury",    "lat_engagement"),
        (bar_path_dl,     2, "rom",       "bar_path"),
        (lockout_dl,      2, "rom",       "lockout"),
        (head_position,   5, "control",   "head_position"),
        (tempo_dl,        3, "tempo",     "tempo"),
        (setup,           5, "control",   "setup"),
    ]


def _pull_row_cues() -> List[CueEntry]:
    """Pull / Row variants — pull-up, chin-up, lat pulldown, barbell row, cable row, T-bar row."""

    def scapular_control(sub, inj, fat, ang, phase):
        stab = _score(sub, "Stability")
        if stab is not None and stab < 70:
            return "Initiate with your shoulder blades — pull them down and together first."
        return None

    def elbow_path(sub, inj, fat, ang, phase):
        elbow = _angle(ang, "elbow_flare")
        if elbow is not None and elbow > 60:
            return f"Keep your elbows tighter — they're flaring {round(elbow - 45)}° too wide."
        return None

    def full_stretch(sub, inj, fat, ang, phase):
        r = _score(sub, "ROM")
        if r is not None and r < 65 and phase in ("bottom", "stretch", "eccentric"):
            return "Get a full stretch at the bottom — let your arms extend completely."
        return None

    def squeeze(sub, inj, fat, ang, phase):
        r = _score(sub, "ROM")
        if r is not None and r < 70 and phase in ("top", "contraction", "concentric"):
            return "Squeeze your back at the top — hold the contraction for a beat."
        return None

    def momentum(sub, inj, fat, ang, phase):
        ctrl = _score(sub, "Control")
        if ctrl is not None and ctrl < 60:
            return "Stop using momentum — control the weight and feel your back working."
        return None

    def chin_over_bar(sub, inj, fat, ang, phase):
        r = _score(sub, "ROM")
        if r is not None and r < 60 and phase in ("top", "concentric"):
            return "Pull higher — get your chin over the bar for a full rep."
        return None

    def head_forward(sub, inj, fat, ang, phase):
        if _injury_level(inj, "rounded_shoulders") in ("watch", "high"):
            return "Pull your head back — don't crane your neck forward as you pull."
        return None

    def tempo_row(sub, inj, fat, ang, phase):
        t = _score(sub, "Tempo")
        if t is not None and t < 55:
            return "Slow down your eccentric on rows — lower the weight over 2 seconds."
        return None

    return [
        (head_forward,     0, "injury",    "head_forward"),
        (scapular_control, 2, "rom",       "scap_control"),
        (elbow_path,       2, "rom",       "elbow_path"),
        (full_stretch,     2, "rom",       "full_stretch"),
        (squeeze,          2, "rom",       "squeeze"),
        (tempo_row,        3, "tempo",     "tempo"),
        (momentum,         5, "control",   "momentum"),
        (chin_over_bar,    2, "rom",       "chin_over_bar"),
    ]


def _curl_cues() -> List[CueEntry]:
    """Curl variants — barbell curl, dumbbell curl, hammer curl, preacher curl, cable curl."""

    def elbow_pinning(sub, inj, fat, ang, phase):
        elbow_drift = _angle(ang, "elbow_drift")
        if elbow_drift is not None and elbow_drift > 10:
            return f"Pin your elbows to your sides — they're drifting {round(elbow_drift)}° forward."
        ctrl = _score(sub, "Control")
        if ctrl is not None and ctrl < 65:
            return "Lock your elbows by your ribs — only your forearms should move."
        return None

    def wrist_curl(sub, inj, fat, ang, phase):
        wrist = _angle(ang, "wrist_extension")
        if wrist is not None and wrist > 25:
            return f"Keep your wrists neutral — they're flexing {round(wrist)}° back."
        return None

    def full_extension(sub, inj, fat, ang, phase):
        r = _score(sub, "ROM")
        elbow = _angle(ang, "elbow")
        if phase in ("bottom", "eccentric") and elbow is not None and elbow < 150:
            gap = round(170 - elbow)
            return f"Extend all the way down — {gap}° short of full stretch."
        if r is not None and r < 65:
            return "Extend your arms fully at the bottom — own the stretch."
        return None

    def squeeze_top(sub, inj, fat, ang, phase):
        r = _score(sub, "ROM")
        if phase in ("top", "concentric") and r is not None and r < 70:
            return "Squeeze harder at the top — full contraction, hold for a beat."
        return None

    def swinging(sub, inj, fat, ang, phase):
        ctrl = _score(sub, "Control")
        if ctrl is not None and ctrl < 55:
            return "Stop swinging — use strict form, slow the eccentric to 2 seconds."
        return None

    def tempo_curl(sub, inj, fat, ang, phase):
        t = _score(sub, "Tempo")
        if t is not None and t < 55:
            return "Slow down your eccentric — 2–3 seconds down on every curl."
        return None

    def symmetry_curl(sub, inj, fat, ang, phase):
        sym = _score(sub, "Symmetry")
        if sym is not None and sym < 75:
            return "Your weaker arm is lagging — match your reps evenly on both sides."
        return None

    return [
        (wrist_curl,      0, "injury",    "wrist"),
        (elbow_pinning,   2, "rom",       "elbow_pin"),
        (full_extension,  2, "rom",       "full_extension"),
        (squeeze_top,     2, "rom",       "squeeze"),
        (tempo_curl,      3, "tempo",     "tempo"),
        (swinging,        5, "control",   "swinging"),
        (symmetry_curl,   4, "symmetry",  "symmetry"),
    ]


def _press_cues() -> List[CueEntry]:
    """Press variants — overhead press, push press, Arnold press, lateral raise, dumbbell shoulder press."""

    def bar_path_press(sub, inj, fat, ang, phase):
        drift = _angle(ang, "bar_drift")
        if drift is not None and abs(drift) > 6:
            direction = "forward" if drift > 0 else "backward"
            return f"Press straight up — the bar is drifting {abs(round(drift))}° {direction}."
        return None

    def lockout_press(sub, inj, fat, ang, phase):
        elbow = _angle(ang, "elbow")
        if phase in ("top", "lockout") and elbow is not None and elbow < 170:
            gap = round(180 - elbow)
            return f"Lock out overhead — extend {gap}° more. Stack the bar over your spine."
        return None

    def shoulder_position(sub, inj, fat, ang, phase):
        if _injury_level(inj, "rounded_shoulders") in ("watch", "high"):
            return "Pull your shoulders back before pressing — don't let them round forward."
        return None

    def core_brace(sub, inj, fat, ang, phase):
        stab = _score(sub, "Stability")
        if stab is not None and stab < 65:
            return "Brace your core — squeeze your glutes and abs to stabilize overhead."
        return None

    def rib_flare(sub, inj, fat, ang, phase):
        lumbar = _angle(ang, "lumbar_arch")
        if lumbar is not None and lumbar > 25:
            return "Stop flaring your ribs — tuck them down and keep a neutral spine."
        return None

    def tempo_press(sub, inj, fat, ang, phase):
        t = _score(sub, "Tempo")
        if t is not None and t < 55:
            return "Control the eccentric — lower the bar to your shoulders over 2 seconds."
        return None

    def head_clearance(sub, inj, fat, ang, phase):
        ctrl = _score(sub, "Control")
        if ctrl is not None and ctrl < 60 and phase in ("concentric", "ascent"):
            return "Move your head back as the bar passes — then push it forward to finish."
        return None

    return [
        (shoulder_position, 0, "injury",    "shoulder"),
        (rib_flare,         0, "injury",    "rib_flare"),
        (bar_path_press,    2, "rom",       "bar_path"),
        (lockout_press,     2, "rom",       "lockout"),
        (tempo_press,       3, "tempo",     "tempo"),
        (core_brace,        6, "stability", "core_brace"),
        (head_clearance,    5, "control",   "head_clearance"),
    ]


def _olympic_cues() -> List[CueEntry]:
    """Olympic lifts — clean, snatch, clean & jerk, power clean, hang clean."""

    def catch_position(sub, inj, fat, ang, phase):
        if phase in ("catch", "receiving"):
            elbow = _angle(ang, "elbow")
            if elbow is not None and elbow > 100:
                return "Faster elbows in the catch — whip them through and get them high."
            stab = _score(sub, "Stability")
            if stab is not None and stab < 65:
                return "Stabilize the catch — brace your core and find your balance before standing."
        return None

    def hip_extension(sub, inj, fat, ang, phase):
        if phase in ("pull", "second_pull", "concentric"):
            hip = _angle(ang, "hip")
            if hip is not None and hip < 165:
                return "Finish your hip extension — snap your hips through fully before pulling under."
        return None

    def arm_timing(sub, inj, fat, ang, phase):
        ctrl = _score(sub, "Control")
        if ctrl is not None and ctrl < 60 and phase in ("pull", "second_pull"):
            return "Arms stay straight until the hips fire — don't pull early with your arms."
        return None

    def overhead_stability(sub, inj, fat, ang, phase):
        stab = _score(sub, "Stability")
        if phase in ("overhead", "catch") and stab is not None and stab < 60:
            return "Lock the bar overhead — active shoulders, push up into the bar."
        return None

    def first_pull(sub, inj, fat, ang, phase):
        if _injury_level(inj, "lumbar_flexion") in ("watch", "high") and phase in ("first_pull", "setup"):
            return "Set your back before the first pull — chest up, lats tight, hips set."
        return None

    def triple_extension(sub, inj, fat, ang, phase):
        r = _score(sub, "ROM")
        if r is not None and r < 60:
            return "Full triple extension — ankles, knees, and hips all need to fire together."
        return None

    def bar_contact(sub, inj, fat, ang, phase):
        if phase in ("second_pull", "power_position"):
            ctrl = _score(sub, "Control")
            if ctrl is not None and ctrl < 65:
                return "Keep the bar close — it should brush your thighs at the power position."
        return None

    return [
        (first_pull,          0, "injury",    "first_pull"),
        (catch_position,      2, "rom",       "catch"),
        (hip_extension,       2, "rom",       "hip_extension"),
        (arm_timing,          3, "tempo",     "arm_timing"),
        (overhead_stability,  6, "stability", "overhead_stab"),
        (triple_extension,    2, "rom",       "triple_extension"),
        (bar_contact,         5, "control",   "bar_contact"),
    ]


def _core_cues() -> List[CueEntry]:
    """Core exercises — plank, deadbug, pallof press, ab rollout, hanging leg raise, crunch."""

    def bracing(sub, inj, fat, ang, phase):
        stab = _score(sub, "Stability")
        if stab is not None and stab < 65:
            return "Brace like someone's about to punch your stomach — 360° tension."
        return None

    def spine_neutral(sub, inj, fat, ang, phase):
        if _injury_level(inj, "lumbar_flexion") in ("watch", "high"):
            return "Keep your spine neutral — don't let your lower back arch or round."
        return None

    def breathing(sub, inj, fat, ang, phase):
        ctrl = _score(sub, "Control")
        if ctrl is not None and ctrl < 60:
            return "Exhale on exertion — breathe out as you crunch or brace harder."
        return None

    def hip_flexor(sub, inj, fat, ang, phase):
        hip = _angle(ang, "hip")
        if hip is not None and hip < 60:
            return "Keep the work in your abs — don't let your hip flexors take over."
        return None

    def rib_tuck(sub, inj, fat, ang, phase):
        r = _score(sub, "ROM")
        if r is not None and r < 65:
            return "Tuck your ribs toward your pelvis — feel your abs shorten, not your neck."
        return None

    def neck_strain(sub, inj, fat, ang, phase):
        neck = _angle(ang, "neck_angle")
        if neck is not None and neck > 35:
            return "Relax your neck — look at the ceiling, don't pull your head forward."
        return None

    def plank_sag(sub, inj, fat, ang, phase):
        torso = _angle(ang, "torso_lean")
        if phase in ("hold", "isometric") and torso is not None and torso > 20:
            return "Your hips are sagging — squeeze your glutes and tighten your core."
        return None

    def anti_rotation(sub, inj, fat, ang, phase):
        sym = _score(sub, "Symmetry")
        if sym is not None and sym < 70:
            return "Resist the rotation — keep your hips and shoulders perfectly square."
        return None

    return [
        (spine_neutral,  0, "injury",    "spine_neutral"),
        (neck_strain,    0, "injury",    "neck_strain"),
        (bracing,        6, "stability", "bracing"),
        (rib_tuck,       2, "rom",       "rib_tuck"),
        (breathing,      5, "control",   "breathing"),
        (hip_flexor,     5, "control",   "hip_flexor"),
        (plank_sag,      6, "stability", "plank_sag"),
        (anti_rotation,  4, "symmetry",  "anti_rotation"),
    ]


# ---------------------------------------------------------------------------
# Exercise → category mapping
# ---------------------------------------------------------------------------

_EXERCISE_CATEGORY: Dict[str, str] = {}

_CATEGORY_KEYWORDS: Dict[str, List[str]] = {
    "bench": [
        "bench_press", "bench press", "flat bench", "incline bench",
        "decline bench", "dumbbell bench", "close grip bench",
        "dumbbell press flat", "dumbbell press incline", "floor press",
        "smith bench", "machine chest press", "chest press",
    ],
    "squat": [
        "squat", "back squat", "front squat", "goblet squat",
        "bulgarian split squat", "split squat", "hack squat", "leg press",
        "sissy squat", "zercher squat", "box squat", "overhead squat",
        "smith squat", "belt squat", "pistol squat", "safety bar squat",
    ],
    "deadlift": [
        "deadlift", "conventional deadlift", "sumo deadlift", "rdl",
        "romanian deadlift", "stiff leg deadlift", "trap bar deadlift",
        "deficit deadlift", "block pull", "rack pull", "good morning",
        "hip hinge", "single leg rdl", "kettlebell deadlift",
    ],
    "pull_row": [
        "pull up", "pullup", "chin up", "chinup", "lat pulldown",
        "pulldown", "barbell row", "bent over row", "pendlay row",
        "dumbbell row", "cable row", "seated row", "t-bar row",
        "meadows row", "chest supported row", "face pull", "inverted row",
        "machine row", "single arm row", "kroc row",
    ],
    "curl": [
        "curl", "barbell curl", "dumbbell curl", "hammer curl",
        "preacher curl", "incline curl", "cable curl", "concentration curl",
        "spider curl", "ez bar curl", "reverse curl", "drag curl",
        "bayesian curl", "21s", "scott curl",
    ],
    "press": [
        "overhead press", "ohp", "military press", "push press",
        "arnold press", "dumbbell shoulder press", "seated press",
        "lateral raise", "front raise", "behind the neck press",
        "landmine press", "z press", "viking press", "log press",
        "machine shoulder press", "smith overhead press",
    ],
    "olympic": [
        "clean", "snatch", "clean and jerk", "power clean", "hang clean",
        "muscle snatch", "power snatch", "hang snatch", "clean pull",
        "snatch pull", "split jerk", "push jerk", "thruster",
    ],
    "core": [
        "plank", "deadbug", "dead bug", "pallof", "ab rollout",
        "hanging leg raise", "crunch", "sit up", "russian twist",
        "cable crunch", "woodchop", "hollow hold", "l-sit", "v-up",
        "dragon flag", "ab wheel", "decline crunch", "bicycle crunch",
        "side plank", "bird dog", "copenhagen plank",
    ],
}

# Build reverse lookup
for _cat, _keywords in _CATEGORY_KEYWORDS.items():
    for _kw in _keywords:
        _slug = _kw.lower().replace(" ", "_").replace("-", "_")
        _EXERCISE_CATEGORY[_slug] = _cat
        # Also store the raw keyword (spaces intact) for fuzzy matching
        _EXERCISE_CATEGORY[_kw.lower()] = _cat

_CATEGORY_CUE_BUILDERS: Dict[str, Callable[[], List[CueEntry]]] = {
    "bench":    _bench_cues,
    "squat":    _squat_cues,
    "deadlift": _deadlift_cues,
    "pull_row": _pull_row_cues,
    "curl":     _curl_cues,
    "press":    _press_cues,
    "olympic":  _olympic_cues,
    "core":     _core_cues,
}


def _classify_exercise(exercise: str) -> str:
    """Map an exercise name/slug to a cue category. Falls back to 'general'."""
    slug = exercise.lower().strip().replace(" ", "_").replace("-", "_")

    # Direct match
    if slug in _EXERCISE_CATEGORY:
        return _EXERCISE_CATEGORY[slug]

    # Substring match — check if any keyword appears in the exercise name
    normalized = exercise.lower().replace("_", " ").replace("-", " ")
    for cat, keywords in _CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw in normalized or normalized in kw:
                return cat

    return "general"


# ---------------------------------------------------------------------------
# Universal cues (apply to any exercise)
# ---------------------------------------------------------------------------

def _universal_cues() -> List[CueEntry]:
    """Cues that are not exercise-specific — injury and fatigue gates."""

    def injury_high(sub, inj, fat, ang, phase):
        for slug, data in inj.items():
            if data.get("level") == "high":
                msg = data.get("msg", "Injury risk detected.")
                return f"STOP — {msg} Reduce load or fix your position."
        return None

    def injury_watch(sub, inj, fat, ang, phase):
        for slug, data in inj.items():
            if data.get("level") == "watch":
                msg = data.get("msg", "Watch your form.")
                return msg
        return None

    def fatigue_near_failure(sub, inj, fat, ang, phase):
        level = fat.get("level", 0)
        rir = fat.get("rir")
        status = fat.get("status", "")
        if status == "Near failure" or (level is not None and level >= 80):
            rir_str = f"{rir:.0f}" if rir is not None else "0–1"
            return f"You have {rir_str} reps left before form breaks down — finish strong or rack it."
        return None

    def fatigue_building(sub, inj, fat, ang, phase):
        level = fat.get("level", 0)
        status = fat.get("status", "")
        rir = fat.get("rir")
        if status == "Fatiguing" or (level is not None and 50 <= level < 80):
            rir_str = f"{rir:.0f}" if rir is not None else "2–3"
            return f"Fatigue building — ~{rir_str} quality reps left. Stay tight."
        return None

    def general_symmetry(sub, inj, fat, ang, phase):
        sym = _score(sub, "Symmetry")
        if sym is not None and sym < 70:
            return "Your left side is lagging — focus on driving evenly."
        return None

    return [
        (injury_high,         0, "injury",   "injury_high"),
        (fatigue_near_failure, 1, "fatigue",  "fatigue_near_failure"),
        (injury_watch,        0, "injury",   "injury_watch"),
        (fatigue_building,    1, "fatigue",  "fatigue_building"),
        (general_symmetry,    4, "symmetry", "general_symmetry"),
    ]


# ---------------------------------------------------------------------------
# CueEngine
# ---------------------------------------------------------------------------

class CueEngine:
    """
    Stateful cue generator. Call ``generate_cue()`` once per frame (or per rep).
    Returns the single highest-priority cue, suppressing recently shown cues
    for ``cooldown_frames`` ticks.

    Parameters
    ----------
    cooldown_frames : int
        How many calls to ``generate_cue`` before the same cue label can fire
        again. Prevents nagging. Default 60 (~2 seconds at 30 fps).
    """

    def __init__(self, cooldown_frames: int = 60):
        self.cooldown_frames = cooldown_frames
        self._last_cue_label: str = ""
        self._cooldowns: Dict[str, int] = {}  # label -> remaining frames

    def reset(self) -> None:
        """Clear cooldown state (e.g. between sets)."""
        self._last_cue_label = ""
        self._cooldowns.clear()

    def generate_cue(
        self,
        exercise: str,
        sub_scores: Dict[str, Optional[float]],
        injury_flags: Dict[str, dict],
        fatigue: Dict[str, object],
        angles: Dict[str, Optional[float]],
        phase: str = "",
    ) -> CueResult:
        """
        Return the single most important coaching cue right now.

        Parameters
        ----------
        exercise : str
            Exercise name or slug (e.g. "barbell_back_squat", "Bench Press").
        sub_scores : dict
            Form sub-scores: ROM, Stability, Tempo, Symmetry, Control.
            Values 0-100, or None if not yet computed.
        injury_flags : dict
            From InjuryRiskDetector.process() — slug -> {level, value, msg}.
        fatigue : dict
            From FatigueDetector.state() — {level, status, rir, reason}.
        angles : dict
            Current joint angles from the detector (e.g. left_knee, elbow).
        phase : str
            Current movement phase (e.g. "descent", "ascent", "bottom", "top").

        Returns
        -------
        CueResult with .text (the verbal cue), .priority, .category, .exercise.
        """
        # Tick down cooldowns
        expired = []
        for label, remaining in self._cooldowns.items():
            if remaining <= 1:
                expired.append(label)
            else:
                self._cooldowns[label] = remaining - 1
        for label in expired:
            del self._cooldowns[label]

        # Gather candidate cues: universal first, then exercise-specific
        candidates: List[Tuple[int, str, str, str]] = []  # (priority, category, label, text)

        # Universal (injury / fatigue gates)
        for fn, priority, category, label in _universal_cues():
            if label in self._cooldowns:
                continue
            text = fn(sub_scores, injury_flags, fatigue, angles, phase)
            if text is not None:
                candidates.append((priority, category, label, text))

        # Exercise-specific
        cat = _classify_exercise(exercise)
        builder = _CATEGORY_CUE_BUILDERS.get(cat)
        if builder is not None:
            for fn, priority, category, label in builder():
                prefixed_label = f"{cat}_{label}"
                if prefixed_label in self._cooldowns:
                    continue
                text = fn(sub_scores, injury_flags, fatigue, angles, phase)
                if text is not None:
                    candidates.append((priority, category, prefixed_label, text))

        # Pick highest priority (lowest number), break ties by order
        if not candidates:
            return CueResult(
                text="Good form — keep it up.",
                priority=6,
                category="general",
                exercise=exercise,
            )

        candidates.sort(key=lambda c: c[0])
        best_priority, best_category, best_label, best_text = candidates[0]

        # Apply cooldown
        self._cooldowns[best_label] = self.cooldown_frames
        self._last_cue_label = best_label

        return CueResult(
            text=best_text,
            priority=best_priority,
            category=best_category,
            exercise=exercise,
        )

    @property
    def last_cue(self) -> str:
        """Label of the most recently fired cue."""
        return self._last_cue_label

    @staticmethod
    def supported_categories() -> List[str]:
        """Return the list of exercise categories with cue databases."""
        return list(_CATEGORY_CUE_BUILDERS.keys())

    @staticmethod
    def classify(exercise: str) -> str:
        """Classify an exercise name into a cue category."""
        return _classify_exercise(exercise)
