"""
muscle_targeting.py
-------------------
Maps every exercise to its targeted muscles with activation percentages.
Used by the overlay's muscle heatmap, the AI coach for volume balancing,
and the session logger for per-muscle-group volume tracking.

Activation is expressed as a 0.0–1.0 float where 1.0 = maximum voluntary
activation for that muscle group in the exercise.  Roles:
    primary    — the muscle doing the most work (activation >= 0.6)
    secondary  — meaningfully loaded (0.3 <= activation < 0.6)
    stabilizer — isometric / postural contribution (activation < 0.3)

Usage
~~~~~
    targets = get_muscle_targets("barbell_bench_press")
    for t in targets:
        print(f"{t.muscle}: {t.activation*100:.0f}% ({t.role})")

    # Fuzzy lookup
    targets = get_muscle_targets("Incline Dumbbell Press")

    # All exercises for a muscle group
    exercises = exercises_for_muscle("Quadriceps")
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional


# ---------------------------------------------------------------------------
# Data types
# ---------------------------------------------------------------------------

@dataclass(frozen=True, slots=True)
class MuscleTarget:
    """One muscle's contribution to an exercise."""
    muscle: str          # Canonical muscle name
    activation: float    # 0.0 – 1.0 (fraction of max activation)
    role: str            # "primary" | "secondary" | "stabilizer"

    def __post_init__(self):
        if not 0.0 <= self.activation <= 1.0:
            raise ValueError(f"activation must be 0.0–1.0, got {self.activation}")
        if self.role not in ("primary", "secondary", "stabilizer"):
            raise ValueError(f"role must be primary/secondary/stabilizer, got {self.role!r}")


# ---------------------------------------------------------------------------
# Canonical muscle names — used consistently throughout the map
# ---------------------------------------------------------------------------

# Chest
PECTORALIS_MAJOR         = "Chest (Pectoralis Major)"
PECTORALIS_UPPER         = "Upper Chest (Clavicular Head)"
PECTORALIS_LOWER         = "Lower Chest (Sternal Head)"

# Shoulders
FRONT_DELTOID            = "Front Deltoid (Anterior)"
LATERAL_DELTOID          = "Lateral Deltoid (Medial)"
REAR_DELTOID             = "Rear Deltoid (Posterior)"
ROTATOR_CUFF             = "Rotator Cuff"

# Back
LATISSIMUS_DORSI         = "Lats (Latissimus Dorsi)"
UPPER_TRAPS              = "Upper Traps"
MID_TRAPS                = "Mid Traps (Rhomboids)"
LOWER_TRAPS              = "Lower Traps"
ERECTOR_SPINAE           = "Erector Spinae"
TERES_MAJOR              = "Teres Major"

# Arms
BICEPS                   = "Biceps (Biceps Brachii)"
BICEPS_LONG              = "Biceps (Long Head)"
BICEPS_SHORT             = "Biceps (Short Head)"
BRACHIALIS               = "Brachialis"
BRACHIORADIALIS          = "Brachioradialis"
TRICEPS                  = "Triceps (Triceps Brachii)"
TRICEPS_LONG             = "Triceps (Long Head)"
TRICEPS_LATERAL          = "Triceps (Lateral Head)"
TRICEPS_MEDIAL           = "Triceps (Medial Head)"
FOREARM_FLEXORS          = "Forearm Flexors"
FOREARM_EXTENSORS        = "Forearm Extensors"

# Legs
QUADRICEPS               = "Quadriceps"
RECTUS_FEMORIS           = "Rectus Femoris"
VASTUS_LATERALIS         = "Vastus Lateralis"
VASTUS_MEDIALIS          = "Vastus Medialis"
HAMSTRINGS               = "Hamstrings"
GLUTEUS_MAXIMUS          = "Glutes (Gluteus Maximus)"
GLUTEUS_MEDIUS           = "Gluteus Medius"
ADDUCTORS                = "Adductors"
HIP_FLEXORS              = "Hip Flexors"
CALVES_GASTROC           = "Calves (Gastrocnemius)"
CALVES_SOLEUS            = "Calves (Soleus)"
TIBIALIS_ANTERIOR        = "Tibialis Anterior"

# Core
RECTUS_ABDOMINIS         = "Abs (Rectus Abdominis)"
OBLIQUES                 = "Obliques"
TRANSVERSE_ABDOMINIS     = "Transverse Abdominis"
SERRATUS_ANTERIOR        = "Serratus Anterior"


# ---------------------------------------------------------------------------
# Complete muscle map — 190+ exercises
# ---------------------------------------------------------------------------

