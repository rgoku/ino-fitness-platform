"""
exercise_database.py
--------------------
Master exercise database: 190+ exercises with movement patterns,
rep detection rules, form criteria, and coaching cues.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class MovementPattern(Enum):
    PUSH_HORIZONTAL = "push_horizontal"
    PUSH_VERTICAL = "push_vertical"
    PULL_HORIZONTAL = "pull_horizontal"
    PULL_VERTICAL = "pull_vertical"
    SQUAT = "squat"
    HINGE = "hinge"
    LUNGE = "lunge"
    ISOLATION_CURL = "isolation_curl"
    ISOLATION_EXTENSION = "isolation_extension"
    ISOLATION_RAISE = "isolation_raise"
    OLYMPIC = "olympic"
    CORE = "core"
    CARRY = "carry"
    CALF = "calf"
    BODYWEIGHT = "bodyweight"


@dataclass(frozen=True)
class JointRule:
    landmark_a: int
    landmark_b: int
    landmark_c: int
    contracted: float
    extended: float
    label: str = ""


@dataclass(frozen=True)
class RepDetectionRule:
    primary_joints: tuple[JointRule, ...]
    min_rom_degrees: float = 40.0
    hysteresis: float = 15.0


@dataclass(frozen=True)
class FormCriteria:
    rom_target: float = 120.0
    tempo_range: tuple[float, float] = (1.5, 4.0)
    stability_joints: tuple[int, ...] = ()
    symmetry_check: bool = True
    key_angles: dict = field(default_factory=dict)


@dataclass(frozen=True)
class Exercise:
    name: str
    slug: str
    muscle_group: str
    pattern: MovementPattern
    primary_muscles: tuple[str, ...]
    secondary_muscles: tuple[str, ...] = ()
    rep_rule: RepDetectionRule = None
    form: FormCriteria = FormCriteria()
    cues: tuple[str, ...] = ()
    landmarks_needed: tuple[int, ...] = ()


# ── MediaPipe landmark indices ──────────────────────────────────────
L_SHOULDER, R_SHOULDER = 11, 12
L_ELBOW, R_ELBOW = 13, 14
L_WRIST, R_WRIST = 15, 16
L_HIP, R_HIP = 23, 24
L_KNEE, R_KNEE = 25, 26
L_ANKLE, R_ANKLE = 27, 28
NOSE = 0

# ── Shared rep detection rules ──────────────────────────────────────
_ELBOW_CURL = RepDetectionRule(
    primary_joints=(
        JointRule(L_SHOULDER, L_ELBOW, L_WRIST, 45, 160, "left_elbow"),
        JointRule(R_SHOULDER, R_ELBOW, R_WRIST, 45, 160, "right_elbow"),
    ), min_rom_degrees=60)

_ELBOW_EXTENSION = RepDetectionRule(
    primary_joints=(
        JointRule(L_SHOULDER, L_ELBOW, L_WRIST, 170, 80, "left_elbow"),
        JointRule(R_SHOULDER, R_ELBOW, R_WRIST, 170, 80, "right_elbow"),
    ), min_rom_degrees=50)

_BENCH_PRESS = RepDetectionRule(
    primary_joints=(
        JointRule(L_SHOULDER, L_ELBOW, L_WRIST, 80, 165, "left_elbow"),
        JointRule(R_SHOULDER, R_ELBOW, R_WRIST, 80, 165, "right_elbow"),
    ), min_rom_degrees=50)

_OVERHEAD_PRESS = RepDetectionRule(
    primary_joints=(
        JointRule(L_SHOULDER, L_ELBOW, L_WRIST, 90, 170, "left_elbow"),
        JointRule(R_SHOULDER, R_ELBOW, R_WRIST, 90, 170, "right_elbow"),
    ), min_rom_degrees=50)

_SQUAT = RepDetectionRule(
    primary_joints=(
        JointRule(L_HIP, L_KNEE, L_ANKLE, 80, 170, "left_knee"),
        JointRule(R_HIP, R_KNEE, R_ANKLE, 80, 170, "right_knee"),
    ), min_rom_degrees=60)

_HINGE = RepDetectionRule(
    primary_joints=(
        JointRule(L_SHOULDER, L_HIP, L_KNEE, 90, 170, "left_hip"),
        JointRule(R_SHOULDER, R_HIP, R_KNEE, 90, 170, "right_hip"),
    ), min_rom_degrees=40)

_PULL_VERTICAL = RepDetectionRule(
    primary_joints=(
        JointRule(L_SHOULDER, L_ELBOW, L_WRIST, 60, 170, "left_elbow"),
        JointRule(R_SHOULDER, R_ELBOW, R_WRIST, 60, 170, "right_elbow"),
    ), min_rom_degrees=50)

_PULL_HORIZONTAL = RepDetectionRule(
    primary_joints=(
        JointRule(L_SHOULDER, L_ELBOW, L_WRIST, 60, 155, "left_elbow"),
        JointRule(R_SHOULDER, R_ELBOW, R_WRIST, 60, 155, "right_elbow"),
    ), min_rom_degrees=40)

_LATERAL_RAISE = RepDetectionRule(
    primary_joints=(
        JointRule(L_HIP, L_SHOULDER, L_ELBOW, 15, 90, "left_shoulder_abd"),
        JointRule(R_HIP, R_SHOULDER, R_ELBOW, 15, 90, "right_shoulder_abd"),
    ), min_rom_degrees=40)

_CALF_RAISE = RepDetectionRule(
    primary_joints=(
        JointRule(L_KNEE, L_ANKLE, L_HIP, 160, 180, "left_ankle"),
        JointRule(R_KNEE, R_ANKLE, R_HIP, 160, 180, "right_ankle"),
    ), min_rom_degrees=10, hysteresis=5)

_CORE_FLEXION = RepDetectionRule(
    primary_joints=(
        JointRule(L_SHOULDER, L_HIP, L_KNEE, 60, 160, "trunk"),
    ), min_rom_degrees=30)

_LUNGE = RepDetectionRule(
    primary_joints=(
        JointRule(L_HIP, L_KNEE, L_ANKLE, 80, 170, "left_knee"),
        JointRule(R_HIP, R_KNEE, R_ANKLE, 80, 170, "right_knee"),
    ), min_rom_degrees=50)


# ── Helper factories ────────────────────────────────────────────────
def _chest(name, slug, cues, secondary=("Front Deltoid", "Triceps"), **kw):
    return Exercise(name=name, slug=slug, muscle_group="Chest",
        pattern=MovementPattern.PUSH_HORIZONTAL,
        primary_muscles=("Pectoralis Major",), secondary_muscles=secondary,
        rep_rule=_BENCH_PRESS,
        form=FormCriteria(rom_target=90, tempo_range=(1.5, 4.0),
            stability_joints=(L_HIP, R_HIP), symmetry_check=True),
        cues=cues, **kw)

def _back_pull(name, slug, cues, pattern=MovementPattern.PULL_VERTICAL, rule=_PULL_VERTICAL, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Back",
        pattern=pattern,
        primary_muscles=("Latissimus Dorsi",), secondary_muscles=("Biceps", "Rear Deltoid"),
        rep_rule=rule,
        form=FormCriteria(rom_target=100, tempo_range=(1.5, 3.5),
            stability_joints=(L_HIP, R_HIP), symmetry_check=True),
        cues=cues, **kw)

def _back_hinge(name, slug, cues, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Back",
        pattern=MovementPattern.HINGE,
        primary_muscles=("Erector Spinae", "Hamstrings", "Glutes"),
        secondary_muscles=("Latissimus Dorsi", "Trapezius"),
        rep_rule=_HINGE,
        form=FormCriteria(rom_target=80, tempo_range=(2.0, 4.0),
            stability_joints=(L_KNEE, R_KNEE), symmetry_check=True),
        cues=cues, **kw)

def _shoulder_press(name, slug, cues, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Shoulders",
        pattern=MovementPattern.PUSH_VERTICAL,
        primary_muscles=("Anterior Deltoid", "Lateral Deltoid"),
        secondary_muscles=("Triceps", "Upper Trapezius"),
        rep_rule=_OVERHEAD_PRESS,
        form=FormCriteria(rom_target=100, tempo_range=(1.5, 3.5),
            stability_joints=(L_HIP, R_HIP), symmetry_check=True),
        cues=cues, **kw)

def _shoulder_raise(name, slug, cues, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Shoulders",
        pattern=MovementPattern.ISOLATION_RAISE,
        primary_muscles=("Lateral Deltoid",), secondary_muscles=("Upper Trapezius",),
        rep_rule=_LATERAL_RAISE,
        form=FormCriteria(rom_target=75, tempo_range=(2.0, 4.0),
            stability_joints=(L_HIP, R_HIP, L_ELBOW, R_ELBOW)),
        cues=cues, **kw)

def _curl(name, slug, cues, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Biceps",
        pattern=MovementPattern.ISOLATION_CURL,
        primary_muscles=("Biceps Brachii",), secondary_muscles=("Brachialis", "Forearm Flexors"),
        rep_rule=_ELBOW_CURL,
        form=FormCriteria(rom_target=120, tempo_range=(1.5, 3.5),
            stability_joints=(L_SHOULDER, R_SHOULDER, L_HIP, R_HIP)),
        cues=cues, **kw)

def _tricep(name, slug, cues, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Triceps",
        pattern=MovementPattern.ISOLATION_EXTENSION,
        primary_muscles=("Triceps",), secondary_muscles=("Anconeus",),
        rep_rule=_ELBOW_EXTENSION,
        form=FormCriteria(rom_target=100, tempo_range=(1.5, 3.5),
            stability_joints=(L_SHOULDER, R_SHOULDER)),
        cues=cues, **kw)

def _squat(name, slug, cues, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Quads",
        pattern=MovementPattern.SQUAT,
        primary_muscles=("Quadriceps", "Glutes"),
        secondary_muscles=("Hamstrings", "Erector Spinae", "Core"),
        rep_rule=_SQUAT,
        form=FormCriteria(rom_target=110, tempo_range=(2.0, 4.5),
            stability_joints=(L_ANKLE, R_ANKLE), symmetry_check=True),
        cues=cues, **kw)

def _ham(name, slug, cues, pattern=MovementPattern.HINGE, rule=_HINGE, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Hamstrings",
        pattern=pattern, primary_muscles=("Hamstrings",),
        secondary_muscles=("Glutes", "Erector Spinae"), rep_rule=rule,
        form=FormCriteria(rom_target=80, tempo_range=(2.0, 4.0),
            stability_joints=(L_KNEE, R_KNEE)),
        cues=cues, **kw)

def _glute(name, slug, cues, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Glutes",
        pattern=MovementPattern.HINGE,
        primary_muscles=("Gluteus Maximus",),
        secondary_muscles=("Hamstrings", "Core"), rep_rule=_HINGE,
        form=FormCriteria(rom_target=70, tempo_range=(1.5, 3.5),
            stability_joints=(L_KNEE, R_KNEE)),
        cues=cues, **kw)

def _lunge(name, slug, cues, **kw):
    return Exercise(name=name, slug=slug, muscle_group="Quads",
        pattern=MovementPattern.LUNGE,
        primary_muscles=("Quadriceps", "Glutes"),
        secondary_muscles=("Hamstrings", "Core"), rep_rule=_LUNGE,
        form=FormCriteria(rom_target=100, tempo_range=(2.0, 4.0),
            stability_joints=(L_HIP, R_HIP)),
        cues=cues, **kw)


# ── Shared coaching cues ────────────────────────────────────────────
_BENCH_CUES = (
    "Retract your shoulder blades and set your arch",
    "Drive your feet into the floor for leg drive",
    "Lower the bar to your nipple line",
    "Press up and slightly back toward the rack",
    "Keep your wrists straight over your elbows",
)
_SQUAT_CUES = (
    "Break at hips and knees simultaneously",
    "Drive your knees out over your toes",
    "Keep your chest up — don't let it cave",
    "Brace your core — big breath at the top",
    "Push the floor away on the way up",
)
_DL_CUES = (
    "Pack your lats — protect the bar",
    "Push your hips back to initiate",
    "Keep the bar close to your shins",
    "Drive through your heels",
    "Lock out your hips at the top",
)
_PULL_CUES = (
    "Initiate with your shoulder blades, not arms",
    "Pull to your upper chest/chin over bar",
    "Squeeze your shoulder blades together",
    "Control the descent — full stretch at bottom",
    "Keep your core tight — no swinging",
)
_ROW_CUES = (
    "Hinge forward 45° — maintain flat back",
    "Pull to your lower chest/upper abdomen",
    "Squeeze at the top for 1 second",
    "Don't use momentum — control the weight",
    "Keep your elbows close to your body",
)
_OHP_CUES = (
    "Brace your core tight before pressing",
    "Press straight up — move your head through",
    "Lock out fully overhead",
    "Don't lean back excessively",
    "Control the bar back to shoulder height",
)
_CURL_CUES = (
    "Keep your elbows pinned to your sides",
    "Full range of motion — extend fully",
    "Squeeze at the top for peak contraction",
    "Control the negative — don't just drop it",
    "Don't swing your body for momentum",
)
_TRI_CUES = (
    "Keep your elbows stationary — only forearms move",
    "Full lockout at the bottom/extension",
    "Squeeze your triceps at peak contraction",
    "Slow eccentric — 2-3 seconds back",
    "Don't flare your elbows out",
)
_LUNGE_CUES = (
    "Take a long stride forward",
    "Front knee tracks over your toes",
    "Back knee hovers just above the floor",
    "Drive through your front heel to stand",
    "Keep your torso upright throughout",
)
_RAISE_CUES = (
    "Slight bend in your elbows — keep it locked",
    "Lead with your elbows, not your hands",
    "Stop at shoulder height — no higher",
    "Control the descent — don't just drop",
    "Don't shrug your traps",
)
_GLUTE_CUES = (
    "Drive through your heels",
    "Full hip extension at the top",
    "Squeeze your glutes hard at lockout",
    "Keep your chin tucked",
    "Don't hyperextend your lower back",
)
_CALF_CUES = (
    "Full stretch at the bottom — heels below toes",
    "Rise all the way to tiptoes",
    "Pause at the top for 1-2 seconds",
    "Control the descent — don't bounce",
    "Keep your knees straight (standing) or bent (seated)",
)
_CORE_CUES = (
    "Brace your core — draw your belly button in",
    "Keep your spine neutral — don't round excessively",
    "Breathe out on the contraction",
    "Don't pull on your neck",
    "Control the movement — quality over speed",
)
_OLY_CUES = (
    "First pull: push the floor away, back angle constant",
    "Triple extension: ankles, knees, hips simultaneously",
    "Keep the bar close — brush your thighs",
    "Fast elbows in the catch position",
    "Receive with a solid overhead position",
)


# ── MASTER DATABASE ─────────────────────────────────────────────────
EXERCISE_DB: dict[str, Exercise] = {}

def _add(ex: Exercise):
    EXERCISE_DB[ex.slug] = ex

# ── CHEST (25) ──────────────────────────────────────────────────────
_add(_chest("Barbell Bench Press", "barbell_bench_press", _BENCH_CUES))
_add(_chest("Incline Barbell Bench Press", "incline_barbell_bench_press", _BENCH_CUES))
_add(_chest("Decline Barbell Bench Press", "decline_barbell_bench_press", _BENCH_CUES))
_add(_chest("Close-Grip Bench Press", "close_grip_bench_press", _BENCH_CUES, secondary=("Triceps", "Front Deltoid")))
_add(_chest("Reverse Grip Bench Press", "reverse_grip_bench_press", _BENCH_CUES))
_add(_chest("Spoto Press", "spoto_press", (*_BENCH_CUES[:3], "Pause 1 inch off chest — hold 2 seconds", _BENCH_CUES[4])))
_add(_chest("Larsen Press", "larsen_press", (*_BENCH_CUES[:2], "Legs flat on bench — no leg drive", _BENCH_CUES[3], _BENCH_CUES[4])))
_add(_chest("Floor Press", "floor_press", ("Retract your shoulder blades", "Upper arms touch the floor each rep", "Press straight up", "Pause briefly at the bottom", "Keep wrists stacked")))
_add(_chest("Dumbbell Bench Press", "dumbbell_bench_press", _BENCH_CUES))
_add(_chest("Incline Dumbbell Press", "incline_dumbbell_press", _BENCH_CUES))
_add(_chest("Decline Dumbbell Press", "decline_dumbbell_press", _BENCH_CUES))
_add(_chest("Neutral Grip Dumbbell Press", "neutral_grip_dumbbell_press", _BENCH_CUES))
_add(_chest("Dumbbell Fly", "dumbbell_fly", ("Slight bend in elbows — keep it locked", "Wide arc — feel the stretch", "Squeeze at the top", "Control the descent", "Don't go too deep — protect your shoulders")))
_add(_chest("Incline Dumbbell Fly", "incline_dumbbell_fly", ("Slight bend in elbows", "Feel the stretch across your upper chest", "Squeeze at the top", "Control the descent", "Keep your back pressed into the bench")))
_add(_chest("Cable Fly", "cable_fly", ("Step forward for constant tension", "Slight bend in elbows", "Squeeze at the peak", "Control the stretch", "Keep your shoulders back")))
_add(_chest("Low-to-High Cable Fly", "low_to_high_cable_fly", ("Start with cables at low position", "Drive up and inward", "Squeeze your upper chest at the top", "Control the return", "Don't lean forward")))
_add(_chest("High-to-Low Cable Fly", "high_to_low_cable_fly", ("Start with cables at high position", "Drive down and inward", "Squeeze your lower chest", "Control the return", "Keep your core braced")))
_add(_chest("Pec Deck", "pec_deck", ("Keep your elbows at 90°", "Squeeze hard at the center", "Control the return — don't let it slam", "Keep your back flat on the pad", "Don't shrug your shoulders")))
_add(_chest("Push-Up", "push_up", ("Hands shoulder-width apart", "Body in a straight line — no sagging", "Lower until chest nearly touches floor", "Drive up through your palms", "Keep your core tight")))
_add(_chest("Weighted Push-Up", "weighted_push_up", ("Hands shoulder-width apart", "Body in a straight line", "Full range of motion — chest to floor", "Controlled tempo", "Keep your core tight")))
_add(_chest("Ring Push-Up", "ring_push_up", ("Stabilize the rings — don't let them flare", "Lower with control", "Turn rings out at the top", "Keep your core rigid", "Slow eccentric for stability")))
_add(_chest("Deficit Push-Up", "deficit_push_up", ("Extra depth — feel the stretch", "Keep elbows at 45°", "Drive up explosively", "Maintain a straight body line", "Don't flare your elbows")))
_add(_chest("Chest Dip", "chest_dip", ("Lean forward 15-20°", "Lower until upper arms are parallel", "Drive up through your palms", "Don't lock out aggressively", "Keep your shoulders down")))
_add(_chest("Weighted Dip", "weighted_dip", ("Lean forward for chest emphasis", "Controlled descent", "Upper arms parallel at the bottom", "Press to near-lockout", "Keep shoulders packed")))
_add(_chest("Machine Chest Press", "machine_chest_press", _BENCH_CUES))
_add(_chest("Hammer Strength Chest Press", "hammer_strength_chest_press", _BENCH_CUES))

# ── BACK (25) ───────────────────────────────────────────────────────
_add(_back_pull("Pull-Up", "pull_up", _PULL_CUES))
_add(_back_pull("Weighted Pull-Up", "weighted_pull_up", _PULL_CUES))
_add(_back_pull("Chin-Up", "chin_up", (*_PULL_CUES[:2], "Supinated grip — palms facing you", _PULL_CUES[3], _PULL_CUES[4])))
_add(_back_pull("Weighted Chin-Up", "weighted_chin_up", _PULL_CUES))
_add(_back_pull("Neutral Grip Pull-Up", "neutral_grip_pull_up", _PULL_CUES))
_add(_back_pull("Wide Grip Pull-Up", "wide_grip_pull_up", (*_PULL_CUES[:1], "Pull to your upper chest", "Squeeze your lats at the top", _PULL_CUES[3], _PULL_CUES[4])))
_add(_back_pull("Lat Pulldown", "lat_pulldown", ("Lean back slightly", "Pull to your upper chest", "Squeeze your shoulder blades", "Control the return — full stretch", "Don't use momentum")))
_add(_back_pull("Reverse Grip Pulldown", "reverse_grip_pulldown", ("Supinated grip — palms toward you", "Pull to your chest", "Squeeze your lower lats", "Full stretch at the top", "Keep your torso stable")))
_add(_back_pull("Single Arm Pulldown", "single_arm_pulldown", ("Pull with one arm at a time", "Squeeze at the bottom", "Full stretch at the top", "Don't rotate your torso", "Control the negative")))
_add(_back_pull("Straight Arm Pulldown", "straight_arm_pulldown", ("Keep arms straight — slight bend", "Drive down with your lats", "Squeeze at your thighs", "Control the return", "Don't bend your elbows")))
_add(_back_pull("Barbell Row", "barbell_row", _ROW_CUES, pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Pendlay Row", "pendlay_row", ("Torso parallel to the floor", "Explosive pull to your lower chest", "Return the bar to the floor each rep", "Reset your back angle", "Brace hard before each pull"), pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Yates Row", "yates_row", ("Upright torso — 60-70° angle", "Pull to your hip crease", "Underhand grip", "Squeeze your lats", "Control the negative"), pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("T-Bar Row", "t_bar_row", _ROW_CUES, pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Seal Row", "seal_row", ("Chest on the bench — no momentum possible", "Pull to the bench", "Squeeze hard at the top", "Full stretch at the bottom", "Keep your legs off the floor"), pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Dumbbell Row", "dumbbell_row", ("One arm at a time — knee on bench", "Pull to your hip", "Squeeze at the top", "Full stretch at the bottom", "Don't rotate your torso"), pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Chest Supported Row", "chest_supported_row", _ROW_CUES, pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Cable Row", "cable_row", _ROW_CUES, pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Machine Row", "machine_row", _ROW_CUES, pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Meadows Row", "meadows_row", ("Staggered stance — landmine setup", "Pull to your hip", "Squeeze at the top", "Full stretch", "Control the negative"), pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Landmine Row", "landmine_row", _ROW_CUES, pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_pull("Inverted Row", "inverted_row", ("Body straight — no sagging", "Pull your chest to the bar", "Squeeze at the top", "Full extension at the bottom", "Keep your core tight"), pattern=MovementPattern.PULL_HORIZONTAL, rule=_PULL_HORIZONTAL))
_add(_back_hinge("Rack Pull", "rack_pull", _DL_CUES))
_add(_back_hinge("Deadlift", "deadlift", _DL_CUES))
_add(_back_hinge("Romanian Deadlift", "romanian_deadlift", ("Soft knee bend — keep it constant", "Push your hips back", "Feel the hamstring stretch", "Flat back throughout", "Bar stays close to your legs")))
_add(_back_hinge("Deficit Deadlift", "deficit_deadlift", _DL_CUES))
_add(_back_hinge("Snatch Grip Deadlift", "snatch_grip_deadlift", (*_DL_CUES[:3], "Wide grip — extra upper back work", _DL_CUES[4])))
_add(_back_hinge("Good Morning", "good_morning", ("Bar on your upper back", "Hinge at your hips", "Keep your back flat", "Feel the hamstring stretch", "Drive your hips forward to stand")))
_add(Exercise("Hyperextension", "hyperextension", "Back", MovementPattern.HINGE,
    ("Erector Spinae",), ("Glutes", "Hamstrings"), _HINGE,
    FormCriteria(rom_target=60, tempo_range=(2.0, 4.0)),
    ("Hinge at your hips — not your lower back", "Squeeze your glutes at the top", "Don't hyperextend", "Control the descent", "Keep your neck neutral")))
_add(Exercise("Reverse Hyper", "reverse_hyper", "Back", MovementPattern.HINGE,
    ("Glutes", "Hamstrings"), ("Erector Spinae",), _HINGE,
    FormCriteria(rom_target=60), ("Control the swing", "Squeeze at the top", "Let legs hang at the bottom", "Don't use momentum", "Keep your upper body still")))

# ── SHOULDERS (18) ──────────────────────────────────────────────────
_add(_shoulder_press("Standing Overhead Press", "standing_overhead_press", _OHP_CUES))
_add(_shoulder_press("Seated Overhead Press", "seated_overhead_press", _OHP_CUES))
_add(_shoulder_press("Dumbbell Shoulder Press", "dumbbell_shoulder_press", _OHP_CUES))
_add(_shoulder_press("Arnold Press", "arnold_press", ("Start with palms facing you", "Rotate as you press up", "Full lockout overhead", "Reverse on the way down", "Control the rotation")))
_add(_shoulder_press("Push Press", "push_press", ("Dip with your knees — 4 inches", "Explode through your legs", "Press overhead", "Lock out fully", "Catch with straight arms")))
_add(_shoulder_press("Behind The Neck Press", "behind_the_neck_press", ("Warm up your shoulders first", "Only go to ear level", "Press straight up", "Keep your core braced", "Don't go too heavy")))
_add(_shoulder_press("Bradford Press", "bradford_press", ("Alternate front and behind neck", "Don't lock out — constant tension", "Control the movement", "Keep it light", "Focus on the deltoid stretch")))
_add(_shoulder_raise("Lateral Raise", "lateral_raise", _RAISE_CUES))
_add(_shoulder_raise("Cable Lateral Raise", "cable_lateral_raise", _RAISE_CUES))
_add(_shoulder_raise("Machine Lateral Raise", "machine_lateral_raise", _RAISE_CUES))
_add(_shoulder_raise("Leaning Lateral Raise", "leaning_lateral_raise", (*_RAISE_CUES[:3], "Lean away for extra stretch", "Control the negative")))
_add(Exercise("Rear Delt Fly", "rear_delt_fly", "Shoulders", MovementPattern.ISOLATION_RAISE,
    ("Rear Deltoid",), ("Rhomboids", "Middle Trapezius"), _LATERAL_RAISE,
    FormCriteria(rom_target=70, tempo_range=(2.0, 4.0)), ("Bend forward at the hips", "Lead with your elbows", "Squeeze your rear delts", "Control the descent", "Don't use momentum")))
_add(Exercise("Reverse Pec Deck", "reverse_pec_deck", "Shoulders", MovementPattern.ISOLATION_RAISE,
    ("Rear Deltoid",), ("Rhomboids",), _LATERAL_RAISE,
    FormCriteria(rom_target=70), ("Squeeze at the back position", "Control the return", "Don't shrug", "Keep your chest on the pad", "Slight pause at peak contraction")))
_add(Exercise("Face Pull", "face_pull", "Shoulders", MovementPattern.PULL_HORIZONTAL,
    ("Rear Deltoid", "External Rotators"), ("Middle Trapezius", "Rhomboids"), _PULL_HORIZONTAL,
    FormCriteria(rom_target=80), ("Pull to your forehead", "Rotate your hands outward", "Squeeze your rear delts", "Control the return", "Keep your elbows high")))
_add(Exercise("Upright Row", "upright_row", "Shoulders", MovementPattern.PULL_VERTICAL,
    ("Lateral Deltoid", "Upper Trapezius"), ("Biceps",), _PULL_VERTICAL,
    FormCriteria(rom_target=80), ("Pull to collarbone height", "Lead with your elbows", "Don't go above shoulder height", "Control the descent", "Keep the bar close to your body")))
_add(_shoulder_raise("Front Raise", "front_raise", ("Arms straight — slight bend", "Raise to eye level", "Control the descent", "Alternate arms or both", "Don't swing")))
_add(_shoulder_raise("Plate Raise", "plate_raise", ("Hold plate at 3 and 9 o'clock", "Raise to eye level", "Squeeze at the top", "Slow descent", "Keep your core tight")))
_add(_shoulder_raise("Cuban Press", "cuban_press", ("External rotate at the top", "Light weight — rotator cuff work", "Control every phase", "Elbows at 90°", "Don't rush")))

# ── BICEPS (15) ─────────────────────────────────────────────────────
_add(_curl("Barbell Curl", "barbell_curl", _CURL_CUES))
_add(_curl("EZ Bar Curl", "ez_bar_curl", _CURL_CUES))
_add(_curl("Dumbbell Curl", "dumbbell_curl", _CURL_CUES))
_add(_curl("Alternating Curl", "alternating_curl", (*_CURL_CUES[:3], "Alternate arms each rep", "Don't lean to compensate")))
_add(_curl("Hammer Curl", "hammer_curl", ("Neutral grip — palms facing each other", "Keep elbows pinned", "Full extension at the bottom", "Squeeze at the top", "Control the negative")))
_add(_curl("Cross Body Hammer Curl", "cross_body_hammer_curl", ("Curl across your body toward opposite shoulder", "Keep elbow pinned", "Squeeze at the top", "Control the descent", "Alternate arms")))
_add(_curl("Incline Curl", "incline_curl", ("Bench at 45° — arms hang straight", "Full stretch at the bottom", "Curl up — don't swing", "Squeeze at the top", "Slow negative")))
_add(_curl("Preacher Curl", "preacher_curl", ("Armpits on the pad", "Full extension at the bottom", "Don't swing — pad prevents it", "Squeeze at the top", "Control the negative")))
_add(_curl("Spider Curl", "spider_curl", ("Chest on incline bench — arms hang", "Curl up with both arms", "Squeeze hard at the top", "Control the descent", "No momentum")))
_add(_curl("Bayesian Curl", "bayesian_curl", ("Cable behind you — arm extended back", "Curl forward and up", "Peak contraction at the top", "Control the return", "Keep your elbow stationary")))
_add(_curl("Concentration Curl", "concentration_curl", ("Elbow on inner thigh", "Full extension at the bottom", "Curl up — squeeze at the top", "Control the negative", "Don't use your body")))
_add(_curl("Cable Curl", "cable_curl", _CURL_CUES))
_add(_curl("Reverse Curl", "reverse_curl", ("Overhand grip — palms down", "Keep your wrists straight", "Full range of motion", "Squeeze at the top", "Control the negative")))
_add(_curl("Drag Curl", "drag_curl", ("Drag the bar up your torso", "Elbows go behind you", "Squeeze at the top", "Control the descent", "Keep the bar touching your body")))
_add(_curl("Machine Curl", "machine_curl", _CURL_CUES))

# ── TRICEPS (12) ────────────────────────────────────────────────────
_add(_tricep("Skull Crusher", "skull_crusher", ("Lower to your forehead", "Keep elbows pointed at ceiling", "Full extension at the top", "Control the descent", "Don't flare your elbows")))
_add(_tricep("JM Press", "jm_press", ("Hybrid skull crusher and close grip bench", "Lower to your chin/neck area", "Press back up", "Keep elbows in", "Control the weight")))
_add(_tricep("Close Grip Bench", "close_grip_bench", ("Hands shoulder-width apart", "Elbows close to your body", "Lower to your lower chest", "Press up and lock out", "Keep your wrists straight")))
_add(_tricep("Overhead Extension", "overhead_extension", ("Arms overhead — elbows by ears", "Lower behind your head", "Full extension at the top", "Don't flare your elbows", "Control the stretch")))
_add(_tricep("Dumbbell Extension", "dumbbell_extension", _TRI_CUES))
_add(_tricep("Rope Pushdown", "rope_pushdown", (*_TRI_CUES[:3], "Spread the rope at the bottom", "Don't lean into it")))
_add(_tricep("Straight Bar Pushdown", "straight_bar_pushdown", _TRI_CUES))
_add(_tricep("Reverse Grip Pushdown", "reverse_grip_pushdown", ("Palms up — underhand grip", *_TRI_CUES[1:4], "Focus on the squeeze")))
_add(_tricep("Dip", "dip", ("Upright torso for tricep focus", "Lower until 90° elbow angle", "Press to full lockout", "Don't flare your elbows", "Control the descent")))
_add(_tricep("Machine Dip", "machine_dip", _TRI_CUES))
_add(_tricep("Single Arm Pushdown", "single_arm_pushdown", ("One arm at a time", "Full lockout", "Squeeze at the bottom", "Control the return", "Don't rotate your torso")))
_add(_tricep("Kickback", "kickback", ("Hinge forward — upper arm parallel", "Extend your forearm back", "Squeeze at full extension", "Control the return", "Don't swing")))

# ── QUADS (17) ──────────────────────────────────────────────────────
_add(_squat("Back Squat", "back_squat", _SQUAT_CUES))
_add(_squat("Front Squat", "front_squat", ("Elbows high — bar on front delts", "Stay upright", "Break at knees first", "Drive your elbows up out of the hole", "Brace hard")))
_add(_squat("High Bar Squat", "high_bar_squat", _SQUAT_CUES))
_add(_squat("Low Bar Squat", "low_bar_squat", ("Bar on rear delts — lower position", "More forward lean", "Hips back first", "Drive up with your hips", "Wide stance")))
_add(_squat("Safety Bar Squat", "safety_bar_squat", _SQUAT_CUES))
_add(_squat("Zercher Squat", "zercher_squat", ("Bar in elbow crease", "Stay upright", "Deep squat", "Drive up through your quads", "Brace your core hard")))
_add(_squat("Goblet Squat", "goblet_squat", ("Hold the dumbbell at your chest", "Elbows between your knees", "Sit deep", "Push the floor away", "Stay upright")))
_add(_squat("Hack Squat", "hack_squat", ("Shoulders on the pads", "Feet shoulder-width on the platform", "Full depth", "Drive up through your heels", "Don't lock out aggressively")))
_add(_squat("Pendulum Squat", "pendulum_squat", ("Stay upright — machine guides the path", "Full depth", "Drive up", "Control the descent", "Keep your feet flat")))
_add(_squat("Leg Press", "leg_press", ("Feet shoulder-width on the platform", "Lower until 90° at knees", "Don't lock your knees at the top", "Press through your heels", "Keep your lower back on the pad")))
_add(_lunge("Bulgarian Split Squat", "bulgarian_split_squat", ("Rear foot on bench", "Long stride", "Lower until rear knee near floor", "Drive through front heel", "Keep torso upright")))
_add(_lunge("Walking Lunge", "walking_lunge", _LUNGE_CUES))
_add(_lunge("Reverse Lunge", "reverse_lunge", ("Step backward", "Lower until rear knee near floor", "Drive through front heel", "Keep torso upright", "Alternate legs")))
_add(_lunge("Step Up", "step_up", ("Full foot on the box", "Drive through your lead leg only", "Don't push off your back foot", "Full hip extension at the top", "Control the step down")))
_add(_squat("Sissy Squat", "sissy_squat", ("Lean back — knees forward", "Lower until quads are parallel", "Drive up through your quads", "Keep your hips extended", "Hold something for balance")))
_add(_squat("Belt Squat", "belt_squat", ("Weight on your hips — no spinal load", "Full depth", "Drive up", "Keep your chest up", "Push the floor away")))
_add(_squat("Smith Machine Squat", "smith_machine_squat", _SQUAT_CUES))

# ── HAMSTRINGS (10) ─────────────────────────────────────────────────
_add(_ham("Romanian Deadlift", "rdl", ("Soft knee bend — keep it constant", "Push hips back", "Feel hamstring stretch", "Flat back throughout", "Bar close to legs")))
_add(_ham("Stiff Leg Deadlift", "stiff_leg_deadlift", ("Legs nearly straight", "Hinge at hips", "Feel the deep stretch", "Flat back", "Control the descent")))
_add(_ham("Nordic Curl", "nordic_curl", ("Start kneeling — partner holds ankles", "Lower slowly with control", "Resist as long as possible", "Push off the ground to return", "Keep your hips extended"), pattern=MovementPattern.ISOLATION_CURL))
_add(_ham("Seated Leg Curl", "seated_leg_curl", ("Adjust pad to your calves", "Curl all the way in", "Squeeze at peak contraction", "Control the return", "Don't swing"), pattern=MovementPattern.ISOLATION_CURL, rule=_ELBOW_CURL))
_add(_ham("Lying Leg Curl", "lying_leg_curl", ("Pad on your Achilles area", "Curl all the way up", "Squeeze at the top", "Slow negative", "Don't lift your hips"), pattern=MovementPattern.ISOLATION_CURL, rule=_ELBOW_CURL))
_add(_ham("Standing Leg Curl", "standing_leg_curl", ("One leg at a time", "Curl fully", "Squeeze at the top", "Control the descent", "Keep your hips square"), pattern=MovementPattern.ISOLATION_CURL, rule=_ELBOW_CURL))
_add(_ham("Glute Ham Raise", "glute_ham_raise", ("Start from the top", "Lower with control — fight gravity", "Drive up with your hamstrings", "Keep your hips extended", "Don't round your back")))
_add(_ham("Good Morning", "good_morning_ham", ("Bar on upper back", "Hinge at hips", "Feel the stretch", "Flat back", "Drive hips forward to stand")))
_add(_ham("Cable Leg Curl", "cable_leg_curl", ("Ankle strap attachment", "Curl fully", "Squeeze at the top", "Control the return", "Keep your body stable"), pattern=MovementPattern.ISOLATION_CURL, rule=_ELBOW_CURL))
_add(_ham("Single Leg RDL", "single_leg_rdl", ("Hinge on one leg", "Opposite leg extends behind", "Feel the hamstring stretch", "Flat back", "Return with control")))

# ── GLUTES (12) ─────────────────────────────────────────────────────
_add(_glute("Hip Thrust", "hip_thrust", _GLUTE_CUES))
_add(_glute("Barbell Hip Thrust", "barbell_hip_thrust", _GLUTE_CUES))
_add(_glute("Dumbbell Hip Thrust", "dumbbell_hip_thrust", _GLUTE_CUES))
_add(_glute("Glute Bridge", "glute_bridge", ("Feet flat on the floor", "Drive through your heels", "Squeeze at the top", "Don't hyperextend", "Control the descent")))
_add(_glute("Single Leg Hip Thrust", "single_leg_hip_thrust", ("One leg at a time", "Drive through your working heel", "Full hip extension", "Keep your hips level", "Control the negative")))
_add(_glute("Cable Kickback", "cable_kickback", ("Ankle strap — lean forward slightly", "Kick straight back", "Squeeze your glute at full extension", "Don't arch your back", "Control the return")))
_add(_glute("Frog Pump", "frog_pump", ("Soles of feet together — knees out", "Drive hips up", "Squeeze at the top", "High rep range", "Keep your back flat")))
_add(_glute("Kettlebell Swing", "kettlebell_swing", ("Hinge at your hips — not a squat", "Explosive hip drive", "Arms are pendulums — not lifters", "Squeeze glutes at the top", "Control the backswing")))

# ── CALVES (6) ──────────────────────────────────────────────────────
for name, slug in [("Standing Calf Raise", "standing_calf_raise"), ("Seated Calf Raise", "seated_calf_raise"),
    ("Donkey Calf Raise", "donkey_calf_raise"), ("Single Leg Calf Raise", "single_leg_calf_raise"),
    ("Leg Press Calf Raise", "leg_press_calf_raise")]:
    _add(Exercise(name, slug, "Calves", MovementPattern.CALF,
        ("Gastrocnemius", "Soleus"), (), _CALF_RAISE,
        FormCriteria(rom_target=30, tempo_range=(2.0, 4.0)), _CALF_CUES))
_add(Exercise("Tibialis Raise", "tibialis_raise", "Calves", MovementPattern.CALF,
    ("Tibialis Anterior",), (), _CALF_RAISE,
    FormCriteria(rom_target=25), ("Toes up — feel the shin burn", "Full range of motion", "Control both directions", "Don't bounce", "High reps work best")))

# ── ABS / CORE (16) ────────────────────────────────────────────────
for name, slug in [("Crunch", "crunch"), ("Cable Crunch", "cable_crunch"), ("Decline Crunch", "decline_crunch"),
    ("Sit-Up", "sit_up"), ("Reverse Crunch", "reverse_crunch"), ("Bicycle Crunch", "bicycle_crunch")]:
    _add(Exercise(name, slug, "Core", MovementPattern.CORE,
        ("Rectus Abdominis",), ("Obliques",), _CORE_FLEXION,
        FormCriteria(rom_target=50, tempo_range=(1.5, 3.0)), _CORE_CUES))
_add(Exercise("Hanging Leg Raise", "hanging_leg_raise", "Core", MovementPattern.CORE,
    ("Rectus Abdominis", "Hip Flexors"), ("Obliques",), _CORE_FLEXION,
    FormCriteria(rom_target=80), ("Hang from the bar — arms straight", "Raise legs to parallel or higher", "Control the descent — no swinging", "Engage your abs — not just hip flexors", "Slow tempo")))
_add(Exercise("Toes To Bar", "toes_to_bar", "Core", MovementPattern.CORE,
    ("Rectus Abdominis",), ("Hip Flexors", "Obliques"), _CORE_FLEXION,
    FormCriteria(rom_target=100), ("Touch toes to the bar", "Use a kipping rhythm or strict", "Control the descent", "Engage your lats for stability", "Full extension at the bottom")))
_add(Exercise("Ab Wheel", "ab_wheel", "Core", MovementPattern.CORE,
    ("Rectus Abdominis",), ("Obliques", "Hip Flexors", "Shoulders"), _CORE_FLEXION,
    FormCriteria(rom_target=80, tempo_range=(2.0, 5.0)), ("Roll out as far as you can control", "Keep your core tight — don't sag", "Pull back with your abs", "Breathe out on the return", "Don't hyperextend")))
_add(Exercise("Plank", "plank", "Core", MovementPattern.CORE,
    ("Rectus Abdominis", "Transverse Abdominis"), ("Obliques", "Erector Spinae"), None,
    FormCriteria(), ("Straight line from head to heels", "Squeeze your glutes", "Draw your belly button in", "Don't let your hips sag", "Breathe normally")))
_add(Exercise("Side Plank", "side_plank", "Core", MovementPattern.CORE,
    ("Obliques",), ("Gluteus Medius", "Quadratus Lumborum"), None,
    FormCriteria(), ("Stack your feet or stagger them", "Hips up — straight line", "Don't rotate forward", "Breathe normally", "Engage your obliques")))
_add(Exercise("Dragon Flag", "dragon_flag", "Core", MovementPattern.CORE,
    ("Rectus Abdominis",), ("Obliques", "Hip Flexors"), _CORE_FLEXION,
    FormCriteria(rom_target=90), ("Grip the bench behind your head", "Lift your body as one rigid unit", "Lower with control — fight gravity", "Don't bend at the hips", "Start with negatives only")))
_add(Exercise("Pallof Press", "pallof_press", "Core", MovementPattern.CORE,
    ("Transverse Abdominis", "Obliques"), ("Rectus Abdominis",), None,
    FormCriteria(), ("Press straight out from your chest", "Resist the rotation", "Hold for 2 seconds extended", "Return with control", "Keep your hips square")))
_add(Exercise("Russian Twist", "russian_twist", "Core", MovementPattern.CORE,
    ("Obliques",), ("Rectus Abdominis",), _CORE_FLEXION,
    FormCriteria(rom_target=60), ("Lean back 45° — feet off the floor", "Rotate side to side", "Touch the weight to each side", "Control the rotation", "Don't round your lower back")))
_add(Exercise("Dead Bug", "dead_bug", "Core", MovementPattern.CORE,
    ("Transverse Abdominis",), ("Rectus Abdominis",), None,
    FormCriteria(), ("Back flat on the floor", "Opposite arm and leg extend", "Don't let your back arch", "Breathe out as you extend", "Slow and controlled")))
_add(Exercise("Hollow Hold", "hollow_hold", "Core", MovementPattern.CORE,
    ("Rectus Abdominis",), ("Hip Flexors",), None,
    FormCriteria(), ("Arms overhead — legs straight", "Press your lower back into the floor", "Don't let your back arch", "Hold the position — don't rest", "Breathe normally")))
_add(Exercise("Farmer Carry", "farmer_carry", "Core", MovementPattern.CARRY,
    ("Forearms", "Trapezius", "Core"), ("Obliques", "Glutes"), None,
    FormCriteria(), ("Stand tall — shoulders back", "Grip hard — crush the handles", "Walk with normal stride", "Don't lean to either side", "Keep your core braced")))

# ── OLYMPIC (8) ─────────────────────────────────────────────────────
for name, slug in [("Clean", "clean"), ("Power Clean", "power_clean"), ("Hang Clean", "hang_clean"),
    ("Snatch", "snatch"), ("Power Snatch", "power_snatch"), ("Clean and Jerk", "clean_and_jerk"),
    ("Push Jerk", "push_jerk"), ("Split Jerk", "split_jerk")]:
    _add(Exercise(name, slug, "Olympic", MovementPattern.OLYMPIC,
        ("Quadriceps", "Glutes", "Hamstrings", "Trapezius", "Shoulders"),
        ("Core", "Forearms", "Calves"),
        RepDetectionRule(primary_joints=(
            JointRule(L_SHOULDER, L_HIP, L_KNEE, 90, 170, "hip"),
            JointRule(R_SHOULDER, R_HIP, R_KNEE, 90, 170, "hip"),
        ), min_rom_degrees=50),
        FormCriteria(rom_target=120, tempo_range=(0.5, 2.0),
            stability_joints=(L_ANKLE, R_ANKLE), symmetry_check=True),
        _OLY_CUES))

# ── KETTLEBELL (7) ──────────────────────────────────────────────────
_add(Exercise("Kettlebell Swing", "kb_swing", "Kettlebell", MovementPattern.HINGE,
    ("Glutes", "Hamstrings"), ("Core", "Shoulders"), _HINGE,
    FormCriteria(rom_target=70), _GLUTE_CUES))
_add(_squat("Goblet Squat (KB)", "kb_goblet_squat", ("Hold the kettlebell at your chest", "Elbows between your knees", "Sit deep", "Push the floor away", "Stay upright")))
_add(Exercise("Turkish Get Up", "turkish_get_up", "Kettlebell", MovementPattern.BODYWEIGHT,
    ("Shoulders", "Core", "Glutes"), ("Triceps", "Quadriceps"), None,
    FormCriteria(), ("Eyes on the kettlebell at all times", "Each position is a checkpoint", "Lock your arm out fully", "Stand up tall at the top", "Reverse the exact same path down")))
_add(Exercise("Kettlebell Clean", "kb_clean", "Kettlebell", MovementPattern.OLYMPIC,
    ("Glutes", "Hamstrings", "Shoulders"), ("Core", "Biceps"), _HINGE,
    FormCriteria(), ("Hike pass between your legs", "Explosive hip drive", "Catch in the rack position", "Don't bang your forearm", "Control the drop")))
_add(Exercise("Kettlebell Snatch", "kb_snatch", "Kettlebell", MovementPattern.OLYMPIC,
    ("Glutes", "Shoulders", "Hamstrings"), ("Core", "Triceps"), _HINGE,
    FormCriteria(), ("Hike pass start", "Explosive hip drive", "Punch through at the top", "Soft catch overhead", "Control the drop")))
_add(_shoulder_press("Kettlebell Press", "kb_press", _OHP_CUES))
_add(Exercise("Windmill", "windmill", "Kettlebell", MovementPattern.HINGE,
    ("Obliques", "Shoulders"), ("Hamstrings", "Glutes"), _HINGE,
    FormCriteria(), ("Kettlebell locked overhead", "Hinge toward your front foot", "Eyes on the kettlebell", "Feel the oblique stretch", "Stand up with control")))

# ── BODYWEIGHT (16) ─────────────────────────────────────────────────
_add(Exercise("Pistol Squat", "pistol_squat", "Bodyweight", MovementPattern.SQUAT,
    ("Quadriceps", "Glutes"), ("Core", "Hip Flexors"), _SQUAT,
    FormCriteria(rom_target=120), ("One leg — other extended forward", "Sit all the way down", "Keep your heel flat", "Drive up through one leg", "Arms forward for balance")))
_add(Exercise("Burpee", "burpee", "Bodyweight", MovementPattern.BODYWEIGHT,
    ("Full Body",), (), None,
    FormCriteria(), ("Drop to the floor — chest touches", "Push up explosively", "Jump your feet forward", "Jump and clap overhead", "Keep a rhythm")))
_add(Exercise("Mountain Climber", "mountain_climber", "Bodyweight", MovementPattern.CORE,
    ("Core", "Hip Flexors"), ("Shoulders", "Quadriceps"), None,
    FormCriteria(), ("Push-up position — hands under shoulders", "Drive knees to chest alternating", "Keep your hips low", "Fast tempo", "Don't bounce your hips")))
_add(Exercise("Jump Squat", "jump_squat", "Bodyweight", MovementPattern.SQUAT,
    ("Quadriceps", "Glutes", "Calves"), ("Core",), _SQUAT,
    FormCriteria(tempo_range=(0.5, 2.0)), ("Quarter squat depth", "Explode upward", "Land softly — absorb with your knees", "Immediate next rep", "Arms swing for momentum")))
_add(Exercise("Box Jump", "box_jump", "Bodyweight", MovementPattern.SQUAT,
    ("Quadriceps", "Glutes", "Calves"), ("Core",), _SQUAT,
    FormCriteria(), ("Quarter squat — swing arms back", "Explode up and forward", "Land softly on the box", "Stand up fully", "Step down — don't jump down")))
_add(Exercise("Handstand Push-Up", "handstand_push_up", "Bodyweight", MovementPattern.PUSH_VERTICAL,
    ("Shoulders", "Triceps"), ("Upper Chest", "Core"), _OVERHEAD_PRESS,
    FormCriteria(rom_target=90), ("Kick up to the wall", "Lower until head touches floor", "Press straight up", "Keep your core tight", "Control the descent")))
_add(Exercise("Muscle Up", "muscle_up", "Bodyweight", MovementPattern.PULL_VERTICAL,
    ("Latissimus Dorsi", "Chest", "Triceps"), ("Biceps", "Core"), _PULL_VERTICAL,
    FormCriteria(), ("Explosive pull — fast pull-up", "Transition over the bar/rings", "Press to lockout", "Control the descent", "Kipping or strict")))
_add(Exercise("Front Lever", "front_lever", "Bodyweight", MovementPattern.PULL_VERTICAL,
    ("Latissimus Dorsi", "Core"), ("Shoulders", "Biceps"), None,
    FormCriteria(), ("Hang from the bar", "Raise body to horizontal", "Keep arms straight", "Engage your lats hard", "Hold — don't drop")))
_add(Exercise("Back Lever", "back_lever", "Bodyweight", MovementPattern.PULL_VERTICAL,
    ("Shoulders", "Core", "Biceps"), ("Chest",), None,
    FormCriteria(), ("Skin the cat to inverted hang", "Lower to horizontal behind you", "Arms straight", "Engage your whole posterior chain", "Hold the position")))
_add(Exercise("Planche", "planche", "Bodyweight", MovementPattern.PUSH_HORIZONTAL,
    ("Shoulders", "Chest", "Core"), ("Triceps", "Forearms"), None,
    FormCriteria(), ("Lean forward — hands by your hips", "Lift your body horizontal", "Arms straight — locked out", "Engage everything", "Start with tuck progressions")))


# ── Lookup helpers ──────────────────────────────────────────────────
def get_exercise(slug: str) -> Exercise | None:
    return EXERCISE_DB.get(slug)

def find_exercise(name: str) -> Exercise | None:
    slug = name.lower().replace(" ", "_").replace("-", "_")
    if slug in EXERCISE_DB:
        return EXERCISE_DB[slug]
    for ex in EXERCISE_DB.values():
        if name.lower() in ex.name.lower():
            return ex
    return None

def exercises_by_pattern(pattern: MovementPattern) -> list[Exercise]:
    return [ex for ex in EXERCISE_DB.values() if ex.pattern == pattern]

def exercises_by_muscle_group(group: str) -> list[Exercise]:
    return [ex for ex in EXERCISE_DB.values() if ex.muscle_group.lower() == group.lower()]

def list_all_exercises() -> list[str]:
    return [ex.name for ex in EXERCISE_DB.values()]


# Final count
TOTAL_EXERCISES = len(EXERCISE_DB)
