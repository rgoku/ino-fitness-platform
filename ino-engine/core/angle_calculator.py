"""
angle_calculator.py
--------------------
Core geometry utilities for computing joint angles from MediaPipe pose
landmarks.  Designed to be imported by any exercise-detector module.

All public symbols are listed in __all__; internal helpers are prefixed
with a leading underscore.
"""

from __future__ import annotations

import logging
from typing import Optional, Tuple

import numpy as np

__all__ = [
    "PoseLandmark",
    "Point2D",
    "get_landmark_coords",
    "get_landmark_visibility",
    "calculate_angle",
    "calculate_angle_from_landmarks",
    "smooth_angle",
]

log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Type aliases
# ---------------------------------------------------------------------------

#: A 2-D pixel coordinate (x, y).
Point2D = Tuple[float, float]


# ---------------------------------------------------------------------------
# Landmark index registry
# ---------------------------------------------------------------------------

class PoseLandmark:
    """
    Hardcoded MediaPipe BlazePose landmark indices.

    Kept as plain class constants rather than an IntEnum so downstream code
    can pass these directly to mediapipe without an extra cast.

    Reference:
        https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
    """

    # Face
    NOSE           = 0

    # Ears
    LEFT_EAR       = 7
    RIGHT_EAR      = 8

    # Upper limbs
    LEFT_SHOULDER  = 11
    RIGHT_SHOULDER = 12
    LEFT_ELBOW     = 13
    RIGHT_ELBOW    = 14
    LEFT_WRIST     = 15
    RIGHT_WRIST    = 16

    # Lower limbs
    LEFT_HIP       = 23
    RIGHT_HIP      = 24
    LEFT_KNEE      = 25
    RIGHT_KNEE     = 26
    LEFT_ANKLE     = 27
    RIGHT_ANKLE    = 28


# ---------------------------------------------------------------------------
# Landmark accessors
# ---------------------------------------------------------------------------

def get_landmark_coords(
    landmarks,
    index: int,
    image_width: int,
    image_height: int,
) -> Point2D:
    """
    Return the *pixel* coordinates of a single landmark.

    Args:
        landmarks:    ``mediapipe.framework.formats.landmark_pb2.NormalizedLandmarkList``
        index:        Landmark index — use :class:`PoseLandmark` constants.
        image_width:  Frame width in pixels (for denormalization).
        image_height: Frame height in pixels (for denormalization).

    Returns:
        ``(x, y)`` pixel coordinates as floats.
    """
    lm = landmarks.landmark[index]
    return lm.x * image_width, lm.y * image_height


def get_landmark_visibility(landmarks, index: int) -> float:
    """Return the visibility confidence score ``[0, 1]`` for *index*."""
    return landmarks.landmark[index].visibility


# ---------------------------------------------------------------------------
# Angle computation
# ---------------------------------------------------------------------------

def calculate_angle(a: Point2D, b: Point2D, c: Point2D) -> float:
    """
    Compute the interior angle **at joint B** formed by the rays B→A and B→C.

    Uses the dot-product identity::

        angle = arccos( (BA · BC) / (|BA| × |BC|) )

    Args:
        a: First point  (e.g. shoulder).
        b: Vertex joint (e.g. elbow).
        c: Third point  (e.g. wrist).

    Returns:
        Angle in degrees, clamped to ``[0°, 180°]``.
        Returns ``0.0`` for degenerate (coincident-point) inputs.
    """
    va = np.asarray(a, dtype=np.float64)
    vb = np.asarray(b, dtype=np.float64)
    vc = np.asarray(c, dtype=np.float64)

    ba = va - vb
    bc = vc - vb

    norm_ba = np.linalg.norm(ba)
    norm_bc = np.linalg.norm(bc)

    if norm_ba == 0.0 or norm_bc == 0.0:
        log.debug("calculate_angle: degenerate input — coincident points detected")
        return 0.0

    # Clamp to [-1, 1] to guard against floating-point drift beyond unit range.
    cos_theta = np.clip(np.dot(ba, bc) / (norm_ba * norm_bc), -1.0, 1.0)
    return float(np.degrees(np.arccos(cos_theta)))


def calculate_angle_from_landmarks(
    landmarks,
    idx_a: int,
    idx_b: int,
    idx_c: int,
    image_width: int,
    image_height: int,
    *,
    min_visibility: float = 0.5,
) -> Optional[float]:
    """
    High-level convenience wrapper: extract three landmarks and compute the
    angle at *idx_b*.

    Args:
        landmarks:       ``NormalizedLandmarkList`` from a MediaPipe result.
        idx_a:           Index of the first point.
        idx_b:           Index of the **vertex** joint.
        idx_c:           Index of the third point.
        image_width:     Frame width in pixels.
        image_height:    Frame height in pixels.
        min_visibility:  Minimum landmark confidence required.  Any landmark
                         scoring below this threshold causes the function to
                         return ``None`` rather than an unreliable angle.

    Returns:
        Angle in degrees, or ``None`` when any landmark is unreliable.
    """
    for idx in (idx_a, idx_b, idx_c):
        vis = get_landmark_visibility(landmarks, idx)
        if vis < min_visibility:
            log.debug(
                "Landmark %d visibility %.2f below threshold %.2f — skipping",
                idx, vis, min_visibility,
            )
            return None

    a = get_landmark_coords(landmarks, idx_a, image_width, image_height)
    b = get_landmark_coords(landmarks, idx_b, image_width, image_height)
    c = get_landmark_coords(landmarks, idx_c, image_width, image_height)

    return calculate_angle(a, b, c)


# ---------------------------------------------------------------------------
# Smoothing
# ---------------------------------------------------------------------------

def smooth_angle(
    new_angle: float,
    history: list[float],
    *,
    window: int = 5,
) -> float:
    """
    Apply a simple **moving-average** filter to reduce per-frame jitter.

    *history* is mutated in place and acts as a fixed-length circular buffer.

    Args:
        new_angle: Latest raw angle reading (degrees).
        history:   Mutable list maintained by the caller across frames.
        window:    Number of frames to include in the rolling average.

    Returns:
        Smoothed angle value (degrees).
    """
    history.append(new_angle)
    if len(history) > window:
        history.pop(0)
    return float(np.mean(history))