MUSCLE_MAP: Dict[str, List[MuscleTarget]] = {

    # =======================================================================
    # CHEST — Bench Press Variants
    # =======================================================================
    "barbell_bench_press": [
        MuscleTarget(PECTORALIS_MAJOR,   1.0,  "primary"),
        MuscleTarget(FRONT_DELTOID,      0.60, "secondary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.25, "stabilizer"),
        MuscleTarget(BICEPS,             0.10, "stabilizer"),
    ],
    "incline_barbell_bench_press": [
        MuscleTarget(PECTORALIS_UPPER,   1.0,  "primary"),
        MuscleTarget(FRONT_DELTOID,      0.70, "primary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.55, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.25, "stabilizer"),
    ],
    "decline_barbell_bench_press": [
        MuscleTarget(PECTORALIS_LOWER,   1.0,  "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.80, "primary"),
        MuscleTarget(TRICEPS,            0.55, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.40, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.20, "stabilizer"),
    ],
    "dumbbell_bench_press": [
        MuscleTarget(PECTORALIS_MAJOR,   1.0,  "primary"),
        MuscleTarget(FRONT_DELTOID,      0.55, "secondary"),
        MuscleTarget(TRICEPS,            0.45, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.30, "stabilizer"),
        MuscleTarget(BICEPS,             0.10, "stabilizer"),
    ],
    "incline_dumbbell_press": [
        MuscleTarget(PECTORALIS_UPPER,   1.0,  "primary"),
        MuscleTarget(FRONT_DELTOID,      0.65, "primary"),
        MuscleTarget(TRICEPS,            0.45, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.25, "stabilizer"),
    ],
    "decline_dumbbell_press": [
        MuscleTarget(PECTORALIS_LOWER,   1.0,  "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.75, "primary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.35, "secondary"),
    ],
    "close_grip_bench_press": [
        MuscleTarget(TRICEPS,            1.0,  "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.70, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.45, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.20, "stabilizer"),
    ],
    "floor_press": [
        MuscleTarget(TRICEPS,            0.85, "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.75, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.45, "secondary"),
    ],
    "smith_machine_bench_press": [
        MuscleTarget(PECTORALIS_MAJOR,   0.90, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.55, "secondary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
    ],
    "machine_chest_press": [
        MuscleTarget(PECTORALIS_MAJOR,   0.85, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.50, "secondary"),
        MuscleTarget(TRICEPS,            0.45, "secondary"),
    ],

    # =======================================================================
    # CHEST — Fly / Crossover Variants
    # =======================================================================
    "dumbbell_fly": [
        MuscleTarget(PECTORALIS_MAJOR,   1.0,  "primary"),
        MuscleTarget(FRONT_DELTOID,      0.35, "secondary"),
        MuscleTarget(BICEPS,             0.15, "stabilizer"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.20, "stabilizer"),
    ],
    "incline_dumbbell_fly": [
        MuscleTarget(PECTORALIS_UPPER,   1.0,  "primary"),
        MuscleTarget(FRONT_DELTOID,      0.40, "secondary"),
        MuscleTarget(BICEPS,             0.15, "stabilizer"),
    ],
    "cable_crossover": [
        MuscleTarget(PECTORALIS_MAJOR,   1.0,  "primary"),
        MuscleTarget(FRONT_DELTOID,      0.30, "secondary"),
        MuscleTarget(BICEPS,             0.15, "stabilizer"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.15, "stabilizer"),
    ],
    "pec_deck": [
        MuscleTarget(PECTORALIS_MAJOR,   1.0,  "primary"),
        MuscleTarget(FRONT_DELTOID,      0.25, "stabilizer"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.20, "stabilizer"),
    ],
    "low_cable_fly": [
        MuscleTarget(PECTORALIS_UPPER,   0.90, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.35, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.20, "stabilizer"),
    ],

    # =======================================================================
    # CHEST — Push-ups
    # =======================================================================
    "push_up": [
        MuscleTarget(PECTORALIS_MAJOR,   0.85, "primary"),
        MuscleTarget(TRICEPS,            0.55, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.25, "stabilizer"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.30, "stabilizer"),
    ],
    "diamond_push_up": [
        MuscleTarget(TRICEPS,            0.90, "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.70, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.45, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.25, "stabilizer"),
    ],
    "decline_push_up": [
        MuscleTarget(PECTORALIS_UPPER,   0.90, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.55, "secondary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.30, "stabilizer"),
    ],
    "weighted_push_up": [
        MuscleTarget(PECTORALIS_MAJOR,   0.95, "primary"),
        MuscleTarget(TRICEPS,            0.55, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.55, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.30, "stabilizer"),
    ],

    # =======================================================================
    # CHEST — Dips
    # =======================================================================
    "chest_dip": [
        MuscleTarget(PECTORALIS_LOWER,   1.0,  "primary"),
        MuscleTarget(TRICEPS,            0.70, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.55, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.20, "stabilizer"),
    ],

    # =======================================================================
    # SHOULDERS — Press Variants
    # =======================================================================
    "overhead_press": [
        MuscleTarget(FRONT_DELTOID,      1.0,  "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.50, "secondary"),
        MuscleTarget(TRICEPS,            0.55, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.35, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.30, "stabilizer"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.25, "stabilizer"),
    ],
    "seated_dumbbell_shoulder_press": [
        MuscleTarget(FRONT_DELTOID,      1.0,  "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.55, "secondary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.30, "stabilizer"),
    ],
    "arnold_press": [
        MuscleTarget(FRONT_DELTOID,      0.90, "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.70, "primary"),
        MuscleTarget(TRICEPS,            0.45, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.30, "stabilizer"),
    ],
    "push_press": [
        MuscleTarget(FRONT_DELTOID,      0.90, "primary"),
        MuscleTarget(TRICEPS,            0.55, "secondary"),
        MuscleTarget(QUADRICEPS,         0.40, "secondary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.35, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.35, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.30, "stabilizer"),
    ],
    "behind_the_neck_press": [
        MuscleTarget(FRONT_DELTOID,      0.85, "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.65, "primary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.35, "secondary"),
    ],
    "landmine_press": [
        MuscleTarget(FRONT_DELTOID,      0.85, "primary"),
        MuscleTarget(PECTORALIS_UPPER,   0.55, "secondary"),
        MuscleTarget(TRICEPS,            0.45, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.35, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.30, "stabilizer"),
    ],
    "z_press": [
        MuscleTarget(FRONT_DELTOID,      1.0,  "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.50, "secondary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.40, "secondary"),
    ],
    "machine_shoulder_press": [
        MuscleTarget(FRONT_DELTOID,      0.85, "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.45, "secondary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
    ],

    # =======================================================================
    # SHOULDERS — Raise Variants
    # =======================================================================
    "lateral_raise": [
        MuscleTarget(LATERAL_DELTOID,    1.0,  "primary"),
        MuscleTarget(FRONT_DELTOID,      0.25, "stabilizer"),
        MuscleTarget(UPPER_TRAPS,        0.30, "stabilizer"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.15, "stabilizer"),
    ],
    "cable_lateral_raise": [
        MuscleTarget(LATERAL_DELTOID,    1.0,  "primary"),
        MuscleTarget(UPPER_TRAPS,        0.25, "stabilizer"),
        MuscleTarget(FRONT_DELTOID,      0.20, "stabilizer"),
    ],
    "front_raise": [
        MuscleTarget(FRONT_DELTOID,      1.0,  "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.25, "stabilizer"),
        MuscleTarget(PECTORALIS_UPPER,   0.20, "stabilizer"),
    ],
    "rear_delt_fly": [
        MuscleTarget(REAR_DELTOID,       1.0,  "primary"),
        MuscleTarget(MID_TRAPS,          0.50, "secondary"),
        MuscleTarget(LOWER_TRAPS,        0.30, "stabilizer"),
        MuscleTarget(ROTATOR_CUFF,       0.25, "stabilizer"),
    ],
    "face_pull": [
        MuscleTarget(REAR_DELTOID,       0.85, "primary"),
        MuscleTarget(MID_TRAPS,          0.65, "primary"),
        MuscleTarget(ROTATOR_CUFF,       0.50, "secondary"),
        MuscleTarget(LOWER_TRAPS,        0.35, "secondary"),
        MuscleTarget(BICEPS,             0.20, "stabilizer"),
    ],
    "upright_row": [
        MuscleTarget(LATERAL_DELTOID,    0.85, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.75, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.45, "secondary"),
        MuscleTarget(BICEPS,             0.30, "stabilizer"),
    ],
    "shrugs": [
        MuscleTarget(UPPER_TRAPS,        1.0,  "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.15, "stabilizer"),
        MuscleTarget(FOREARM_FLEXORS,    0.25, "stabilizer"),
    ],

    # =======================================================================
    # BACK — Pull Variants (Vertical)
    # =======================================================================
    "pull_up": [
        MuscleTarget(LATISSIMUS_DORSI,   1.0,  "primary"),
        MuscleTarget(BICEPS,             0.60, "secondary"),
        MuscleTarget(TERES_MAJOR,        0.55, "secondary"),
        MuscleTarget(MID_TRAPS,          0.40, "secondary"),
        MuscleTarget(LOWER_TRAPS,        0.35, "secondary"),
        MuscleTarget(REAR_DELTOID,       0.25, "stabilizer"),
        MuscleTarget(FOREARM_FLEXORS,    0.30, "stabilizer"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.20, "stabilizer"),
    ],
    "chin_up": [
        MuscleTarget(LATISSIMUS_DORSI,   0.90, "primary"),
        MuscleTarget(BICEPS,             0.80, "primary"),
        MuscleTarget(BRACHIALIS,         0.50, "secondary"),
        MuscleTarget(TERES_MAJOR,        0.50, "secondary"),
        MuscleTarget(MID_TRAPS,          0.35, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.30, "stabilizer"),
    ],
    "lat_pulldown": [
        MuscleTarget(LATISSIMUS_DORSI,   1.0,  "primary"),
        MuscleTarget(BICEPS,             0.50, "secondary"),
        MuscleTarget(TERES_MAJOR,        0.50, "secondary"),
        MuscleTarget(MID_TRAPS,          0.35, "secondary"),
        MuscleTarget(LOWER_TRAPS,        0.30, "stabilizer"),
        MuscleTarget(REAR_DELTOID,       0.20, "stabilizer"),
    ],
    "close_grip_lat_pulldown": [
        MuscleTarget(LATISSIMUS_DORSI,   0.95, "primary"),
        MuscleTarget(BICEPS,             0.60, "secondary"),
        MuscleTarget(BRACHIALIS,         0.40, "secondary"),
        MuscleTarget(MID_TRAPS,          0.35, "secondary"),
    ],
    "straight_arm_pulldown": [
        MuscleTarget(LATISSIMUS_DORSI,   1.0,  "primary"),
        MuscleTarget(TERES_MAJOR,        0.55, "secondary"),
        MuscleTarget(TRICEPS_LONG,       0.30, "stabilizer"),
        MuscleTarget(REAR_DELTOID,       0.25, "stabilizer"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.20, "stabilizer"),
    ],

    # =======================================================================
    # BACK — Row Variants (Horizontal)
    # =======================================================================
    "barbell_row": [
        MuscleTarget(LATISSIMUS_DORSI,   0.85, "primary"),
        MuscleTarget(MID_TRAPS,          0.75, "primary"),
        MuscleTarget(REAR_DELTOID,       0.50, "secondary"),
        MuscleTarget(BICEPS,             0.50, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.45, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.25, "stabilizer"),
    ],
    "pendlay_row": [
        MuscleTarget(LATISSIMUS_DORSI,   0.90, "primary"),
        MuscleTarget(MID_TRAPS,          0.80, "primary"),
        MuscleTarget(REAR_DELTOID,       0.50, "secondary"),
        MuscleTarget(BICEPS,             0.45, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.50, "secondary"),
    ],
    "dumbbell_row": [
        MuscleTarget(LATISSIMUS_DORSI,   1.0,  "primary"),
        MuscleTarget(MID_TRAPS,          0.60, "secondary"),
        MuscleTarget(REAR_DELTOID,       0.45, "secondary"),
        MuscleTarget(BICEPS,             0.50, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.25, "stabilizer"),
    ],
    "seated_cable_row": [
        MuscleTarget(LATISSIMUS_DORSI,   0.85, "primary"),
        MuscleTarget(MID_TRAPS,          0.70, "primary"),
        MuscleTarget(REAR_DELTOID,       0.40, "secondary"),
        MuscleTarget(BICEPS,             0.45, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.30, "stabilizer"),
    ],
    "t_bar_row": [
        MuscleTarget(LATISSIMUS_DORSI,   0.90, "primary"),
        MuscleTarget(MID_TRAPS,          0.75, "primary"),
        MuscleTarget(REAR_DELTOID,       0.45, "secondary"),
        MuscleTarget(BICEPS,             0.45, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.40, "secondary"),
    ],
    "chest_supported_row": [
        MuscleTarget(MID_TRAPS,          0.85, "primary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.75, "primary"),
        MuscleTarget(REAR_DELTOID,       0.55, "secondary"),
        MuscleTarget(BICEPS,             0.40, "secondary"),
    ],
    "meadows_row": [
        MuscleTarget(LATISSIMUS_DORSI,   0.95, "primary"),
        MuscleTarget(MID_TRAPS,          0.55, "secondary"),
        MuscleTarget(REAR_DELTOID,       0.45, "secondary"),
        MuscleTarget(BICEPS,             0.40, "secondary"),
        MuscleTarget(OBLIQUES,           0.20, "stabilizer"),
    ],
    "inverted_row": [
        MuscleTarget(MID_TRAPS,          0.80, "primary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.70, "primary"),
        MuscleTarget(BICEPS,             0.50, "secondary"),
        MuscleTarget(REAR_DELTOID,       0.45, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.25, "stabilizer"),
    ],
    "single_arm_cable_row": [
        MuscleTarget(LATISSIMUS_DORSI,   0.90, "primary"),
        MuscleTarget(MID_TRAPS,          0.60, "secondary"),
        MuscleTarget(REAR_DELTOID,       0.45, "secondary"),
        MuscleTarget(BICEPS,             0.40, "secondary"),
        MuscleTarget(OBLIQUES,           0.25, "stabilizer"),
    ],
    "machine_row": [
        MuscleTarget(LATISSIMUS_DORSI,   0.80, "primary"),
        MuscleTarget(MID_TRAPS,          0.65, "primary"),
        MuscleTarget(REAR_DELTOID,       0.40, "secondary"),
        MuscleTarget(BICEPS,             0.40, "secondary"),
    ],

    # =======================================================================
    # BACK — Other
    # =======================================================================
    "rack_pull": [
        MuscleTarget(ERECTOR_SPINAE,     1.0,  "primary"),
        MuscleTarget(UPPER_TRAPS,        0.70, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.50, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.35, "secondary"),
    ],
    "hyperextension": [
        MuscleTarget(ERECTOR_SPINAE,     1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.65, "primary"),
        MuscleTarget(HAMSTRINGS,         0.50, "secondary"),
    ],
    "reverse_hyperextension": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(HAMSTRINGS,         0.60, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.55, "secondary"),
    ],

    # =======================================================================
    # BICEPS — Curl Variants
    # =======================================================================
    "barbell_curl": [
        MuscleTarget(BICEPS,             1.0,  "primary"),
        MuscleTarget(BRACHIALIS,         0.50, "secondary"),
        MuscleTarget(BRACHIORADIALIS,    0.40, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.25, "stabilizer"),
    ],
    "dumbbell_curl": [
        MuscleTarget(BICEPS,             1.0,  "primary"),
        MuscleTarget(BRACHIALIS,         0.45, "secondary"),
        MuscleTarget(BRACHIORADIALIS,    0.35, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.20, "stabilizer"),
    ],
    "hammer_curl": [
        MuscleTarget(BRACHIALIS,         0.90, "primary"),
        MuscleTarget(BRACHIORADIALIS,    0.80, "primary"),
        MuscleTarget(BICEPS,             0.65, "primary"),
        MuscleTarget(FOREARM_FLEXORS,    0.30, "stabilizer"),
    ],
    "preacher_curl": [
        MuscleTarget(BICEPS_SHORT,       1.0,  "primary"),
        MuscleTarget(BICEPS,             0.85, "primary"),
        MuscleTarget(BRACHIALIS,         0.55, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.20, "stabilizer"),
    ],
    "incline_dumbbell_curl": [
        MuscleTarget(BICEPS_LONG,        1.0,  "primary"),
        MuscleTarget(BICEPS,             0.90, "primary"),
        MuscleTarget(BRACHIALIS,         0.40, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.20, "stabilizer"),
    ],
    "cable_curl": [
        MuscleTarget(BICEPS,             0.95, "primary"),
        MuscleTarget(BRACHIALIS,         0.45, "secondary"),
        MuscleTarget(BRACHIORADIALIS,    0.35, "secondary"),
    ],
    "concentration_curl": [
        MuscleTarget(BICEPS_SHORT,       1.0,  "primary"),
        MuscleTarget(BICEPS,             0.90, "primary"),
        MuscleTarget(BRACHIALIS,         0.50, "secondary"),
    ],
    "spider_curl": [
        MuscleTarget(BICEPS_SHORT,       1.0,  "primary"),
        MuscleTarget(BICEPS,             0.90, "primary"),
        MuscleTarget(BRACHIALIS,         0.55, "secondary"),
    ],
    "ez_bar_curl": [
        MuscleTarget(BICEPS,             0.95, "primary"),
        MuscleTarget(BRACHIALIS,         0.50, "secondary"),
        MuscleTarget(BRACHIORADIALIS,    0.40, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.25, "stabilizer"),
    ],
    "reverse_curl": [
        MuscleTarget(BRACHIORADIALIS,    1.0,  "primary"),
        MuscleTarget(FOREARM_EXTENSORS,  0.65, "primary"),
        MuscleTarget(BICEPS,             0.45, "secondary"),
        MuscleTarget(BRACHIALIS,         0.50, "secondary"),
    ],
    "drag_curl": [
        MuscleTarget(BICEPS_LONG,        1.0,  "primary"),
        MuscleTarget(BICEPS,             0.85, "primary"),
        MuscleTarget(BRACHIALIS,         0.40, "secondary"),
        MuscleTarget(REAR_DELTOID,       0.20, "stabilizer"),
    ],
    "bayesian_curl": [
        MuscleTarget(BICEPS_LONG,        1.0,  "primary"),
        MuscleTarget(BICEPS,             0.90, "primary"),
        MuscleTarget(BRACHIALIS,         0.35, "secondary"),
    ],
    "cable_21s": [
        MuscleTarget(BICEPS,             1.0,  "primary"),
        MuscleTarget(BRACHIALIS,         0.55, "secondary"),
        MuscleTarget(BRACHIORADIALIS,    0.40, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.30, "stabilizer"),
    ],

    # =======================================================================
    # TRICEPS
    # =======================================================================
    "tricep_pushdown": [
        MuscleTarget(TRICEPS_LATERAL,    1.0,  "primary"),
        MuscleTarget(TRICEPS_MEDIAL,     0.70, "primary"),
        MuscleTarget(TRICEPS_LONG,       0.50, "secondary"),
    ],
    "overhead_tricep_extension": [
        MuscleTarget(TRICEPS_LONG,       1.0,  "primary"),
        MuscleTarget(TRICEPS_MEDIAL,     0.55, "secondary"),
        MuscleTarget(TRICEPS_LATERAL,    0.45, "secondary"),
    ],
    "skull_crusher": [
        MuscleTarget(TRICEPS,            1.0,  "primary"),
        MuscleTarget(TRICEPS_LONG,       0.80, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.15, "stabilizer"),
    ],
    "tricep_dip": [
        MuscleTarget(TRICEPS,            1.0,  "primary"),
        MuscleTarget(PECTORALIS_LOWER,   0.50, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.45, "secondary"),
    ],
    "tricep_kickback": [
        MuscleTarget(TRICEPS_LATERAL,    0.90, "primary"),
        MuscleTarget(TRICEPS_LONG,       0.60, "secondary"),
        MuscleTarget(REAR_DELTOID,       0.15, "stabilizer"),
    ],
    "diamond_push_ups": [
        MuscleTarget(TRICEPS,            0.90, "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.65, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.45, "secondary"),
    ],
    "jm_press": [
        MuscleTarget(TRICEPS,            1.0,  "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.40, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.30, "stabilizer"),
    ],

    # =======================================================================
    # FOREARMS
    # =======================================================================
    "wrist_curl": [
        MuscleTarget(FOREARM_FLEXORS,    1.0,  "primary"),
    ],
    "reverse_wrist_curl": [
        MuscleTarget(FOREARM_EXTENSORS,  1.0,  "primary"),
    ],
    "farmers_walk": [
        MuscleTarget(FOREARM_FLEXORS,    0.90, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.70, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.40, "secondary"),
        MuscleTarget(OBLIQUES,           0.35, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.40, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.30, "stabilizer"),
        MuscleTarget(CALVES_GASTROC,     0.25, "stabilizer"),
    ],
    "dead_hang": [
        MuscleTarget(FOREARM_FLEXORS,    1.0,  "primary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.20, "stabilizer"),
        MuscleTarget(ROTATOR_CUFF,       0.25, "stabilizer"),
    ],

    # =======================================================================
    # LEGS — Squat Variants
    # =======================================================================
    "barbell_back_squat": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(ADDUCTORS,          0.50, "secondary"),
        MuscleTarget(HAMSTRINGS,         0.40, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.45, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.30, "stabilizer"),
        MuscleTarget(CALVES_GASTROC,     0.15, "stabilizer"),
    ],
    "barbell_front_squat": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.65, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.50, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.50, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.30, "stabilizer"),
        MuscleTarget(ADDUCTORS,          0.40, "secondary"),
    ],
    "goblet_squat": [
        MuscleTarget(QUADRICEPS,         0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.70, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.40, "secondary"),
        MuscleTarget(BICEPS,             0.20, "stabilizer"),
        MuscleTarget(FRONT_DELTOID,      0.20, "stabilizer"),
    ],
    "bulgarian_split_squat": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.50, "secondary"),
        MuscleTarget(ADDUCTORS,          0.40, "secondary"),
        MuscleTarget(HAMSTRINGS,         0.35, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.25, "stabilizer"),
    ],
    "hack_squat": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.55, "secondary"),
        MuscleTarget(ADDUCTORS,          0.35, "secondary"),
    ],
    "sissy_squat": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(RECTUS_FEMORIS,     0.90, "primary"),
        MuscleTarget(HIP_FLEXORS,        0.30, "stabilizer"),
    ],
    "box_squat": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(QUADRICEPS,         0.80, "primary"),
        MuscleTarget(HAMSTRINGS,         0.50, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.45, "secondary"),
        MuscleTarget(ADDUCTORS,          0.40, "secondary"),
    ],
    "overhead_squat": [
        MuscleTarget(QUADRICEPS,         0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.65, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.55, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.55, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.45, "secondary"),
        MuscleTarget(ROTATOR_CUFF,       0.40, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.35, "secondary"),
    ],
    "zercher_squat": [
        MuscleTarget(QUADRICEPS,         0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(BICEPS,             0.45, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.50, "secondary"),
    ],
    "safety_bar_squat": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.50, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.35, "secondary"),
        MuscleTarget(ADDUCTORS,          0.40, "secondary"),
    ],
    "belt_squat": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(ADDUCTORS,          0.45, "secondary"),
    ],
    "smith_machine_squat": [
        MuscleTarget(QUADRICEPS,         0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.65, "primary"),
        MuscleTarget(ADDUCTORS,          0.35, "secondary"),
    ],
    "pistol_squat": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.60, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.35, "secondary"),
        MuscleTarget(HIP_FLEXORS,        0.30, "stabilizer"),
    ],

    # =======================================================================
    # LEGS — Leg Press
    # =======================================================================
    "leg_press": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.60, "secondary"),
        MuscleTarget(HAMSTRINGS,         0.30, "secondary"),
        MuscleTarget(ADDUCTORS,          0.30, "stabilizer"),
    ],

    # =======================================================================
    # LEGS — Lunge Variants
    # =======================================================================
    "walking_lunge": [
        MuscleTarget(QUADRICEPS,         0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(HAMSTRINGS,         0.40, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.35, "secondary"),
        MuscleTarget(CALVES_GASTROC,     0.20, "stabilizer"),
    ],
    "reverse_lunge": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(QUADRICEPS,         0.80, "primary"),
        MuscleTarget(HAMSTRINGS,         0.40, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.35, "secondary"),
    ],
    "lateral_lunge": [
        MuscleTarget(ADDUCTORS,          0.85, "primary"),
        MuscleTarget(QUADRICEPS,         0.75, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.60, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.50, "secondary"),
    ],
    "step_up": [
        MuscleTarget(QUADRICEPS,         0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.40, "secondary"),
        MuscleTarget(CALVES_GASTROC,     0.20, "stabilizer"),
    ],

    # =======================================================================
    # LEGS — Isolation: Quad
    # =======================================================================
    "leg_extension": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(RECTUS_FEMORIS,     0.85, "primary"),
        MuscleTarget(VASTUS_LATERALIS,   0.80, "primary"),
        MuscleTarget(VASTUS_MEDIALIS,    0.80, "primary"),
    ],

    # =======================================================================
    # LEGS — Deadlift Variants (hip-hinge)
    # =======================================================================
    "conventional_deadlift": [
        MuscleTarget(ERECTOR_SPINAE,     0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.85, "primary"),
        MuscleTarget(HAMSTRINGS,         0.70, "primary"),
        MuscleTarget(QUADRICEPS,         0.55, "secondary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.40, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.45, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.35, "secondary"),
    ],
    "sumo_deadlift": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(QUADRICEPS,         0.70, "primary"),
        MuscleTarget(ADDUCTORS,          0.65, "primary"),
        MuscleTarget(HAMSTRINGS,         0.55, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.65, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.40, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
    ],
    "romanian_deadlift": [
        MuscleTarget(HAMSTRINGS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.85, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.70, "primary"),
        MuscleTarget(ADDUCTORS,          0.30, "stabilizer"),
        MuscleTarget(FOREARM_FLEXORS,    0.30, "stabilizer"),
    ],
    "stiff_leg_deadlift": [
        MuscleTarget(HAMSTRINGS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.75, "primary"),
        MuscleTarget(ADDUCTORS,          0.25, "stabilizer"),
    ],
    "trap_bar_deadlift": [
        MuscleTarget(QUADRICEPS,         0.75, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(HAMSTRINGS,         0.55, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.65, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.50, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
    ],
    "deficit_deadlift": [
        MuscleTarget(HAMSTRINGS,         0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.80, "primary"),
        MuscleTarget(QUADRICEPS,         0.60, "secondary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.40, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
    ],
    "single_leg_rdl": [
        MuscleTarget(HAMSTRINGS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.55, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.30, "stabilizer"),
    ],
    "kettlebell_deadlift": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(HAMSTRINGS,         0.70, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.60, "secondary"),
        MuscleTarget(QUADRICEPS,         0.45, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.30, "stabilizer"),
    ],
    "good_morning": [
        MuscleTarget(HAMSTRINGS,         0.90, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.70, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.25, "stabilizer"),
    ],
    "block_pull": [
        MuscleTarget(ERECTOR_SPINAE,     0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.60, "secondary"),
        MuscleTarget(HAMSTRINGS,         0.45, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
    ],

    # =======================================================================
    # LEGS — Hamstring Isolation
    # =======================================================================
    "lying_leg_curl": [
        MuscleTarget(HAMSTRINGS,         1.0,  "primary"),
        MuscleTarget(CALVES_GASTROC,     0.20, "stabilizer"),
    ],
    "seated_leg_curl": [
        MuscleTarget(HAMSTRINGS,         1.0,  "primary"),
    ],
    "nordic_hamstring_curl": [
        MuscleTarget(HAMSTRINGS,         1.0,  "primary"),
        MuscleTarget(CALVES_GASTROC,     0.30, "stabilizer"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.25, "stabilizer"),
    ],

    # =======================================================================
    # LEGS — Glute Focus
    # =======================================================================
    "hip_thrust": [
        MuscleTarget(GLUTEUS_MAXIMUS,    1.0,  "primary"),
        MuscleTarget(HAMSTRINGS,         0.45, "secondary"),
        MuscleTarget(ADDUCTORS,          0.25, "stabilizer"),
        MuscleTarget(QUADRICEPS,         0.20, "stabilizer"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.20, "stabilizer"),
    ],
    "glute_bridge": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(HAMSTRINGS,         0.40, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.20, "stabilizer"),
    ],
    "cable_pull_through": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(HAMSTRINGS,         0.60, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.35, "secondary"),
    ],
    "cable_kickback": [
        MuscleTarget(GLUTEUS_MAXIMUS,    1.0,  "primary"),
        MuscleTarget(HAMSTRINGS,         0.30, "stabilizer"),
    ],
    "hip_abduction_machine": [
        MuscleTarget(GLUTEUS_MEDIUS,     1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.30, "stabilizer"),
    ],
    "hip_adduction_machine": [
        MuscleTarget(ADDUCTORS,          1.0,  "primary"),
    ],

    # =======================================================================
    # LEGS — Calves
    # =======================================================================
    "standing_calf_raise": [
        MuscleTarget(CALVES_GASTROC,     1.0,  "primary"),
        MuscleTarget(CALVES_SOLEUS,      0.40, "secondary"),
    ],
    "seated_calf_raise": [
        MuscleTarget(CALVES_SOLEUS,      1.0,  "primary"),
        MuscleTarget(CALVES_GASTROC,     0.25, "stabilizer"),
    ],
    "donkey_calf_raise": [
        MuscleTarget(CALVES_GASTROC,     1.0,  "primary"),
        MuscleTarget(CALVES_SOLEUS,      0.50, "secondary"),
    ],
    "tibialis_raise": [
        MuscleTarget(TIBIALIS_ANTERIOR,  1.0,  "primary"),
    ],

    # =======================================================================
    # OLYMPIC LIFTS
    # =======================================================================
    "clean_and_jerk": [
        MuscleTarget(QUADRICEPS,         0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(HAMSTRINGS,         0.70, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.75, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.80, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.70, "primary"),
        MuscleTarget(TRICEPS,            0.55, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.50, "secondary"),
        MuscleTarget(CALVES_GASTROC,     0.35, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
    ],
    "power_clean": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(HAMSTRINGS,         0.75, "primary"),
        MuscleTarget(QUADRICEPS,         0.70, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.80, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.70, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.45, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.40, "secondary"),
    ],
    "hang_clean": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.85, "primary"),
        MuscleTarget(HAMSTRINGS,         0.70, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.75, "primary"),
        MuscleTarget(QUADRICEPS,         0.55, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.60, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.40, "secondary"),
    ],
    "snatch": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(QUADRICEPS,         0.80, "primary"),
        MuscleTarget(HAMSTRINGS,         0.75, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.85, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.75, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.65, "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.50, "secondary"),
        MuscleTarget(TRICEPS,            0.45, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.50, "secondary"),
        MuscleTarget(ROTATOR_CUFF,       0.45, "secondary"),
    ],
    "power_snatch": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.85, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.80, "primary"),
        MuscleTarget(HAMSTRINGS,         0.70, "primary"),
        MuscleTarget(QUADRICEPS,         0.70, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.70, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.60, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.45, "secondary"),
    ],
    "hang_snatch": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.85, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.80, "primary"),
        MuscleTarget(HAMSTRINGS,         0.65, "primary"),
        MuscleTarget(QUADRICEPS,         0.50, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.60, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.55, "secondary"),
    ],
    "clean_pull": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(HAMSTRINGS,         0.80, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.75, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.85, "primary"),
        MuscleTarget(QUADRICEPS,         0.60, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.40, "secondary"),
    ],
    "snatch_pull": [
        MuscleTarget(GLUTEUS_MAXIMUS,    0.90, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.85, "primary"),
        MuscleTarget(HAMSTRINGS,         0.75, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.75, "primary"),
        MuscleTarget(QUADRICEPS,         0.55, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.35, "secondary"),
    ],
    "split_jerk": [
        MuscleTarget(QUADRICEPS,         0.80, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.75, "primary"),
        MuscleTarget(TRICEPS,            0.65, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.55, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.45, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.50, "secondary"),
    ],
    "push_jerk": [
        MuscleTarget(FRONT_DELTOID,      0.80, "primary"),
        MuscleTarget(TRICEPS,            0.65, "primary"),
        MuscleTarget(QUADRICEPS,         0.70, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.45, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.55, "secondary"),
    ],
    "muscle_snatch": [
        MuscleTarget(UPPER_TRAPS,        0.90, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.80, "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.55, "secondary"),
        MuscleTarget(TRICEPS,            0.45, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.50, "secondary"),
    ],
    "thruster": [
        MuscleTarget(QUADRICEPS,         0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.70, "primary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.45, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.40, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.40, "secondary"),
    ],

    # =======================================================================
    # CORE
    # =======================================================================
    "plank": [
        MuscleTarget(RECTUS_ABDOMINIS,   0.80, "primary"),
        MuscleTarget(TRANSVERSE_ABDOMINIS, 0.85, "primary"),
        MuscleTarget(OBLIQUES,           0.50, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.35, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.25, "stabilizer"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.25, "stabilizer"),
    ],
    "side_plank": [
        MuscleTarget(OBLIQUES,           1.0,  "primary"),
        MuscleTarget(TRANSVERSE_ABDOMINIS, 0.65, "primary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.35, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.25, "stabilizer"),
    ],
    "dead_bug": [
        MuscleTarget(TRANSVERSE_ABDOMINIS, 0.90, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.70, "primary"),
        MuscleTarget(OBLIQUES,           0.45, "secondary"),
        MuscleTarget(HIP_FLEXORS,        0.30, "stabilizer"),
    ],
    "pallof_press": [
        MuscleTarget(OBLIQUES,           0.90, "primary"),
        MuscleTarget(TRANSVERSE_ABDOMINIS, 0.80, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.50, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.30, "stabilizer"),
    ],
    "ab_rollout": [
        MuscleTarget(RECTUS_ABDOMINIS,   1.0,  "primary"),
        MuscleTarget(OBLIQUES,           0.50, "secondary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.35, "secondary"),
        MuscleTarget(TRICEPS_LONG,       0.25, "stabilizer"),
        MuscleTarget(HIP_FLEXORS,        0.20, "stabilizer"),
    ],
    "hanging_leg_raise": [
        MuscleTarget(RECTUS_ABDOMINIS,   1.0,  "primary"),
        MuscleTarget(HIP_FLEXORS,        0.65, "primary"),
        MuscleTarget(OBLIQUES,           0.40, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.30, "stabilizer"),
        MuscleTarget(LATISSIMUS_DORSI,   0.20, "stabilizer"),
    ],
    "crunch": [
        MuscleTarget(RECTUS_ABDOMINIS,   0.90, "primary"),
        MuscleTarget(OBLIQUES,           0.30, "stabilizer"),
    ],
    "bicycle_crunch": [
        MuscleTarget(OBLIQUES,           0.90, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.80, "primary"),
        MuscleTarget(HIP_FLEXORS,        0.40, "secondary"),
    ],
    "russian_twist": [
        MuscleTarget(OBLIQUES,           1.0,  "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.55, "secondary"),
        MuscleTarget(HIP_FLEXORS,        0.30, "stabilizer"),
    ],
    "cable_crunch": [
        MuscleTarget(RECTUS_ABDOMINIS,   1.0,  "primary"),
        MuscleTarget(OBLIQUES,           0.35, "secondary"),
    ],
    "cable_woodchop": [
        MuscleTarget(OBLIQUES,           1.0,  "primary"),
        MuscleTarget(TRANSVERSE_ABDOMINIS, 0.60, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.40, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.25, "stabilizer"),
    ],
    "hollow_hold": [
        MuscleTarget(RECTUS_ABDOMINIS,   0.90, "primary"),
        MuscleTarget(TRANSVERSE_ABDOMINIS, 0.80, "primary"),
        MuscleTarget(HIP_FLEXORS,        0.45, "secondary"),
        MuscleTarget(QUADRICEPS,         0.20, "stabilizer"),
    ],
    "l_sit": [
        MuscleTarget(RECTUS_ABDOMINIS,   0.85, "primary"),
        MuscleTarget(HIP_FLEXORS,        0.80, "primary"),
        MuscleTarget(QUADRICEPS,         0.40, "secondary"),
        MuscleTarget(TRICEPS,            0.35, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.30, "stabilizer"),
    ],
    "v_up": [
        MuscleTarget(RECTUS_ABDOMINIS,   1.0,  "primary"),
        MuscleTarget(HIP_FLEXORS,        0.60, "secondary"),
        MuscleTarget(OBLIQUES,           0.35, "secondary"),
    ],
    "dragon_flag": [
        MuscleTarget(RECTUS_ABDOMINIS,   1.0,  "primary"),
        MuscleTarget(OBLIQUES,           0.50, "secondary"),
        MuscleTarget(HIP_FLEXORS,        0.40, "secondary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.30, "stabilizer"),
    ],
    "decline_crunch": [
        MuscleTarget(RECTUS_ABDOMINIS,   0.95, "primary"),
        MuscleTarget(OBLIQUES,           0.35, "secondary"),
        MuscleTarget(HIP_FLEXORS,        0.25, "stabilizer"),
    ],
    "bird_dog": [
        MuscleTarget(ERECTOR_SPINAE,     0.70, "primary"),
        MuscleTarget(TRANSVERSE_ABDOMINIS, 0.65, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.35, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.25, "stabilizer"),
    ],
    "copenhagen_plank": [
        MuscleTarget(ADDUCTORS,          0.85, "primary"),
        MuscleTarget(OBLIQUES,           0.70, "primary"),
        MuscleTarget(TRANSVERSE_ABDOMINIS, 0.55, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.40, "secondary"),
    ],
    "sit_up": [
        MuscleTarget(RECTUS_ABDOMINIS,   0.85, "primary"),
        MuscleTarget(HIP_FLEXORS,        0.55, "secondary"),
        MuscleTarget(OBLIQUES,           0.25, "stabilizer"),
    ],

    # =======================================================================
    # COMPOUND / FULL-BODY
    # =======================================================================
    "barbell_clean_and_press": [
        MuscleTarget(FRONT_DELTOID,      0.80, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(QUADRICEPS,         0.70, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.75, "primary"),
        MuscleTarget(HAMSTRINGS,         0.60, "secondary"),
        MuscleTarget(TRICEPS,            0.55, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.60, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.40, "secondary"),
    ],
    "kettlebell_swing": [
        MuscleTarget(GLUTEUS_MAXIMUS,    1.0,  "primary"),
        MuscleTarget(HAMSTRINGS,         0.75, "primary"),
        MuscleTarget(ERECTOR_SPINAE,     0.60, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.35, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.45, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.35, "secondary"),
    ],
    "turkish_get_up": [
        MuscleTarget(FRONT_DELTOID,      0.75, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.70, "primary"),
        MuscleTarget(OBLIQUES,           0.65, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.60, "secondary"),
        MuscleTarget(QUADRICEPS,         0.50, "secondary"),
        MuscleTarget(TRICEPS,            0.40, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.35, "secondary"),
    ],
    "man_maker": [
        MuscleTarget(PECTORALIS_MAJOR,   0.70, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.70, "primary"),
        MuscleTarget(QUADRICEPS,         0.65, "primary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.55, "secondary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.55, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.50, "secondary"),
    ],
    "battle_ropes": [
        MuscleTarget(FRONT_DELTOID,      0.80, "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.55, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.50, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.55, "secondary"),
        MuscleTarget(BICEPS,             0.35, "secondary"),
        MuscleTarget(CALVES_GASTROC,     0.20, "stabilizer"),
    ],
    "burpee": [
        MuscleTarget(QUADRICEPS,         0.70, "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.55, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.50, "secondary"),
        MuscleTarget(TRICEPS,            0.45, "secondary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.50, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.45, "secondary"),
        MuscleTarget(HIP_FLEXORS,        0.35, "secondary"),
        MuscleTarget(CALVES_GASTROC,     0.30, "stabilizer"),
    ],
    "sled_push": [
        MuscleTarget(QUADRICEPS,         0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(CALVES_GASTROC,     0.50, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.40, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.35, "secondary"),
    ],
    "sled_pull": [
        MuscleTarget(HAMSTRINGS,         0.80, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.50, "secondary"),
        MuscleTarget(BICEPS,             0.40, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.35, "secondary"),
    ],
    "box_jump": [
        MuscleTarget(QUADRICEPS,         0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.80, "primary"),
        MuscleTarget(CALVES_GASTROC,     0.55, "secondary"),
        MuscleTarget(HAMSTRINGS,         0.45, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.30, "stabilizer"),
    ],
    "wall_ball": [
        MuscleTarget(QUADRICEPS,         0.80, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.70, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.55, "secondary"),
        MuscleTarget(TRICEPS,            0.40, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.35, "secondary"),
    ],

    # =======================================================================
    # ADDITIONAL EXERCISES — Machines & Accessories
    # =======================================================================
    "smith_machine_squat": [
        MuscleTarget(QUADRICEPS,         0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.60, "secondary"),
        MuscleTarget(ADDUCTORS,          0.30, "stabilizer"),
    ],
    "cable_fly": [
        MuscleTarget(PECTORALIS_MAJOR,   0.95, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.30, "secondary"),
        MuscleTarget(BICEPS,             0.15, "stabilizer"),
    ],
    "incline_cable_fly": [
        MuscleTarget(PECTORALIS_UPPER,   0.95, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.35, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.20, "stabilizer"),
    ],
    "machine_fly": [
        MuscleTarget(PECTORALIS_MAJOR,   0.90, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.25, "stabilizer"),
    ],
    "wide_grip_lat_pulldown": [
        MuscleTarget(LATISSIMUS_DORSI,   1.0,  "primary"),
        MuscleTarget(TERES_MAJOR,        0.55, "secondary"),
        MuscleTarget(BICEPS,             0.45, "secondary"),
        MuscleTarget(MID_TRAPS,          0.35, "secondary"),
        MuscleTarget(REAR_DELTOID,       0.25, "stabilizer"),
    ],
    "behind_neck_pulldown": [
        MuscleTarget(LATISSIMUS_DORSI,   0.90, "primary"),
        MuscleTarget(TERES_MAJOR,        0.60, "secondary"),
        MuscleTarget(MID_TRAPS,          0.45, "secondary"),
        MuscleTarget(BICEPS,             0.40, "secondary"),
    ],
    "underhand_barbell_row": [
        MuscleTarget(LATISSIMUS_DORSI,   0.90, "primary"),
        MuscleTarget(BICEPS,             0.60, "secondary"),
        MuscleTarget(MID_TRAPS,          0.65, "primary"),
        MuscleTarget(REAR_DELTOID,       0.40, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.40, "secondary"),
    ],
    "kroc_row": [
        MuscleTarget(LATISSIMUS_DORSI,   1.0,  "primary"),
        MuscleTarget(MID_TRAPS,          0.55, "secondary"),
        MuscleTarget(BICEPS,             0.50, "secondary"),
        MuscleTarget(REAR_DELTOID,       0.40, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.45, "secondary"),
    ],
    "seal_row": [
        MuscleTarget(MID_TRAPS,          0.90, "primary"),
        MuscleTarget(LATISSIMUS_DORSI,   0.80, "primary"),
        MuscleTarget(REAR_DELTOID,       0.55, "secondary"),
        MuscleTarget(BICEPS,             0.40, "secondary"),
    ],
    "prone_incline_curl": [
        MuscleTarget(BICEPS,             0.95, "primary"),
        MuscleTarget(BRACHIALIS,         0.50, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.20, "stabilizer"),
    ],
    "cross_body_hammer_curl": [
        MuscleTarget(BRACHIALIS,         0.85, "primary"),
        MuscleTarget(BICEPS_LONG,        0.70, "primary"),
        MuscleTarget(BRACHIORADIALIS,    0.55, "secondary"),
    ],
    "rope_pushdown": [
        MuscleTarget(TRICEPS_LATERAL,    0.95, "primary"),
        MuscleTarget(TRICEPS_MEDIAL,     0.70, "primary"),
        MuscleTarget(TRICEPS_LONG,       0.45, "secondary"),
    ],
    "cable_overhead_extension": [
        MuscleTarget(TRICEPS_LONG,       1.0,  "primary"),
        MuscleTarget(TRICEPS_MEDIAL,     0.50, "secondary"),
        MuscleTarget(TRICEPS_LATERAL,    0.40, "secondary"),
    ],
    "close_grip_push_up": [
        MuscleTarget(TRICEPS,            0.85, "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.60, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.40, "secondary"),
    ],
    "dumbbell_pullover": [
        MuscleTarget(LATISSIMUS_DORSI,   0.80, "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.60, "secondary"),
        MuscleTarget(TRICEPS_LONG,       0.35, "secondary"),
        MuscleTarget(SERRATUS_ANTERIOR,  0.40, "secondary"),
        MuscleTarget(TERES_MAJOR,        0.45, "secondary"),
    ],
    "rear_delt_machine": [
        MuscleTarget(REAR_DELTOID,       1.0,  "primary"),
        MuscleTarget(MID_TRAPS,          0.45, "secondary"),
        MuscleTarget(LOWER_TRAPS,        0.25, "stabilizer"),
    ],
    "cable_lateral_raise_behind": [
        MuscleTarget(LATERAL_DELTOID,    0.95, "primary"),
        MuscleTarget(REAR_DELTOID,       0.30, "stabilizer"),
        MuscleTarget(UPPER_TRAPS,        0.20, "stabilizer"),
    ],
    "lu_raise": [
        MuscleTarget(FRONT_DELTOID,      0.75, "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.85, "primary"),
        MuscleTarget(UPPER_TRAPS,        0.35, "secondary"),
    ],
    "barbell_shrug": [
        MuscleTarget(UPPER_TRAPS,        1.0,  "primary"),
        MuscleTarget(MID_TRAPS,          0.30, "stabilizer"),
        MuscleTarget(FOREARM_FLEXORS,    0.25, "stabilizer"),
    ],
    "dumbbell_shrug": [
        MuscleTarget(UPPER_TRAPS,        0.95, "primary"),
        MuscleTarget(MID_TRAPS,          0.25, "stabilizer"),
        MuscleTarget(FOREARM_FLEXORS,    0.30, "stabilizer"),
    ],
    "smith_machine_overhead_press": [
        MuscleTarget(FRONT_DELTOID,      0.85, "primary"),
        MuscleTarget(LATERAL_DELTOID,    0.45, "secondary"),
        MuscleTarget(TRICEPS,            0.50, "secondary"),
    ],
    "viking_press": [
        MuscleTarget(FRONT_DELTOID,      0.90, "primary"),
        MuscleTarget(TRICEPS,            0.55, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.40, "secondary"),
        MuscleTarget(PECTORALIS_UPPER,   0.30, "stabilizer"),
    ],
    "log_press": [
        MuscleTarget(FRONT_DELTOID,      0.90, "primary"),
        MuscleTarget(TRICEPS,            0.60, "secondary"),
        MuscleTarget(PECTORALIS_UPPER,   0.40, "secondary"),
        MuscleTarget(UPPER_TRAPS,        0.40, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.30, "stabilizer"),
    ],
    "pendulum_squat": [
        MuscleTarget(QUADRICEPS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.45, "secondary"),
    ],
    "split_squat": [
        MuscleTarget(QUADRICEPS,         0.90, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.70, "primary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.40, "secondary"),
        MuscleTarget(ADDUCTORS,          0.30, "stabilizer"),
    ],
    "front_foot_elevated_split_squat": [
        MuscleTarget(QUADRICEPS,         0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.45, "secondary"),
        MuscleTarget(ADDUCTORS,          0.30, "stabilizer"),
    ],
    "leg_press_calf_raise": [
        MuscleTarget(CALVES_GASTROC,     0.90, "primary"),
        MuscleTarget(CALVES_SOLEUS,      0.50, "secondary"),
    ],
    "single_leg_press": [
        MuscleTarget(QUADRICEPS,         0.95, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.60, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.35, "secondary"),
    ],
    "forward_lunge": [
        MuscleTarget(QUADRICEPS,         0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(HAMSTRINGS,         0.35, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.30, "stabilizer"),
        MuscleTarget(CALVES_GASTROC,     0.15, "stabilizer"),
    ],
    "curtsy_lunge": [
        MuscleTarget(GLUTEUS_MEDIUS,     0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.75, "primary"),
        MuscleTarget(QUADRICEPS,         0.70, "primary"),
        MuscleTarget(ADDUCTORS,          0.50, "secondary"),
    ],
    "cossack_squat": [
        MuscleTarget(ADDUCTORS,          0.90, "primary"),
        MuscleTarget(QUADRICEPS,         0.75, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.60, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.45, "secondary"),
        MuscleTarget(HAMSTRINGS,         0.30, "stabilizer"),
    ],
    "glute_ham_raise": [
        MuscleTarget(HAMSTRINGS,         1.0,  "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.60, "secondary"),
        MuscleTarget(ERECTOR_SPINAE,     0.40, "secondary"),
        MuscleTarget(CALVES_GASTROC,     0.25, "stabilizer"),
    ],
    "prone_leg_curl": [
        MuscleTarget(HAMSTRINGS,         1.0,  "primary"),
        MuscleTarget(CALVES_GASTROC,     0.20, "stabilizer"),
    ],
    "single_leg_calf_raise": [
        MuscleTarget(CALVES_GASTROC,     1.0,  "primary"),
        MuscleTarget(CALVES_SOLEUS,      0.45, "secondary"),
        MuscleTarget(TIBIALIS_ANTERIOR,  0.10, "stabilizer"),
    ],
    "kettlebell_goblet_squat": [
        MuscleTarget(QUADRICEPS,         0.85, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.70, "primary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.35, "secondary"),
        MuscleTarget(BICEPS,             0.20, "stabilizer"),
        MuscleTarget(FOREARM_FLEXORS,    0.25, "stabilizer"),
    ],
    "sumo_squat": [
        MuscleTarget(ADDUCTORS,          0.85, "primary"),
        MuscleTarget(QUADRICEPS,         0.75, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.70, "primary"),
        MuscleTarget(HAMSTRINGS,         0.30, "stabilizer"),
    ],
    "dumbbell_lateral_lunge": [
        MuscleTarget(ADDUCTORS,          0.80, "primary"),
        MuscleTarget(QUADRICEPS,         0.70, "primary"),
        MuscleTarget(GLUTEUS_MAXIMUS,    0.55, "secondary"),
        MuscleTarget(GLUTEUS_MEDIUS,     0.45, "secondary"),
    ],
    "weighted_dip": [
        MuscleTarget(TRICEPS,            0.85, "primary"),
        MuscleTarget(PECTORALIS_LOWER,   0.80, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.55, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.20, "stabilizer"),
    ],
    "ring_dip": [
        MuscleTarget(TRICEPS,            0.90, "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.75, "primary"),
        MuscleTarget(FRONT_DELTOID,      0.55, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.30, "stabilizer"),
        MuscleTarget(ROTATOR_CUFF,       0.25, "stabilizer"),
    ],
    "muscle_up": [
        MuscleTarget(LATISSIMUS_DORSI,   0.90, "primary"),
        MuscleTarget(BICEPS,             0.70, "primary"),
        MuscleTarget(TRICEPS,            0.65, "primary"),
        MuscleTarget(PECTORALIS_MAJOR,   0.55, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.45, "secondary"),
        MuscleTarget(FRONT_DELTOID,      0.50, "secondary"),
    ],
    "weighted_pull_up": [
        MuscleTarget(LATISSIMUS_DORSI,   1.0,  "primary"),
        MuscleTarget(BICEPS,             0.65, "primary"),
        MuscleTarget(TERES_MAJOR,        0.55, "secondary"),
        MuscleTarget(MID_TRAPS,          0.45, "secondary"),
        MuscleTarget(FOREARM_FLEXORS,    0.35, "secondary"),
        MuscleTarget(RECTUS_ABDOMINIS,   0.25, "stabilizer"),
    ],
}


# ---------------------------------------------------------------------------
# Lookup functions
# ---------------------------------------------------------------------------

def _normalize_slug(name: str) -> str:
    """Convert an exercise name to a lookup slug."""
    return name.lower().strip().replace(" ", "_").replace("-", "_")


def get_muscle_targets(exercise_slug: str) -> List[MuscleTarget]:
    """
    Return all muscles targeted by an exercise, sorted by activation (desc).

    Accepts any casing/spacing: "Barbell Bench Press", "barbell_bench_press",
    "barbell-bench-press" all work.

    Raises KeyError if the exercise is not in the database.
    """
    slug = _normalize_slug(exercise_slug)
    if slug in MUSCLE_MAP:
        return sorted(MUSCLE_MAP[slug], key=lambda t: t.activation, reverse=True)

    # Fuzzy: try substring match
    for key in MUSCLE_MAP:
        if slug in key or key in slug:
            return sorted(MUSCLE_MAP[key], key=lambda t: t.activation, reverse=True)

    raise KeyError(
        f"Exercise {exercise_slug!r} (slug: {slug!r}) not found in muscle map. "
        f"Available: {len(MUSCLE_MAP)} exercises. Use list_exercises() to see all."
    )


def get_muscle_targets_safe(exercise_slug: str) -> Optional[List[MuscleTarget]]:
    """Like get_muscle_targets but returns None instead of raising."""
    try:
        return get_muscle_targets(exercise_slug)
    except KeyError:
        return None


def primary_muscles(exercise_slug: str) -> List[MuscleTarget]:
    """Return only primary movers for an exercise."""
    return [t for t in get_muscle_targets(exercise_slug) if t.role == "primary"]


def secondary_muscles(exercise_slug: str) -> List[MuscleTarget]:
    """Return only secondary movers for an exercise."""
    return [t for t in get_muscle_targets(exercise_slug) if t.role == "secondary"]


def stabilizer_muscles(exercise_slug: str) -> List[MuscleTarget]:
    """Return only stabilizers for an exercise."""
    return [t for t in get_muscle_targets(exercise_slug) if t.role == "stabilizer"]


def exercises_for_muscle(muscle_name: str) -> List[Dict[str, object]]:
    """
    Find all exercises that target a given muscle.

    Returns a list of dicts:
        [{"exercise": slug, "activation": float, "role": str}, ...]

    The muscle_name match is case-insensitive and supports substring matching.
    """
    needle = muscle_name.lower()
    results = []
    for slug, targets in MUSCLE_MAP.items():
        for t in targets:
            if needle in t.muscle.lower():
                results.append({
                    "exercise": slug,
                    "activation": t.activation,
                    "role": t.role,
                })
    return sorted(results, key=lambda r: r["activation"], reverse=True)


def list_exercises() -> List[str]:
    """Return all exercise slugs in the database."""
    return sorted(MUSCLE_MAP.keys())


def muscle_volume_summary(exercises: List[str]) -> Dict[str, float]:
    """
    Given a list of exercises (a workout), compute total activation per muscle.

    Returns {muscle_name: sum_of_activations}. Useful for checking if a
    workout is balanced or has blind spots.
    """
    totals: Dict[str, float] = {}
    for ex in exercises:
        targets = get_muscle_targets_safe(ex)
        if targets is None:
            continue
        for t in targets:
            totals[t.muscle] = totals.get(t.muscle, 0.0) + t.activation
    return dict(sorted(totals.items(), key=lambda kv: kv[1], reverse=True))


def heatmap_data(exercise_slug: str) -> Dict[str, float]:
    """
    Return a muscle -> activation dict suitable for rendering a body heatmap.

    This is the format expected by the MuscleHeatmap component in the
    trainer dashboard.
    """
    targets = get_muscle_targets_safe(exercise_slug)
    if targets is None:
        return {}
    return {t.muscle: t.activation for t in targets}
